export default function BudgetProgress({ budgets }) {
  if (!budgets || budgets.length === 0) return null

  return (
    <div style={s.card}>
      <h3 style={s.title}>Monthly Budget Status</h3>
      {budgets.map(b => {
        const spent = parseFloat(b.spentAmount)
        const limit = parseFloat(b.limitAmount)
        const pct = Math.min((spent / limit) * 100, 100)
        const over = spent > limit
        const warn = pct >= 80
        const color = over ? '#ea4335' : warn ? '#f59e0b' : '#34a853'

        return (
          <div key={b.id} style={s.item}>
            <div style={s.labelRow}>
              <span style={s.name}>{b.categoryName}</span>
              <div style={s.right}>
                <span style={{ color, fontWeight: 600 }}>${spent.toFixed(2)}</span>
                <span style={s.limit}> / ${limit.toFixed(2)}</span>
                {over && <span style={s.badge}>Over budget</span>}
              </div>
            </div>
            <div style={s.track}>
              <div style={{ ...s.fill, width: `${pct}%`, background: color }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

const s = {
  card: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginTop: '1.5rem' },
  title: { margin: '0 0 1.25rem', fontSize: '1rem', color: '#202124' },
  item: { marginBottom: '1.1rem' },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' },
  name: { fontWeight: 500, color: '#202124', fontSize: '0.9rem' },
  right: { display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' },
  limit: { color: '#888' },
  badge: { marginLeft: '0.5rem', background: '#fce8e6', color: '#ea4335', fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 600 },
  track: { height: '8px', background: '#f0f0f0', borderRadius: '999px', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: '999px', transition: 'width 0.3s ease' },
}
