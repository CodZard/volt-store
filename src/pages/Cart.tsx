import { useNavigate } from 'react-router-dom'
import { Trash2, ArrowLeft, ShoppingBag } from 'lucide-react'
import { useCart } from '../lib/CartContext'

/* ════════════════════════════════════════════════════════════
   KEYFRAMES + RESPONSIVE
════════════════════════════════════════════════════════════ */
const KEYFRAMES = `
  @keyframes voltFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .volt-cart-item {
    transition: background 0.2s;
  }
  .volt-cart-item:hover {
    background: rgba(201,168,76,0.02);
  }

  .volt-qty-btn {
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    background: transparent; border: none;
    color: var(--volt-muted); cursor: pointer;
    font-size: 16px; font-family: 'Montserrat', sans-serif;
    transition: color 0.2s;
  }
  .volt-qty-btn:hover { color: var(--volt-text); }

  .volt-remove-btn {
    background: transparent; border: none;
    color: var(--volt-muted); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    padding: 6px; transition: color 0.2s;
  }
  .volt-remove-btn:hover { color: #E24B4A; }

  .volt-continue-btn {
    display: flex; align-items: center; gap: 8px;
    background: none; border: none; cursor: pointer;
    font-size: 10px; letter-spacing: 0.3em;
    font-family: 'Montserrat', sans-serif;
    color: var(--volt-muted); text-transform: uppercase;
    transition: color 0.25s; padding: 0;
  }
  .volt-continue-btn:hover { color: var(--volt-text); }

  @media (max-width: 1024px) {
    .volt-cart-layout { grid-template-columns: 1fr !important; }
    .volt-summary     { position: static !important; }
  }

  @media (max-width: 640px) {
    .volt-cart-wrap   { padding: 96px 16px 60px !important; }
    .volt-item-img    { width: 64px !important; height: 80px !important; }
    .volt-item-row    { gap: 12px !important; }
    .volt-item-bottom { flex-wrap: wrap; gap: 12px !important; }
    .volt-cart-header { margin-bottom: 32px !important; }
    .volt-title       { font-size: 36px !important; }
  }
`

/* ════════════════════════════════════════════════════════════
   EMPTY STATE
════════════════════════════════════════════════════════════ */
function EmptyCart({ onShop }: { onShop: () => void }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#080808',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 24, padding: '0 24px',
      fontFamily: "'Montserrat', sans-serif",
    }}>
      <style>{KEYFRAMES}</style>

      {/* Icon with gold border */}
      <div style={{
        width: 80, height: 80,
        border: '0.5px solid var(--volt-line)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'voltFadeUp 0.5s ease both',
      }}>
        <ShoppingBag size={28} color="var(--volt-muted)" />
      </div>

      <div style={{ textAlign: 'center', animation: 'voltFadeUp 0.5s 0.1s ease both' }}>
        <p style={{ fontSize: 9, letterSpacing: '0.6em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 8 }}>
          Nothing here yet
        </p>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 22, fontStyle: 'italic',
          color: 'var(--volt-muted)', letterSpacing: '0.02em',
        }}>
          Your cart is empty
        </p>
      </div>

      <button
        onClick={onShop}
        style={{
          padding: '13px 40px', fontSize: 10,
          letterSpacing: '0.25em', fontFamily: "'Montserrat', sans-serif",
          fontWeight: 500, textTransform: 'uppercase',
          background: 'var(--gold)', color: '#000',
          border: 'none', cursor: 'pointer',
          transition: 'background 0.25s',
          animation: 'voltFadeUp 0.5s 0.2s ease both',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--gold-light)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--gold)')}
      >
        Shop Now →
      </button>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   CART PAGE
════════════════════════════════════════════════════════════ */
export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCart()
  const navigate = useNavigate()

  const formatPrice = (n: number) => '₦' + n.toLocaleString()
  const SHIPPING = 5000

  if (items.length === 0) return <EmptyCart onShop={() => navigate('/shop')} />

  return (
    <div style={{ background: '#080808', minHeight: '100vh', fontFamily: "'Montserrat', sans-serif", color: 'var(--volt-text)' }}>
      <style>{KEYFRAMES}</style>

      <div
        className="volt-cart-wrap"
        style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 40px 80px', animation: 'voltFadeUp 0.5s ease both' }}
      >

        {/* ── PAGE HEADER ────────────────────────────────── */}
        <div className="volt-cart-header" style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontSize: 9, letterSpacing: '0.6em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 14 }}>
            Review
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 6 }}>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--volt-line)', maxWidth: 80 }} />
            <h1
              className="volt-title"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 48, letterSpacing: '0.15em',
                color: 'var(--gold)', lineHeight: 1, margin: 0,
              }}
            >
              Your Cart
            </h1>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--volt-line)', maxWidth: 80 }} />
          </div>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 14, fontStyle: 'italic',
            color: 'var(--volt-muted)', letterSpacing: '0.02em',
          }}>
            {items.length} {items.length === 1 ? 'item' : 'items'} in your collection
          </p>
        </div>

        {/* ── LAYOUT ─────────────────────────────────────── */}
        <div
          className="volt-cart-layout"
          style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'start' }}
        >

          {/* ── ITEMS LIST ─────────────────────────────────── */}
          <div>
            {/* Column labels */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr auto',
              padding: '8px 0', marginBottom: 4,
              borderBottom: '0.5px solid var(--volt-line)',
            }}>
              <span style={{ fontSize: 9, letterSpacing: '0.35em', color: 'var(--volt-muted)', textTransform: 'uppercase' }}>Product</span>
              <span style={{ fontSize: 9, letterSpacing: '0.35em', color: 'var(--volt-muted)', textTransform: 'uppercase' }}>Total</span>
            </div>

            {/* Item rows */}
            {items.map(item => (
              <div
                key={`${item.id}-${item.size}`}
                className="volt-cart-item"
                style={{ borderBottom: '0.5px solid var(--volt-line)', padding: '20px 0' }}
              >
                <div className="volt-item-row" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

                  {/* Image */}
                  <div
                    className="volt-item-img"
                    style={{ width: 76, height: 92, flexShrink: 0, background: '#111', overflow: 'hidden' }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <p style={{ fontSize: 13, color: 'var(--volt-text)', fontWeight: 500, letterSpacing: '0.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: 9, letterSpacing: '0.3em', color: 'var(--volt-muted)', textTransform: 'uppercase' }}>
                      Size: {item.size}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--volt-muted)', letterSpacing: '0.05em' }}>
                      {formatPrice(item.price)} each
                    </p>

                    {/* Bottom row: qty + price + remove */}
                    <div className="volt-item-bottom" style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>

                      {/* Qty stepper */}
                      <div style={{ display: 'flex', alignItems: 'center', border: '0.5px solid var(--volt-line)' }}>
                        <button
                          className="volt-qty-btn"
                          onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span style={{
                          width: 32, textAlign: 'center',
                          fontSize: 12, color: 'var(--volt-text)',
                          borderLeft: '0.5px solid var(--volt-line)',
                          borderRight: '0.5px solid var(--volt-line)',
                          lineHeight: '32px',
                        }}>
                          {item.quantity}
                        </span>
                        <button
                          className="volt-qty-btn"
                          onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      {/* Line total */}
                      <p style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 18, letterSpacing: '0.05em',
                        color: 'var(--gold)',
                      }}>
                        {formatPrice(item.price * item.quantity)}
                      </p>

                      {/* Remove */}
                      <button
                        className="volt-remove-btn"
                        onClick={() => removeItem(item.id, item.size)}
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue shopping */}
            <div style={{ marginTop: 24 }}>
              <button className="volt-continue-btn" onClick={() => navigate('/shop')}>
                <ArrowLeft size={14} />
                Continue Shopping
              </button>
            </div>
          </div>

          {/* ── ORDER SUMMARY ──────────────────────────────── */}
          <div
            className="volt-summary"
            style={{
              border: '0.5px solid var(--volt-line)',
              position: 'sticky', top: 96,
              background: '#0c0c0c',
            }}
          >
            {/* Header */}
            <div style={{ padding: '18px 24px', borderBottom: '0.5px solid var(--volt-line)', background: 'rgba(201,168,76,0.04)' }}>
              <p style={{ fontSize: 9, letterSpacing: '0.4em', color: 'var(--gold)', textTransform: 'uppercase' }}>
                Order Summary
              </p>
            </div>

            <div style={{ padding: '24px' }}>

              {/* Line items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--volt-muted)', textTransform: 'uppercase' }}>
                    Subtotal
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--volt-text)' }}>{formatPrice(total)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--volt-muted)', textTransform: 'uppercase' }}>
                    Shipping
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--volt-text)' }}>{formatPrice(SHIPPING)}</span>
                </div>
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <div style={{ flex: 1, height: '0.5px', background: 'var(--volt-line)' }} />
                <div style={{ width: 4, height: 4, transform: 'rotate(45deg)', background: 'rgba(201,168,76,0.3)', flexShrink: 0 }} />
                <div style={{ flex: 1, height: '0.5px', background: 'var(--volt-line)' }} />
              </div>

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28 }}>
                <span style={{ fontSize: 10, letterSpacing: '0.25em', color: 'var(--volt-text)', textTransform: 'uppercase', fontWeight: 500 }}>
                  Total
                </span>
                <span style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 28, letterSpacing: '0.05em',
                  color: 'var(--gold)',
                }}>
                  {formatPrice(total + SHIPPING)}
                </span>
              </div>

              {/* Checkout button */}
              <button
                onClick={() => navigate('/checkout')}
                style={{
                  width: '100%', padding: '15px',
                  fontSize: 11, letterSpacing: '0.25em',
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500, textTransform: 'uppercase',
                  background: 'var(--gold)', color: '#000',
                  border: 'none', cursor: 'pointer',
                  transition: 'background 0.25s',
                  marginBottom: 16,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--gold-light)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--gold)')}
              >
                Proceed to Checkout →
              </button>

              {/* Trust badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#1D9E75' }} />
                <p style={{ fontSize: 8, letterSpacing: '0.3em', color: 'var(--volt-muted)', textTransform: 'uppercase' }}>
                  Secured by Flutterwave
                </p>
              </div>
            </div>

            {/* Corner ornaments */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: 24, height: 24, borderLeft: '0.5px solid rgba(201,168,76,0.15)', borderBottom: '0.5px solid rgba(201,168,76,0.15)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: 24, height: 24, borderRight: '0.5px solid rgba(201,168,76,0.15)', borderTop: '0.5px solid rgba(201,168,76,0.15)', pointerEvents: 'none' }} />
          </div>

        </div>
      </div>
    </div>
  )
}