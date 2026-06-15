import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { transactionApi, categoryApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import TransactionForm from '../components/TransactionForm'
import TransactionList from '../components/TransactionList'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([transactionApi.getAll(), categoryApi.getAll()])
      .then(([tRes, cRes]) => {
        setTransactions(tRes.data)
        setCategories(cRes.data)
      })
  }, [])

  async function handleSave(data) {
    if (editing) {
      const { data: updated } = await transactionApi.update(editing.id, data)
      setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t))
    } else {
      const { data: created } = await transactionApi.create(data)
      setTransactions(prev => [created, ...prev])
    }
    setShowForm(false)
    setEditing(null)
  }

  async function handleDelete(id) {
    await transactionApi.delete(id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  function handleEdit(t) {
    setEditing(t)
    setShowForm(true)
  }

  function handleLogout() { logout(); navigate('/login') }

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <Link to="/" style={s.logo}>Finance Tracker</Link>
        <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
      </nav>

      <div style={s.content}>
        <div style={s.header}>
          <h2 style={s.title}>Transactions</h2>
          <button style={s.addBtn} onClick={() => { setEditing(null); setShowForm(true) }}>
            + Add Transaction
          </button>
        </div>

        {showForm && (
          <TransactionForm
            initial={editing}
            categories={categories}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null) }}
          />
        )}

        <TransactionList transactions={transactions} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh' },
  nav: { background: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  logo: { fontWeight: 700, fontSize: '1.1rem', color: '#1a73e8', textDecoration: 'none' },
  logoutBtn: { background: 'none', border: '1px solid #ddd', padding: '0.35rem 0.8rem', borderRadius: '6px', cursor: 'pointer', color: '#555', fontSize: '0.9rem' },
  content: { padding: '2rem', maxWidth: '860px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  title: { margin: 0, color: '#202124' },
  addBtn: { background: '#1a73e8', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' },
}
