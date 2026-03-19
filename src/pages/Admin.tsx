import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Plus, Pencil, Trash2, X, Check, Package, ShoppingBag, Users, TrendingUp } from 'lucide-react'

/* ─── Types ──────────────────────────────────────────────────────────── */
interface Product {
  id: string
  name: string
  price: number
  category: string
  image: string
  description: string
  sizes: string[]
  in_stock: boolean
  stock: number
}

interface Order {
  id: string
  user_id: string
  total: number
  status: string
  shipping_address: any
  created_at: string
  paystack_reference: string
}

interface User {
  id: string
  email: string
  full_name: string
  role?: string
  created_at: string
}
/* ─── Constants ──────────────────────────────────────────────────────── */
const CATEGORIES = ['Jackets', 'Tops', 'Bottoms', 'Accessories', 'Footwear']
const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const ADMIN_EMAIL = 'codezardsmt@gmail.com'
const emptyForm = {
  name: '', price: '', category: 'Tops', image: '',
  description: '', sizes: DEFAULT_SIZES, stock: '100', in_stock: true,
}

/* ─── Keyframes + Responsive ─────────────────────────────────────────── */
const KEYFRAMES = `
  @keyframes voltFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes voltBounce {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-6px); }
  }
  @keyframes voltSlideIn {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .volt-admin-row { transition: background 0.2s; }
  .volt-admin-row:hover { background: rgba(201,168,76,0.03) !important; }

  .volt-tab-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 24px; font-size: 10px; letter-spacing: 0.25em;
    font-family: 'Montserrat', sans-serif; border: none;
    background: transparent; cursor: pointer;
    transition: all 0.2s; text-transform: uppercase;
    border-bottom: 2px solid transparent; margin-bottom: -1px;
    white-space: nowrap;
  }

  .volt-icon-btn {
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    border: 0.5px solid var(--volt-line);
    background: transparent; cursor: pointer;
    color: var(--volt-muted); transition: all 0.2s;
  }
  .volt-icon-btn:hover { border-color: var(--gold); color: var(--gold); }
  .volt-icon-btn.danger:hover { border-color: rgba(226,75,74,0.5); color: #E24B4A; }

  @media (max-width: 768px) {
    .volt-admin-wrap   { padding: 84px 16px 100px !important; }
    .volt-stats-grid   { grid-template-columns: 1fr 1fr !important; }
    .volt-tabs         { overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .volt-table-head   { display: none !important; }
    .volt-product-row  { grid-template-columns: 48px 1fr auto !important; gap: 12px !important; }
    .volt-order-row    { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
    .volt-user-row     { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
    .volt-col-hide     { display: none !important; }
    .volt-modal-inner  { margin: 12px !important; padding: 24px 20px !important; }
    .volt-form-grid    { grid-template-columns: 1fr !important; }
    .volt-admin-header { flex-direction: column; align-items: flex-start !important; gap: 12px !important; }
    .volt-header-btn   { display: none !important; }
  }
`

/* ─── Shared style tokens ────────────────────────────────────────────── */
const S = {
  page: {
    background: '#080808',
    minHeight: '100vh',
    fontFamily: "'Montserrat', sans-serif",
    color: 'var(--volt-text)',
  },
  label: {
    fontSize: 9,
    letterSpacing: '0.3em',
    color: 'var(--volt-muted)',
    textTransform: 'uppercase' as const,
    display: 'block' as const,
  },
  input: {
    background: 'rgba(255,255,255,0.03)',
    border: '0.5px solid var(--volt-line)',
    color: 'var(--volt-text)',
    fontFamily: "'Montserrat', sans-serif",
    width: '100%',
    padding: '11px 14px',
    fontSize: 12,
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box' as const,
  },
}

/* ─── Loading Dots ───────────────────────────────────────────────────── */
function LoadingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 8 }}>
      {[0, 150, 300].map(d => (
        <div key={d} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: 'var(--gold)',
          animation: `voltBounce 0.9s ${d}ms ease-in-out infinite`,
        }} />
      ))}
    </div>
  )
}

/* ─── Section label with side lines ─────────────────────────────────── */
function SectionLabel({ children }: { children: string }) {
  return (
    <p style={{ fontSize: 9, letterSpacing: '0.6em', color: 'var(--gold)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
      <span style={{ flex: 0, height: '0.5px', width: 24, background: 'var(--volt-line)', display: 'inline-block' }} />
      {children}
      <span style={{ flex: 0, height: '0.5px', width: 24, background: 'var(--volt-line)', display: 'inline-block' }} />
    </p>
  )
}

/* ─── Status badge ───────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    paid:      { bg: 'rgba(29,158,117,0.12)',  color: '#1D9E75' },
    delivered: { bg: 'rgba(29,158,117,0.12)',  color: '#1D9E75' },
    shipped:   { bg: 'rgba(201,168,76,0.12)',  color: 'var(--gold)' },
    pending:   { bg: 'rgba(90,85,80,0.2)',     color: 'var(--volt-muted)' },
    cancelled: { bg: 'rgba(226,75,74,0.12)',   color: '#E24B4A' },
  }
  const c = colors[status] ?? colors.pending
  return (
    <span style={{ fontSize: 9, letterSpacing: '0.15em', padding: '4px 10px', background: c.bg, color: c.color, textTransform: 'uppercase' }}>
      {status}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   ADMIN
══════════════════════════════════════════════════════════════════════ */
function Admin() {
  const [tab, setTab] = useState<'products' | 'orders' | 'users'>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => { checkAdmin() }, [])

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.email !== ADMIN_EMAIL) {
      navigate('/')
      setChecking(false)
      return
    }
    setIsAdmin(true)
    fetchAll()
    setChecking(false)
  }

  const fetchAll = async () => {
    setLoading(true)
    const [{ data: p }, { data: o }, { data: u }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, email, full_name, created_at').order('created_at', { ascending: false }),
    ])
    setProducts(p || [])
    setOrders(o || [])
    setUsers(u || [])
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const toggleSize = (size: string) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size],
    }))
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setForm({
      name: product.name, price: String(product.price), category: product.category,
      image: product.image, description: product.description || '',
      sizes: product.sizes || DEFAULT_SIZES, stock: String(product.stock || 100),
      in_stock: product.in_stock,
    })
    setShowForm(true)
    setError('')
  }

  const handleNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
    setError('')
  }

  const handleSave = async () => {
    setError('')
    if (!form.name || !form.price || !form.image || !form.description) {
      setError('Please fill in all required fields.')
      return
    }
    setSaving(true)
    const payload = {
      name: form.name, price: Number(form.price), category: form.category,
      image: form.image, description: form.description, sizes: form.sizes,
      stock: Number(form.stock), in_stock: form.in_stock,
    }
    const { error: err } = editingId
      ? await supabase.from('products').update(payload).eq('id', editingId)
      : await supabase.from('products').insert(payload)
    if (err) { setError(err.message); setSaving(false); return }
    setSaving(false)
    setShowForm(false)
    setEditingId(null)
    fetchAll()
  }

  const handleDelete = async (id: string) => {
    await supabase.from('products').delete().eq('id', id)
    setDeleteConfirm(null)
    fetchAll()
  }

  const toggleStock = async (product: Product) => {
    await supabase.from('products').update({ in_stock: !product.in_stock }).eq('id', product.id)
    fetchAll()
  }

  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    fetchAll()
  }

  const formatPrice = (n: number) => '₦' + n.toLocaleString()
  const formatDate  = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  const revenue = orders.filter(o => o.status === 'paid').reduce((a, o) => a + o.total, 0)

  /* Loading / auth check */
  if (checking) return (
    <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingDots />
    </div>
  )
  if (!isAdmin) return null

  return (
    <div style={S.page}>
      <style>{KEYFRAMES}</style>

      <div className="volt-admin-wrap" style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 40px 120px', animation: 'voltFadeUp 0.5s ease both' }}>

        {/* ── PAGE HEADER ──────────────────────────────────── */}
        <div className="volt-admin-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <SectionLabel>VŌLT Dashboard</SectionLabel>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, letterSpacing: '0.1em', color: 'var(--volt-text)', lineHeight: 1, marginTop: 8 }}>
              Admin Panel
            </h1>
          </div>
          {tab === 'products' && (
            <button
              className="volt-header-btn"
              onClick={handleNew}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'var(--gold)', color: '#000', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '0.25em', fontFamily: "'Montserrat', sans-serif", fontWeight: 500, transition: 'background 0.2s', marginTop: 8 }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--gold-light)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--gold)')}
            >
              <Plus size={13} /> ADD PRODUCT
            </button>
          )}
        </div>

        {/* ── STATS ────────────────────────────────────────── */}
        <div className="volt-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--volt-line)', border: '0.5px solid var(--volt-line)', marginBottom: 40 }}>
          {[
            { label: 'Products', value: products.length, icon: Package,     suffix: '' },
            { label: 'Orders',   value: orders.length,   icon: ShoppingBag, suffix: '' },
            { label: 'Users',    value: users.length,    icon: Users,       suffix: '' },
            { label: 'Revenue',  value: formatPrice(revenue), icon: TrendingUp, suffix: '', raw: true },
          ].map(({ label, value, icon: Icon, raw }) => (
            <div key={label} style={{ background: '#080808', padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 16, right: 20, color: 'rgba(201,168,76,0.08)' }}>
                <Icon size={40} />
              </div>
              <p style={{ ...S.label, marginBottom: 12 }}>{label}</p>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: raw ? 28 : 40, color: 'var(--gold)', lineHeight: 1, letterSpacing: '0.05em' }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* ── TABS ─────────────────────────────────────────── */}
        <div className="volt-tabs" style={{ borderBottom: '0.5px solid var(--volt-line)', marginBottom: 32, display: 'flex' }}>
          {[
            { key: 'products', label: 'Products', icon: Package },
            { key: 'orders',   label: 'Orders',   icon: ShoppingBag },
            { key: 'users',    label: 'Users',     icon: Users },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className="volt-tab-btn"
              onClick={() => setTab(key as any)}
              style={{
                color: tab === key ? 'var(--gold)' : 'var(--volt-muted)',
                borderBottomColor: tab === key ? 'var(--gold)' : 'transparent',
              }}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {/* ── CONTENT ──────────────────────────────────────── */}
        {loading ? <LoadingDots /> : (
          <div style={{ animation: 'voltSlideIn 0.3s ease both', border: '0.5px solid var(--volt-line)' }}>

            {/* ── PRODUCTS ── */}
            {tab === 'products' && (
              <>
                {/* Table header */}
                <div className="volt-table-head" style={{ display: 'grid', gridTemplateColumns: '56px 1fr 120px 120px 72px 88px 100px', gap: 16, padding: '10px 20px', background: 'rgba(201,168,76,0.04)', borderBottom: '0.5px solid var(--volt-line)' }}>
                  {['', 'Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                    <div key={h} style={S.label}>{h}</div>
                  ))}
                </div>

                {products.length === 0 ? (
                  <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--volt-muted)', fontSize: 11, letterSpacing: '0.3em' }}>NO PRODUCTS YET</div>
                ) : products.map(product => (
                  <div
                    key={product.id}
                    className="volt-admin-row volt-product-row"
                    style={{ display: 'grid', gridTemplateColumns: '56px 1fr 120px 120px 72px 88px 100px', gap: 16, padding: '14px 20px', alignItems: 'center', borderBottom: '0.5px solid var(--volt-line)' }}
                  >
                    {/* Image */}
                    <div style={{ width: 40, height: 48, background: '#111', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    {/* Name */}
                    <div>
                      <p style={{ fontSize: 12, color: 'var(--volt-text)', fontWeight: 500, marginBottom: 3 }}>{product.name}</p>
                      <p className="volt-col-hide" style={{ fontSize: 10, color: 'var(--volt-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                        {product.description?.slice(0, 50)}…
                      </p>
                    </div>

                    {/* Category */}
                    <div className="volt-col-hide">
                      <span style={{ background: 'rgba(201,168,76,0.08)', color: 'var(--gold)', fontSize: 9, letterSpacing: '0.1em', padding: '3px 8px' }}>
                        {product.category}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="volt-col-hide">
                      <p style={{ fontSize: 13, color: 'var(--gold)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>{formatPrice(product.price)}</p>
                    </div>

                    {/* Stock */}
                    <div className="volt-col-hide">
                      <p style={{ fontSize: 12, color: 'var(--volt-text)' }}>{product.stock}</p>
                    </div>

                    {/* Status toggle */}
                    <div className="volt-col-hide">
                      <button
                        onClick={() => toggleStock(product)}
                        style={{
                          fontSize: 9, letterSpacing: '0.1em', padding: '4px 10px', cursor: 'pointer',
                          border: `0.5px solid ${product.in_stock ? 'rgba(29,158,117,0.35)' : 'rgba(226,75,74,0.35)'}`,
                          background: product.in_stock ? 'rgba(29,158,117,0.1)' : 'rgba(226,75,74,0.1)',
                          color: product.in_stock ? '#1D9E75' : '#E24B4A',
                          transition: 'all 0.2s',
                        }}
                      >
                        {product.in_stock ? 'In Stock' : 'Out'}
                      </button>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button className="volt-icon-btn" onClick={() => handleEdit(product)}>
                        <Pencil size={12} />
                      </button>
                      {deleteConfirm === product.id ? (
                        <>
                          <button className="volt-icon-btn" onClick={() => handleDelete(product.id)} style={{ borderColor: 'rgba(226,75,74,0.4)', color: '#E24B4A' }}>
                            <Check size={12} />
                          </button>
                          <button className="volt-icon-btn" onClick={() => setDeleteConfirm(null)}>
                            <X size={12} />
                          </button>
                        </>
                      ) : (
                        <button className="volt-icon-btn danger" onClick={() => setDeleteConfirm(product.id)}>
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ── ORDERS ── */}
            {tab === 'orders' && (
              <>
                <div className="volt-table-head" style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 120px 140px', gap: 16, padding: '10px 20px', background: 'rgba(201,168,76,0.04)', borderBottom: '0.5px solid var(--volt-line)' }}>
                  {['Order ID', 'Customer', 'Total', 'Date', 'Status'].map(h => (
                    <div key={h} style={S.label}>{h}</div>
                  ))}
                </div>

                {orders.length === 0 ? (
                  <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--volt-muted)', fontSize: 11, letterSpacing: '0.3em' }}>NO ORDERS YET</div>
                ) : orders.map(order => (
                  <div
                    key={order.id}
                    className="volt-admin-row volt-order-row"
                    style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 120px 140px', gap: 16, padding: '14px 20px', alignItems: 'center', borderBottom: '0.5px solid var(--volt-line)' }}
                  >
                    <p style={{ fontSize: 10, color: 'var(--volt-muted)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <div>
                      <p style={{ fontSize: 12, color: 'var(--volt-text)' }}>{order.shipping_address?.fullName || 'N/A'}</p>
                      <p className="volt-col-hide" style={{ fontSize: 10, color: 'var(--volt-muted)', marginTop: 2 }}>
                        {order.shipping_address?.city}, {order.shipping_address?.state}
                      </p>
                    </div>
                    <p className="volt-col-hide" style={{ fontSize: 13, color: 'var(--gold)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
                      {formatPrice(order.total)}
                    </p>
                    <p className="volt-col-hide" style={{ fontSize: 11, color: 'var(--volt-muted)' }}>
                      {formatDate(order.created_at)}
                    </p>
                    <select
                      value={order.status}
                      onChange={e => updateOrderStatus(order.id, e.target.value)}
                      style={{
                        background: '#111', border: '0.5px solid var(--volt-line)',
                        fontSize: 10, letterSpacing: '0.1em', padding: '6px 10px',
                        cursor: 'pointer', fontFamily: "'Montserrat', sans-serif",
                        outline: 'none', color: 'var(--volt-text)', textTransform: 'uppercase',
                      }}
                    >
                      {['pending','paid','shipped','delivered','cancelled'].map(s => (
                        <option key={s} value={s} style={{ background: '#111' }}>{s.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </>
            )}

            {/* ── USERS ── */}
            {tab === 'users' && (
              <>
                <div className="volt-table-head" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 140px', gap: 16, padding: '10px 20px', background: 'rgba(201,168,76,0.04)', borderBottom: '0.5px solid var(--volt-line)' }}>
                  {['Email', 'Full Name', 'Joined'].map(h => (
                    <div key={h} style={S.label}>{h}</div>
                  ))}
                </div>

                {users.length === 0 ? (
                  <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--volt-muted)', fontSize: 11, letterSpacing: '0.3em' }}>NO USERS YET</div>
                ) : users.map(user => (
                  <div
                    key={user.id}
                    className="volt-admin-row volt-user-row"
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 140px', gap: 16, padding: '14px 20px', alignItems: 'center', borderBottom: '0.5px solid var(--volt-line)' }}
                  >
                    <p style={{ fontSize: 12, color: 'var(--volt-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                    <p style={{ fontSize: 12, color: 'var(--volt-muted)' }}>{user.full_name || '—'}</p>
                    <p style={{ fontSize: 11, color: 'var(--volt-muted)' }}>{formatDate(user.created_at)}</p>
                  </div>
                ))}
              </>
            )}

          </div>
        )}
      </div>

      {/* ── FLOATING ADD BUTTON (mobile) ─────────────────── */}
      {tab === 'products' && (
        <button
          onClick={handleNew}
          style={{
            position: 'fixed', bottom: 28, right: 24,
            width: 52, height: 52,
            background: 'var(--gold)', color: '#000',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, transition: 'all 0.25s',
            boxShadow: '0 4px 24px rgba(201,168,76,0.35)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold-light)'; e.currentTarget.style.transform = 'scale(1.08)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.transform = 'scale(1)' }}
          title="Add New Product"
        >
          <Plus size={22} />
        </button>
      )}

      {/* ── ADD / EDIT MODAL ─────────────────────────────── */}
      {showForm && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16, animation: 'voltFadeUp 0.25s ease both',
          }}
        >
          <div
            className="volt-modal-inner"
            style={{
              width: '100%', maxWidth: 640,
              background: '#0c0c0c',
              border: '0.5px solid var(--volt-line)',
              maxHeight: '90vh', overflowY: 'auto',
              position: 'relative',
            }}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '0.5px solid var(--volt-line)' }}>
              <div>
                <p style={{ ...S.label, marginBottom: 4 }}>{editingId ? 'Editing' : 'New Product'}</p>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: '0.1em', color: 'var(--volt-text)', lineHeight: 1 }}>
                  {editingId ? 'Update Product' : 'Add Product'}
                </h2>
              </div>
              <button
                onClick={() => setShowForm(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--volt-muted)', padding: 4, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--volt-muted)')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

              <div className="volt-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ ...S.label, marginBottom: 8 }}>Product Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Obsidian Blazer" style={S.input}
                    onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--volt-line)')} />
                </div>
                <div>
                  <label style={{ ...S.label, marginBottom: 8 }}>Price (₦) *</label>
                  <input name="price" value={form.price} onChange={handleChange} type="number" placeholder="285000" style={S.input}
                    onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--volt-line)')} />
                </div>
              </div>

              <div className="volt-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ ...S.label, marginBottom: 8 }}>Category</label>
                  <select name="category" value={form.category} onChange={handleChange} style={S.input}>
                    {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#111' }}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ ...S.label, marginBottom: 8 }}>Stock Qty</label>
                  <input name="stock" value={form.stock} onChange={handleChange} type="number" placeholder="100" style={S.input}
                    onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--volt-line)')} />
                </div>
              </div>

              <div>
                <label style={{ ...S.label, marginBottom: 8 }}>Image URL *</label>
                <input name="image" value={form.image} onChange={handleChange} placeholder="https://images.unsplash.com/..." style={S.input}
                  onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--volt-line)')} />
                {form.image && (
                  <div style={{ marginTop: 10, width: 60, height: 72, background: '#111', overflow: 'hidden' }}>
                    <img src={form.image} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              <div>
                <label style={{ ...S.label, marginBottom: 8 }}>Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                  placeholder="Product description..."
                  style={{ ...S.input, resize: 'none' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--volt-line)')} />
              </div>

              <div>
                <label style={{ ...S.label, marginBottom: 10 }}>Available Sizes</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {DEFAULT_SIZES.map(size => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      style={{
                        width: 40, height: 40, fontSize: 10,
                        border: '0.5px solid',
                        borderColor: form.sizes.includes(size) ? 'var(--gold)' : 'var(--volt-line)',
                        color: form.sizes.includes(size) ? '#000' : 'var(--volt-muted)',
                        background: form.sizes.includes(size) ? 'var(--gold)' : 'transparent',
                        fontFamily: "'Montserrat', sans-serif",
                        cursor: 'pointer', transition: 'all 0.2s',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* In-stock toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => setForm(prev => ({ ...prev, in_stock: !prev.in_stock }))}
                  style={{
                    width: 44, height: 24, position: 'relative',
                    background: form.in_stock ? 'var(--gold)' : '#333',
                    border: 'none', cursor: 'pointer', transition: 'background 0.3s',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 4, width: 16, height: 16,
                    background: '#fff', transition: 'left 0.3s',
                    left: form.in_stock ? 24 : 4,
                  }} />
                </button>
                <span style={{ fontSize: 10, letterSpacing: '0.2em', color: form.in_stock ? 'var(--gold)' : 'var(--volt-muted)', textTransform: 'uppercase' }}>
                  {form.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              {error && (
                <p style={{ fontSize: 11, color: '#E24B4A', letterSpacing: '0.05em', padding: '10px 14px', background: 'rgba(226,75,74,0.08)', border: '0.5px solid rgba(226,75,74,0.2)' }}>
                  {error}
                </p>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  width: '100%', padding: '15px',
                  background: saving ? 'rgba(201,168,76,0.5)' : 'var(--gold)',
                  color: '#000', fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500, letterSpacing: '0.25em', fontSize: 11,
                  border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.background = 'var(--gold-light)' }}
                onMouseLeave={e => { if (!saving) e.currentTarget.style.background = 'var(--gold)' }}
              >
                {saving ? 'SAVING…' : editingId ? 'UPDATE PRODUCT' : 'ADD PRODUCT'}
              </button>

            </div>

            {/* Corner ornaments */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: 32, height: 32, borderRight: '0.5px solid rgba(201,168,76,0.15)', borderBottom: '0.5px solid rgba(201,168,76,0.15)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderLeft: '0.5px solid rgba(201,168,76,0.15)', borderTop: '0.5px solid rgba(201,168,76,0.15)', pointerEvents: 'none' }} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin