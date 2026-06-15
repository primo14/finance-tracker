import { useState, useEffect, useMemo } from 'react'
import { budgetApi, categoryApi, transactionApi } from '../api/client'

const today = new Date()
const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
const daysPassed = today.getDate()
const daysLeft = daysInMonth - daysPassed
const currentMonth = today.toLocaleString('default', { month: 'long', year: 'numeric' })

function project(spent) {
  if (daysPassed === 0) return 0
  return (parseFloat(spent) / daysPassed) * daysInMonth
}

function fmt(n) {
  return parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function statusOf(pct, over) {
  if (over)     return { label: 'Over budget',   color: 'var(--expense)',  bg: 'var(--expense-light)' }
  if (pct >= 80) return { label: 'Warning',       color: 'var(--warning)',  bg: 'var(--warning-light)' }
  if (pct >= 50) return { label: 'On track',      color: '#0891b2',         bg: '#e0f2fe' }
  return           { label: 'Well within',        color: 'var(--income)',   bg: 'var(--income-light)' }
}

export default function Budgets() {
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [spending, setSpending] = useState([]) // spendingByCategory from summary
  const [addForm, setAddForm] = useState({ categoryId: '', limitAmount: '' })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ limitAmount: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([budgetApi.getCurrentMonth(), categoryApi.getAll(), transactionApi.getSummary()])
      .then(([bRes, cRes, sRes]) => {
        setBudgets(bRes.data)
        setCategories(cRes.data)
        setSpending(sRes.data.spendingByCategory || [])
      })
  }, [])

  // Categories that have spending this month but no budget set
  const budgetedCatNames = new Set(budgets.map(b => b.categoryName))
  const unbudgeted = spending.filter(s => s.category !== 'Uncategorized' && !budgetedCatNames.has(s.category))

  // Totals
  const totals = useMemo(() => {
    const budgeted = budgets.reduce((s, b) => s + parseFloat(b.limitAmount), 0)
    const spent    = budgets.reduce((s, b) => s + parseFloat(b.spentAmount || 0), 0)
    return { budgeted, spent, remaining: budgeted - spent, pct: budgeted > 0 ? (spent / budgeted) * 100 : 0 }
  }, [budgets])

  const overBudget = budgets.filter(b => parseFloat(b.spentAmount) > parseFloat(b.limitAmount))

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    const saved = await budgetApi.upsert({ categoryId: Number(addForm.categoryId), limitAmount: parseFloat(addForm.limitAmount) })
    setBudgets(prev => {
      const exists = prev.find(b => b.id === saved.data.id)
      return exists ? prev.map(b => b.id === saved.data.id ? saved.data : b) : [...prev, saved.data]
    })
    setAddForm({ categoryId: '', limitAmount: '' })
    setSaving(false)
  }

  async function handleEdit(b) {
    setSaving(true)
    const saved = await budgetApi.upsert({ categoryId: b.categoryId, limitAmount: parseFloat(editForm.limitAmount) })
    setBudgets(prev => prev.map(x => x.id === saved.data.id ? saved.data : x))
    setEditingId(null)
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!confirm('Remove this budget?')) return
    await budgetApi.delete(id)
    setBudgets(prev => prev.filter(b => b.id !== id))
  }

  const expenseCats = categories.filter(c => c.type === 'EXPENSE')
  const availableCats = expenseCats.filter(c => !budgets.find(b => b.categoryName === c.name))

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Budgets</h1>
          <p style={s.sub}>{currentMonth} · {daysLeft} days remaining</p>
        </div>
      </div>

      {/* Summary row */}
      <div style={s.summaryRow}>
        <SummaryCard label="Total Budgeted" value={`$${fmt(totals.budgeted)}`} color="var(--balance)" icon="🎯" />
        <SummaryCard label="Spent So Far" value={`$${fmt(totals.spent)}`} color="var(--expense)" icon="💸" />
        <SummaryCard label="Remaining" value={`$${fmt(totals.remaining)}`} color={totals.remaining >= 0 ? 'var(--income)' : 'var(--expense)'} icon="💰" />
        <SummaryCard label="Overall Usage" value={`${Math.round(totals.pct)}%`} color="var(--warning)" icon="📊" />
      </div>

      {/* Overall progress bar */}
      {budgets.length > 0 && (
        <div style={s.overallBar}>
          <div style={s.overallMeta}>
            <span style={s.overallLabel}>Monthly budget used</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: totals.pct > 100 ? 'var(--expense)' : totals.pct > 80 ? 'var(--warning)' : 'var(--income)' }}>
              {Math.round(totals.pct)}%
            </span>
          </div>
          <div style={s.trackLg}>
            <div style={{ ...s.fillLg, width: `${Math.min(totals.pct, 100)}%`, background: totals.pct > 100 ? 'var(--expense)' : totals.pct > 80 ? 'var(--warning)' : 'var(--income)' }} />
          </div>
        </div>
      )}

      {/* Over-budget alert */}
      {overBudget.length > 0 && (
        <div style={s.alert}>
          <span style={s.alertIcon}>⚠</span>
          <div>
            <p style={s.alertTitle}>{overBudget.length} {overBudget.length === 1 ? 'category' : 'categories'} over budget this month</p>
            <p style={s.alertSub}>{overBudget.map(b => `${b.categoryName} ($${fmt(parseFloat(b.spentAmount) - parseFloat(b.limitAmount))} over)`).join(' · ')}</p>
          </div>
        </div>
      )}

      {/* Budget cards */}
      {budgets.length > 0 ? (
        <div style={s.grid}>
          {budgets.map(b => {
            const spent   = parseFloat(b.spentAmount || 0)
            const limit   = parseFloat(b.limitAmount)
            const pct     = Math.min((spent / limit) * 100, 100)
            const over    = spent > limit
            const proj    = project(spent)
            const status  = statusOf(pct, over)
            const isEditing = editingId === b.id

            return (
              <div key={b.id} style={{ ...s.card, borderTop: `3px solid ${status.color}` }}>
                {/* Card header */}
                <div style={s.cardTop}>
                  <div>
                    <p style={s.catName}>{b.categoryName}</p>
                    <span style={{ ...s.statusBadge, background: status.bg, color: status.color }}>{status.label}</span>
                  </div>
                  <div style={s.cardActions}>
                    <button onClick={() => { setEditingId(isEditing ? null : b.id); setEditForm({ limitAmount: limit }) }} style={s.iconBtn}>
                      {isEditing ? '✕' : '✏'}
                    </button>
                    <button onClick={() => handleDelete(b.id)} style={{ ...s.iconBtn, color: 'var(--expense)' }}>🗑</button>
                  </div>
                </div>

                {/* Amounts */}
                <div style={s.amounts}>
                  <div>
                    <p style={s.amtLabel}>Spent</p>
                    <p style={{ ...s.amtValue, color: status.color }}>${fmt(spent)}</p>
                  </div>
                  <div style={s.divider} />
                  <div>
                    <p style={s.amtLabel}>Limit</p>
                    <p style={s.amtValue}>${fmt(limit)}</p>
                  </div>
                  <div style={s.divider} />
                  <div>
                    <p style={s.amtLabel}>{over ? 'Over by' : 'Left'}</p>
                    <p style={{ ...s.amtValue, color: over ? 'var(--expense)' : 'var(--income)' }}>
                      ${fmt(Math.abs(limit - spent))}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={s.track}>
                  <div style={{ ...s.fill, width: `${pct}%`, background: status.color }} />
                </div>
                <div style={s.pctRow}>
                  <span style={{ color: 'var(--text-3)', fontSize: '0.72rem' }}>{Math.round(pct)}% used</span>
                  <span style={{ color: 'var(--text-3)', fontSize: '0.72rem' }}>{daysLeft}d left</span>
                </div>

                {/* Projection */}
                <div style={{ ...s.projection, background: proj > limit ? 'var(--expense-light)' : 'var(--surface-2)', borderColor: proj > limit ? '#fecdd3' : 'var(--border)' }}>
                  <span style={s.projLabel}>Projected end-of-month</span>
                  <span style={{ ...s.projValue, color: proj > limit ? 'var(--expense)' : 'var(--text-2)' }}>
                    ${fmt(proj)}
                    {proj > limit && <span style={s.projOver}> ↑ ${fmt(proj - limit)} over</span>}
                  </span>
                </div>

                {/* Inline edit */}
                {isEditing && (
                  <div style={s.editRow}>
                    <input style={s.editInput} type="number" step="0.01" min="1"
                      value={editForm.limitAmount} onChange={e => setEditForm({ limitAmount: e.target.value })}
                      placeholder="New limit" autoFocus />
                    <button onClick={() => handleEdit(b)} style={s.editSaveBtn} disabled={saving}>
                      {saving ? '…' : 'Update'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div style={s.emptyState}>
          <p style={{ fontSize: '2rem', marginBottom: 12 }}>🎯</p>
          <p style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 6 }}>No budgets set yet</p>
          <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>Add a budget below to start tracking your spending limits</p>
        </div>
      )}

      {/* Add budget */}
      {availableCats.length > 0 && (
        <div style={s.addCard}>
          <h3 style={s.addTitle}>Add Budget Limit</h3>
          <p style={s.addSub}>Set a monthly spending cap for an expense category</p>
          <form onSubmit={handleAdd} style={s.addForm}>
            <select style={s.addInput} value={addForm.categoryId}
              onChange={e => setAddForm(f => ({ ...f, categoryId: e.target.value }))} required>
              <option value="">Select category…</option>
              {availableCats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <div style={s.addAmtWrap}>
              <span style={s.addDollar}>$</span>
              <input style={s.addAmtInput} type="number" step="0.01" min="1"
                placeholder="Monthly limit" value={addForm.limitAmount}
                onChange={e => setAddForm(f => ({ ...f, limitAmount: e.target.value }))} required />
            </div>
            <button type="submit" style={s.addBtn} disabled={saving}>{saving ? 'Saving…' : '+ Set Budget'}</button>
          </form>
        </div>
      )}

      {/* Unbudgeted spending */}
      {unbudgeted.length > 0 && (
        <div style={s.unbudgetedCard}>
          <h3 style={s.addTitle}>Unbudgeted Spending This Month</h3>
          <p style={s.addSub}>You're spending in these categories without a budget set</p>
          <div style={s.unbudgetedGrid}>
            {unbudgeted.map(u => (
              <div key={u.category} style={s.unbudgetedItem}>
                <span style={s.unbudgetedCat}>{u.category}</span>
                <span style={{ color: 'var(--expense)', fontWeight: 700, fontSize: '0.9rem' }}>${fmt(u.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, color, icon }) {
  return (
    <div style={s.summaryCard}>
      <span style={s.summaryIcon}>{icon}</span>
      <p style={s.summaryLabel}>{label}</p>
      <p style={{ ...s.summaryValue, color }}>{value}</p>
    </div>
  )
}

const s = {
  page: { padding: '32px 32px 48px', maxWidth: 1100, margin: '0 auto' },
  header: { marginBottom: 24 },
  title: { fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em' },
  sub: { color: 'var(--text-3)', fontSize: '0.85rem', marginTop: 4 },

  summaryRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 },
  summaryCard: { background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '18px 20px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' },
  summaryIcon: { fontSize: '1.2rem', display: 'block', marginBottom: 10 },
  summaryLabel: { color: 'var(--text-3)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 },
  summaryValue: { fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.03em' },

  overallBar: { background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '16px 20px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', marginBottom: 16 },
  overallMeta: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  overallLabel: { fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)' },
  trackLg: { height: 10, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden', border: '1px solid var(--border)' },
  fillLg: { height: '100%', borderRadius: 99, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' },

  alert: { background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 'var(--radius)', padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' },
  alertIcon: { fontSize: '1.1rem', marginTop: 1 },
  alertTitle: { fontWeight: 700, color: 'var(--warning)', fontSize: '0.875rem', marginBottom: 3 },
  alertSub: { color: '#92400e', fontSize: '0.8rem' },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 },
  card: { background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '18px 18px 14px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  catName: { fontWeight: 700, fontSize: '0.95rem', marginBottom: 5 },
  statusBadge: { fontSize: '0.68rem', fontWeight: 700, padding: '3px 8px', borderRadius: 99, letterSpacing: '0.04em' },
  cardActions: { display: 'flex', gap: 4 },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', padding: '2px 5px', borderRadius: 5, color: 'var(--text-3)', transition: 'var(--transition)' },

  amounts: { display: 'flex', gap: 0, marginBottom: 12 },
  divider: { width: 1, background: 'var(--border)', margin: '0 12px' },
  amtLabel: { fontSize: '0.68rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 },
  amtValue: { fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.02em' },

  track: { height: 7, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden', marginBottom: 4, border: '1px solid var(--border)' },
  fill: { height: '100%', borderRadius: 99, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)' },
  pctRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 10 },

  projection: { border: '1px solid', borderRadius: 8, padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  projLabel: { fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 500 },
  projValue: { fontSize: '0.82rem', fontWeight: 700 },
  projOver: { fontWeight: 500, fontSize: '0.72rem' },

  editRow: { display: 'flex', gap: 8, marginTop: 10 },
  editInput: { flex: 1, padding: '7px 10px', border: '1.5px solid var(--balance)', borderRadius: 7, fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none' },
  editSaveBtn: { padding: '7px 14px', background: 'var(--balance)', color: '#fff', border: 'none', borderRadius: 7, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' },

  emptyState: { background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '48px', textAlign: 'center', marginBottom: 20, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' },

  addCard: { background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '22px 24px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', marginBottom: 16 },
  addTitle: { fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 },
  addSub: { color: 'var(--text-3)', fontSize: '0.8rem', marginBottom: 14 },
  addForm: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  addInput: { flex: '1 1 180px', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 9, fontSize: '0.875rem', fontFamily: 'inherit', color: 'var(--text-1)', background: 'var(--surface)' },
  addAmtWrap: { flex: '1 1 130px', display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 9, padding: '0 12px', background: 'var(--surface)' },
  addDollar: { color: 'var(--text-3)', fontWeight: 600, marginRight: 4, fontSize: '0.9rem' },
  addAmtInput: { border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', width: '100%', fontFamily: 'inherit', padding: '10px 0' },
  addBtn: { padding: '10px 22px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 9, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },

  unbudgetedCard: { background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '22px 24px', boxShadow: 'var(--shadow)', border: '1.5px dashed #e2e8f0' },
  unbudgetedGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 12 },
  unbudgetedItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-2)', borderRadius: 8, padding: '10px 14px', border: '1px solid var(--border)' },
  unbudgetedCat: { fontSize: '0.85rem', fontWeight: 500 },
}
