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
 * UPDATED: Added isVerified check and specific messaging for unverified users.
 */

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getComments } from '@/lib/actions/matchDetail';
import { postComment, deleteComment } from '@/lib/actions/interactions';
import { type CommentsPage, type CommentItem } from '@/lib/validations/models';

interface Props {
  matchId: string;
  initialPage: CommentsPage;
  /** null if user is not authenticated */
  currentUserId: string | null;
  currentUserName: string | null;
  isVerified: boolean;
}

export function CommentsSection({ matchId, initialPage, currentUserId, currentUserName, isVerified }: Props) {
  const router = useRouter();
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
    if (!currentUserId) return;
    
    if (!isVerified) {
      setFormError('Please verify your email to post a comment.');
      return;
    }

    if (!commentText.trim()) {
      setFormError('Comment cannot be empty.');
      return;
    }

    startPosting(async () => {
      const result = await postComment(matchId, commentText);
      if ('error' in result) {
        if (result.error === 'email_unverified') {
          setFormError('Please verify your email to post a comment.');
        } else {
          setFormError(result.message ?? 'Something went wrong.');
        }
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
      router.refresh();
    });
  }

  // ── Delete comment ─────────────────────────────────────────────────────────

  function handleDelete(commentId: string) {
    setDeletingIds((s) => new Set([...s, commentId]));
    // Fire-and-forget pattern — remove optimistically, server confirms
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    deleteComment(commentId).then((result) => {
      if ('error' in result) {
        console.error('[CommentsSection] delete failed:', result.error);
      } else {
        router.refresh();
      }
      setDeletingIds((s) => { const n = new Set(s); n.delete(commentId); return n; });
    });
  }

  return (
    <div className="mt-12">
      {/* Section header */}
      <div className="flex items-baseline gap-4 mb-8">
        <h2 className="text-xl font-black font-serif uppercase tracking-tight text-[#2C2B28]">
          Letters to the Editor
        </h2>
        <span className="text-[0.65rem] font-mono font-bold text-[#6B5E4A] uppercase tracking-widest">
          {comments.length} responses
        </span>
        <div className="flex-1 border-b-2 border-dashed border-[#2C2B28]/20 hidden sm:block" />
      </div>

      {/* ── Comment Form ─────────────────────────────────────────────── */}
      <div className="mb-10 p-6 bg-[#F9F6EF] border-2 border-[#2C2B28] shadow-[5px_5px_0_0_rgba(0,0,0,0.2)] relative">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] mix-blend-multiply" aria-hidden="true" />
        <div className="relative z-10">
          <textarea
            value={commentText}
            onChange={(e) => {
              setCommentText(e.target.value);
              setCharCount(e.target.value.length);
              setFormError(null);
            }}
            placeholder={
              !currentUserId
                ? 'Submit a letter to the editor. Sign in to write.'
                : !isVerified
                ? 'Please verify your email to submit a letter…'
                : 'Write your response here…'
            }
            maxLength={500}
            rows={3}
            disabled={isPosting || (!!currentUserId && !isVerified)}
            className="w-full resize-none bg-transparent text-sm font-serif text-[#3A3126] placeholder:text-[#6B5E4A]/50 focus:outline-none leading-relaxed"
          />

          <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-[#2C2B28]/20 mt-3">
            {/* char counter */}
            <span
              className={`text-[0.7rem] font-mono font-bold tabular-nums ${
                charCount > 450 ? 'text-[#9B2C2C]' : 'text-[#6B5E4A]'
              }`}
            >
              {charCount}/500
            </span>

            {/* CTA — differs by auth state */}
            {!currentUserId ? (
              <Link
                href="/auth/sign-in"
                className="px-4 py-2 text-[0.65rem] font-mono font-bold uppercase tracking-widest text-[#2C2B28] bg-[#F9F6EF] border-2 border-[#2C2B28] shadow-[2px_2px_0_0_rgba(0,0,0,0.2)] transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                Sign In To Write
              </Link>
            ) : !isVerified ? (
              <div className="flex flex-col items-end gap-1">
                <span className="text-[0.6rem] font-mono font-bold uppercase tracking-widest text-[#9B2C2C] mb-1">
                  Verification Required
                </span>
                <Link
                  href="/auth/verify-email"
                  className="px-4 py-2 text-[0.65rem] font-mono font-bold uppercase tracking-widest text-[#2C2B28] bg-[#F9F6EF] border-2 border-[#2C2B28] shadow-[2px_2px_0_0_rgba(0,0,0,0.2)] transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                >
                  Verify Email
                </Link>
              </div>
            ) : (
              <button
                onClick={handlePost}
                disabled={isPosting || commentText.trim().length === 0}
                className="px-4 py-2 text-[0.65rem] font-mono font-bold uppercase tracking-widest text-[#F9F6EF] bg-[#2C2B28] border-2 border-[#2C2B28] transition-all disabled:opacity-50 disabled:cursor-not-allowed enabled:shadow-[2px_2px_0_0_rgba(0,0,0,0.2)] enabled:hover:shadow-none enabled:hover:translate-x-[2px] enabled:hover:translate-y-[2px]"
              >
                {isPosting ? 'Adding...' : 'Add Comment'}
              </button>
            )}
          </div>

          {formError && (
            <p className="mt-2 text-[0.65rem] font-mono font-bold uppercase tracking-widest text-[#9B2C2C]">{formError}</p>
          )}
        </div>
      </div>

      {/* ── Comment List ─────────────────────────────────────────────── */}
      {comments.length === 0 ? (
        <div className="py-12 text-center border-y-2 border-dashed border-[#2C2B28]/20">
          <p className="text-sm font-mono font-bold text-[#6B5E4A] uppercase tracking-widest">
            No Comments yet. Be the first to post a comment.
          </p>
        </div>
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
            className="px-6 py-2.5 text-[0.65rem] font-mono font-bold uppercase tracking-widest text-[#2C2B28] bg-[#F9F6EF] border-2 border-[#2C2B28] transition-all disabled:opacity-40 enabled:shadow-[3px_3px_0_0_rgba(0,0,0,0.2)] enabled:hover:shadow-none enabled:hover:translate-x-[2px] enabled:hover:translate-y-[2px]"
          >
            {isLoadingMore ? 'Printing…' : 'Load More Letters'}
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
    <li className={`flex gap-4 p-5 bg-[#F9F6EF] border-2 border-[#2C2B28] shadow-[3px_3px_0_0_rgba(0,0,0,0.1)] transition-opacity relative ${isDeleting ? 'opacity-40' : ''}`}>
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] mix-blend-multiply" aria-hidden="true" />
      
      {/* Avatar */}
      <div className="shrink-0 w-8 h-8 border-2 border-[#2C2B28] flex items-center justify-center text-xs font-mono font-bold text-[#2C2B28] bg-[#F9F6EF] select-none relative z-10">
        {initials}
      </div>

      <div className="flex-1 min-w-0 relative z-10">
        {/* Name + time row */}
        <div className="flex items-center gap-2 mb-2 border-b-2 border-dashed border-[#2C2B28]/10 pb-1">
          <span className="text-[0.75rem] font-mono font-bold uppercase tracking-widest text-[#2C2B28]">
            {comment.user.name ?? 'Anonymous'}
          </span>
          {isOwn && (
            <span className="text-[0.55rem] font-mono font-bold uppercase tracking-widest text-[#9B2C2C] border border-[#9B2C2C] px-1.5 py-0.5">
              AUTHOR
            </span>
          )}
          <span className="text-[0.65rem] font-mono font-bold text-[#6B5E4A] ml-auto uppercase tracking-widest">
            {timeAgo}
          </span>
        </div>

        {/* Content */}
        <p className="text-sm font-serif text-[#3A3126] leading-relaxed m-0 break-words">
          {comment.content}
        </p>
      </div>

      {/* Delete — only shown for own comments */}
      {isOwn && !isDeleting && (
        <button
          onClick={onDelete}
          aria-label="Delete comment"
          className="shrink-0 self-start mt-0.5 text-[#2C2B28] hover:text-[#9B2C2C] transition-colors relative z-10"
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

function formatTimeAgo(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return 'recently';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
