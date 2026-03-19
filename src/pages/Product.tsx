import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowLeft, ShoppingBag, Sparkles } from 'lucide-react'
import { useCart } from '../lib/CartContext'
import { supabase } from '../lib/supabase'

interface Product {
  id: string
  name: string
  price: number
  category: string
  image: string
  description: string
  sizes: string[]
  in_stock: boolean
}

/* ════════════════════════════════════════════════════════════
   KEYFRAMES + RESPONSIVE
════════════════════════════════════════════════════════════ */
const KEYFRAMES = `
  @keyframes voltFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes voltFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes voltBounce {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-6px); }
  }
  @keyframes voltImageReveal {
    from { opacity: 0; transform: scale(1.04); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes voltCheckPop {
    0%   { transform: scale(0.8); opacity: 0; }
    60%  { transform: scale(1.1); }
    100% { transform: scale(1);   opacity: 1; }
  }

  .volt-size-btn {
    width: 46px; height: 46px;
    font-size: 10px; letter-spacing: 0.1em;
    font-family: 'Montserrat', sans-serif;
    border: 0.5px solid var(--volt-line);
    color: var(--volt-muted);
    background: transparent;
    cursor: pointer;
    transition: all 0.2s;
  }
  .volt-size-btn:hover {
    border-color: rgba(201,168,76,0.5);
    color: var(--volt-text);
  }
  .volt-size-btn.active {
    border-color: var(--gold);
    background: var(--gold);
    color: #000;
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

  @media (max-width: 768px) {
    .volt-product-wrap   { padding: 96px 16px 60px !important; }
    .volt-product-layout { grid-template-columns: 1fr !important; gap: 32px !important; }
    .volt-product-image  { aspect-ratio: 4/3 !important; }
    .volt-product-name   { font-size: 28px !important; }
  }

  @media (max-width: 480px) {
    .volt-product-price  { font-size: 32px !important; }
    .volt-product-name   { font-size: 24px !important; }
  }
`

/* ════════════════════════════════════════════════════════════
   LOADING STATE
════════════════════════════════════════════════════════════ */
function LoadingState() {
  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{KEYFRAMES}</style>
      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 150, 300].map(d => (
          <div key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)', animation: `voltBounce 0.9s ${d}ms ease-in-out infinite` }} />
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   NOT FOUND STATE
════════════════════════════════════════════════════════════ */
function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, fontFamily: "'Montserrat', sans-serif" }}>
      <style>{KEYFRAMES}</style>
      <p style={{ fontSize: 9, letterSpacing: '0.6em', color: 'var(--gold)', textTransform: 'uppercase' }}>404</p>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: 'italic', color: 'var(--volt-muted)' }}>
        Product not found
      </p>
      <button
        className="volt-back-btn"
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '0.3em', fontFamily: "'Montserrat', sans-serif", color: 'var(--volt-muted)', textTransform: 'uppercase', transition: 'color 0.25s', padding: 0 }}
      >
        <ArrowLeft size={13} /> Back to Shop
      </button>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   SIZE MISSING TOAST
════════════════════════════════════════════════════════════ */
function SizeToast({ visible }: { visible: boolean }) {
  if (!visible) return null
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      background: '#0c0c0c', border: '0.5px solid rgba(226,75,74,0.4)',
      padding: '12px 24px', zIndex: 999,
      fontSize: 10, letterSpacing: '0.25em', color: '#E24B4A',
      textTransform: 'uppercase', fontFamily: "'Montserrat', sans-serif",
      animation: 'voltFadeUp 0.25s ease both',
      whiteSpace: 'nowrap',
    }}>
      Please select a size
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   PRODUCT PAGE
════════════════════════════════════════════════════════════ */
function Product() {
  const { id }              = useParams()
  const navigate            = useNavigate()
  const { addItem }         = useCart()
  const [product, setProduct]       = useState<Product | null>(null)
  const [loading, setLoading]       = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [added, setAdded]           = useState(false)
  const [sizeToast, setSizeToast]   = useState(false)

  useEffect(() => { if (id) fetchProduct() }, [id])

  const fetchProduct = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
    if (error) { console.error(error); setProduct(null) }
    else setProduct(data)
    setLoading(false)
  }

  const formatPrice = (n: number) => '₦' + n.toLocaleString()

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeToast(true)
      setTimeout(() => setSizeToast(false), 2200)
      return
    }
    if (!product) return
    addItem({
      id: String(product.id),
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity: 1,
      image: product.image,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  if (loading) return <LoadingState />
  if (!product) return <NotFound onBack={() => navigate('/shop')} />

  return (
    <div style={{ background: '#080808', minHeight: '100vh', fontFamily: "'Montserrat', sans-serif", color: 'var(--volt-text)' }}>
      <style>{KEYFRAMES}</style>
      <SizeToast visible={sizeToast} />

      <div
        className="volt-product-wrap"
        style={{ maxWidth: 1060, margin: '0 auto', padding: '96px 40px 80px' }}
      >

        {/* ── BACK BUTTON ──────────────────────────────────── */}
        <button
          className="volt-back-btn"
          onClick={() => navigate('/shop')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '0.3em', fontFamily: "'Montserrat', sans-serif", color: 'var(--volt-muted)', textTransform: 'uppercase', transition: 'color 0.25s', padding: 0, marginBottom: 40 }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--volt-text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--volt-muted)')}
        >
          <ArrowLeft size={13} />
          Back to Shop
        </button>

        {/* ── MAIN LAYOUT ────────────────────────────────── */}
        <div
          className="volt-product-layout"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'start', animation: 'voltFadeIn 0.5s ease both' }}
        >

          {/* ── IMAGE ────────────────────────────────────────── */}
          <div
            className="volt-product-image"
            style={{
              position: 'relative',
              aspectRatio: '3 / 4',
              background: '#111',
              overflow: 'hidden',
            }}
          >
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                display: 'block',
                animation: 'voltImageReveal 0.7s ease both',
              }}
            />

            {/* Category badge — top left */}
            <div style={{
              position: 'absolute', top: 16, left: 16,
              background: 'rgba(8,8,8,0.85)',
              border: '0.5px solid var(--volt-line)',
              padding: '5px 12px',
              fontSize: 8, letterSpacing: '0.35em',
              color: 'var(--gold)', textTransform: 'uppercase',
              backdropFilter: 'blur(6px)',
            }}>
              {product.category}
            </div>

            {/* Out of stock overlay */}
            {!product.in_stock && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(8,8,8,0.7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 11, letterSpacing: '0.4em', color: 'var(--volt-muted)', textTransform: 'uppercase', border: '0.5px solid var(--volt-line)', padding: '10px 20px', background: 'rgba(8,8,8,0.8)' }}>
                  Out of Stock
                </span>
              </div>
            )}

            {/* Corner ornament */}
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderTop: '0.5px solid rgba(201,168,76,0.2)', borderLeft: '0.5px solid rgba(201,168,76,0.2)', pointerEvents: 'none' }} />
          </div>

          {/* ── DETAILS ──────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, animation: 'voltFadeUp 0.6s 0.15s ease both' }}>

            {/* Category + name */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 9, letterSpacing: '0.5em', color: 'var(--volt-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
                {product.category}
              </p>
              <h1
                className="volt-product-name"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 40, letterSpacing: '0.08em',
                  color: 'var(--volt-text)', lineHeight: 1, margin: 0,
                }}
              >
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <p
              className="volt-product-price"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 40, letterSpacing: '0.06em',
                color: 'var(--gold)', lineHeight: 1, marginBottom: 24,
              }}
            >
              {formatPrice(product.price)}
            </p>

            {/* Gold line divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 32, height: '0.5px', background: 'var(--gold)' }} />
              <div style={{ width: 4, height: 4, transform: 'rotate(45deg)', background: 'var(--gold)', flexShrink: 0 }} />
              <div style={{ flex: 1, height: '0.5px', background: 'var(--volt-line)' }} />
            </div>

            {/* Description */}
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 16, lineHeight: 1.8,
              color: 'var(--volt-muted)', letterSpacing: '0.01em',
              marginBottom: 32,
            }}>
              {product.description}
            </p>

            {/* Size selector */}
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 9, letterSpacing: '0.4em', color: 'var(--volt-muted)', textTransform: 'uppercase', marginBottom: 14 }}>
                Select Size
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.sizes?.map(size => (
                  <button
                    key={size}
                    className={`volt-size-btn${selectedSize === size ? ' active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {selectedSize && (
                <p style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--gold)', marginTop: 10, textTransform: 'uppercase', animation: 'voltFadeUp 0.2s ease both' }}>
                  Size {selectedSize} selected
                </p>
              )}
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={!product.in_stock}
                style={{
                  width: '100%', padding: '15px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  fontSize: 10, letterSpacing: '0.25em',
                  fontFamily: "'Montserrat', sans-serif", fontWeight: 500,
                  textTransform: 'uppercase', border: 'none', cursor: product.in_stock ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s',
                  background: added ? 'transparent' : product.in_stock ? 'var(--gold)' : 'rgba(201,168,76,0.15)',
                  color: added ? 'var(--gold)' : product.in_stock ? '#000' : 'var(--volt-muted)',
                  borderWidth: added ? 1 : 0,
                  borderStyle: added ? 'solid' : 'none',
                  borderColor: added ? 'var(--gold)' : 'transparent',
                }}
                onMouseEnter={e => { if (product.in_stock && !added) e.currentTarget.style.background = 'var(--gold-light)' }}
                onMouseLeave={e => { if (product.in_stock && !added) e.currentTarget.style.background = 'var(--gold)' }}
              >
                {added ? (
                  <>
                    <span style={{ animation: 'voltCheckPop 0.3s ease both', display: 'inline-block' }}>✓</span>
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag size={14} />
                    Add to Cart
                  </>
                )}
              </button>

              {/* Style with AI */}
              <button
                onClick={() => navigate('/stylist')}
                style={{
                  width: '100%', padding: '15px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  fontSize: 10, letterSpacing: '0.25em',
                  fontFamily: "'Montserrat', sans-serif", fontWeight: 500,
                  textTransform: 'uppercase',
                  background: 'transparent', color: 'var(--volt-muted)',
                  border: '0.5px solid var(--volt-line)',
                  cursor: 'pointer', transition: 'all 0.25s',
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
                <Sparkles size={13} />
                Style This With AI
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Product