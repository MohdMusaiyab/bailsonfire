import { ImageResponse } from 'next/og';
import { getMatchDetail } from '@/lib/actions/matchDetail';

// ─── Config ──────────────────────────────────────────────────────────────────

// Prisma and other DB actions require Node.js runtime for 'crypto' and other modules
export const runtime = 'nodejs';

// Image metadata
export const alt = 'IPL Match Roast Preview';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// ─── Image Generation ────────────────────────────────────────────────────────

export default async function Image({ params }: { params: { externalId: string } }) {
  const { externalId } = params;
  const match = await getMatchDetail(externalId);

  if (!match) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: '#1A1A1A',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          Match Not Found
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: '#1A1A1A',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '40px',
        }}
      >
        {/* Subtle decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#F59E0B',
            }}
          />
          <span
            style={{
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: '24px',
              fontWeight: '900',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            Bails On Fire
          </span>
        </div>

        {/* Main Content Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            marginTop: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '40px',
            }}
          >
            <span
              style={{
                fontSize: '84px',
                fontWeight: '900',
                color: 'white',
                letterSpacing: '-0.04em',
              }}
            >
              {match.homeTeam}
            </span>
            <span
              style={{
                fontSize: '48px',
                fontWeight: '300',
                color: 'rgba(255, 255, 255, 0.2)',
                fontStyle: 'italic',
              }}
            >
              vs
            </span>
            <span
              style={{
                fontSize: '84px',
                fontWeight: '900',
                color: 'white',
                letterSpacing: '-0.04em',
              }}
            >
              {match.awayTeam}
            </span>
          </div>

          <div
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              padding: '12px 32px',
              borderRadius: '99px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '32px' }}>🔥</span>
            <span
              style={{
                color: '#F59E0B',
                fontSize: '28px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Match Roasted
            </span>
          </div>

          <div
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '32px',
              fontWeight: '600',
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: '1.4',
              marginTop: '12px',
            }}
          >
            {match.scoreSummary}
          </div>
        </div>

        {/* Bottom watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            color: 'rgba(255, 255, 255, 0.15)',
            fontSize: '20px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
          }}
        >
          IPL 2026 Season • AI Commentary
        </div>
        
        {/* Fire accent line at the very bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: 'linear-gradient(to right, #F59E0B, #EF4444)',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
