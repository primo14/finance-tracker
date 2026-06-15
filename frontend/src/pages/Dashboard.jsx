import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { transactionApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

const COLORS = ['#1a73e8', '#ea4335', '#fbbc04', '#34a853', '#ff6d00', '#46bdc6', '#7c4dff']

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    transactionApi.getSummary().then(r => setSummary(r.data))
  }, [])

  function handleLogout() { logout(); navigate('/login') }

  const chartData = summary?.spendingByCategory?.map(c => ({
    name: c.category || 'Uncategorized',
    value: parseFloat(c.amount),
  })) ?? []

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.logo}>Finance Tracker</span>
        <div style={s.navRight}>
          <span style={s.welcome}>Hi, {user?.name}</span>
          <Link to="/transactions" style={s.navLink}>Transactions</Link>
          <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={s.content}>
        <h2 style={s.title}>Dashboard</h2>

        {summary && (
          <>
            <div style={s.cards}>
              <StatCard label="Total Income" value={summary.totalIncome} color="#34a853" />
              <StatCard label="Total Expenses" value={summary.totalExpenses} color="#ea4335" />
              <StatCard label="Balance" value={summary.balance}
                color={parseFloat(summary.balance) >= 0 ? '#1a73e8' : '#ea4335'} />
            </div>

            {chartData.length > 0 ? (
              <div style={s.chartCard}>
                <h3 style={s.chartTitle}>This Month's Spending by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" outerRadius={110}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={v => `$${parseFloat(v).toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={s.empty}>
                No spending data yet. <Link to="/transactions">Add a transaction</Link> to get started.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ ...s.card, borderTop: `4px solid ${color}` }}>
      <p style={s.cardLabel}>{label}</p>
      <p style={{ ...s.cardValue, color }}>${parseFloat(value).toFixed(2)}</p>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh' },
  nav: { background: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  logo: { fontWeight: 700, fontSize: '1.1rem', color: '#1a73e8' },
  navRight: { display: 'flex', alignItems: 'center', gap: '1.25rem' },
  welcome: { color: '#555', fontSize: '0.9rem' },
  navLink: { color: '#1a73e8', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' },
  logoutBtn: { background: 'none', border: '1px solid #ddd', padding: '0.35rem 0.8rem', borderRadius: '6px', cursor: 'pointer', color: '#555', fontSize: '0.9rem' },
  content: { padding: '2rem', maxWidth: '860px', margin: '0 auto' },
  title: { marginTop: 0, color: '#202124' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
  card: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  cardLabel: { margin: '0 0 0.5rem', color: '#777', fontSize: '0.85rem' },
  cardValue: { margin: 0, fontSize: '1.75rem', fontWeight: 700 },
  chartCard: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  chartTitle: { marginTop: 0, color: '#202124', fontSize: '1rem' },
  empty: { background: '#fff', padding: '2rem', borderRadius: '12px', textAlign: 'center', color: '#777' },
}
