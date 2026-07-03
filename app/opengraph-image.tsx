import { ImageResponse } from 'next/og'

// The social-share card. Every share of ensoacademy.ai previously rendered
// blank; this generates a branded 1200x630 card in the brand palette
// (teal #0F3D3E, cream #FAF7F2, coral #E07856) with no static asset needed.
export const alt = 'Enso Academy · Know you are ready before exam day'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0F3D3E',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: '4px solid #E07856',
              borderTopColor: 'transparent',
              transform: 'rotate(45deg)',
            }}
          />
          <div
            style={{
              color: '#FAF7F2',
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: '0.14em',
            }}
          >
            ENSO ACADEMY
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            color: '#FAF7F2',
            fontSize: 88,
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
          }}
        >
          <div>KNOW YOU&apos;RE READY</div>
          <div style={{ display: 'flex' }}>
            BEFORE&nbsp;<span style={{ color: '#E07856' }}>EXAM DAY.</span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'rgba(250, 247, 242, 0.75)',
            fontSize: 26,
            letterSpacing: '0.04em',
          }}
        >
          <div>An AI classroom built from primary sources</div>
          <div style={{ color: '#E07856', fontWeight: 700 }}>CAMS · CCAS</div>
        </div>
      </div>
    ),
    { ...size },
  )
}
