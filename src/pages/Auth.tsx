import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

/* ════════════════════════════════════════════════════════════
   KEYFRAMES
════════════════════════════════════════════════════════════ */
const KEYFRAMES = `
  @keyframes voltFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes voltRotate {
    from { transform: translate(-50%,-50%) rotate(0deg); }
    to   { transform: translate(-50%,-50%) rotate(360deg); }
  }
  @keyframes voltRotateRev {
    from { transform: translate(-50%,-50%) rotate(0deg); }
    to   { transform: translate(-50%,-50%) rotate(-360deg); }
  }
  @keyframes voltPulse {
    0%,100% { opacity:.5; transform:translate(-50%,-50%) rotate(45deg) scale(1); }
    50%      { opacity:1;  transform:translate(-50%,-50%) rotate(45deg) scale(1.06); }
  }
  @keyframes voltShimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }

  @media (max-width: 480px) {
    .volt-auth-card  { padding: 32px 20px !important; }
    .volt-auth-title { font-size: 56px !important; }
  }
`

/* ════════════════════════════════════════════════════════════
   ORBITAL DECORATION — same as Home hero right panel
════════════════════════════════════════════════════════════ */
function OrbitalBg() {
  const ticks = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2
    const isMaj = i % 6 === 0
    return {
      x1: Math.cos(a) * 208, y1: Math.sin(a) * 208,
      x2: Math.cos(a) * (isMaj ? 196 : 200), y2: Math.sin(a) * (isMaj ? 196 : 200),
      stroke: isMaj ? 'rgba(201,168,76,0.35)' : 'rgba(201,168,76,0.12)',
      sw: isMaj ? 1.5 : 0.5,
    }
  })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)`,
        backgroundSize: '56px 56px',
      }} />

      {/* Orbital rings */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', width: 500, height: 500 }}>
        <svg viewBox="0 0 420 420" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, opacity: 0.6 }}>
          <g transform="translate(210,210)">
            {ticks.map((t, i) => (
              <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={t.stroke} strokeWidth={t.sw} />
            ))}
          </g>
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 420, height: 420, borderRadius: '50%', border: '0.5px solid rgba(201,168,76,0.1)', animation: 'voltRotate 24s linear infinite' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 300, height: 300, borderRadius: '50%', border: '0.5px solid rgba(201,168,76,0.15)', animation: 'voltRotateRev 16s linear infinite' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 150, height: 150, border: '0.5px solid rgba(201,168,76,0.2)', animation: 'voltPulse 4s ease-in-out infinite' }} />
      </div>

      {/* Radial glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   AUTH PAGE
════════════════════════════════════════════════════════════ */
export default function Auth() {
  const [isLogin, setIsLogin]   = useState(true)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [message, setMessage]   = useState('')
  const navigate                = useNavigate()

  const switchMode = (login: boolean) => {
    setIsLogin(login)
    setError('')
    setMessage('')
  }

  const handleSubmit = async () => {
    setError('')
    setMessage('')

    if (!email || !password) { setError('Please fill in all fields.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (!isLogin && !name.trim()) { setError('Please enter your full name.'); return }

    setLoading(true)

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else navigate('/')
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      if (error) setError(error.message)
      else if (data.user && !data.session) setMessage('Account created! Check your email to confirm.')
      else navigate('/')
    }

    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '0.5px solid var(--volt-line)',
    color: 'var(--volt-text)',
    fontFamily: "'Montserrat', sans-serif",
    fontSize: 12,
    letterSpacing: '0.04em',
    padding: '13px 16px',
    outline: 'none',
    transition: 'border-color 0.25s, background 0.25s',
    boxSizing: 'border-box' as const,
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 9,
    letterSpacing: '0.35em',
    color: 'var(--volt-muted)',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: 8,
  }

  return (
    <div style={{
      background: '#080808',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Montserrat', sans-serif",
      color: 'var(--volt-text)',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{KEYFRAMES}</style>
      <OrbitalBg />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}>

        {/* ── LOGO ─────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 40, animation: 'voltFadeUp 0.6s 0.1s ease both' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1
              className="volt-auth-title"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 72,
                letterSpacing: '0.15em',
                color: 'var(--gold)',
                lineHeight: 1,
                marginBottom: 10,
              }}
            >
              VŌLT
            </h1>
          </Link>

          {/* Divider row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 10 }}>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--volt-line)', maxWidth: 60 }} />
            <div style={{ width: 4, height: 4, transform: 'rotate(45deg)', background: 'var(--gold)', flexShrink: 0 }} />
            <div style={{ flex: 1, height: '0.5px', background: 'var(--volt-line)', maxWidth: 60 }} />
          </div>

          <p style={{ fontSize: 9, letterSpacing: '0.5em', color: 'var(--volt-muted)', textTransform: 'uppercase' }}>
            {isLogin ? 'Welcome Back' : 'Join the House'}
          </p>
        </div>

        {/* ── CARD ─────────────────────────────────────────── */}
        <div
          className="volt-auth-card"
          style={{
            background: '#0c0c0c',
            border: '0.5px solid var(--volt-line)',
            padding: '40px 36px',
            position: 'relative',
            animation: 'voltFadeUp 0.6s 0.25s ease both',
          }}
        >
          {/* Corner ornaments */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: 28, height: 28, borderRight: '0.5px solid rgba(201,168,76,0.2)', borderBottom: '0.5px solid rgba(201,168,76,0.2)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderLeft: '0.5px solid rgba(201,168,76,0.2)', borderTop: '0.5px solid rgba(201,168,76,0.2)', pointerEvents: 'none' }} />

          {/* ── TAB TOGGLE ─────────────────────────────────── */}
          <div style={{ display: 'flex', marginBottom: 32, border: '0.5px solid var(--volt-line)' }}>
            {[{ label: 'Sign In', val: true }, { label: 'Register', val: false }].map(({ label, val }) => (
              <button
                key={label}
                onClick={() => switchMode(val)}
                style={{
                  flex: 1, padding: '12px 0',
                  fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase',
                  fontFamily: "'Montserrat', sans-serif",
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.25s',
                  background: isLogin === val ? 'var(--gold)' : 'transparent',
                  color: isLogin === val ? '#000' : 'var(--volt-muted)',
                  fontWeight: isLogin === val ? 500 : 400,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── FIELDS ─────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24 }}>

            {/* Full name — signup only */}
            {!isLogin && (
              <div style={{ animation: 'voltFadeUp 0.3s ease both' }}>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Your full name"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.background = 'rgba(201,168,76,0.05)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--volt-line)'; e.target.style.background = 'rgba(255,255,255,0.03)' }}
                />
              </div>
            )}

            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="your@email.com"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.background = 'rgba(201,168,76,0.05)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--volt-line)'; e.target.style.background = 'rgba(255,255,255,0.03)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                {isLogin && (
                  <span
                    style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--volt-muted)', cursor: 'pointer', textDecoration: 'underline', textTransform: 'uppercase', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--volt-muted)')}
                  >
                    Forgot?
                  </span>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.background = 'rgba(201,168,76,0.05)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--volt-line)'; e.target.style.background = 'rgba(255,255,255,0.03)' }}
              />
              {!isLogin && (
                <p style={{ fontSize: 9, color: 'var(--volt-muted)', marginTop: 6, letterSpacing: '0.05em' }}>
                  Minimum 6 characters
                </p>
              )}
            </div>
          </div>

          {/* ── FEEDBACK ───────────────────────────────────── */}
          {error && (
            <div style={{
              padding: '10px 14px', marginBottom: 20,
              background: 'rgba(226,75,74,0.08)',
              border: '0.5px solid rgba(226,75,74,0.25)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#E24B4A', flexShrink: 0 }} />
              <p style={{ fontSize: 11, color: '#E24B4A', letterSpacing: '0.03em' }}>{error}</p>
            </div>
          )}

          {message && (
            <div style={{
              padding: '10px 14px', marginBottom: 20,
              background: 'rgba(201,168,76,0.08)',
              border: '0.5px solid rgba(201,168,76,0.25)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
              <p style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '0.03em' }}>{message}</p>
            </div>
          )}

          {/* ── SUBMIT BUTTON ──────────────────────────────── */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '15px',
              background: loading ? 'rgba(201,168,76,0.5)' : 'var(--gold)',
              color: '#000',
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 500, fontSize: 11,
              letterSpacing: '0.25em', textTransform: 'uppercase',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.25s',
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--gold-light)' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--gold)' }}
          >
            {loading ? 'Please wait…' : isLogin ? 'Sign In →' : 'Create Account →'}
          </button>

          {/* ── SWITCH MODE ────────────────────────────────── */}
          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--volt-muted)', marginTop: 24, letterSpacing: '0.04em' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span
              onClick={() => switchMode(!isLogin)}
              style={{ color: 'var(--gold)', cursor: 'pointer', borderBottom: '0.5px solid var(--gold)', paddingBottom: 1, transition: 'opacity 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </span>
          </p>
        </div>

        {/* ── FOOTER NOTE ──────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginTop: 28, animation: 'voltFadeUp 0.6s 0.4s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 10 }}>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--volt-line)', maxWidth: 80 }} />
            <p style={{ fontSize: 8, letterSpacing: '0.4em', color: 'var(--volt-muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Protected by Supabase Auth
            </p>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--volt-line)', maxWidth: 80 }} />
          </div>
          <Link
            to="/"
            style={{ fontSize: 9, letterSpacing: '0.3em', color: 'var(--volt-muted)', textDecoration: 'none', textTransform: 'uppercase', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--volt-muted)')}
          >
            ← Back to VŌLT
          </Link>
        </div>

      </div>
    </div>
  )
}