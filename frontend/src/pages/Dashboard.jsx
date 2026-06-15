import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { transactionApi, budgetApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

const COLORS = ['#4f46e5','#059669','#e11d48','#d97706','#0891b2','#7c3aed','#db2777']

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function fmt(n) {
  return parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0d1117', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.8rem' }}>
      <p style={{ color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.fill, marginBottom: 2 }}>
          {p.name === 'income' ? '↑ Income' : '↓ Expenses'}: ${fmt(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [monthly, setMonthly] = useState([])
  const [budgets, setBudgets] = useState([])

  useEffect(() => {
    transactionApi.getSummary().then(r => setSummary(r.data))
    transactionApi.getMonthly().then(r => setMonthly(r.data))
    budgetApi.getCurrentMonth().then(r => setBudgets(r.data)).catch(() => {})
  }, [])

  const balance = parseFloat(summary?.balance || 0)
  const income = parseFloat(summary?.totalIncome || 0)
  const expenses = parseFloat(summary?.totalExpenses || 0)
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0

  const pieData = summary?.spendingByCategory?.map(c => ({
    name: c.category || 'Other',
    value: parseFloat(c.amount),
  })) ?? []

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.greeting}>{greeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={s.date}>{today}</p>
        </div>
        <Link to="/budgets" style={s.budgetBtn}>⚙ Manage Budgets</Link>
      </div>

      {/* Stat Cards */}
      <div style={s.statsGrid}>
        <StatCard label="Net Balance" value={fmt(balance)} color="var(--balance)" bg="var(--balance-light)"
          icon={<BalanceIcon />} sub={balance >= 0 ? 'You\'re on track' : 'Spending over income'} positive={balance >= 0} />
        <StatCard label="Total Income" value={fmt(income)} color="var(--income)" bg="var(--income-light)"
          icon={<IncomeIcon />} sub="All time" positive />
        <StatCard label="Total Expenses" value={fmt(expenses)} color="var(--expense)" bg="var(--expense-light)"
          icon={<ExpenseIcon />} sub="All time" positive={false} />
        <StatCard label="Savings Rate" value={`${savingsRate}%`} color="var(--warning)" bg="var(--warning-light)"
          icon={<SavingsIcon />} sub="Of total income" positive={savingsRate >= 20} prefix="" />
      </div>

      {/* Charts Row */}
      <div style={s.chartsRow}>
        {/* Bar Chart */}
        <div style={s.chartCard}>
          <div style={s.cardHeader}>
            <h3 style={s.cardTitle}>Monthly Overview</h3>
            <div style={s.legend}>
              <span style={s.legendDot('#059669')} /> Income
              <span style={{...s.legendDot('#e11d48'), marginLeft: 12}} /> Expenses
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthly} barGap={4} barCategoryGap="30%">
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis hide />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)', radius: 6 }} />
              <Bar dataKey="income" fill="#059669" radius={[6,6,0,0]} maxBarSize={32} />
              <Bar dataKey="expenses" fill="#e11d48" radius={[6,6,0,0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div style={{...s.chartCard, minWidth: 280}}>
          <div style={s.cardHeader}>
            <h3 style={s.cardTitle}>Spending This Month</h3>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => `$${fmt(v)}`} contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: '0.8rem' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.78rem' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={s.emptyChart}>No expense data this month</div>
          )}
        </div>
      </div>

      {/* Budget Snapshot */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <h3 style={s.cardTitle}>Budget Snapshot — {new Date().toLocaleString('default', { month: 'long' })}</h3>
          <Link to="/budgets" style={s.viewAll}>View all →</Link>
        </div>
        {budgets.length > 0 ? (
          <div style={s.budgetGrid}>
            {budgets.slice(0, 4).map(b => {
              const spent = parseFloat(b.spentAmount || 0)
              const limit = parseFloat(b.limitAmount)
              const pct   = Math.min((spent / limit) * 100, 100)
              const over  = spent > limit
              const color = over ? 'var(--expense)' : pct >= 80 ? 'var(--warning)' : 'var(--income)'
              return (
                <div key={b.id} style={s.budgetItem}>
                  <div style={s.budgetTop}>
                    <span style={s.budgetCat}>{b.categoryName}</span>
                    <span style={{ fontSize: '0.78rem', color, fontWeight: 600 }}>
                      ${fmt(spent)} <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>/ ${fmt(limit)}</span>
                    </span>
                  </div>
                  <div style={s.track}>
                    <div style={{ ...s.fill, width: `${pct}%`, background: color }} />
                  </div>
                  {over && <p style={{ color: 'var(--expense)', fontSize: '0.72rem', marginTop: 4, fontWeight: 500 }}>⚠ Over by ${fmt(spent - limit)}</p>}
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-3)', fontSize: '0.875rem' }}>
            No budgets set. <Link to="/budgets" style={{ color: 'var(--balance)', fontWeight: 600 }}>Set your first budget →</Link>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color, bg, icon, sub, positive, prefix = '$' }) {
  return (
    <div style={s.statCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ ...s.statIconWrap, background: bg, color }}>{icon}</div>
        <span style={{ ...s.statBadge, background: positive ? 'var(--income-light)' : 'var(--expense-light)', color: positive ? 'var(--income)' : 'var(--expense)' }}>
          {positive ? '↑' : '↓'}
        </span>
      </div>
      <p style={s.statLabel}>{label}</p>
      <p style={{ ...s.statValue, color }}>{value}</p>
      <p style={s.statSub}>{sub}</p>
    </div>
  )
}

function BalanceIcon() { return <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14H11v-2h2v2zm0-4H11V7h2v5z"/></svg> }
function IncomeIcon() { return <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 20V4m0 0l-6 6m6-6l6 6"/></svg> }
function ExpenseIcon() { return <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 4v16m0 0l-6-6m6 6l6-6"/></svg> }
function SavingsIcon() { return <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg> }

const legendDot = (color) => ({ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color, marginRight: 4 })

const s = {
  page: { padding: '32px 32px 48px', maxWidth: 1100, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  greeting: { fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)' },
  date: { color: 'var(--text-3)', fontSize: '0.85rem', marginTop: 4 },
  budgetBtn: { padding: '9px 18px', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-2)', transition: 'var(--transition)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 },
  statCard: { background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '20px 20px 16px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' },
  statIconWrap: { width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statBadge: { fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 99 },
  statLabel: { color: 'var(--text-3)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 },
  statValue: { fontSize: '1.55rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 },
  statSub: { color: 'var(--text-3)', fontSize: '0.72rem', marginTop: 6 },
  chartsRow: { display: 'flex', gap: 14, marginBottom: 20 },
  chartCard: { flex: 1, background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '20px 20px 10px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' },
  card: { background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '20px 24px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', marginBottom: 20 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-1)' },
  legend: { display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-3)' },
  legendDot,
  emptyChart: { height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: '0.85rem' },
  viewAll: { fontSize: '0.8rem', fontWeight: 600, color: 'var(--balance)', textDecoration: 'none' },
  budgetGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px 28px' },
  budgetItem: {},
  budgetTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  budgetCat: { fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-2)' },
  track: { height: 7, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 99, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)' },
}
