import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const { data } = await authApi.login(form)
      login(data)
      navigate('/')
    } catch {
      setError('Invalid email or password')
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.logo}>Finance Tracker</h1>
        <h2 style={s.heading}>Sign in</h2>
        {error && <p style={s.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={s.input} type="email" placeholder="Email"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input style={s.input} type="password" placeholder="Password"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <button style={s.btn} type="submit">Sign In</button>
        </form>
        <p style={s.footer}>No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 16px rgba(0,0,0,0.1)', width: '360px' },
  logo: { margin: '0 0 0.25rem', color: '#1a73e8', fontSize: '1.4rem' },
  heading: { margin: '0 0 1.5rem', color: '#555', fontWeight: 400, fontSize: '1rem' },
  error: { color: '#d32f2f', fontSize: '0.875rem', margin: '0 0 1rem' },
  input: { display: 'block', width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' },
  btn: { width: '100%', padding: '0.75rem', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' },
  footer: { textAlign: 'center', marginTop: '1rem', color: '#666', fontSize: '0.9rem' },
}
