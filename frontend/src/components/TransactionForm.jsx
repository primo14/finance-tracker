import { useState } from 'react'

export default function TransactionForm({ initial, categories, onSave, onCancel }) {
  const [form, setForm] = useState({
    amount: initial?.amount ?? '',
    type: initial?.type ?? 'EXPENSE',
    description: initial?.description ?? '',
    date: initial?.date ?? new Date().toISOString().split('T')[0],
    categoryId: initial?.categoryId ?? '',
  })

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  function handleSubmit(e) {
    e.preventDefault()
    onSave({ ...form, amount: parseFloat(form.amount), categoryId: form.categoryId ? Number(form.categoryId) : null })
  }

  const filteredCats = categories.filter(c => form.type === 'ALL' || c.type === form.type)

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div style={s.panel}>
        <div style={s.panelHeader}>
          <h3 style={s.panelTitle}>{initial ? 'Edit Transaction' : 'New Transaction'}</h3>
          <button onClick={onCancel} style={s.closeBtn}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type toggle */}
          <div style={s.typeToggle}>
            {['EXPENSE', 'INCOME'].map(t => (
              <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t, categoryId: '' }))}
                style={{ ...s.typeBtn, ...(form.type === t ? (t === 'EXPENSE' ? s.expenseActive : s.incomeActive) : {}) }}>
                {t === 'INCOME' ? '↑ Income' : '↓ Expense'}
              </button>
            ))}
          </div>

          {/* Amount — big, prominent */}
          <div style={s.amountWrap}>
            <span style={s.currencySymbol}>$</span>
            <input style={s.amountInput} type="number" step="0.01" min="0.01"
              placeholder="0.00" value={form.amount} onChange={set('amount')} required />
          </div>

          <div style={s.grid}>
            <Field label="Description">
              <input style={s.input} placeholder="What was this for?" value={form.description} onChange={set('description')} />
            </Field>
            <Field label="Date">
              <input style={s.input} type="date" value={form.date} onChange={set('date')} required />
            </Field>
          </div>

          <Field label="Category">
            <select style={s.input} value={form.categoryId} onChange={set('categoryId')}>
              <option value="">No category</option>
              {filteredCats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </Field>

          <div style={s.actions}>
            <button type="button" onClick={onCancel} style={s.cancelBtn}>Cancel</button>
            <button type="submit" style={s.saveBtn}>
              {initial ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(13,17,23,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 },
  panel: { background: 'var(--surface)', borderRadius: 18, padding: '28px 28px 24px', width: '100%', maxWidth: 440, boxShadow: 'var(--shadow-md)', animation: 'fadeUp 0.25s cubic-bezier(0.4,0,0.2,1)' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  panelTitle: { fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--text-3)', padding: '2px 6px', borderRadius: 6 },
  typeToggle: { display: 'flex', background: 'var(--surface-2)', borderRadius: 10, padding: 4, marginBottom: 20, border: '1px solid var(--border)' },
  typeBtn: { flex: 1, padding: '8px', borderRadius: 7, border: 'none', background: 'transparent', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-3)', transition: 'var(--transition)' },
  expenseActive: { background: 'var(--expense-light)', color: 'var(--expense)' },
  incomeActive: { background: 'var(--income-light)', color: 'var(--income)' },
  amountWrap: { display: 'flex', alignItems: 'center', background: 'var(--surface-2)', borderRadius: 12, border: '1.5px solid var(--border)', marginBottom: 18, padding: '0 16px' },
  currencySymbol: { fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-3)', marginRight: 4 },
  amountInput: { flex: 1, border: 'none', background: 'transparent', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-1)', padding: '14px 0', outline: 'none', letterSpacing: '-0.04em', fontFamily: 'inherit' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  input: { width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 9, fontSize: '0.875rem', color: 'var(--text-1)', background: 'var(--surface)', outline: 'none', fontFamily: 'inherit' },
  actions: { display: 'flex', gap: 10, marginTop: 20 },
  cancelBtn: { flex: 1, padding: '11px', border: '1.5px solid var(--border)', background: 'var(--surface)', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-2)' },
  saveBtn: { flex: 2, padding: '11px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' },
}
