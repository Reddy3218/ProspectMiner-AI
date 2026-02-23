import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStats } from '../services/api'
import { TrendingUp, Users, Briefcase, Star, Search, ArrowRight, Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatDistanceToNow } from 'date-fns'

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="card" style={{ position:'relative', overflow:'hidden' }}>
    <div style={{ position:'absolute', top:0, right:0, width:80, height:80, background:`radial-gradient(circle at 100% 0%, ${color}15 0%, transparent 70%)` }} />
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
      <div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text3)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>{label}</div>
        <div style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:800, color:'var(--text)', lineHeight:1 }}>{value ?? '—'}</div>
        {sub && <div style={{ marginTop:6, fontSize:12, color:'var(--text3)' }}>{sub}</div>}
      </div>
      <div style={{ width:40, height:40, borderRadius:10, background:`${color}18`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon size={18} color={color} />
      </div>
    </div>
  </div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:8, padding:'8px 14px', fontFamily:'var(--font-mono)', fontSize:12 }}>
      <div style={{ color:'var(--text2)' }}>{label}</div>
      <div style={{ color:payload[0].color, fontWeight:600 }}>{payload[0].value} leads</div>
    </div>
  )
}

const statusColor = { completed:'var(--green)', running:'var(--accent)', failed:'var(--red)', paused:'var(--yellow)', idle:'var(--text3)' }

export default function Dashboard() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getStats().then(r => { setStats(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const chartData = stats ? [
    { name:'High',   value: stats.highLeads,   color:'#00e5a0' },
    { name:'Medium', value: stats.mediumLeads,  color:'#ffd166' },
    { name:'Low',    value: stats.lowLeads,     color:'#ff6b6b' },
  ] : []

  return (
    <div className="animate-fade">
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, color:'var(--text)', letterSpacing:'-0.03em' }}>Mission Control</h1>
        <p style={{ color:'var(--text2)', marginTop:4, fontSize:14 }}>Your lead mining operations at a glance.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:24 }}>
        {loading
          ? Array.from({length:4}).map((_,i) => <div key={i} className="card skeleton" style={{height:100}} />)
          : <>
              <StatCard label="Total Leads"  value={stats?.totalLeads}    icon={Users}      color="var(--accent)"  sub={`${stats?.withWebsite||0} with websites`} />
              <StatCard label="High Quality" value={stats?.highLeads}     icon={Star}       color="var(--green)"   sub="Score ≥ 70" />
              <StatCard label="Campaigns"    value={stats?.totalCampaigns} icon={Briefcase}  color="var(--purple)"  sub={`${stats?.activeCampaigns||0} active`} />
              <StatCard label="AI Enriched"  value={stats?.enrichedLeads} icon={Activity}   color="var(--yellow)"  sub="With AI insights" />
            </>
        }
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:16, marginBottom:24 }}>
        {/* Chart */}
        <div className="card">
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, marginBottom:16 }}>Lead Score Distribution</div>
          {loading ? <div className="skeleton" style={{height:160}} /> :
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} barSize={36}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill:'var(--text3)', fontSize:12, fontFamily:'var(--font-mono)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill:'var(--text3)', fontSize:11 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="value" radius={[6,6,0,0]}>
                  {chartData.map((d,i) => <Cell key={i} fill={d.color} fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          }
        </div>

        {/* Recent campaigns */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14 }}>Recent Campaigns</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/campaigns')}>View all <ArrowRight size={12}/></button>
          </div>
          {loading
            ? Array.from({length:3}).map((_,i) => <div key={i} className="skeleton" style={{height:44, marginBottom:8, borderRadius:8}} />)
            : !stats?.recentCampaigns?.length
              ? <div style={{ textAlign:'center', padding:'30px 0', color:'var(--text3)', fontSize:13 }}>No campaigns yet</div>
              : stats.recentCampaigns.map(c => (
                  <div key={c._id} onClick={() => navigate(`/campaigns/${c._id}`)}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:8, cursor:'pointer', marginBottom:4, transition:'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    <span className={`dot dot-${c.status}`} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</div>
                      <div style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--font-mono)' }}>{formatDistanceToNow(new Date(c.createdAt), {addSuffix:true})}</div>
                    </div>
                    <div style={{ fontSize:11, fontFamily:'var(--font-mono)', color:statusColor[c.status], textTransform:'uppercase', letterSpacing:'0.06em' }}>{c.status}</div>
                    <div style={{ textAlign:'right', fontSize:11, color:'var(--text3)' }}>
                      <div style={{ fontFamily:'var(--font-mono)', color:'var(--text2)' }}>{c.progress?.scraped||0}</div>
                      <div>leads</div>
                    </div>
                  </div>
                ))
          }
        </div>
      </div>

      {/* CTA */}
      <div className="card" style={{ background:'linear-gradient(135deg,rgba(0,212,255,0.08) 0%,rgba(0,229,160,0.05) 100%)', border:'1px solid rgba(0,212,255,0.2)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:20 }}>
        <div>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:18, letterSpacing:'-0.02em' }}>Ready to mine your next batch of leads?</div>
          <div style={{ color:'var(--text2)', marginTop:4, fontSize:13 }}>Enter a business type and location to start extracting AI-enriched prospects.</div>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/search')} style={{ flexShrink:0 }}>
          <Search size={16}/> New Search
        </button>
      </div>
    </div>
  )
}
