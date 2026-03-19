import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Style me for a night out',
  'What goes with the Obsidian Blazer?',
  'Build a full look under ₦300,000',
  'What to wear to a business meeting?',
]

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

/* ════════════════════════════════════════════════════════════
   KEYFRAMES + RESPONSIVE
════════════════════════════════════════════════════════════ */
const KEYFRAMES = `
  @keyframes voltFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes voltTyping {
    0%, 60%, 100% { transform: translateY(0);    opacity: 0.4; }
    30%           { transform: translateY(-5px); opacity: 1; }
  }
  @keyframes voltPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0); }
    50%      { box-shadow: 0 0 0 6px rgba(201,168,76,0.08); }
  }
  @keyframes voltScanline {
    from { transform: translateY(-100%); }
    to   { transform: translateY(100vh); }
  }

  /* ── Responsive ─────────────────────────────── */
  @media (max-width: 768px) {
    .volt-stylist-header  { padding: 84px 16px 16px !important; }
    .volt-stylist-title   { font-size: 28px !important; }
    .volt-stylist-msgs    { padding: 20px 16px !important; }
    .volt-stylist-input   { padding: 14px 16px !important; }
    .volt-stylist-input-row { gap: 8px !important; }
    .volt-stylist-send    { width: 46px !important; height: 46px !important; flex-shrink: 0; }
    .volt-bubble          { max-width: 88% !important; }
    .volt-suggestions     { padding: 0 16px 16px !important; }
    .volt-suggest-btn     { font-size: 9px !important; padding: 7px 12px !important; }
    .volt-stylist-footer  { font-size: 8px !important; }
    .volt-avatar          { width: 28px !important; height: 28px !important; margin-right: 8px !important; }
    .volt-avatar span     { font-size: 13px !important; }
  }

  @media (max-width: 480px) {
    .volt-stylist-title   { font-size: 24px !important; letter-spacing: 0.1em !important; }
    .volt-bubble          { max-width: 92% !important; font-size: 14px !important; padding: 12px 14px !important; }
    .volt-suggest-row     { gap: 6px !important; }
  }
`

/* ════════════════════════════════════════════════════════════
   AMBIENT BACKGROUND
════════════════════════════════════════════════════════════ */
function AmbientBg() {
  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 80,
          height: 80,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <svg viewBox="0 0 80 80" width="80" height="80">
          <path d="M0 40 L0 0 L40 0" fill="none" stroke="rgba(201,168,76,0.12)" strokeWidth="0.5" />
          <path d="M0 20 L0 0 L20 0" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="0.5" />
        </svg>
      </div>
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: 80,
          height: 80,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <svg viewBox="0 0 80 80" width="80" height="80">
          <path d="M80 40 L80 80 L40 80" fill="none" stroke="rgba(201,168,76,0.12)" strokeWidth="0.5" />
          <path d="M80 60 L80 80 L60 80" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="0.5" />
        </svg>
      </div>
    </>
  )
}

/* ════════════════════════════════════════════════════════════
   ASSISTANT AVATAR
════════════════════════════════════════════════════════════ */
function Avatar() {
  return (
    <div
      className="volt-avatar"
      style={{
        width: 36,
        height: 36,
        flexShrink: 0,
        border: '0.5px solid var(--gold)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 2,
        background: 'rgba(201,168,76,0.05)',
        animation: 'voltPulse 3s ease-in-out infinite',
      }}
    >
      <span
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 16,
          color: 'var(--gold)',
          lineHeight: 1,
        }}
      >
        V
      </span>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   MESSAGE BUBBLE
════════════════════════════════════════════════════════════ */
function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        animation: 'voltFadeUp 0.35s ease both',
      }}
    >
      {!isUser && <Avatar />}
      <div
        className="volt-bubble"
        style={{
          maxWidth: '70%',
          padding: '16px 20px',
          lineHeight: 1.75,
          fontFamily: isUser ? "'Montserrat', sans-serif" : "'Cormorant Garamond', serif",
          fontSize: isUser ? 12 : 16,
          letterSpacing: isUser ? '0.03em' : '0.01em',
          background: isUser ? 'var(--gold)' : 'rgba(201,168,76,0.05)',
          color: isUser ? '#000' : 'var(--volt-text)',
          borderLeft: isUser ? 'none' : '1px solid var(--gold)',
          position: 'relative',
        }}
      >
        {isUser && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 8,
              height: 8,
              borderTop: '0.5px solid rgba(0,0,0,0.15)',
              borderLeft: '0.5px solid rgba(0,0,0,0.15)',
            }}
          />
        )}
        {msg.content}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   TYPING INDICATOR
════════════════════════════════════════════════════════════ */
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', animation: 'voltFadeUp 0.3s ease both' }}>
      <Avatar />
      <div
        style={{
          padding: '16px 20px',
          background: 'rgba(201,168,76,0.05)',
          borderLeft: '1px solid var(--gold)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: 'var(--gold)',
              animation: `voltTyping 1.1s ${i * 0.18}s ease infinite`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════ */
export default function Stylist() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Welcome to VŌLT. I'm your personal stylist — tell me your occasion, your vibe, or your budget and I'll build the perfect look for you.",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const userMsg: Message = { role: 'user', content }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)
    inputRef.current?.focus()

    try {
      const res = await fetch(`${API_BASE_URL}/api/stylist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Request failed')
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (error) {
      console.error(error)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'My apologies — something went wrong. Please try again.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const canSend = !!input.trim() && !loading

  return (
    <div
      style={{
        background: '#080808',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Montserrat', sans-serif",
        color: 'var(--volt-text)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{KEYFRAMES}</style>
      <AmbientBg />

      <header
        className="volt-stylist-header"
        style={{
          position: 'relative',
          zIndex: 10,
          borderBottom: '0.5px solid var(--volt-line)',
          padding: '28px 40px 22px',
          paddingTop: 96,
          textAlign: 'center',
          background: 'rgba(8,8,8,0.9)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <p
          style={{
            fontSize: 9,
            letterSpacing: '0.6em',
            color: 'var(--gold)',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          Exclusive Service
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            marginBottom: 10,
          }}
        >
          <div style={{ flex: 1, height: '0.5px', background: 'var(--volt-line)', maxWidth: 80 }} />
          <h1
            className="volt-stylist-title"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 36,
              letterSpacing: '0.18em',
              color: 'var(--gold)',
              lineHeight: 1,
              margin: 0,
            }}
          >
            AI STYLIST
          </h1>
          <div style={{ flex: 1, height: '0.5px', background: 'var(--volt-line)', maxWidth: 80 }} />
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#4ade80',
              animation: 'voltPulse 2s ease-in-out infinite',
            }}
          />
          <p
            style={{
              fontSize: 9,
              letterSpacing: '0.3em',
              color: 'var(--volt-muted)',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            Powered by VŌLT Intelligence
          </p>
        </div>
      </header>

      <main
        className="volt-stylist-msgs"
        style={{
          flex: 1,
          overflowY: 'auto',
          position: 'relative',
          zIndex: 5,
          padding: '28px 24px',
          scrollBehavior: 'smooth',
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          {messages.map((msg, i) => (
            <Bubble key={i} msg={msg} />
          ))}

          {loading && <TypingIndicator />}

          <div ref={bottomRef} />
        </div>
      </main>

      {messages.length === 1 && !loading && (
        <div
          className="volt-suggestions"
          style={{
            position: 'relative',
            zIndex: 10,
            padding: '0 24px 18px',
          }}
        >
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <p
              style={{
                fontSize: 9,
                letterSpacing: '0.4em',
                color: 'var(--volt-muted)',
                textTransform: 'uppercase',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span
                style={{
                  flex: 1,
                  height: '0.5px',
                  background: 'var(--volt-line)',
                  maxWidth: 40,
                  display: 'inline-block',
                }}
              />
              Suggested
              <span
                style={{
                  flex: 1,
                  height: '0.5px',
                  background: 'var(--volt-line)',
                  maxWidth: 40,
                  display: 'inline-block',
                }}
              />
            </p>

            <div className="volt-suggest-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className="volt-suggest-btn"
                  onClick={() => sendMessage(s)}
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    padding: '8px 16px',
                    border: '0.5px solid var(--volt-line)',
                    color: 'var(--volt-muted)',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontFamily: "'Montserrat', sans-serif",
                    transition: 'all 0.25s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--gold)'
                    e.currentTarget.style.color = 'var(--gold)'
                    e.currentTarget.style.background = 'rgba(201,168,76,0.04)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--volt-line)'
                    e.currentTarget.style.color = 'var(--volt-muted)'
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        className="volt-stylist-input"
        style={{
          position: 'relative',
          zIndex: 10,
          borderTop: '0.5px solid var(--volt-line)',
          padding: '16px 24px 20px',
          background: 'rgba(8,8,8,0.97)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div
            className="volt-stylist-input-row"
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'stretch',
            }}
          >
            <div
              style={{
                flex: 1,
                position: 'relative',
                borderLeft: '2px solid var(--gold)',
                transition: 'border-color 0.3s',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your stylist anything…"
                style={{
                  width: '100%',
                  background: 'rgba(201,168,76,0.04)',
                  border: '0.5px solid var(--volt-line)',
                  borderLeft: 'none',
                  color: 'var(--volt-text)',
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 12,
                  letterSpacing: '0.04em',
                  padding: '14px 18px',
                  outline: 'none',
                  transition: 'background 0.2s, border-color 0.2s',
                  boxSizing: 'border-box',
                  height: '100%',
                }}
                onFocus={e => {
                  e.currentTarget.style.background = 'rgba(201,168,76,0.07)'
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'
                }}
                onBlur={e => {
                  e.currentTarget.style.background = 'rgba(201,168,76,0.04)'
                  e.currentTarget.style.borderColor = 'var(--volt-line)'
                }}
              />
            </div>

            <button
              className="volt-stylist-send"
              onClick={() => sendMessage()}
              disabled={!canSend}
              style={{
                width: 52,
                height: 52,
                background: canSend ? 'var(--gold)' : 'rgba(201,168,76,0.1)',
                border: canSend ? 'none' : '0.5px solid var(--volt-line)',
                cursor: canSend ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.25s ease',
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                if (canSend) e.currentTarget.style.background = 'var(--gold-light)'
              }}
              onMouseLeave={e => {
                if (canSend) e.currentTarget.style.background = 'var(--gold)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                  stroke={canSend ? '#000' : 'var(--volt-muted)'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div
            className="volt-stylist-footer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              marginTop: 12,
            }}
          >
            <div style={{ flex: 1, height: '0.5px', background: 'var(--volt-line)' }} />
            <p
              style={{
                fontSize: 9,
                letterSpacing: '0.3em',
                color: 'var(--volt-muted)',
                textTransform: 'uppercase',
                margin: 0,
                whiteSpace: 'nowrap',
              }}
            >
              VŌLT AI · Personal Styling Intelligence
            </p>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--volt-line)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}