import { useState } from 'react'

export default function TransactionForm({ initial, categories, onSave, onCancel }) {
  const [form, setForm] = useState({
    amount: initial?.amount ?? '',
    type: initial?.type ?? 'EXPENSE',
    description: initial?.description ?? '',
    date: initial?.date ?? new Date().toISOString().split('T')[0],
    categoryId: initial?.categoryId ?? '',
  })

  function handleSubmit(e) {
    e.preventDefault()
    onSave({
      ...form,
      amount: parseFloat(form.amount),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
    })
  }

  const set = field => e => setForm({ ...form, [field]: e.target.value })

  return (
    <div style={s.card}>
      <h3 style={s.heading}>{initial ? 'Edit' : 'New'} Transaction</h3>
      <form onSubmit={handleSubmit}>
        <div style={s.row}>
          <Field label="Type">
            <select style={s.input} value={form.type} onChange={set('type')}>
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </Field>
          <Field label="Amount ($)">
            <input style={s.input} type="number" step="0.01" min="0.01"
              value={form.amount} onChange={set('amount')} required />
          </Field>
          <Field label="Date">
            <input style={s.input} type="date"
              value={form.date} onChange={set('date')} required />
          </Field>
        </div>
        <div style={s.row}>
          <Field label="Description" flex={2}>
            <input style={s.input} placeholder="What was this for?"
              value={form.description} onChange={set('description')} />
          </Field>
          <Field label="Category">
            <select style={s.input} value={form.categoryId} onChange={set('categoryId')}>
              <option value="">None</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </Field>
        </div>
        <div style={s.actions}>
          <button type="button" onClick={onCancel} style={s.cancelBtn}>Cancel</button>
          <button type="submit" style={s.saveBtn}>Save</button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children, flex = 1 }) {
  return (
    <div style={{ flex, display: 'flex', flexDirection: 'column' }}>
      <label style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.3rem' }}>{label}</label>
      {children}
    </div>
  )
}

const s = {
  card: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '1.5rem' },
  heading: { margin: '0 0 1.25rem', fontSize: '1rem', color: '#202124' },
  row: { display: 'flex', gap: '1rem', marginBottom: '1rem' },
  input: { padding: '0.6rem 0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.95rem', width: '100%' },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' },
  cancelBtn: { padding: '0.55rem 1.2rem', border: '1px solid #ddd', background: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' },
  saveBtn: { padding: '0.55rem 1.2rem', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' },
}
