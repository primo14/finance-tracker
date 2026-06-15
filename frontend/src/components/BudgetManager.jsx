import { useState } from 'react'

export default function BudgetManager({ categories, budgets, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({ categoryId: '', limitAmount: '' })
  const [loading, setLoading] = useState(false)

  const expenseCats = categories.filter(c => c.type === 'EXPENSE')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    await onSave({ categoryId: Number(form.categoryId), limitAmount: parseFloat(form.limitAmount) })
    setForm({ categoryId: '', limitAmount: '' })
    setLoading(false)
  }

  return (
    <div style={s.card}>
      <div style={s.header}>
        <div>
          <h3 style={s.title}>Budget Limits</h3>
          <p style={s.sub}>Set monthly spending caps per category</p>
        </div>
        <button onClick={onClose} style={s.closeBtn}>✕</button>
      </div>

      <form onSubmit={handleSubmit} style={s.form}>
        <select style={s.input} value={form.categoryId}
          onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} required>
          <option value="">Select expense category</option>
          {expenseCats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <div style={s.amountWrap}>
          <span style={s.dollar}>$</span>
          <input style={s.amountInput} type="number" step="0.01" min="1" placeholder="Monthly limit"
            value={form.limitAmount} onChange={e => setForm(f => ({ ...f, limitAmount: e.target.value }))} required />
        </div>
        <button type="submit" style={s.saveBtn} disabled={loading}>
          {loading ? 'Saving…' : 'Set Limit'}
        </button>
      </form>

      {budgets.length > 0 && (
        <div style={s.list}>
          <p style={s.listLabel}>Active budgets this month</p>
          {budgets.map(b => (
            <div key={b.id} style={s.row}>
              <span style={s.catName}>{b.categoryName}</span>
              <span style={s.limit}>${parseFloat(b.limitAmount).toFixed(2)}/mo</span>
              <button onClick={() => onDelete(b.id)} style={s.deleteBtn}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const s = {
  card: { background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '22px 24px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', marginBottom: 20 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  title: { fontSize: '0.95rem', fontWeight: 700 },
  sub: { color: 'var(--text-3)', fontSize: '0.8rem', marginTop: 2 },
  closeBtn: { background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', color: 'var(--text-3)', padding: '2px 6px' },
  form: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 6 },
  input: { flex: '1 1 160px', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 9, fontSize: '0.875rem', color: 'var(--text-1)', fontFamily: 'inherit', background: 'var(--surface)' },
  amountWrap: { flex: '1 1 130px', display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 9, padding: '0 12px', background: 'var(--surface)' },
  dollar: { color: 'var(--text-3)', fontWeight: 600, marginRight: 4, fontSize: '0.9rem' },
  amountInput: { border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', width: '100%', fontFamily: 'inherit', padding: '10px 0' },
  saveBtn: { padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 9, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
  list: { marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 14 },
  listLabel: { fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 },
  row: { display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f8fafc', gap: 10 },
  catName: { flex: 1, fontSize: '0.875rem', fontWeight: 500 },
  limit: { fontSize: '0.82rem', color: 'var(--text-3)' },
  deleteBtn: { padding: '4px 10px', border: 'none', background: 'var(--expense-light)', color: 'var(--expense)', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' },
}
