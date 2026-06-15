import { useState, useEffect } from 'react'
import { categoryApi } from '../api/client'

const SUGGESTED_ICONS = {
  EXPENSE: ['🍔','🚗','🛍','🎬','🏥','💡','🏠','✈️','📚','🎮','🐾','🏋️','☕','🧴','🎁'],
  INCOME:  ['💼','💻','📈','🏦','🎨','🎤','🏗','🤝','💰','🎓'],
}

function blankForm(type = 'EXPENSE') {
  return { name: '', type, icon: type === 'EXPENSE' ? '📁' : '💵' }
}

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [showAdd, setShowAdd] = useState(null)   // 'INCOME' | 'EXPENSE' | null
  const [addForm, setAddForm] = useState(blankForm())
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    categoryApi.getAll().then(r => setCategories(r.data))
  }, [])

  const byType = type => categories.filter(c => c.type === type)

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await categoryApi.create(addForm)
      setCategories(prev => [...prev, data])
      setShowAdd(null)
      setAddForm(blankForm())
    } finally { setSaving(false) }
  }

  async function handleEdit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await categoryApi.update(editingId, editForm)
      setCategories(prev => prev.map(c => c.id === data.id ? data : c))
      setEditingId(null)
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category? Any transactions using it will become uncategorized.')) return
    await categoryApi.delete(id)
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  function startEdit(c) {
    setEditingId(c.id)
    setEditForm({ name: c.name, type: c.type, icon: c.icon })
  }

  function openAdd(type) {
    setShowAdd(type)
    setAddForm(blankForm(type))
    setEditingId(null)
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Categories</h1>
          <p style={s.sub}>Organize your transactions with custom categories</p>
        </div>
      </div>

      <div style={s.cols}>
        {['EXPENSE', 'INCOME'].map(type => (
          <div key={type} style={s.col}>
            <div style={s.colHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ ...s.typeTag, background: type === 'EXPENSE' ? 'var(--expense-light)' : 'var(--income-light)', color: type === 'EXPENSE' ? 'var(--expense)' : 'var(--income)' }}>
                  {type === 'EXPENSE' ? '↓ Expense' : '↑ Income'}
                </span>
                <span style={s.count}>{byType(type).length} categories</span>
              </div>
              <button onClick={() => openAdd(type)} style={s.addBtn}>+ Add</button>
            </div>

            <div style={s.list}>
              {byType(type).map(c => (
                <div key={c.id} style={s.item}>
                  {editingId === c.id ? (
                    /* ── Inline edit form ── */
                    <form onSubmit={handleEdit} style={s.editForm}>
                      <IconPicker
                        value={editForm.icon}
                        type={type}
                        onChange={icon => setEditForm(f => ({ ...f, icon }))}
                      />
                      <input style={s.nameInput} value={editForm.name}
                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Category name" required autoFocus />
                      <div style={s.editActions}>
                        <button type="button" onClick={() => setEditingId(null)} style={s.cancelBtn}>Cancel</button>
                        <button type="submit" style={s.saveBtn} disabled={saving}>{saving ? '…' : 'Save'}</button>
                      </div>
                    </form>
                  ) : (
                    /* ── Category row ── */
                    <div style={s.row}>
                      <span style={s.icon}>{c.icon}</span>
                      <span style={s.name}>{c.name}</span>
                      {c.custom ? (
                        <div style={s.rowActions}>
                          <button onClick={() => startEdit(c)} style={s.editBtn}>Edit</button>
                          <button onClick={() => handleDelete(c.id)} style={s.deleteBtn}>Delete</button>
                        </div>
                      ) : (
                        <span style={s.defaultBadge}>Default</span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* ── Add new form ── */}
              {showAdd === type && (
                <div style={s.item}>
                  <form onSubmit={handleAdd} style={s.editForm}>
                    <IconPicker
                      value={addForm.icon}
                      type={type}
                      onChange={icon => setAddForm(f => ({ ...f, icon }))}
                    />
                    <input style={s.nameInput} value={addForm.name}
                      onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                      placeholder={`New ${type.toLowerCase()} category`} required autoFocus />
                    <div style={s.editActions}>
                      <button type="button" onClick={() => setShowAdd(null)} style={s.cancelBtn}>Cancel</button>
                      <button type="submit" style={s.saveBtn} disabled={saving}>{saving ? '…' : 'Create'}</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function IconPicker({ value, type, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(v => !v)} style={s.iconBtn} title="Pick icon">
        {value}
      </button>
      {open && (
        <div style={s.iconDropdown}>
          <p style={s.iconPickerLabel}>Quick pick</p>
          <div style={s.iconGrid}>
            {SUGGESTED_ICONS[type].map(em => (
              <button key={em} type="button" style={{ ...s.iconOption, background: em === value ? 'var(--balance-light)' : 'transparent' }}
                onClick={() => { onChange(em); setOpen(false) }}>{em}</button>
            ))}
          </div>
          <div style={s.iconCustomRow}>
            <p style={s.iconPickerLabel}>Or type any emoji</p>
            <input style={s.iconCustomInput} value={value} maxLength={4}
              onChange={e => onChange(e.target.value)}
              placeholder="🏷" />
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  page: { padding: '32px 32px 48px', maxWidth: 1000, margin: '0 auto' },
  header: { marginBottom: 28 },
  title: { fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em' },
  sub: { color: 'var(--text-3)', fontSize: '0.85rem', marginTop: 4 },

  cols: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  col: { background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', overflow: 'hidden' },
  colHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' },
  typeTag: { fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: 99, letterSpacing: '0.04em' },
  count: { color: 'var(--text-3)', fontSize: '0.78rem' },
  addBtn: { padding: '6px 14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 7, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' },

  list: { padding: '8px 0' },
  item: { borderBottom: '1px solid var(--border)', padding: '0' },

  row: { display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px' },
  icon: { fontSize: '1.1rem', width: 28, textAlign: 'center', flexShrink: 0 },
  name: { flex: 1, fontSize: '0.875rem', fontWeight: 500 },
  rowActions: { display: 'flex', gap: 6 },
  editBtn: { padding: '4px 10px', border: '1.5px solid var(--border)', background: 'var(--surface)', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-2)' },
  deleteBtn: { padding: '4px 10px', border: 'none', background: 'var(--expense-light)', color: 'var(--expense)', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' },
  defaultBadge: { fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-3)', background: 'var(--surface-2)', padding: '3px 8px', borderRadius: 99, border: '1px solid var(--border)', letterSpacing: '0.04em' },

  editForm: { display: 'flex', gap: 8, alignItems: 'center', padding: '10px 16px', flexWrap: 'wrap', background: 'var(--surface-2)' },
  iconBtn: { width: 36, height: 36, borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--surface)', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  nameInput: { flex: 1, minWidth: 120, padding: '8px 10px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none', background: 'var(--surface)' },
  editActions: { display: 'flex', gap: 6 },
  cancelBtn: { padding: '7px 12px', border: '1.5px solid var(--border)', background: 'var(--surface)', borderRadius: 7, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-2)' },
  saveBtn: { padding: '7px 14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 7, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' },

  iconDropdown: { position: 'absolute', top: 42, left: 0, background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12, padding: 12, boxShadow: 'var(--shadow-md)', zIndex: 50, width: 220 },
  iconPickerLabel: { fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 },
  iconGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, marginBottom: 10 },
  iconOption: { border: 'none', borderRadius: 6, padding: '5px', fontSize: '1.1rem', cursor: 'pointer', textAlign: 'center' },
  iconCustomRow: { borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 },
  iconCustomInput: { marginTop: 6, width: '100%', padding: '6px 8px', border: '1.5px solid var(--border)', borderRadius: 7, fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none' },
}
