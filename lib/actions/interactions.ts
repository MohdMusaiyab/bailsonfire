"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// ─── Toggle Reaction ──────────────────────────────────────────────────────────
import { ReactionType } from "../validations/models";

type ReactionResult =
  | {
      success: true;
      reacted: boolean;
      newType: ReactionType | null;
      newCount: number;
    }
  | { error: "unauthorized" | "match_not_found" | "db_error" };

/**
 * Toggles or updates the current user's reaction on a match.
 * 1. If user hasn't reacted → Creates the reaction.
 * 2. If user has reacted with the SAME type → Removes it (Toggle off).
 * 3. If user has reacted with a DIFFERENT type → Updates to the new type.
 */
export default async function toggleReaction(
  matchId: string,
  type: ReactionType,
): Promise<ReactionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "unauthorized" };
  }
  const userId = session.user.id;

  try {
    const existing = await prisma.reaction.findUnique({
      where: { userId_matchId: { userId, matchId } },
      select: { id: true, type: true },
    });

    let reacted = false;
    let newType: ReactionType | null = null;

    if (existing) {
      if (existing.type === type) {
        // Toggle off: User clicked the same reaction again
        await prisma.reaction.delete({ where: { id: existing.id } });
        reacted = false;
        newType = null;
      } else {
        // Switch: User clicked a different reaction
        await prisma.reaction.update({
          where: { id: existing.id },
          data: { type },
        });
        reacted = true;
        newType = type;
      }
    } else {
      // New reaction
      await prisma.reaction.create({
        data: { userId, matchId, type },
      });
      reacted = true;
      newType = type;
    }

    // Re-count total reactions after mutation
    const newCount = await prisma.reaction.count({ where: { matchId } });

    revalidatePath(`/match/[externalId]`, "page");

    return { success: true, reacted, newType, newCount };
  } catch {
    return { error: "db_error" };
  }
}

// ─── Post Comment ─────────────────────────────────────────────────────────────

type CommentResult =
  | { success: true }
  | { error: "unauthorized" | "invalid" | "db_error"; message?: string };

/**
 * Creates a new comment. Validates auth and content server-side.
 * Content must be between 1 and 500 characters.
 */
export async function postComment(
  matchId: string,
  content: string,
): Promise<CommentResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "unauthorized" };
  }

  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return { error: "invalid", message: "Comment cannot be empty." };
  }
  if (trimmed.length > 500) {
    return {
      error: "invalid",
      message: "Comment must be 500 characters or fewer.",
    };
  }

  try {
    await prisma.comment.create({
      data: { matchId, userId: session.user.id, content: trimmed },
    });
    revalidatePath(`/match/[externalId]`, "page");
    return { success: true };
  } catch {
    return { error: "db_error" };
  }
}

// ─── Delete Comment ───────────────────────────────────────────────────────────

type DeleteResult =
  | { success: true }
  | { error: "unauthorized" | "not_found" | "db_error" };

/**
 * Deletes a comment. Users can only delete their own comments.
 * The ownership check happens server-side — never trust the client.
 */
export async function deleteComment(commentId: string): Promise<DeleteResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "unauthorized" };
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true, matchId: true },
    });

    if (!comment) return { error: "not_found" };
    // Server-side ownership gate — only the author can delete
    if (comment.userId !== session.user.id) return { error: "unauthorized" };

    await prisma.comment.delete({ where: { id: commentId } });
    revalidatePath(`/match/[externalId]`, "page");
    return { success: true };
  } catch {
    return { error: "db_error" };
  }
}
