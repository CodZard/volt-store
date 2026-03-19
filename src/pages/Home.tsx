import {
  useState,
  useRef,
  useEffect,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

const KEYFRAMES = `
  @keyframes voltFadeUp {
    from { opacity:0; transform:translateY(24px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes voltRotate {
    from { transform:translate(-50%,-50%) rotate(0deg); }
    to   { transform:translate(-50%,-50%) rotate(360deg); }
  }
  @keyframes voltRotateRev {
    from { transform:translate(-50%,-50%) rotate(0deg); }
    to   { transform:translate(-50%,-50%) rotate(-360deg); }
  }
  @keyframes voltPulse {
    0%,100% { opacity:.6; transform:translate(-50%,-50%) rotate(45deg) scale(1); }
    50%     { opacity:1;  transform:translate(-50%,-50%) rotate(45deg) scale(1.05); }
  }
  @keyframes voltMarquee {
    from { transform:translateX(0); }
    to   { transform:translateX(-50%); }
  }
  @keyframes voltModalIn {
    from { opacity:0; transform:translateY(32px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes voltOverlayIn {
    from { opacity:0; }
    to   { opacity:1; }
  }

  /* Tablet / Mobile */
  @media (max-width: 768px) {
    .volt-hero        { grid-template-columns: 1fr !important; min-height: unset !important; }
    .volt-hero-right  { display: none !important; }
    .volt-hero-left   { padding: 56px 24px !important; align-items: center !important; text-align: center !important; }
    .volt-hero-rule   { justify-content: center !important; }
    .volt-hero-btns   { flex-direction: column !important; width: 100% !important; max-width: 300px; }
    .volt-hero-btns a { width: 100% !important; text-align: center !important; }
    .volt-hero-auth   { justify-content: center !important; }
    .volt-feat-grid   { grid-template-columns: 1fr !important; }
    .volt-stats-bar   { flex-direction: column !important; }
    .volt-stats-bar > div { max-width: 100% !important; }
    .volt-footer-in   { flex-direction: column !important; align-items: center !important; text-align: center !important; }
    .volt-nav         { padding: 14px 20px !important; }
    .volt-nav-desktop { display: none !important; }
    .volt-nav-mobile  { display: flex !important; }
    .volt-cta-btns    { flex-direction: column !important; align-items: center !important; }
    .volt-feat-sec    { padding: 64px 20px !important; }
  }

  @media (max-width: 480px) {
    .volt-hero-title   { font-size: clamp(72px, 20vw, 110px) !important; }
    .volt-hero-outline { font-size: clamp(72px, 20vw, 110px) !important; }
    .volt-feat-card    { padding: 36px 20px !important; }
    .volt-modal-card   { padding: 36px 20px !important; margin: 12px !important; }
    .volt-nav-logo     { font-size: 22px !important; }
  }
`

const MARQUEE_ITEMS = [
  'New Arrivals 2026',
  'AI Personal Stylist',
  'Luxury Curation',
  'Secure Checkout',
  'Free Express Delivery',
]

const FEATURES = [
  {
    num: '01',
    icon: '✦',
    title: 'AI Personal Stylist',
    text: 'Get outfit recommendations tailored to your style, body, and occasion — powered by AI that truly understands you.',
  },
  {
    num: '02',
    icon: '◈',
    title: 'Luxury Curation',
    text: 'Every piece is handpicked for quality, exclusivity, and timeless elegance. Nothing ordinary. Ever.',
  },
  {
    num: '03',
    icon: '⟡',
    title: 'Seamless Checkout',
    text: 'Fast, secure payments via Flutterwave. Your order delivered with the precision you deserve.',
  },
]

const STATS = [
  { num: '4.9★', label: 'Average Rating' },
  { num: '12K+', label: 'Styled Clients' },
  { num: '48H', label: 'Express Delivery' },
]

type ButtonProps = {
  to?: string
  onClick?: () => void
  children: ReactNode
  fullWidth?: boolean
}

/* ── Atoms ── */

function BtnPrimary({ to, onClick, children, fullWidth }: ButtonProps) {
  const s: CSSProperties = {
    display: 'inline-block',
    padding: '14px 36px',
    fontSize: 10,
    letterSpacing: '0.25em',
    fontFamily: "'Montserrat',sans-serif",
    fontWeight: 500,
    textTransform: 'uppercase',
    textDecoration: 'none',
    background: 'var(--gold)',
    color: '#000',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.3s',
    ...(fullWidth ? { width: '100%', textAlign: 'center' as const } : {}),
  }

  const h = {
    onMouseEnter: (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      e.currentTarget.style.background = 'var(--gold-light)'
    },
    onMouseLeave: (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      e.currentTarget.style.background = 'var(--gold)'
    },
  }

  return to ? (
    <Link to={to} style={s} {...h}>
      {children}
    </Link>
  ) : (
    <button onClick={onClick} style={s} {...h}>
      {children}
    </button>
  )
}

function BtnGhost({ to, onClick, children, fullWidth }: ButtonProps) {
  const s: CSSProperties = {
    display: 'inline-block',
    padding: '14px 36px',
    fontSize: 10,
    letterSpacing: '0.25em',
    fontFamily: "'Montserrat',sans-serif",
    fontWeight: 500,
    textTransform: 'uppercase',
    textDecoration: 'none',
    background: 'transparent',
    color: 'var(--gold)',
    border: '0.5px solid var(--gold)',
    cursor: 'pointer',
    transition: 'all 0.3s',
    ...(fullWidth ? { width: '100%', textAlign: 'center' as const } : {}),
  }

  const h = {
    onMouseEnter: (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      e.currentTarget.style.background = 'var(--gold)'
      e.currentTarget.style.color = '#000'
    },
    onMouseLeave: (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      e.currentTarget.style.background = 'transparent'
      e.currentTarget.style.color = 'var(--gold)'
    },
  }

  return to ? (
    <Link to={to} style={s} {...h}>
      {children}
    </Link>
  ) : (
    <button onClick={onClick} style={s} {...h}>
      {children}
    </button>
  )
}

/* ── Orbital SVG ── */
function OrbitalSVG() {
  const ticks = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2
    const isMaj = i % 6 === 0
    return {
      x1: Math.cos(a) * 208,
      y1: Math.sin(a) * 208,
      x2: Math.cos(a) * (isMaj ? 196 : 200),
      y2: Math.sin(a) * (isMaj ? 196 : 200),
      stroke: isMaj ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.2)',
      sw: isMaj ? 1.5 : 0.5,
    }
  })

  return (
    <svg
      viewBox="0 0 420 420"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <g transform="translate(210,210)">
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.stroke}
            strokeWidth={t.sw}
          />
        ))}
      </g>
    </svg>
  )
}

/* ── Feature Card ── */
function FeatureCard({
  num,
  icon,
  title,
  text,
}: {
  num: string
  icon: string
  title: string
  text: string
}) {
  const barRef = useRef<HTMLDivElement | null>(null)

  return (
    <div
      className="volt-feat-card"
      style={{
        background: 'var(--volt-bg)',
        padding: '48px 36px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'background 0.4s',
      }}
      onMouseEnter={(e: MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.background = 'rgba(201,168,76,0.04)'
        if (barRef.current) barRef.current.style.transform = 'scaleX(1)'
      }}
      onMouseLeave={(e: MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.background = 'var(--volt-bg)'
        if (barRef.current) barRef.current.style.transform = 'scaleX(0)'
      }}
    >
      <div
        ref={barRef}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: 'var(--gold)',
          transform: 'scaleX(0)',
          transition: 'transform 0.4s ease',
          transformOrigin: 'left',
        }}
      />
      <span
        style={{
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: 72,
          color: 'rgba(201,168,76,0.08)',
          lineHeight: 1,
          position: 'absolute',
          top: 24,
          right: 24,
          pointerEvents: 'none',
        }}
      >
        {num}
      </span>
      <div
        style={{
          width: 48,
          height: 48,
          border: '0.5px solid var(--gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 28,
          fontSize: 18,
        }}
      >
        {icon}
      </div>
      <p
        style={{
          fontSize: 10,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'var(--volt-text)',
          marginBottom: 16,
          fontWeight: 500,
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: 16,
          color: 'var(--volt-muted)',
          lineHeight: 1.7,
        }}
      >
        {text}
      </p>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   HOME
══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()
  const marqueeItems = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const navLinkS: CSSProperties = {
    fontSize: 10,
    letterSpacing: '0.3em',
    color: 'var(--volt-muted)',
    textDecoration: 'none',
    textTransform: 'uppercase',
    transition: 'color 0.3s',
    fontFamily: "'Montserrat', sans-serif",
  }

  const navH = {
    onMouseEnter: (e: MouseEvent<HTMLAnchorElement>) => {
      e.currentTarget.style.color = 'var(--gold)'
    },
    onMouseLeave: (e: MouseEvent<HTMLAnchorElement>) => {
      e.currentTarget.style.color = 'var(--volt-muted)'
    },
  }

  const btnLoginS: CSSProperties = {
    fontSize: 10,
    letterSpacing: '0.25em',
    fontFamily: "'Montserrat', sans-serif",
    textTransform: 'uppercase',
    textDecoration: 'none',
    padding: '8px 20px',
    border: '0.5px solid rgba(201,168,76,0.4)',
    color: 'var(--volt-muted)',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  }

  const btnSignupS: CSSProperties = {
    fontSize: 10,
    letterSpacing: '0.25em',
    fontFamily: "'Montserrat', sans-serif",
    textTransform: 'uppercase',
    textDecoration: 'none',
    padding: '8px 20px',
    background: 'var(--gold)',
    color: '#000',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.3s ease',
  }

  return (
    <div
      style={{
        background: 'var(--volt-bg)',
        color: 'var(--volt-text)',
        fontFamily: "'Montserrat',sans-serif",
        overflowX: 'hidden',
        minHeight: '100vh',
      }}
    >
      <style>{KEYFRAMES}</style>

      <nav
        className="volt-nav"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 40px',
          boxSizing: 'border-box',
          borderBottom: scrolled
            ? '0.5px solid rgba(201,168,76,0.2)'
            : '0.5px solid transparent',
          background: scrolled ? 'rgba(8,8,8,0.97)' : 'rgba(8,8,8,0.92)',
          backdropFilter: 'blur(12px)',
          transition: 'all 0.3s ease',
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 28,
            letterSpacing: '0.15em',
            color: 'var(--gold)',
            textDecoration: 'none',
          }}
          className="volt-nav-logo"
        >
          VŌLT
        </Link>

        <div className="volt-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          {[
            ['Shop', '/shop'],
            ['AI Stylist', '/stylist'],
          ].map(([l, p]) => (
            <Link key={p} to={p} style={navLinkS} {...navH}>
              {l}
            </Link>
          ))}
        </div>

        <div className="volt-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link to="/cart" style={navLinkS} {...navH}>
            Cart
          </Link>

          {user ? (
            <button
              onClick={handleSignOut}
              style={btnLoginS}
              onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.borderColor = 'var(--gold)'
                e.currentTarget.style.color = 'var(--gold)'
              }}
              onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'
                e.currentTarget.style.color = 'var(--volt-muted)'
              }}
            >
              Sign Out
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <Link
                to="/login"
                style={btnLoginS}
                onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.borderColor = 'var(--gold)'
                  e.currentTarget.style.color = 'var(--gold)'
                }}
                onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'
                  e.currentTarget.style.color = 'var(--volt-muted)'
                }}
              >
                Login
              </Link>
              <Link
                to="/login"
                style={btnSignupS}
                onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.background = 'var(--gold-light)'
                }}
                onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.background = 'var(--gold)'
                }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <button
          className="volt-nav-mobile"
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          onClick={() => setMobileMenuOpen((o) => !o)}
        >
          {mobileMenuOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <line x1="4" y1="4" x2="16" y2="16" stroke="var(--gold)" strokeWidth="1.5" />
              <line x1="16" y1="4" x2="4" y2="16" stroke="var(--gold)" strokeWidth="1.5" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <line x1="3" y1="6" x2="17" y2="6" stroke="var(--volt-muted)" strokeWidth="1.5" />
              <line x1="3" y1="10" x2="17" y2="10" stroke="var(--volt-muted)" strokeWidth="1.5" />
              <line x1="3" y1="14" x2="17" y2="14" stroke="var(--volt-muted)" strokeWidth="1.5" />
            </svg>
          )}
        </button>
      </nav>

      <div
        style={{
          position: 'fixed',
          top: 68,
          left: 0,
          width: '100%',
          zIndex: 199,
          background: 'rgba(8,8,8,0.98)',
          borderBottom: '0.5px solid rgba(201,168,76,0.2)',
          backdropFilter: 'blur(12px)',
          padding: '24px 40px',
          display: mobileMenuOpen ? 'flex' : 'none',
          flexDirection: 'column',
          gap: 20,
          boxSizing: 'border-box',
        }}
      >
        {[
          ['Home', '/'],
          ['Shop', '/shop'],
          ['AI Stylist', '/stylist'],
          ['Cart', '/cart'],
        ].map(([l, p]) => (
          <Link
            key={p}
            to={p}
            style={{ ...navLinkS, fontSize: 12 }}
            onClick={() => setMobileMenuOpen(false)}
            {...navH}
          >
            {l}
          </Link>
        ))}
        <div style={{ height: '0.5px', background: 'var(--volt-line)' }} />
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          {user ? (
            <button
              onClick={() => {
                void handleSignOut()
                setMobileMenuOpen(false)
              }}
              style={btnLoginS}
            >
              Sign Out
            </button>
          ) : (
            <>
              <Link to="/login" style={btnLoginS} onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link to="/login" style={btnSignupS} onClick={() => setMobileMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      <div style={{ height: 68 }} />

      <section
        className="volt-hero"
        style={{
          position: 'relative',
          minHeight: '92vh',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          overflow: 'hidden',
        }}
      >
        <div
          className="volt-hero-left"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px 60px 80px 40px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <p
            style={{
              fontSize: 9,
              letterSpacing: '0.6em',
              color: 'var(--gold)',
              textTransform: 'uppercase',
              marginBottom: 24,
              animation: 'voltFadeUp 0.8s 0.2s ease both',
            }}
          >
            New Collection — 2026
          </p>

          <div style={{ position: 'relative', display: 'inline-block', width: 'fit-content' }}>
            <div
              className="volt-hero-outline"
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 'clamp(100px,14vw,180px)',
                lineHeight: 0.9,
                letterSpacing: '0.05em',
                WebkitTextStroke: '1px rgba(201,168,76,0.22)',
                color: 'transparent',
                position: 'absolute',
                top: 6,
                left: 6,
                pointerEvents: 'none',
              }}
            >
              VŌLT
            </div>
            <h1
              className="volt-hero-title"
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 'clamp(100px,14vw,180px)',
                lineHeight: 0.9,
                letterSpacing: '0.05em',
                color: 'var(--gold)',
                animation: 'voltFadeUp 0.8s 0.4s ease both',
                position: 'relative',
              }}
            >
              VŌLT
            </h1>
          </div>

          <p
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 18,
              fontStyle: 'italic',
              color: 'rgba(232,224,208,0.6)',
              marginTop: 28,
              lineHeight: 1.6,
              maxWidth: 360,
              animation: 'voltFadeUp 0.8s 0.6s ease both',
            }}
          >
            Luxury redefined. Every piece crafted for those who command attention.
          </p>

          <div
            className="volt-hero-rule"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '20px 0 32px',
              animation: 'voltFadeUp 0.8s 0.7s ease both',
            }}
          >
            <div style={{ flex: 1, height: '0.5px', background: 'var(--volt-line)', maxWidth: 120 }} />
            <span
              style={{
                fontSize: 8,
                letterSpacing: '0.4em',
                color: 'var(--volt-muted)',
                textTransform: 'uppercase',
              }}
            >
              AI-Powered Personal Styling
            </span>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--volt-line)', maxWidth: 120 }} />
          </div>

          <div
            className="volt-hero-btns"
            style={{ display: 'flex', gap: 12, animation: 'voltFadeUp 0.8s 0.85s ease both' }}
          >
            <BtnPrimary to="/shop">Shop Now</BtnPrimary>
            <BtnGhost to="/stylist">Meet Your Stylist</BtnGhost>
          </div>

          {!user && (
            <div
              className="volt-hero-auth"
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                marginTop: 16,
                animation: 'voltFadeUp 0.8s 1s ease both',
              }}
            >
              <Link
                to="/login"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  color: 'var(--gold)',
                  textDecoration: 'underline',
                  fontFamily: "'Montserrat',sans-serif",
                }}
              >
                Create an account
              </Link>
              <span style={{ color: 'var(--volt-muted)', fontSize: 12 }}>·</span>
              <Link
                to="/login"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  color: 'var(--volt-muted)',
                  textDecoration: 'underline',
                  fontFamily: "'Montserrat',sans-serif",
                }}
              >
                Sign in
              </Link>
            </div>
          )}
        </div>

        <div className="volt-hero-right" style={{ position: 'relative', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 420,
              height: 420,
            }}
          >
            <OrbitalSVG />
          </div>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 420,
              height: 420,
              borderRadius: '50%',
              border: '0.5px solid rgba(201,168,76,0.15)',
              animation: 'voltRotate 20s linear infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 280,
              height: 280,
              borderRadius: '50%',
              border: '0.5px solid rgba(201,168,76,0.25)',
              animation: 'voltRotateRev 12s linear infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 160,
              height: 160,
              border: '1px solid var(--gold)',
              animation: 'voltPulse 3s ease-in-out infinite',
              transform: 'translate(-50%,-50%) rotate(45deg)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 8,
              height: 8,
              background: 'var(--gold)',
              borderRadius: '50%',
            }}
          />
          <p
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, calc(-50% + 120px))',
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 13,
              letterSpacing: '0.5em',
              color: 'rgba(201,168,76,0.4)',
              whiteSpace: 'nowrap',
            }}
          >
            LUXURY · PRECISION · CRAFT
          </p>
        </div>
      </section>

      <div
        style={{
          overflow: 'hidden',
          borderTop: '0.5px solid var(--volt-line)',
          borderBottom: '0.5px solid var(--volt-line)',
          padding: '14px 0',
          background: 'var(--volt-bg2)',
        }}
      >
        <div style={{ display: 'flex', animation: 'voltMarquee 18s linear infinite', width: 'max-content' }}>
          {marqueeItems.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                padding: '0 32px',
                fontSize: 9,
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: 'var(--volt-muted)',
                whiteSpace: 'nowrap',
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 4,
                  background: 'var(--gold)',
                  transform: 'rotate(45deg)',
                  flexShrink: 0,
                }}
              />
              {item}
            </div>
          ))}
        </div>
      </div>

      <section className="volt-feat-sec" style={{ padding: '100px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <p
          style={{
            fontSize: 9,
            letterSpacing: '0.6em',
            color: 'var(--gold)',
            textTransform: 'uppercase',
            textAlign: 'center',
            marginBottom: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
          }}
        >
          <span style={{ height: '0.5px', width: 80, background: 'var(--volt-line)' }} />
          What We Offer
          <span style={{ height: '0.5px', width: 80, background: 'var(--volt-line)' }} />
        </p>

        <div
          className="volt-feat-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: 1,
            background: 'var(--volt-line)',
            border: '0.5px solid var(--volt-line)',
          }}
        >
          {FEATURES.map((f) => (
            <FeatureCard key={f.num} {...f} />
          ))}
        </div>
      </section>

      <div
        className="volt-stats-bar"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
          background: 'var(--volt-line)',
          borderTop: '0.5px solid var(--volt-line)',
          borderBottom: '0.5px solid var(--volt-line)',
          overflow: 'hidden',
        }}
      >
        {STATS.map((s) => (
          <div
            key={s.label}
            style={{
              flex: 1,
              maxWidth: 280,
              background: 'var(--volt-bg)',
              padding: '36px 24px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 48,
                color: 'var(--gold)',
                letterSpacing: '0.05em',
                lineHeight: 1,
                marginBottom: 8,
              }}
            >
              {s.num}
            </p>
            <p
              style={{
                fontSize: 9,
                letterSpacing: '0.3em',
                color: 'var(--volt-muted)',
                textTransform: 'uppercase',
              }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <section style={{ position: 'relative', padding: '120px 40px', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {[0, 30, 60, 90, 120, 150].map((a) => (
            <div
              key={a}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(-50%,-50%) rotate(${a}deg)`,
                width: '200%',
                height: '0.5px',
                background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.1),transparent)',
              }}
            />
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 680, margin: '0 auto' }}>
          <p
            style={{
              fontSize: 9,
              letterSpacing: '0.6em',
              color: 'var(--gold)',
              textTransform: 'uppercase',
              marginBottom: 28,
            }}
          >
            Exclusive Access
          </p>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 'clamp(32px,5vw,60px)',
              fontWeight: 300,
              lineHeight: 1.2,
              color: 'var(--volt-text)',
              marginBottom: 24,
              letterSpacing: '0.02em',
            }}
          >
            Style starts with
            <br />a <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>conversation</em>
          </h2>
          <p
            style={{
              fontSize: 13,
              color: 'var(--volt-muted)',
              lineHeight: 1.8,
              marginBottom: 44,
              maxWidth: 440,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Tell our AI stylist your occasion, your vibe, your budget — and get a full outfit built
            just for you in seconds.
          </p>

          <div
            className="volt-cta-btns"
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <BtnPrimary to="/stylist">Try the Stylist →</BtnPrimary>
            {!user && <BtnGhost to="/login">Join VŌLT Free</BtnGhost>}
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '0.5px solid var(--volt-line)', padding: 40 }}>
        <div
          className="volt-footer-in"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
          }}
        >
          <span
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 24,
              letterSpacing: '0.15em',
              color: 'var(--gold)',
            }}
          >
            VŌLT
          </span>

          <p
            style={{
              fontSize: 9,
              letterSpacing: '0.3em',
              color: 'var(--volt-muted)',
              textTransform: 'uppercase',
            }}
          >
            © 2026 VŌLT. All rights reserved.
          </p>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              ['Shop', '/shop'],
              ['Stylist', '/stylist'],
              ['Cart', '/cart'],
            ].map(([l, p]) => (
              <Link
                key={p}
                to={p}
                style={{
                  fontSize: 9,
                  letterSpacing: '0.3em',
                  color: 'var(--volt-muted)',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  transition: 'color 0.3s',
                }}
                onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.color = 'var(--gold)'
                }}
                onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.color = 'var(--volt-muted)'
                }}
              >
                {l}
              </Link>
            ))}

            {user ? (
              <button
                onClick={handleSignOut}
                style={{
                  fontSize: 9,
                  letterSpacing: '0.3em',
                  color: 'var(--volt-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  fontFamily: "'Montserrat',sans-serif",
                  transition: 'color 0.3s',
                }}
                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.color = 'var(--gold)'
                }}
                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.color = 'var(--volt-muted)'
                }}
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                style={{
                  fontSize: 9,
                  letterSpacing: '0.3em',
                  color: 'var(--volt-muted)',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  transition: 'color 0.3s',
                  fontFamily: "'Montserrat',sans-serif",
                }}
                onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.color = 'var(--gold)'
                }}
                onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.color = 'var(--volt-muted)'
                }}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}