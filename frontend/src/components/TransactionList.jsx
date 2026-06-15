export default function TransactionList({ transactions, onEdit, onDelete }) {
  if (transactions.length === 0) {
    return (
      <div style={s.empty}>No transactions yet. Add one above to get started.</div>
    )
  }

  return (
    <div style={s.list}>
      {transactions.map(t => (
        <div key={t.id} style={s.row}>
          <div style={{ ...s.badge, background: t.type === 'INCOME' ? '#e6f4ea' : '#fce8e6' }}>
            <span style={{ color: t.type === 'INCOME' ? '#34a853' : '#ea4335', fontWeight: 700, fontSize: '1.1rem' }}>
              {t.type === 'INCOME' ? '+' : '-'}
            </span>
          </div>

          <div style={s.info}>
            <p style={s.desc}>{t.description || 'No description'}</p>
            <p style={s.meta}>
              {t.date}{t.categoryName ? ` · ${t.categoryName}` : ''}
            </p>
          </div>

          <span style={{ ...s.amount, color: t.type === 'INCOME' ? '#34a853' : '#ea4335' }}>
            {t.type === 'INCOME' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}
          </span>

          <div style={s.actions}>
            <button onClick={() => onEdit(t)} style={s.editBtn}>Edit</button>
            <button onClick={() => onDelete(t.id)} style={s.deleteBtn}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}

const s = {
  list: { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' },
  row: { display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #f5f5f5', gap: '1rem' },
  badge: { width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  info: { flex: 1, minWidth: 0 },
  desc: { margin: 0, fontWeight: 500, color: '#202124', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  meta: { margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#888' },
  amount: { fontWeight: 700, fontSize: '1rem', minWidth: '100px', textAlign: 'right' },
  actions: { display: 'flex', gap: '0.5rem', flexShrink: 0 },
  editBtn: { padding: '0.3rem 0.7rem', border: '1px solid #ddd', background: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  deleteBtn: { padding: '0.3rem 0.7rem', border: '1px solid #fce8e6', background: '#fce8e6', color: '#ea4335', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  empty: { background: '#fff', padding: '3rem', textAlign: 'center', color: '#888', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
}
