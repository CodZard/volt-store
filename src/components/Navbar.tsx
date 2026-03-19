import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCart } from '../lib/CartContext'
import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = 'codezardsmt@gmail.com'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { count } = useCart()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsAdmin(session?.user?.email === ADMIN_EMAIL)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsAdmin(session?.user?.email === ADMIN_EMAIL)
    })
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

  const navStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 40px',
    borderBottom: scrolled ? '0.5px solid rgba(201,168,76,0.2)' : '0.5px solid transparent',
    background: scrolled ? 'rgba(8,8,8,0.97)' : 'rgba(8,8,8,0.92)',
    backdropFilter: 'blur(12px)',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
  }

  const logoStyle: React.CSSProperties = {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 28,
    letterSpacing: '0.15em',
    color: 'var(--gold)',
    textDecoration: 'none',
  }

  const linkStyle: React.CSSProperties = {
    fontSize: 10,
    letterSpacing: '0.3em',
    color: 'var(--volt-muted)',
    textDecoration: 'none',
    textTransform: 'uppercase',
    transition: 'color 0.3s',
    fontFamily: "'Montserrat', sans-serif",
  }

  const adminLinkStyle: React.CSSProperties = {
    ...linkStyle,
    color: 'var(--gold)',
  }

  const cartBadgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    borderRadius: '50%',
    backgroundColor: 'var(--gold)',
    color: '#000',
    fontSize: 9,
    fontWeight: 600,
    marginLeft: 6,
  }

  const btnLoginStyle: React.CSSProperties = {
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

  const btnSignupStyle: React.CSSProperties = {
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

  const mobileLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/stylist', label: 'AI Stylist' },
    { to: '/cart', label: `Cart${count > 0 ? ` (${count})` : ''}` },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin ✦' }] : []),
  ]

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .volt-nav-center { display: none !important; }
          .volt-nav-right { display: none !important; }
          .volt-hamburger { display: flex !important; }
        }
      `}</style>

      <nav style={navStyle}>

        {/* Logo */}
        <Link to="/" style={logoStyle}>VŌLT</Link>

        {/* Desktop Center Links */}
        <div className="volt-nav-center" style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <Link to="/shop" style={linkStyle}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--volt-muted)')}>
            Shop
          </Link>
          <Link to="/stylist" style={linkStyle}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--volt-muted)')}>
            AI Stylist
          </Link>
          {isAdmin && (
            <Link to="/admin" style={adminLinkStyle}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold-light)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--gold)')}>
              ✦ Admin
            </Link>
          )}
        </div>

        {/* Desktop Right */}
        <div className="volt-nav-right" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link to="/cart" style={linkStyle}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--volt-muted)')}>
            Cart
            {count > 0 && <span style={cartBadgeStyle}>{count}</span>}
          </Link>

          {user ? (
            <button
              onClick={handleSignOut}
              style={btnLoginStyle}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--gold)'
                e.currentTarget.style.color = 'var(--gold)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'
                e.currentTarget.style.color = 'var(--volt-muted)'
              }}
            >
              Sign Out
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/login" style={btnLoginStyle}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--gold)'
                  e.currentTarget.style.color = 'var(--gold)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'
                  e.currentTarget.style.color = 'var(--volt-muted)'
                }}>
                Login
              </Link>
              <Link to="/login" style={btnSignupStyle}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--gold-light)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--gold)')}>
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Hamburger */}
        <button
          className="volt-hamburger"
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
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

      {/* Mobile Menu */}
      <div style={{
        position: 'fixed',
        top: 68,
        left: 0,
        width: '100%',
        background: 'rgba(8,8,8,0.98)',
        borderBottom: '0.5px solid rgba(201,168,76,0.2)',
        backdropFilter: 'blur(12px)',
        padding: '24px 40px',
        display: menuOpen ? 'flex' : 'none',
        flexDirection: 'column',
        gap: 20,
        zIndex: 199,
        boxSizing: 'border-box',
      }}>
        {mobileLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              ...linkStyle,
              fontSize: 12,
              color: link.label.includes('Admin') ? 'var(--gold)' : 'var(--volt-muted)',
            }}
            onClick={() => setMenuOpen(false)}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
            onMouseLeave={e => (e.currentTarget.style.color = link.label.includes('Admin') ? 'var(--gold)' : 'var(--volt-muted)')}
          >
            {link.label}
          </Link>
        ))}

        <div style={{ height: '0.5px', background: 'var(--volt-line)' }} />

        <div style={{ display: 'flex', gap: 10 }}>
          {user ? (
            <button
              onClick={() => { handleSignOut(); setMenuOpen(false) }}
              style={btnLoginStyle}
            >
              Sign Out
            </button>
          ) : (
            <>
              <Link to="/login" style={btnLoginStyle} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/login" style={btnSignupStyle} onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Navbar