import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { authApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { token, login } = useAuth()
  const navigate = useNavigate()

  if (token) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const { data } = await authApi.login(form)
      login(data); navigate('/')
    } catch {
      setError('Invalid email or password')
    } finally { setLoading(false) }
  }

  return (
    <div style={s.shell}>
      {/* Left panel */}
      <div style={s.left}>
        <div style={s.logoRow}>
          <div style={s.logoMark}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1L16.5 5.25V12.75L9 17L1.5 12.75V5.25L9 1Z" fill="#fff" fillOpacity="0.9"/>
              <path d="M9 5L13 7.5V12.5L9 15L5 12.5V7.5L9 5Z" fill="#4f46e5"/>
            </svg>
          </div>
          <span style={s.logoText}>FinTrack</span>
        </div>
        <div style={s.leftContent}>
          <h2 style={s.leftTitle}>Your money,<br />under control.</h2>
          <p style={s.leftSub}>Track income, set budgets, and understand your spending — all in one place.</p>
          <div style={s.features}>
            {['📊 Visual spending breakdowns', '🎯 Monthly budget limits', '📈 Income vs expense trends'].map(f => (
              <div key={f} style={s.featureItem}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={s.right}>
        <div style={s.form}>
          <h1 style={s.title}>Welcome back</h1>
          <p style={s.subtitle}>Sign in to your account</p>

          {error && <div style={s.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <Field label="Email address">
              <input style={s.input} type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </Field>
            <Field label="Password">
              <input style={s.input} type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </Field>
            <button type="submit" style={s.btn} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <p style={s.footer}>Don't have an account? <Link to="/register" style={s.link}>Create one free</Link></p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

const s = {
  shell: { display: 'flex', minHeight: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif' },
  left: { width: '42%', background: '#0d1117', padding: '40px 48px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'auto' },
  logoMark: { width: 34, height: 34, borderRadius: 10, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontWeight: 700, fontSize: '1.1rem' },
  leftContent: { paddingBottom: 48 },
  leftTitle: { fontSize: '2.4rem', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.04em', marginBottom: 16 },
  leftSub: { color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 32 },
  features: { display: 'flex', flexDirection: 'column', gap: 10 },
  featureItem: { color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 },
  right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 40 },
  form: { width: '100%', maxWidth: 380 },
  title: { fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6 },
  subtitle: { color: '#64748b', fontSize: '0.9rem', marginBottom: 28 },
  errorBox: { background: '#ffe4e6', color: '#e11d48', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 18, fontWeight: 500 },
  input: { width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.9rem', background: '#fff', outline: 'none', color: '#0f172a', transition: 'border-color 0.15s', fontFamily: 'inherit' },
  btn: { width: '100%', padding: '12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', marginTop: 8, letterSpacing: '-0.01em', transition: 'opacity 0.15s' },
  footer: { textAlign: 'center', marginTop: 24, color: '#64748b', fontSize: '0.875rem' },
  link: { color: '#4f46e5', fontWeight: 600 },
}
