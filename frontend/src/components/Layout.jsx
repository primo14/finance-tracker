import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/', label: 'Dashboard', icon: <GridIcon /> },
  { to: '/transactions', label: 'Transactions', icon: <SwapIcon /> },
  { to: '/budgets', label: 'Budgets', icon: <BudgetIcon /> },
  { to: '/categories', label: 'Categories', icon: <TagIcon /> },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) ?? '?'

  function handleLogout() { logout(); navigate('/login') }

  return (
    <div style={s.shell}>
      <aside style={s.sidebar}>
        <div style={s.logo}>
          <div style={s.logoMark}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1L16.5 5.25V12.75L9 17L1.5 12.75V5.25L9 1Z" fill="#4f46e5" fillOpacity="0.9"/>
              <path d="M9 5L13 7.5V12.5L9 15L5 12.5V7.5L9 5Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <span style={s.logoText}>FinTrack</span>
        </div>

        <p style={s.navLabel}>MENU</p>
        <nav style={s.nav}>
          {NAV.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
              ...s.navItem,
              ...(isActive ? s.navActive : {})
            })}>
              <span style={s.navIcon}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={s.sidebarBottom}>
          <div style={s.userCard}>
            <div style={s.avatar}>{initials}</div>
            <div style={s.userInfo}>
              <p style={s.userName}>{user?.name}</p>
              <p style={s.userEmail}>{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn}>
            <LogoutIcon /> Sign out
          </button>
        </div>
      </aside>

      <main style={s.main}>
        {children}
      </main>
    </div>
  )
}

/* ── Icons ── */
function GridIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  )
}
function SwapIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
    </svg>
  )
}
function BudgetIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
    </svg>
  )
}
function TagIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/>
    </svg>
  )
}
function LogoutIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{marginRight: 6}}>
      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
    </svg>
  )
}

const s = {
  shell: { display: 'flex', minHeight: '100vh', background: 'var(--bg)' },
  sidebar: {
    width: 'var(--sidebar-width)', flexShrink: 0, background: 'var(--sidebar-bg)',
    display: 'flex', flexDirection: 'column', padding: '24px 16px',
    position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', marginBottom: 32 },
  logoMark: {
    width: 34, height: 34, borderRadius: 10, background: 'rgba(79,70,229,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { color: '#fff', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.02em' },
  navLabel: { color: '#475569', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em', padding: '0 8px', marginBottom: 6 },
  nav: { display: 'flex', flexDirection: 'column', gap: 2, flex: 1 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
    borderRadius: 9, color: '#64748b', fontSize: '0.875rem', fontWeight: 500,
    transition: 'var(--transition)', cursor: 'pointer',
  },
  navActive: { background: 'rgba(255,255,255,0.08)', color: '#fff' },
  navIcon: { display: 'flex', alignItems: 'center' },
  sidebarBottom: { borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, marginTop: 16 },
  userCard: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px', marginBottom: 8 },
  avatar: {
    width: 34, height: 34, borderRadius: 9, background: '#4f46e5',
    color: '#fff', fontWeight: 700, fontSize: '0.8rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  userInfo: { minWidth: 0 },
  userName: { color: '#e2e8f0', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userEmail: { color: '#475569', fontSize: '0.7rem', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  logoutBtn: {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '8px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.07)',
    background: 'rgba(255,255,255,0.04)', color: '#64748b', fontSize: '0.8rem',
    cursor: 'pointer', transition: 'var(--transition)',
  },
  main: { flex: 1, overflow: 'auto', minWidth: 0 },
}
