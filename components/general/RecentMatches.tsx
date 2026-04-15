/**
 * components/general/RecentMatches.tsx
 *
 * SERVER COMPONENT — renders the "Recent Matches" section on the home page.
 *
 * Fetches data inline (no prop drilling needed) since this is a Server
 * Component: it has direct async/await access to the server action.
 *
 * Structure:
 *   <RecentMatches />          ← this file (async Server Component)
 *     <MatchCard match={...} /> ← sub-component for each match row
 *
 * Usage in app/page.tsx:
 *   import { RecentMatches } from '@/components/general/RecentMatches';
 *   ...
 *   <RecentMatches />
 */

import Link from 'next/link';
import { getRecentMatches } from '@/lib/actions/matches';
import { type RecentMatchCard } from '@/lib/validations/models';

// ---------------------------------------------------------------------------
// MatchCard — pure presentational sub-component
// ---------------------------------------------------------------------------

/**
 * Renders a single match card. Entirely display-only — all data comes from
 * the parent. No hooks, no client state.
 */
function MatchCard({ match }: { match: RecentMatchCard }) {
  // Format matchDate as a readable IST date string
  const dateLabel = match.matchDate.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Truncate the roast summary to a 2-line teaser (160 chars)
  const roastTeaser =
    match.summary !== null
      ? match.summary.content.length > 160
        ? match.summary.content.slice(0, 157).trimEnd() + '…'
        : match.summary.content
      : null;

  return (
    <article className="match-card">
      {/* Header: teams + date */}
      <header className="match-card__header">
        <h2 className="match-card__teams">
          {match.homeTeam}
          <span className="match-card__vs" aria-hidden="true"> vs </span>
          {match.awayTeam}
        </h2>
        <time
          className="match-card__date"
          dateTime={match.matchDate.toISOString()}
        >
          {dateLabel}
        </time>
      </header>

      {/* Score + venue */}
      <p className="match-card__score">{match.scoreSummary}</p>
      <p className="match-card__venue">{match.venue}</p>

      {/* Winner badge */}
      {match.winner !== null && (
        <p className="match-card__winner">
          🏆 <strong>{match.winner}</strong> won
        </p>
      )}

      {/* Roast teaser — shown only if a summary exists */}
      {roastTeaser !== null && (
        <blockquote className="match-card__roast-teaser">
          {roastTeaser}
        </blockquote>
      )}

      {/* Engagement footer: likes + comments + CTA */}
      <footer className="match-card__footer">
        <div className="match-card__counts">
          <span aria-label={`${match.likesCount} likes`}>
            👍 {match.likesCount}
          </span>
          <span aria-label={`${match.commentsCount} comments`}>
            💬 {match.commentsCount}
          </span>
        </div>

        <Link
          href={`/match/${match.externalId}`}
          className="match-card__cta"
          aria-label={`Read full roast for ${match.homeTeam} vs ${match.awayTeam}`}
        >
          Read Full Roast →
        </Link>
      </footer>
    </article>
  );
}

// ---------------------------------------------------------------------------
// RecentMatches — the exported async Server Component
// ---------------------------------------------------------------------------

/**
 * Fetches and renders up to 3 recent match cards.
 * Shows an empty state if no matches have been ingested yet.
 */
export async function RecentMatches() {
  const matches = await getRecentMatches(3);

  if (matches.length === 0) {
    return (
      <section className="recent-matches" aria-label="Recent matches">
        <h1 className="recent-matches__heading">Recent Matches</h1>
        <p className="recent-matches__empty">
          No matches ingested yet. Run <code>npx tsx scripts/ingest.ts</code> to
          populate.
        </p>
      </section>
    );
  }

  return (
    <section className="recent-matches" aria-label="Recent IPL matches">
      <h1 className="recent-matches__heading">Recent Matches</h1>
      <ul className="recent-matches__list" role="list">
        {matches.map((match) => (
          <li key={match.id}>
            <MatchCard match={match} />
          </li>
        ))}
      </ul>
    </section>
  );
}
