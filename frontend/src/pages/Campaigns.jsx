import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCampaigns, deleteCampaign } from '../services/api'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { Briefcase, Trash2, Eye, Plus, RefreshCw } from 'lucide-react'

const statusColor = { completed:'var(--green)', running:'var(--accent)', failed:'var(--red)', paused:'var(--yellow)', idle:'var(--text3)' }

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading]     = useState(true)
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    getCampaigns().then(r => { setCampaigns(r.data.campaigns); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this campaign and all its leads?')) return
    try { await deleteCampaign(id); toast.success('Deleted'); load() } catch(err) { toast.error(err.message) }
  }

  return (
    <div className="animate-fade">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, letterSpacing:'-0.03em' }}>Campaigns</h1>
          <p style={{ color:'var(--text2)', marginTop:4, fontSize:14 }}>{campaigns.length} total</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={13}/></button>
          <button className="btn btn-primary" onClick={() => navigate('/search')}><Plus size={14}/> New Campaign</button>
        </div>
      </div>

      {loading ? (
        <div className="card">{Array.from({length:5}).map((_,i) => <div key={i} className="skeleton" style={{height:56,marginBottom:10,borderRadius:8}}/>)}</div>
      ) : !campaigns.length ? (
        <div className="card" style={{ textAlign:'center', padding:'60px 20px' }}>
          <Briefcase size={40} color="var(--text3)" style={{marginBottom:14}}/>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, marginBottom:6 }}>No campaigns yet</div>
          <div style={{ color:'var(--text3)', marginBottom:18, fontSize:13 }}>Start your first lead mining campaign</div>
          <button className="btn btn-primary" onClick={() => navigate('/search')}><Plus size={14}/> New Campaign</button>
        </div>
      ) : (
        <div className="card" style={{padding:0}}>
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Campaign</th><th>Status</th><th>Progress</th><th>Leads</th><th>Score Dist.</th><th>Created</th><th></th>
              </tr></thead>
              <tbody>
                {campaigns.map(c => {
                  const pct = c.progress.total > 0 ? Math.round((c.progress.scored/c.progress.total)*100) : 0
                  return (
                    <tr key={c._id} style={{cursor:'pointer'}} onClick={() => navigate(`/campaigns/${c._id}`)}>
                      <td>
                        <div style={{fontWeight:600,fontSize:13}}>{c.name}</div>
                        <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text3)',marginTop:2}}>"{c.query}" in {c.location}</div>
                      </td>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:7}}>
                          <span className={`dot dot-${c.status}`}/>
                          <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:statusColor[c.status],textTransform:'uppercase',letterSpacing:'0.06em'}}>{c.status}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{minWidth:100}}>
                          <div className="progress-bar" style={{height:3,marginBottom:4}}><div className="progress-fill" style={{width:`${pct}%`}}/></div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text3)'}}>{c.progress.scored}/{c.progress.total} scored</div>
                        </div>
                      </td>
                      <td><span style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:18}}>{c.progress.scraped}</span></td>
                      <td>
                        <div style={{display:'flex',gap:6}}>
                          {c.stats.highLeads   > 0 && <span className="badge badge-high">{c.stats.highLeads} H</span>}
                          {c.stats.mediumLeads > 0 && <span className="badge badge-med">{c.stats.mediumLeads} M</span>}
                          {c.stats.lowLeads    > 0 && <span className="badge badge-low">{c.stats.lowLeads} L</span>}
                          {!c.stats.highLeads && !c.stats.mediumLeads && !c.stats.lowLeads && <span style={{color:'var(--text3)',fontSize:12}}>—</span>}
                        </div>
                      </td>
                      <td><span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text3)'}}>{formatDistanceToNow(new Date(c.createdAt),{addSuffix:true})}</span></td>
                      <td>
                        <div style={{display:'flex',gap:6}}>
                          <button className="btn btn-ghost btn-sm" onClick={e=>{e.stopPropagation();navigate(`/campaigns/${c._id}`)}}><Eye size={13}/></button>
                          <button className="btn btn-danger btn-sm" onClick={e=>handleDelete(c._id,e)}><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
