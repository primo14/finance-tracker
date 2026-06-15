import { useState } from 'react'

export default function BudgetManager({ categories, budgets, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({ categoryId: '', limitAmount: '' })
  const [loading, setLoading] = useState(false)

  const expenseCategories = categories.filter(c => c.type === 'EXPENSE')

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
        <h3 style={s.title}>Set Monthly Budget</h3>
        <button onClick={onClose} style={s.closeBtn}>×</button>
      </div>

      <form onSubmit={handleSubmit} style={s.form}>
        <select style={s.input} value={form.categoryId}
          onChange={e => setForm({ ...form, categoryId: e.target.value })} required>
          <option value="">Select category</option>
          {expenseCategories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
        <input style={s.input} type="number" step="0.01" min="1"
          placeholder="Monthly limit ($)"
          value={form.limitAmount}
          onChange={e => setForm({ ...form, limitAmount: e.target.value })} required />
        <button type="submit" style={s.saveBtn} disabled={loading}>
          {loading ? 'Saving...' : 'Set Budget'}
        </button>
      </form>

      {budgets.length > 0 && (
        <div style={s.list}>
          <p style={s.listLabel}>Current budgets</p>
          {budgets.map(b => (
            <div key={b.id} style={s.row}>
              <span style={s.catName}>{b.categoryName}</span>
              <span style={s.limitText}>${parseFloat(b.limitAmount).toFixed(2)}/mo</span>
              <button onClick={() => onDelete(b.id)} style={s.deleteBtn}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const s = {
  card: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginTop: '1.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  title: { margin: 0, fontSize: '1rem', color: '#202124' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#888', lineHeight: 1 },
  form: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  input: { flex: 1, minWidth: '160px', padding: '0.6rem 0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.95rem' },
  saveBtn: { padding: '0.6rem 1.25rem', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.95rem' },
  list: { marginTop: '1.25rem', borderTop: '1px solid #f0f0f0', paddingTop: '1rem' },
  listLabel: { margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' },
  row: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid #f8f8f8' },
  catName: { flex: 1, fontSize: '0.9rem', color: '#202124' },
  limitText: { color: '#555', fontSize: '0.9rem' },
  deleteBtn: { padding: '0.25rem 0.6rem', border: '1px solid #fce8e6', background: '#fce8e6', color: '#ea4335', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
}
