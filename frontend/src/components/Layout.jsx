import React, { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Search, Briefcase, Users, ChevronRight, Zap, Menu } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/search',    icon: Search,          label: 'New Search' },
  { to: '/campaigns', icon: Briefcase,       label: 'Campaigns' },
  { to: '/leads',     icon: Users,           label: 'All Leads' },
]

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: collapsed ? 64 : 220,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s ease',
        flexShrink: 0,
        position: 'fixed', top:0, left:0, bottom:0,
        zIndex: 100, overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding:'20px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10, minHeight:64 }}>
          <div style={{
            width:32, height:32, borderRadius:8, flexShrink:0,
            background:'linear-gradient(135deg, var(--accent), var(--green))',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <Zap size={16} color="#080c14" fill="#080c14" />
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:14, color:'var(--text)', letterSpacing:'-0.02em', lineHeight:1.1 }}>ProspectMiner</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--accent)', letterSpacing:'0.12em', marginTop:1 }}>AI ENGINE</div>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav style={{ flex:1, padding:'12px 0' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} title={collapsed ? label : undefined}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center', gap:10,
                padding: collapsed ? '11px 16px' : '10px 16px',
                margin:'2px 8px', borderRadius:8,
                textDecoration:'none',
                fontFamily:'var(--font-display)', fontSize:13,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--accent)' : 'var(--text2)',
                background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                transition:'all 0.15s',
                whiteSpace:'nowrap', overflow:'hidden',
                justifyContent: collapsed ? 'center' : 'flex-start',
              })}
            >
              <Icon size={16} style={{ flexShrink:0 }} />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)} className="btn btn-ghost btn-sm"
          style={{ margin:'12px 8px', justifyContent: collapsed ? 'center' : 'flex-end', color:'var(--text3)' }}>
          {collapsed ? <ChevronRight size={14} /> : <><span style={{fontSize:11}}>Collapse</span><Menu size={14}/></>}
        </button>
      </aside>

      {/* ── Main area ── */}
      <main style={{ flex:1, marginLeft: collapsed ? 64 : 220, transition:'margin-left 0.25s ease', minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        {/* Top bar */}
        <header style={{
          height:56, background:'var(--bg2)', borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center', padding:'0 28px', gap:12,
          position:'sticky', top:0, zIndex:99,
        }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text3)', letterSpacing:'0.06em' }}>
            {location.pathname.slice(1).toUpperCase() || 'DASHBOARD'}
          </div>
          <div style={{ flex:1 }} />
          <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(0,229,160,0.08)', border:'1px solid rgba(0,229,160,0.2)', borderRadius:20, padding:'4px 12px' }}>
            <span className="dot dot-running" />
            <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--green)', letterSpacing:'0.08em' }}>SYSTEM ONLINE</span>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex:1, padding:'28px', maxWidth:1400, width:'100%' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
