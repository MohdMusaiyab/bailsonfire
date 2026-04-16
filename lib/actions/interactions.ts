'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// ─── Toggle Like ──────────────────────────────────────────────────────────────

type LikeResult =
  | { success: true; liked: boolean; newCount: number }
  | { error: 'unauthorized' | 'match_not_found' | 'db_error' };

/**
 * Toggles the current user's like on a match.
 * If already liked → removes it. If not liked → creates it.
 * Only callable by authenticated users; returns { error: 'unauthorized' } for guests.
 */
export async function toggleLike(matchId: string): Promise<LikeResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'unauthorized' };
  }
  const userId = session.user.id;

  try {
    // Check if like already exists (atomic pair: read + conditional write)
    const existing = await prisma.like.findUnique({
      where: { userId_matchId: { userId, matchId } },
      select: { id: true },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
    } else {
      await prisma.like.create({ data: { userId, matchId } });
    }

    // Re-count after mutation (single aggregation query)
    const newCount = await prisma.like.count({ where: { matchId } });

    // This revalidates the match page so the server-rendered count updates
    revalidatePath(`/match/[externalId]`, 'page');

    return { success: true, liked: !existing, newCount };
  } catch {
    return { error: 'db_error' };
  }
}

// ─── Post Comment ─────────────────────────────────────────────────────────────

type CommentResult =
  | { success: true }
  | { error: 'unauthorized' | 'invalid' | 'db_error'; message?: string };

/**
 * Creates a new comment. Validates auth and content server-side.
 * Content must be between 1 and 500 characters.
 */
export async function postComment(matchId: string, content: string): Promise<CommentResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'unauthorized' };
  }

  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return { error: 'invalid', message: 'Comment cannot be empty.' };
  }
  if (trimmed.length > 500) {
    return { error: 'invalid', message: 'Comment must be 500 characters or fewer.' };
  }

  try {
    await prisma.comment.create({
      data: { matchId, userId: session.user.id, content: trimmed },
    });
    revalidatePath(`/match/[externalId]`, 'page');
    return { success: true };
  } catch {
    return { error: 'db_error' };
  }
}

// ─── Delete Comment ───────────────────────────────────────────────────────────

type DeleteResult = { success: true } | { error: 'unauthorized' | 'not_found' | 'db_error' };

/**
 * Deletes a comment. Users can only delete their own comments.
 * The ownership check happens server-side — never trust the client.
 */
export async function deleteComment(commentId: string): Promise<DeleteResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'unauthorized' };
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true, matchId: true },
    });

    if (!comment) return { error: 'not_found' };
    // Server-side ownership gate — only the author can delete
    if (comment.userId !== session.user.id) return { error: 'unauthorized' };

    await prisma.comment.delete({ where: { id: commentId } });
    revalidatePath(`/match/[externalId]`, 'page');
    return { success: true };
  } catch {
    return { error: 'db_error' };
  }
}
