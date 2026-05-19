import { ImageResponse } from 'next/og';
import { getMatchDetail } from '@/lib/actions/matchDetail';

// Prisma and other DB actions require Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ externalId: string }> }
) {
  const { externalId } = await params;
  const match = await getMatchDetail(externalId);

  if (!match) {
    return new Response('Match not found', { status: 404 });
  }

  // Load custom fonts for maximum aesthetic premium feeling
  let playfairBold: ArrayBuffer | null = null;
  let playfairRegular: ArrayBuffer | null = null;
  let spaceMono: ArrayBuffer | null = null;

  try {
    const [boldRes, regularRes, monoRes] = await Promise.all([
      fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/playfairdisplay/static/PlayfairDisplay-Bold.ttf'),
      fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/playfairdisplay/static/PlayfairDisplay-Regular.ttf'),
      fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/spacemono/SpaceMono-Regular.ttf'),
    ]);

    if (boldRes.ok) playfairBold = await boldRes.arrayBuffer();
    if (regularRes.ok) playfairRegular = await regularRes.arrayBuffer();
    if (monoRes.ok) spaceMono = await monoRes.arrayBuffer();
  } catch (err) {
    console.error('Error fetching dynamic fonts for satori', err);
  }

  const fonts = [];
  if (playfairBold) {
    fonts.push({
      name: 'Playfair Display',
      data: playfairBold,
      weight: 700 as const,
      style: 'normal' as const,
    });
  }
  if (playfairRegular) {
    fonts.push({
      name: 'Playfair Display',
      data: playfairRegular,
      weight: 400 as const,
      style: 'normal' as const,
    });
  }
  if (spaceMono) {
    fonts.push({
      name: 'Space Mono',
      data: spaceMono,
      weight: 400 as const,
      style: 'normal' as const,
    });
  }

  // Format date
  const dateLabel = match.matchDate.toLocaleDateString('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Extract full roast content (rendered as paragraphs)
  const fullRoast = match.summary?.content || 'Awaiting dynamic IPL match collapse publisher...';
  const paragraphs = fullRoast.split('\n').map(p => p.trim()).filter(Boolean);

  return new ImageResponse(
    (
      <div
        style={{
          width: '2400px',
          height: '1260px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FCFBF7',
          color: '#2C2B28',
          padding: '60px 80px',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Newspaper double outer border (Scaled 2x) */}
        <div
          style={{
            position: 'absolute',
            top: '30px',
            bottom: '30px',
            left: '30px',
            right: '30px',
            border: '16px solid #2C2B28',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '56px',
            bottom: '56px',
            left: '56px',
            right: '56px',
            border: '4px solid #2C2B28',
            pointerEvents: 'none',
          }}
        />

        {/* Paper texture overlay container (Scaled 2x) */}
        <div
          style={{
            position: 'absolute',
            top: '64px',
            bottom: '64px',
            left: '64px',
            right: '64px',
            display: 'flex',
            flexDirection: 'column',
            padding: '50px',
            boxSizing: 'border-box',
          }}
        >
          {/* Main content split: Left Column (32%) & Right Column (68%) (Scaled 2x) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              height: '900px',
            }}
          >
            {/* LEFT COLUMN: 32% Width (Match Details) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '32%',
                borderRight: '6px dashed #2C2B28',
                paddingRight: '60px',
                boxSizing: 'border-box',
              }}
            >
              {/* Home Team Container (Fixed Height to prevent Satori overlapping) */}
              <div
                style={{
                  fontFamily: playfairBold ? 'Playfair Display' : 'serif',
                  fontSize: '44px',
                  fontWeight: 'bold',
                  lineHeight: '1.2',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.01em',
                  height: '110px',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                {match.homeTeam}
              </div>

              {/* VS separator */}
              <div
                style={{
                  fontFamily: spaceMono ? 'Space Mono' : 'monospace',
                  fontSize: '30px',
                  fontWeight: 'bold',
                  color: '#6B5E4A',
                  textTransform: 'lowercase',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                vs
              </div>

              {/* Away Team Container (Fixed Height to prevent Satori overlapping) */}
              <div
                style={{
                  fontFamily: playfairBold ? 'Playfair Display' : 'serif',
                  fontSize: '44px',
                  fontWeight: 'bold',
                  lineHeight: '1.2',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.01em',
                  height: '110px',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                {match.awayTeam}
              </div>

              {/* Match date info */}
              <div
                style={{
                  fontFamily: spaceMono ? 'Space Mono' : 'monospace',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#6B5E4A',
                  textTransform: 'uppercase',
                  marginTop: '24px',
                  letterSpacing: '0.05em',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                {dateLabel}
              </div>

              {/* Venue Container (Fixed Height to cleanly wrap long stadium names) */}
              <div
                style={{
                  fontFamily: spaceMono ? 'Space Mono' : 'monospace',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#6B5E4A',
                  textTransform: 'uppercase',
                  marginTop: '8px',
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                📍 {match.venue}
              </div>

              {/* Score summary box */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: '#2C2B28',
                  padding: '12px 24px',
                  color: '#FCFBF7',
                  marginTop: '24px',
                  borderRadius: '4px',
                  height: '84px',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontFamily: spaceMono ? 'Space Mono' : 'monospace',
                    fontSize: '22px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    lineHeight: '1.3',
                  }}
                >
                  {match.scoreSummary}
                </div>
              </div>

              {/* Dynamic Winner Badge */}
              {match.winner && (
                <div
                  style={{
                    marginTop: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      fontFamily: spaceMono ? 'Space Mono' : 'monospace',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#6B5E4A',
                      letterSpacing: '0.15em',
                    }}
                  >
                    OFFICIAL WINNER:
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      border: '4px solid #2C2B28',
                      padding: '8px 20px',
                      textTransform: 'uppercase',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: spaceMono ? 'Space Mono' : 'monospace',
                        fontSize: '22px',
                        fontWeight: 'bold',
                      }}
                    >
                      {match.winner}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: 68% Width (Roast Summary) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '68%',
                paddingLeft: '64px',
                boxSizing: 'border-box',
              }}
            >
              {/* The dynamic roast text paragraphs (Full Roast Integration) */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 2,
                }}
              >
                {paragraphs.map((para, idx) => (
                  <div
                    key={idx}
                    style={{
                      fontFamily: playfairRegular ? 'Playfair Display' : 'serif',
                      fontSize: '32px',
                      color: '#3A3126',
                      lineHeight: '1.65',
                      marginBottom: '24px',
                    }}
                  >
                    {para}
                  </div>
                ))}
              </div>

              {/* Accent double underline/divider */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  marginTop: 'auto',
                  marginBottom: '20px',
                }}
              >
                <div style={{ height: '6px', backgroundColor: '#2C2B28', width: '100%', marginBottom: '4px' }} />
                <div style={{ height: '2px', backgroundColor: '#2C2B28', width: '100%' }} />
              </div>
            </div>
          </div>

          {/* BOTTOM WATERMARK SECTION */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              borderTop: '6px solid #2C2B28',
              paddingTop: '32px',
              marginTop: 'auto',
            }}
          >
            {/* Branding with Fire Emoji */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <span style={{ fontSize: '52px' }}>🔥</span>
              <span
                style={{
                  fontFamily: playfairBold ? 'Playfair Display' : 'serif',
                  fontWeight: 'bold',
                  fontSize: '48px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                Bails On Fire
              </span>
            </div>

            {/* Read more invitation watermark */}
            <div
              style={{
                fontFamily: spaceMono ? 'Space Mono' : 'monospace',
                fontSize: '22px',
                fontWeight: 'bold',
                letterSpacing: '0.05em',
                color: '#6B5E4A',
                textTransform: 'uppercase',
              }}
            >
              For more brutal IPL collapses, read at bailsonfire.vercel.app
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 2400,
      height: 1260,
      fonts: fonts.length > 0 ? fonts : undefined,
    }
  );
}
