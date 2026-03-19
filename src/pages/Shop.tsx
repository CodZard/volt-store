import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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

const CATEGORIES = ['All', 'Jackets', 'Tops', 'Bottoms', 'Accessories', 'Footwear']

/* ════════════════════════════════════════════════════════════
   KEYFRAMES + RESPONSIVE
════════════════════════════════════════════════════════════ */
const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Montserrat:wght@300;400;500&display=swap');

  @keyframes voltFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes voltBounce {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-6px); }
  }
  @keyframes voltCardIn {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .volt-product-card {
    cursor: pointer;
    animation: voltCardIn 0.45s ease both;
  }

  .volt-card-img-wrap {
    position: relative;
    overflow: hidden;
    background: #111;
    aspect-ratio: 3 / 4;
    margin-bottom: 14px;
  }

  .volt-card-img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.6s ease;
  }
  .volt-product-card:hover .volt-card-img {
    transform: scale(1.06);
  }

  .volt-card-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0);
    transition: background 0.35s;
  }
  .volt-product-card:hover .volt-card-overlay {
    background: rgba(0,0,0,0.18);
  }

  .volt-card-cta {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 13px;
    font-size: 9px; letter-spacing: 0.25em;
    font-family: 'Montserrat', sans-serif; font-weight: 500;
    text-transform: uppercase;
    background: var(--gold); color: #000;
    border: none; cursor: pointer;
    transform: translateY(100%);
    transition: transform 0.3s ease, background 0.2s;
  }
  .volt-product-card:hover .volt-card-cta {
    transform: translateY(0);
  }
  .volt-card-cta:hover { background: var(--gold-light) !important; }

  .volt-cat-btn {
    font-size: 9px; letter-spacing: 0.25em;
    font-family: 'Montserrat', sans-serif;
    text-transform: uppercase;
    padding: 8px 16px;
    border: 0.5px solid var(--volt-line);
    color: var(--volt-muted);
    background: transparent;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .volt-cat-btn:hover {
    border-color: rgba(201,168,76,0.5);
    color: var(--volt-text);
  }
  .volt-cat-btn.active {
    border-color: var(--gold);
    background: var(--gold);
    color: #000;
  }

  @media (max-width: 768px) {
    .volt-shop-wrap     { padding: 96px 16px 60px !important; }
    .volt-shop-controls { flex-direction: column !important; }
    .volt-shop-grid     { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
    .volt-shop-title    { font-size: 36px !important; }
    .volt-cats-row      { overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 4px; }
  }

  @media (max-width: 400px) {
    .volt-shop-grid { grid-template-columns: 1fr !important; }
  }
`

/* ════════════════════════════════════════════════════════════
   LOADING DOTS
════════════════════════════════════════════════════════════ */
function LoadingDots() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0', gap: 8 }}>
      {[0, 150, 300].map(d => (
        <div key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)', animation: `voltBounce 0.9s ${d}ms ease-in-out infinite` }} />
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   PRODUCT CARD
════════════════════════════════════════════════════════════ */
function ProductCard({ product, delay, onClick }: { product: Product; delay: number; onClick: () => void }) {
  const formatPrice = (n: number) => '₦' + n.toLocaleString()

  return (
    <div
      className="volt-product-card"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      {/* Image */}
      <div className="volt-card-img-wrap">
        <img className="volt-card-img" src={product.image} alt={product.name} />
        <div className="volt-card-overlay" />

        {/* Category badge */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: 'rgba(8,8,8,0.82)',
          border: '0.5px solid var(--volt-line)',
          padding: '4px 10px',
          fontSize: 8, letterSpacing: '0.3em',
          color: 'var(--volt-muted)', textTransform: 'uppercase',
          backdropFilter: 'blur(6px)',
          pointerEvents: 'none',
        }}>
          {product.category}
        </div>

        {/* Corner ornament */}
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderTop: '0.5px solid rgba(201,168,76,0.2)', borderLeft: '0.5px solid rgba(201,168,76,0.2)', pointerEvents: 'none' }} />

        {/* Hover CTA */}
        <button
          className="volt-card-cta"
          onClick={e => { e.stopPropagation(); onClick() }}
        >
          View Product
        </button>
      </div>

      {/* Info */}
      <div>
        <p style={{ fontSize: 8, letterSpacing: '0.35em', color: 'var(--volt-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
          {product.category}
        </p>
        <h3 style={{ fontSize: 12, fontWeight: 500, color: 'var(--volt-text)', letterSpacing: '0.05em', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.name}
        </h3>
        <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: '0.06em', color: 'var(--gold)' }}>
          {formatPrice(product.price)}
        </p>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   SHOP PAGE
════════════════════════════════════════════════════════════ */
function Shop() {
  const [products, setProducts]             = useState<Product[]>([])
  const [loading, setLoading]               = useState(true)
  const [search, setSearch]                 = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortBy, setSortBy]                 = useState('default')
  const [searchFocused, setSearchFocused]   = useState(false)
  const navigate = useNavigate()

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*').eq('in_stock', true)
    if (error) console.error(error)
    else setProducts(data || [])
    setLoading(false)
  }

  const filtered = products
    .filter(p => activeCategory === 'All' || p.category === activeCategory)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'low')  return a.price - b.price
      if (sortBy === 'high') return b.price - a.price
      return 0
    })

  return (
    <div style={{ background: '#080808', minHeight: '100vh', fontFamily: "'Montserrat', sans-serif", color: 'var(--volt-text)' }}>
      <style>{KEYFRAMES}</style>

      <div
        className="volt-shop-wrap"
        style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 40px 80px' }}
      >

        {/* ── PAGE HEADER ────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 48, animation: 'voltFadeUp 0.5s ease both' }}>
          <p style={{ fontSize: 9, letterSpacing: '0.6em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 14 }}>
            Explore
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 6 }}>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--volt-line)', maxWidth: 80 }} />
            <h1
              className="volt-shop-title"
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: '0.15em', color: 'var(--gold)', lineHeight: 1, margin: 0 }}
            >
              The Collection
            </h1>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--volt-line)', maxWidth: 80 }} />
          </div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, fontStyle: 'italic', color: 'var(--volt-muted)' }}>
            {products.length > 0 ? `${products.length} curated pieces` : 'Handpicked luxury pieces'}
          </p>
        </div>

        {/* ── SEARCH + SORT ──────────────────────────────── */}
        <div
          className="volt-shop-controls"
          style={{ display: 'flex', gap: 12, marginBottom: 20, animation: 'voltFadeUp 0.5s 0.1s ease both', opacity: 0, animationFillMode: 'forwards' }}
        >
          {/* Search */}
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 12,
            border: `0.5px solid ${searchFocused ? 'var(--gold)' : 'var(--volt-line)'}`,
            background: 'rgba(255,255,255,0.02)',
            padding: '12px 16px',
            transition: 'border-color 0.25s',
          }}>
            <Search size={14} color={searchFocused ? 'var(--gold)' : 'var(--volt-muted)'} style={{ flexShrink: 0, transition: 'color 0.25s' }} />
            <input
              type="text"
              placeholder="Search the collection…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--volt-text)', fontFamily: "'Montserrat', sans-serif",
                fontSize: 11, letterSpacing: '0.08em', flex: 1,
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', color: 'var(--volt-muted)', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 2, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--volt-muted)')}
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            border: '0.5px solid var(--volt-line)',
            background: 'rgba(255,255,255,0.02)',
            padding: '12px 16px',
            minWidth: 200,
          }}>
            <SlidersHorizontal size={13} color="var(--volt-muted)" style={{ flexShrink: 0 }} />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--volt-muted)', fontFamily: "'Montserrat', sans-serif",
                fontSize: 10, letterSpacing: '0.2em', cursor: 'pointer',
                textTransform: 'uppercase', flex: 1,
              }}
            >
              <option value="default" style={{ background: '#111' }}>Sort By</option>
              <option value="low"     style={{ background: '#111' }}>Price: Low → High</option>
              <option value="high"    style={{ background: '#111' }}>Price: High → Low</option>
            </select>
          </div>
        </div>

        {/* ── CATEGORY FILTER ────────────────────────────── */}
        <div
          className="volt-cats-row"
          style={{ display: 'flex', gap: 8, marginBottom: 40, animation: 'voltFadeUp 0.5s 0.2s ease both', opacity: 0, animationFillMode: 'forwards' }}
        >
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`volt-cat-btn${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}

          {/* Result count */}
          {!loading && (
            <span style={{ marginLeft: 'auto', fontSize: 9, letterSpacing: '0.3em', color: 'var(--volt-muted)', textTransform: 'uppercase', alignSelf: 'center', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
            </span>
          )}
        </div>

        {/* ── CONTENT ────────────────────────────────────── */}
        {loading && <LoadingDots />}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', animation: 'voltFadeUp 0.4s ease both' }}>
            <p style={{ fontSize: 9, letterSpacing: '0.5em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 12 }}>Nothing found</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontStyle: 'italic', color: 'var(--volt-muted)' }}>
              No products match your search
            </p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('All') }}
              style={{ marginTop: 20, padding: '10px 28px', fontSize: 9, letterSpacing: '0.25em', fontFamily: "'Montserrat', sans-serif", textTransform: 'uppercase', background: 'transparent', color: 'var(--gold)', border: '0.5px solid var(--gold)', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = '#000' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gold)' }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div
            className="volt-shop-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}
          >
            {filtered.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                delay={i * 60}
                onClick={() => navigate(`/product/${product.id}`)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default Shop