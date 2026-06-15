import { useState, useEffect, useMemo } from 'react'
import { transactionApi, categoryApi } from '../api/client'
import TransactionForm from '../components/TransactionForm'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    Promise.all([transactionApi.getAll(), categoryApi.getAll()])
      .then(([tRes, cRes]) => { setTransactions(tRes.data); setCategories(cRes.data) })
  }, [])

  const filtered = useMemo(() => transactions.filter(t => {
    const matchType = filter === 'ALL' || t.type === filter
    const matchSearch = !search || t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.categoryName?.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  }), [transactions, filter, search])

  async function handleSave(data) {
    if (editing) {
      const { data: u } = await transactionApi.update(editing.id, data)
      setTransactions(prev => prev.map(t => t.id === u.id ? u : t))
    } else {
      const { data: c } = await transactionApi.create(data)
      setTransactions(prev => [c, ...prev])
    }
    setShowForm(false); setEditing(null)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this transaction?')) return
    await transactionApi.delete(id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  function openEdit(t) { setEditing(t); setShowForm(true) }
  function openNew() { setEditing(null); setShowForm(true) }

  const totals = useMemo(() => ({
    income: filtered.filter(t => t.type === 'INCOME').reduce((s, t) => s + parseFloat(t.amount), 0),
    expense: filtered.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + parseFloat(t.amount), 0),
  }), [filtered])

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Transactions</h1>
          <p style={s.sub}>{filtered.length} records · <span style={{ color: 'var(--income)' }}>+${fmt(totals.income)}</span> · <span style={{ color: 'var(--expense)' }}>-${fmt(totals.expense)}</span></p>
        </div>
        <button onClick={openNew} style={s.addBtn}>+ Add Transaction</button>
      </div>

      {/* Filters */}
      <div style={s.toolbar}>
        <div style={s.searchWrap}>
          <SearchIcon />
          <input style={s.search} placeholder="Search by description or category…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={s.filterGroup}>
          {['ALL', 'INCOME', 'EXPENSE'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ ...s.filterBtn, ...(filter === f ? s.filterActive : {}) }}>
              {f === 'ALL' ? 'All' : f === 'INCOME' ? '↑ Income' : '↓ Expenses'}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <TransactionForm initial={editing} categories={categories}
          onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null) }} />
      )}

      {/* Table */}
      <div style={s.tableCard}>
        {filtered.length === 0 ? (
          <div style={s.empty}>
            <p style={{ fontSize: '1.5rem', marginBottom: 8 }}>🔍</p>
            <p style={{ fontWeight: 600, color: 'var(--text-2)' }}>No transactions found</p>
            <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginTop: 4 }}>Try adjusting your search or filter</p>
          </div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <Th>Type</Th><Th>Description</Th><Th>Category</Th><Th>Date</Th><Th align="right">Amount</Th><Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => {
                const isIncome = t.type === 'INCOME'
                return (
                  <tr key={t.id} style={{ ...s.tr, animationDelay: `${i * 20}ms` }} className="fade-up">
                    <td style={s.td}>
                      <span style={{ ...s.typeBadge, background: isIncome ? 'var(--income-light)' : 'var(--expense-light)', color: isIncome ? 'var(--income)' : 'var(--expense)' }}>
                        {isIncome ? '↑' : '↓'} {t.type}
                      </span>
                    </td>
                    <td style={{ ...s.td, fontWeight: 500, maxWidth: 220 }}>
                      <span style={s.ellipsis}>{t.description || <span style={{ color: 'var(--text-3)' }}>—</span>}</span>
                    </td>
                    <td style={{ ...s.td, color: 'var(--text-3)', fontSize: '0.82rem' }}>
                      {t.categoryName || '—'}
                    </td>
                    <td style={{ ...s.td, color: 'var(--text-3)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                      {new Date(t.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ ...s.td, textAlign: 'right', fontWeight: 700, fontSize: '0.95rem', color: isIncome ? 'var(--income)' : 'var(--expense)', whiteSpace: 'nowrap' }}>
                      {isIncome ? '+' : '-'}${fmt(t.amount)}
                    </td>
                    <td style={{ ...s.td, textAlign: 'right' }}>
                      <div style={s.actions}>
                        <button onClick={() => openEdit(t)} style={s.editBtn}>Edit</button>
                        <button onClick={() => handleDelete(t.id)} style={s.deleteBtn}>Delete</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function Th({ children, align = 'left' }) {
  return <th style={{ padding: '11px 16px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: align, borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>{children}</th>
}

function SearchIcon() {
  return <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
}

function fmt(n) {
  return parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const s = {
  page: { padding: '32px 32px 48px', maxWidth: 1100, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em' },
  sub: { color: 'var(--text-3)', fontSize: '0.82rem', marginTop: 4 },
  addBtn: { padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)', whiteSpace: 'nowrap' },
  toolbar: { display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' },
  searchWrap: { flex: 1, position: 'relative', minWidth: 200 },
  search: { width: '100%', padding: '10px 12px 10px 36px', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: '0.875rem', outline: 'none', color: 'var(--text-1)', transition: 'var(--transition)' },
  filterGroup: { display: 'flex', gap: 6 },
  filterBtn: { padding: '9px 16px', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-2)', transition: 'var(--transition)' },
  filterActive: { background: '#0d1117', color: '#fff', borderColor: '#0d1117' },
  tableCard: { background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tr: { borderBottom: '1px solid var(--border)', transition: 'background 0.12s' },
  td: { padding: '13px 16px', fontSize: '0.875rem', color: 'var(--text-1)' },
  ellipsis: { display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  typeBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em' },
  actions: { display: 'flex', gap: 6, justifyContent: 'flex-end' },
  editBtn: { padding: '5px 12px', border: '1.5px solid var(--border)', background: 'var(--surface)', borderRadius: 7, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-2)', transition: 'var(--transition)' },
  deleteBtn: { padding: '5px 12px', border: '1.5px solid var(--expense-light)', background: 'var(--expense-light)', borderRadius: 7, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', color: 'var(--expense)', transition: 'var(--transition)' },
  empty: { padding: '60px 0', textAlign: 'center' },
}
