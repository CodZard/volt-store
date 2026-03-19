import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3'
import { useCart } from '../lib/CartContext'
import { supabase } from '../lib/supabase'
import { ArrowLeft, ShoppingBag } from 'lucide-react'

/* ════════════════════════════════════════════════════════════
   KEYFRAMES + RESPONSIVE
════════════════════════════════════════════════════════════ */
const KEYFRAMES = `
  @keyframes voltFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes voltBounce {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-6px); }
  }

  .volt-field input:focus {
    border-color: var(--gold) !important;
    background: rgba(201,168,76,0.04) !important;
  }

  .volt-back-btn {
    display: flex; align-items: center; gap: 8px;
    background: none; border: none; cursor: pointer;
    font-size: 10px; letter-spacing: 0.3em;
    font-family: 'Montserrat', sans-serif;
    color: var(--volt-muted); text-transform: uppercase;
    transition: color 0.25s; padding: 0;
  }
  .volt-back-btn:hover { color: var(--volt-text); }

  @media (max-width: 1024px) {
    .volt-checkout-layout { grid-template-columns: 1fr !important; }
    .volt-checkout-summary { position: static !important; }
  }

  @media (max-width: 640px) {
    .volt-checkout-wrap  { padding: 96px 16px 60px !important; }
    .volt-checkout-title { font-size: 36px !important; }
    .volt-form-grid      { grid-template-columns: 1fr !important; }
    .volt-checkout-header { margin-bottom: 32px !important; }
  }
`

const FIELDS = [
  { label: 'Full Name',         name: 'fullName', type: 'text',  placeholder: 'Adebayo Johnson',  span: false },
  { label: 'Email Address',     name: 'email',    type: 'email', placeholder: 'your@email.com',   span: false },
  { label: 'Phone Number',      name: 'phone',    type: 'tel',   placeholder: '08012345678',      span: false },
  { label: 'Delivery Address',  name: 'address',  type: 'text',  placeholder: '12 Lagos Street',  span: true  },
  { label: 'City',              name: 'city',     type: 'text',  placeholder: 'Lagos',            span: false },
  { label: 'State',             name: 'state',    type: 'text',  placeholder: 'Lagos State',      span: false },
] as const

/* ════════════════════════════════════════════════════════════
   EMPTY STATE
════════════════════════════════════════════════════════════ */
function EmptyCheckout({ onShop }: { onShop: () => void }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#080808',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 24, padding: '0 24px',
      fontFamily: "'Montserrat', sans-serif",
    }}>
      <style>{KEYFRAMES}</style>
      <div style={{ width: 80, height: 80, border: '0.5px solid var(--volt-line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ShoppingBag size={28} color="var(--volt-muted)" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 9, letterSpacing: '0.6em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 8 }}>Nothing to checkout</p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontStyle: 'italic', color: 'var(--volt-muted)' }}>Your cart is empty</p>
      </div>
      <button
        onClick={onShop}
        style={{ padding: '13px 40px', fontSize: 10, letterSpacing: '0.25em', fontFamily: "'Montserrat', sans-serif", fontWeight: 500, textTransform: 'uppercase', background: 'var(--gold)', color: '#000', border: 'none', cursor: 'pointer', transition: 'background 0.25s' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--gold-light)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--gold)')}
      >
        Shop Now →
      </button>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   CHECKOUT PAGE
════════════════════════════════════════════════════════════ */
export default function Checkout() {
  const { items, total, count, clearCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '',
    address: '', city: '', state: '',
  })
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const SHIPPING    = 5000
  const grandTotal  = total + SHIPPING
  const formatPrice = (n: number) => '₦' + n.toLocaleString()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  /* Flutterwave config — unchanged from original */
  const config = {
    public_key: (import.meta as any).env.VITE_FLW_PUBLIC_KEY,
    tx_ref: `VOLT-${Date.now()}`,
    amount: grandTotal,
    currency: 'NGN',
    payment_options: 'card,ussd,banktransfer',
    customer: { email: form.email, phone_number: form.phone, name: form.fullName },
    customizations: { title: 'VŌLT Store', description: `Payment for ${count} item(s)`, logo: '' },
  }

  const handleFlutterPayment = useFlutterwave(config)

  const validateForm = () => {
    const { fullName, email, phone, address, city, state } = form
    if (!fullName || !email || !phone || !address || !city || !state) {
      setError('Please fill in all fields.'); return false
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.'); return false
    }
    return true
  }

  const handleCheckout = () => {
    setError('')
    if (!validateForm()) return
    if (count === 0) { setError('Your cart is empty.'); return }

    setLoading(true)

    handleFlutterPayment({
      callback: async (response) => {
        closePaymentModal()

        if (response.status === 'successful') {
          try {
            const { data: { session } } = await supabase.auth.getSession()

            const { data: order, error: orderError } = await supabase
              .from('orders')
              .insert({
                user_id: session?.user?.id ?? null,
                total: grandTotal,
                status: 'paid',
                shipping_address: {
                  fullName: form.fullName, address: form.address,
                  city: form.city, state: form.state, phone: form.phone,
                },
                paystack_reference: response.transaction_id,
              })
              .select()
              .single()

            if (orderError) throw orderError

            await supabase.from('order_items').insert(
              items.map(item => ({
                order_id: order.id, product_id: item.id,
                quantity: item.quantity, size: item.size, price: item.price,
              }))
            )

            navigate('/order-success')
          } catch (err) {
            console.error('Order save error:', err)
            navigate('/order-success')
          }
        } else {
          setError('Payment was not successful. Please try again.')
          setLoading(false)
        }
      },
      onClose: () => setLoading(false),
    })
  }

  if (count === 0) return <EmptyCheckout onShop={() => navigate('/shop')} />

  const inputBase: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.03)',
    border: '0.5px solid var(--volt-line)',
    color: 'var(--volt-text)', fontFamily: "'Montserrat', sans-serif",
    fontSize: 12, letterSpacing: '0.04em',
    padding: '12px 16px', outline: 'none',
    transition: 'border-color 0.25s, background 0.25s',
    boxSizing: 'border-box' as const,
  }

  const labelBase: React.CSSProperties = {
    fontSize: 9, letterSpacing: '0.35em',
    color: 'var(--volt-muted)', textTransform: 'uppercase',
    display: 'block', marginBottom: 8,
  }

  return (
    <div style={{ background: '#080808', minHeight: '100vh', fontFamily: "'Montserrat', sans-serif", color: 'var(--volt-text)' }}>
      <style>{KEYFRAMES}</style>

      <div
        className="volt-checkout-wrap"
        style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 40px 80px', animation: 'voltFadeUp 0.5s ease both' }}
      >

        {/* ── PAGE HEADER ────────────────────────────────── */}
        <div className="volt-checkout-header" style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontSize: 9, letterSpacing: '0.6em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 14 }}>
            Final Step
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 6 }}>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--volt-line)', maxWidth: 80 }} />
            <h1
              className="volt-checkout-title"
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: '0.15em', color: 'var(--gold)', lineHeight: 1, margin: 0 }}
            >
              Checkout
            </h1>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--volt-line)', maxWidth: 80 }} />
          </div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, fontStyle: 'italic', color: 'var(--volt-muted)' }}>
            {count} {count === 1 ? 'item' : 'items'} · {formatPrice(grandTotal)} total
          </p>
        </div>

        {/* ── MAIN LAYOUT ────────────────────────────────── */}
        <div
          className="volt-checkout-layout"
          style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'start' }}
        >

          {/* ── DELIVERY FORM ──────────────────────────────── */}
          <div>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
              <div style={{ width: 3, height: 3, background: 'var(--gold)', transform: 'rotate(45deg)', flexShrink: 0 }} />
              <p style={{ fontSize: 9, letterSpacing: '0.4em', color: 'var(--gold)', textTransform: 'uppercase' }}>
                Delivery Information
              </p>
              <div style={{ flex: 1, height: '0.5px', background: 'var(--volt-line)' }} />
            </div>

            <div
              className="volt-form-grid"
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}
            >
              {FIELDS.map(field => (
                <div
                  key={field.name}
                  className="volt-field"
                  style={{ gridColumn: field.span ? '1 / -1' : undefined }}
                >
                  <label style={labelBase}>{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    style={inputBase}
                    onFocus={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.background = 'rgba(201,168,76,0.04)' }}
                    onBlur={e => { e.target.style.borderColor = 'var(--volt-line)'; e.target.style.background = 'rgba(255,255,255,0.03)' }}
                  />
                </div>
              ))}
            </div>

            {/* Back to cart */}
            <button className="volt-back-btn" onClick={() => navigate('/cart')}>
              <ArrowLeft size={13} />
              Back to Cart
            </button>
          </div>

          {/* ── ORDER SUMMARY ──────────────────────────────── */}
          <div
            className="volt-checkout-summary"
            style={{
              border: '0.5px solid var(--volt-line)',
              background: '#0c0c0c',
              position: 'sticky', top: 96,
            }}
          >
            {/* Header */}
            <div style={{ padding: '16px 24px', borderBottom: '0.5px solid var(--volt-line)', background: 'rgba(201,168,76,0.04)' }}>
              <p style={{ fontSize: 9, letterSpacing: '0.4em', color: 'var(--gold)', textTransform: 'uppercase' }}>
                Order Summary
              </p>
            </div>

            <div style={{ padding: '20px 24px' }}>

              {/* Items list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {items.map(item => (
                  <div key={`${item.id}-${item.size}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, color: 'var(--volt-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                        {item.name}
                      </p>
                      <p style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--volt-muted)', textTransform: 'uppercase' }}>
                        {item.size} · ×{item.quantity}
                      </p>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--volt-text)', flexShrink: 0 }}>
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ flex: 1, height: '0.5px', background: 'var(--volt-line)' }} />
                <div style={{ width: 4, height: 4, transform: 'rotate(45deg)', background: 'rgba(201,168,76,0.25)', flexShrink: 0 }} />
                <div style={{ flex: 1, height: '0.5px', background: 'var(--volt-line)' }} />
              </div>

              {/* Totals */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--volt-muted)', textTransform: 'uppercase' }}>Subtotal</span>
                  <span style={{ fontSize: 12, color: 'var(--volt-text)' }}>{formatPrice(total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--volt-muted)', textTransform: 'uppercase' }}>Shipping</span>
                  <span style={{ fontSize: 12, color: 'var(--volt-text)' }}>{formatPrice(SHIPPING)}</span>
                </div>
              </div>

              {/* Grand total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '14px 0', borderTop: '0.5px solid var(--volt-line)', marginBottom: 20 }}>
                <span style={{ fontSize: 10, letterSpacing: '0.25em', color: 'var(--volt-text)', textTransform: 'uppercase', fontWeight: 500 }}>Total</span>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: '0.05em', color: 'var(--gold)' }}>
                  {formatPrice(grandTotal)}
                </span>
              </div>

              {/* Error */}
              {error && (
                <div style={{ padding: '10px 14px', marginBottom: 16, background: 'rgba(226,75,74,0.08)', border: '0.5px solid rgba(226,75,74,0.25)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#E24B4A', flexShrink: 0, marginTop: 4 }} />
                  <p style={{ fontSize: 11, color: '#E24B4A', letterSpacing: '0.03em', lineHeight: 1.5 }}>{error}</p>
                </div>
              )}

              {/* Pay button */}
              <button
                onClick={handleCheckout}
                disabled={loading}
                style={{
                  width: '100%', padding: '15px',
                  fontSize: 11, letterSpacing: '0.25em',
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500, textTransform: 'uppercase',
                  background: loading ? 'rgba(201,168,76,0.5)' : 'var(--gold)',
                  color: '#000', border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.25s',
                  marginBottom: 14,
                  position: 'relative',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--gold-light)' }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = loading ? 'rgba(201,168,76,0.5)' : 'var(--gold)' }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {[0,150,300].map(d => (
                      <span key={d} style={{ width: 5, height: 5, borderRadius: '50%', background: '#000', display: 'inline-block', animation: `voltBounce 0.8s ${d}ms ease-in-out infinite` }} />
                    ))}
                  </span>
                ) : (
                  `Pay ${formatPrice(grandTotal)} →`
                )}
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