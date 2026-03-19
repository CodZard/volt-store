import { useNavigate } from 'react-router-dom'
import { useCart } from '../lib/CartContext'
import { useEffect, useState } from 'react'

/* ════════════════════════════════════════════════════════════
   KEYFRAMES
════════════════════════════════════════════════════════════ */
const KEYFRAMES = `
  @keyframes voltFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes voltCheckDraw {
    from { stroke-dashoffset: 60; opacity: 0; }
    to   { stroke-dashoffset: 0;  opacity: 1; }
  }
  @keyframes voltRingPulse {
    0%   { transform: translate(-50%,-50%) scale(0.85); opacity: 0; }
    60%  { transform: translate(-50%,-50%) scale(1.05); opacity: 1; }
    100% { transform: translate(-50%,-50%) scale(1);    opacity: 1; }
  }
  @keyframes voltOrbitA {
    from { transform: translate(-50%,-50%) rotate(0deg); }
    to   { transform: translate(-50%,-50%) rotate(360deg); }
  }
  @keyframes voltOrbitB {
    from { transform: translate(-50%,-50%) rotate(0deg); }
    to   { transform: translate(-50%,-50%) rotate(-360deg); }
  }
  @keyframes voltDiamondPulse {
    0%,100% { opacity: 0.5; transform: translate(-50%,-50%) rotate(45deg) scale(1); }
    50%      { opacity: 1;   transform: translate(-50%,-50%) rotate(45deg) scale(1.06); }
  }
  @keyframes voltConfetti {
    0%   { transform: translateY(0) rotate(0deg);   opacity: 1; }
    100% { transform: translateY(80px) rotate(360deg); opacity: 0; }
  }

  @media (max-width: 480px) {
    .volt-success-title { font-size: 36px !important; }
    .volt-success-btns  { flex-direction: column !important; width: 100% !important; }
    .volt-success-btns button { width: 100% !important; }
  }
`

/* ════════════════════════════════════════════════════════════
   ORBITAL BACKGROUND (lighter version of Home hero)
════════════════════════════════════════════════════════════ */
function OrbitalBg() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px)`,
        backgroundSize: '56px 56px',
      }} />
      {/* Rings */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', width: 560, height: 560, borderRadius: '50%', border: '0.5px solid rgba(201,168,76,0.07)', animation: 'voltOrbitA 28s linear infinite' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', width: 380, height: 380, borderRadius: '50%', border: '0.5px solid rgba(201,168,76,0.1)', animation: 'voltOrbitB 18s linear infinite' }} />
      {/* Radial glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   ANIMATED CHECK ICON
════════════════════════════════════════════════════════════ */
function CheckIcon() {
  return (
    <div style={{ position: 'relative', width: 100, height: 100, marginBottom: 8 }}>
      {/* Outer ring */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 100, height: 100,
        borderRadius: '50%',
        border: '0.5px solid rgba(201,168,76,0.25)',
        animation: 'voltRingPulse 0.7s 0.2s ease both',
      }} />
      {/* Inner square (diamond rotated) */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 68, height: 68,
        border: '1px solid var(--gold)',
        animation: 'voltDiamondPulse 3s 0.8s ease-in-out infinite',
      }} />
      {/* SVG check */}
      <svg
        viewBox="0 0 40 40"
        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 36, height: 36 }}
      >
        <polyline
          points="8,20 16,28 32,12"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="60"
          strokeDashoffset="60"
          style={{ animation: 'voltCheckDraw 0.6s 0.5s ease forwards' }}
        />
      </svg>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   CONFETTI PARTICLES
════════════════════════════════════════════════════════════ */
function Confetti() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    left: `${10 + i * 7}%`,
    delay: `${i * 0.08}s`,
    size: i % 3 === 0 ? 6 : 4,
    color: i % 4 === 0 ? 'var(--gold)' : i % 4 === 1 ? 'var(--gold-light)' : 'rgba(201,168,76,0.4)',
  }))

  return (
    <div style={{ position: 'fixed', top: '15%', left: 0, width: '100%', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.left,
            width: p.size, height: p.size,
            background: p.color,
            transform: 'rotate(45deg)',
            animation: `voltConfetti 1.8s ${p.delay} ease-out both`,
          }}
        />
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   ORDER SUCCESS PAGE
════════════════════════════════════════════════════════════ */
function OrderSuccess() {
  const navigate   = useNavigate()
  const { clearCart } = useCart()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    clearCart()
    // Slight delay so animations feel intentional
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      textAlign: 'center',
      fontFamily: "'Montserrat', sans-serif",
      color: 'var(--volt-text)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{KEYFRAMES}</style>
      <OrbitalBg />
      {visible && <Confetti />}

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>

        {/* ── CHECK ICON ───────────────────────────────── */}
        <div style={{ animation: 'voltFadeUp 0.5s 0.1s ease both', opacity: 0, animationFillMode: 'forwards' }}>
          <CheckIcon />
        </div>

        {/* ── HEADING ──────────────────────────────────── */}
        <div style={{ marginTop: 28, marginBottom: 16, animation: 'voltFadeUp 0.5s 0.4s ease both', opacity: 0, animationFillMode: 'forwards' }}>
          <p style={{ fontSize: 9, letterSpacing: '0.6em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 14 }}>
            Payment Successful
          </p>
          <h1
            className="volt-success-title"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 52, letterSpacing: '0.12em',
              color: 'var(--volt-text)', lineHeight: 1, margin: 0,
            }}
          >
            Order Confirmed
          </h1>
        </div>

        {/* ── DIVIDER ──────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 320, marginBottom: 20, animation: 'voltFadeUp 0.5s 0.55s ease both', opacity: 0, animationFillMode: 'forwards' }}>
          <div style={{ flex: 1, height: '0.5px', background: 'var(--volt-line)' }} />
          <div style={{ width: 4, height: 4, transform: 'rotate(45deg)', background: 'var(--gold)', flexShrink: 0 }} />
          <div style={{ flex: 1, height: '0.5px', background: 'var(--volt-line)' }} />
        </div>

        {/* ── BODY TEXT ────────────────────────────────── */}
        <div style={{ animation: 'voltFadeUp 0.5s 0.65s ease both', opacity: 0, animationFillMode: 'forwards', maxWidth: 400 }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 18, fontStyle: 'italic',
            color: 'var(--volt-muted)', lineHeight: 1.7,
            marginBottom: 6,
          }}>
            Your order has been placed successfully.
          </p>
          <p style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--volt-muted)', textTransform: 'uppercase' }}>
            A confirmation will be sent to your email shortly
          </p>
        </div>

        {/* ── ORDER NOTE ───────────────────────────────── */}
        <div style={{
          marginTop: 28, marginBottom: 36,
          padding: '14px 28px',
          border: '0.5px solid var(--volt-line)',
          background: 'rgba(201,168,76,0.04)',
          animation: 'voltFadeUp 0.5s 0.75s ease both', opacity: 0, animationFillMode: 'forwards',
          position: 'relative',
        }}>
          <p style={{ fontSize: 9, letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 4 }}>
            What's next?
          </p>
          <p style={{ fontSize: 11, color: 'var(--volt-muted)', letterSpacing: '0.05em', lineHeight: 1.7 }}>
            Our team will process your order within 24 hours.<br />
            Delivery within 2–5 business days.
          </p>
          {/* Corner ornaments */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: 16, height: 16, borderRight: '0.5px solid rgba(201,168,76,0.2)', borderBottom: '0.5px solid rgba(201,168,76,0.2)' }} />
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderLeft: '0.5px solid rgba(201,168,76,0.2)', borderTop: '0.5px solid rgba(201,168,76,0.2)' }} />
        </div>

        {/* ── BUTTONS ──────────────────────────────────── */}
        <div
          className="volt-success-btns"
          style={{
            display: 'flex', gap: 12,
            animation: 'voltFadeUp 0.5s 0.85s ease both', opacity: 0, animationFillMode: 'forwards',
          }}
        >
          <button
            onClick={() => navigate('/shop')}
            style={{
              padding: '14px 36px', fontSize: 10,
              letterSpacing: '0.25em', fontFamily: "'Montserrat', sans-serif",
              fontWeight: 500, textTransform: 'uppercase',
              background: 'var(--gold)', color: '#000',
              border: 'none', cursor: 'pointer',
              transition: 'background 0.25s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--gold-light)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--gold)')}
          >
            Continue Shopping
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              padding: '14px 36px', fontSize: 10,
              letterSpacing: '0.25em', fontFamily: "'Montserrat', sans-serif",
              fontWeight: 500, textTransform: 'uppercase',
              background: 'transparent', color: 'var(--gold)',
              border: '0.5px solid var(--gold)', cursor: 'pointer',
              transition: 'all 0.25s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--gold)'
              e.currentTarget.style.color = '#000'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--gold)'
            }}
          >
            Go Home
          </button>
        </div>

      </div>
    </div>
  )
}

export default OrderSuccess