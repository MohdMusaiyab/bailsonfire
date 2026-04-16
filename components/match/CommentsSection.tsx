'use client';

/**
 * CommentsSection.tsx — Client Component
 *
 * Handles the full comments experience:
 * - Shows initial server-fetched comments immediately (no loading flash)
 * - "Load More" appends next page via cursor pagination
 * - Comment form: visible for all, but submit gated (redirect to sign-in for guests)
 * - Delete button: only shown on own comments
 *
 * Auth strategy:
 * - `currentUserId` is null for guests — passed as prop from the Server Component.
 * - Form shows a "Sign in to comment" CTA for guests instead of a submit button.
 * - All mutations hit Server Actions which re-validate auth server-side.
 */

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { getComments } from '@/lib/actions/matchDetail';
import { postComment, deleteComment } from '@/lib/actions/interactions';
import { type CommentsPage, type CommentItem } from '@/lib/validations/models';

interface Props {
  matchId: string;
  initialPage: CommentsPage;
  /** null if user is not authenticated */
  currentUserId: string | null;
  currentUserName: string | null;
}

export function CommentsSection({ matchId, initialPage, currentUserId, currentUserName }: Props) {
  const [comments, setComments] = useState<CommentItem[]>(initialPage.items);
  const [nextCursor, setNextCursor] = useState<string | null>(initialPage.nextCursor);
  const [commentText, setCommentText] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoadingMore, startLoadMore] = useTransition();
  const [isPosting, startPosting] = useTransition();
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // ── Load more ──────────────────────────────────────────────────────────────

  function loadMore() {
    if (!nextCursor) return;
    startLoadMore(async () => {
      const page = await getComments(matchId, nextCursor);
      setComments((prev) => [...prev, ...page.items]);
      setNextCursor(page.nextCursor);
    });
  }

  // ── Post comment ───────────────────────────────────────────────────────────

  function handlePost() {
    setFormError(null);
    if (!commentText.trim()) {
      setFormError('Comment cannot be empty.');
      return;
    }
    startPosting(async () => {
      const result = await postComment(matchId, commentText);
      if ('error' in result) {
        setFormError(result.message ?? 'Something went wrong.');
        return;
      }
      // Optimistically prepend — the text is what we just typed
      const optimistic: CommentItem = {
        id: `optimistic-${Date.now()}`,
        content: commentText.trim(),
        createdAt: new Date(),
        user: { id: currentUserId!, name: currentUserName, image: null },
      };
      setComments((prev) => [optimistic, ...prev]);
      setCommentText('');
      setCharCount(0);
    });
  }

  // ── Delete comment ─────────────────────────────────────────────────────────

  function handleDelete(commentId: string) {
    setDeletingIds((s) => new Set([...s, commentId]));
    // Fire-and-forget pattern — remove optimistically, server confirms
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    deleteComment(commentId).then((result) => {
      if ('error' in result) {
        // If server-side delete failed, we don't re-add here  
        // (revalidatePath from server handles eventual consistency)
        console.error('[CommentsSection] delete failed:', result.error);
      }
      setDeletingIds((s) => { const n = new Set(s); n.delete(commentId); return n; });
    });
  }

  return (
    <div className="mt-12">
      {/* Section header */}
      <div className="flex items-baseline gap-4 mb-8">
        <h2 className="text-xl font-black tracking-tight text-[#1A1A1A]">
          Comments
        </h2>
        <span className="text-[0.72rem] font-bold text-[#1A1A1A]/30 uppercase tracking-widest">
          {comments.length} shown
        </span>
        <div className="flex-1 h-px bg-[#1A1A1A]/5 hidden sm:block" />
      </div>

      {/* ── Comment Form ─────────────────────────────────────────────── */}
      <div className="mb-10 p-6 bg-white border border-[#1A1A1A]/6 rounded-2xl shadow-sm">
        <textarea
          value={commentText}
          onChange={(e) => {
            setCommentText(e.target.value);
            setCharCount(e.target.value.length);
            setFormError(null);
          }}
          placeholder={
            currentUserId
              ? 'Share your take on this roast…'
              : 'Read the roast, have a thought? Sign in to share it.'
          }
          maxLength={500}
          rows={3}
          disabled={isPosting}
          className="w-full resize-none bg-transparent text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:outline-none leading-relaxed"
        />

        <div className="flex items-center justify-between pt-4 border-t border-[#1A1A1A]/5 mt-3">
          {/* char counter */}
          <span
            className={`text-[0.7rem] font-semibold tabular-nums ${
              charCount > 450 ? 'text-amber-500' : 'text-[#1A1A1A]/25'
            }`}
          >
            {charCount}/500
          </span>

          {/* CTA — differs by auth state */}
          {currentUserId ? (
            <button
              onClick={handlePost}
              disabled={isPosting || commentText.trim().length === 0}
              className="px-5 py-2 text-[0.75rem] font-black uppercase tracking-wider text-[#FCFBF7] bg-[#1A1A1A] rounded-lg transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isPosting ? 'Posting…' : 'Post Comment'}
            </button>
          ) : (
            <Link
              href="/auth/sign-in"
              className="px-5 py-2 text-[0.75rem] font-black uppercase tracking-wider text-[#1A1A1A] bg-white border border-[#1A1A1A]/12 rounded-lg transition-all hover:bg-[#1A1A1A] hover:text-[#FCFBF7] hover:border-[#1A1A1A]"
            >
              Sign in to comment →
            </Link>
          )}
        </div>

        {formError && (
          <p className="mt-2 text-xs font-semibold text-red-500">{formError}</p>
        )}
      </div>

      {/* ── Comment List ─────────────────────────────────────────────── */}
      {comments.length === 0 ? (
        <p className="text-center text-sm text-[#1A1A1A]/30 font-semibold py-12 uppercase tracking-widest">
          No comments yet. Be the first.
        </p>
      ) : (
        <ul className="flex flex-col gap-4 list-none p-0 m-0">
          {comments.map((comment) => (
            <CommentRow
              key={comment.id}
              comment={comment}
              isOwn={comment.user.id === currentUserId}
              isDeleting={deletingIds.has(comment.id)}
              onDelete={() => handleDelete(comment.id)}
            />
          ))}
        </ul>
      )}

      {/* ── Load More ────────────────────────────────────────────────── */}
      {nextCursor !== null && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="px-6 py-2.5 text-[0.75rem] font-black uppercase tracking-wider text-[#1A1A1A] border border-[#1A1A1A]/12 rounded-lg transition-all hover:bg-[#1A1A1A] hover:text-[#FCFBF7] hover:border-[#1A1A1A] disabled:opacity-40"
          >
            {isLoadingMore ? 'Loading…' : 'Load More Comments'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Single Comment Row ───────────────────────────────────────────────────────

function CommentRow({
  comment,
  isOwn,
  isDeleting,
  onDelete,
}: {
  comment: CommentItem;
  isOwn: boolean;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  const timeAgo = formatTimeAgo(comment.createdAt);
  const initials = (comment.user.name ?? 'A').charAt(0).toUpperCase();

  return (
    <li className={`flex gap-4 p-5 bg-white border border-[#1A1A1A]/5 rounded-xl transition-opacity ${isDeleting ? 'opacity-40' : ''}`}>
      {/* Avatar */}
      <div className="shrink-0 w-9 h-9 rounded-full bg-[#1A1A1A]/8 flex items-center justify-center text-xs font-black text-[#1A1A1A]/50 select-none">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        {/* Name + time row */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[0.8rem] font-black text-[#1A1A1A]">
            {comment.user.name ?? 'Anonymous'}
          </span>
          {isOwn && (
            <span className="text-[0.6rem] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              You
            </span>
          )}
          <span className="text-[0.7rem] text-[#1A1A1A]/30 font-medium ml-auto">
            {timeAgo}
          </span>
        </div>

        {/* Content */}
        <p className="text-sm text-[#1A1A1A]/70 leading-relaxed m-0 break-words">
          {comment.content}
        </p>
      </div>

      {/* Delete — only shown for own comments */}
      {isOwn && !isDeleting && (
        <button
          onClick={onDelete}
          aria-label="Delete comment"
          className="shrink-0 self-start mt-0.5 text-[#1A1A1A]/20 hover:text-red-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </li>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
