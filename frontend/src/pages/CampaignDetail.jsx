import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCampaign, getLeads, pauseCampaign, restartCampaign, deleteCampaign, exportLeadsCSV } from '../services/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Pause, RefreshCw, Trash2, Download, ExternalLink, Star, Globe, Phone, Mail } from 'lucide-react'

const ScoreBadge = ({ score }) => {
  const cls = { High:'badge-high', Medium:'badge-med', Low:'badge-low', Unscored:'badge-none' }
  return <span className={`badge ${cls[score]||'badge-none'}`}>{score}</span>
}

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [leads, setLeads]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [search, setSearch]     = useState('')

  const load = useCallback(async () => {
    try {
      const [cRes, lRes] = await Promise.all([getCampaign(id), getLeads({ campaignId:id, limit:100 })])
      setCampaign(cRes.data.campaign)
      setLeads(lRes.data.leads)
    } catch(err) { toast.error(err.message) }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (campaign?.status !== 'running') return
    const t = setInterval(load, 4000)
    return () => clearInterval(t)
  }, [campaign?.status, load])

  const handlePause   = async () => { try { await pauseCampaign(id);   toast.success('Paused');    load() } catch(e){ toast.error(e.message) } }
  const handleRestart = async () => { try { await restartCampaign(id); toast.success('Restarted'); load() } catch(e){ toast.error(e.message) } }
  const handleDelete  = async () => {
    if (!window.confirm('Delete this campaign?')) return
    try { await deleteCampaign(id); toast.success('Deleted'); navigate('/campaigns') } catch(e){ toast.error(e.message) }
  }

  const filtered = leads.filter(l => {
    const ok1 = filter==='all' || l.score===filter
    const ok2 = !search || l.businessName.toLowerCase().includes(search.toLowerCase()) || (l.aiSummary||'').toLowerCase().includes(search.toLowerCase())
    return ok1 && ok2
  })

  if (loading && !campaign) return <div style={{display:'flex',justifyContent:'center',padding:60}}><span className="animate-spin" style={{width:24,height:24,border:'2px solid var(--border)',borderTopColor:'var(--accent)',borderRadius:'50%',display:'block'}}/></div>

  const pct = campaign?.progress?.total > 0 ? Math.round((campaign.progress.scored/campaign.progress.total)*100) : 0

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/campaigns')} style={{marginTop:4}}><ArrowLeft size={15}/></button>
        <div style={{flex:1}}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, letterSpacing:'-0.03em' }}>{campaign?.name}</h1>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text3)', marginTop:3 }}>"{campaign?.query}" · {campaign?.location}</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          {campaign?.status==='running'                                   && <button className="btn btn-secondary btn-sm" onClick={handlePause}  ><Pause size={13}/> Pause</button>}
          {(campaign?.status==='paused'||campaign?.status==='failed')    && <button className="btn btn-secondary btn-sm" onClick={handleRestart}><RefreshCw size={13}/> Restart</button>}
          <button className="btn btn-secondary btn-sm" onClick={() => exportLeadsCSV({campaignId:id})}><Download size={13}/> Export CSV</button>
          <button className="btn btn-danger btn-sm"    onClick={handleDelete}><Trash2 size={13}/></button>
        </div>
      </div>

      {/* Progress */}
      <div className="card" style={{marginBottom:20}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:16,marginBottom:16}}>
          {[
            {label:'Scraped',   value:campaign?.progress?.scraped,    color:'var(--text)'},
            {label:'Enriched',  value:campaign?.progress?.enriched,   color:'var(--accent)'},
            {label:'Scored',    value:campaign?.progress?.scored,     color:'var(--green)'},
            {label:'High Leads',value:campaign?.stats?.highLeads,     color:'var(--green)'},
            {label:'Failed',    value:campaign?.progress?.failed,     color:'var(--red)'},
          ].map((s,i) => (
            <div key={i} style={{textAlign:'center'}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:26,fontWeight:800,color:s.color}}>{s.value??0}</div>
              <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text3)',letterSpacing:'0.06em',textTransform:'uppercase'}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`}}/></div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:6}}>
          <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text3)'}}>Overall progress</span>
          <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--accent)'}}>{pct}%</span>
        </div>
      </div>

      {/* Filters */}
      <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:16,flexWrap:'wrap'}}>
        {['all','High','Medium','Low'].map(f => (
          <button key={f} className={`btn btn-sm ${filter===f?'btn-primary':'btn-secondary'}`} onClick={()=>setFilter(f)}>
            {f==='all'?'All':f} {f!=='all'&&`(${leads.filter(l=>l.score===f).length})`}
          </button>
        ))}
        <div style={{flex:1}}/>
        <input className="input" style={{maxWidth:220,padding:'7px 12px'}} placeholder="Search leads..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      {/* Leads table */}
      <div className="card" style={{padding:0}}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Business</th><th>Score</th><th>Contact</th><th>Rating</th><th>AI Summary</th><th>Services</th><th></th></tr></thead>
            <tbody>
              {!filtered.length ? (
                <tr><td colSpan={7} style={{textAlign:'center',padding:'40px',color:'var(--text3)'}}>
                  {campaign?.status==='running' ? 'Mining in progress...' : 'No leads found'}
                </td></tr>
              ) : filtered.map(lead => (
                <tr key={lead._id} style={{cursor:'pointer'}} onClick={()=>navigate(`/leads/${lead._id}`)}>
                  <td>
                    <div style={{fontWeight:600,fontSize:13}}>{lead.businessName}</div>
                    {lead.category && <div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>{lead.category}</div>}
                    {lead.address  && <div style={{fontSize:11,color:'var(--text3)'}}>{lead.address}</div>}
                  </td>
                  <td>
                    <ScoreBadge score={lead.score}/>
                    {lead.scoreValue>0 && <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text3)',marginTop:3}}>{lead.scoreValue}/100</div>}
                  </td>
                  <td>
                    <div style={{display:'flex',flexDirection:'column',gap:3}}>
                      {lead.phone   && <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text2)',display:'flex',alignItems:'center',gap:4}}><Phone size={10} color="var(--text3)"/>{lead.phone}</span>}
                      {lead.website && <span style={{fontSize:11,color:'var(--accent)',display:'flex',alignItems:'center',gap:4}}><Globe size={10}/>{lead.website.replace(/^https?:\/\/(www\.)?/,'').split('/')[0]}</span>}
                      {(lead.email||lead.emailGuesses?.[0]) && <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text2)',display:'flex',alignItems:'center',gap:4}}><Mail size={10} color="var(--text3)"/>{lead.email||lead.emailGuesses[0]}</span>}
                    </div>
                  </td>
                  <td>
                    {lead.rating>0 ? (
                      <div>
                        <div style={{display:'flex',alignItems:'center',gap:4}}><Star size={11} color="var(--yellow)" fill="var(--yellow)"/><span style={{fontFamily:'var(--font-mono)',fontWeight:600,fontSize:12}}>{lead.rating}</span></div>
                        <div style={{fontSize:11,color:'var(--text3)'}}>{lead.reviewCount} reviews</div>
                      </div>
                    ) : <span style={{color:'var(--text3)'}}>—</span>}
                  </td>
                  <td style={{maxWidth:220}}>
                    {lead.aiSummary ? <div style={{fontSize:12,color:'var(--text2)',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{lead.aiSummary}</div>
                      : <span style={{fontSize:11,color:'var(--text3)'}}>{lead.status==='enriching'?'Enriching...':'—'}</span>}
                  </td>
                  <td>
                    {lead.keyServices?.slice(0,2).map((s,i) => (
                      <span key={i} style={{display:'inline-block',background:'var(--surface2)',borderRadius:4,padding:'2px 7px',fontSize:10,color:'var(--text3)',marginRight:4,marginBottom:3}}>{s}</span>
                    ))}
                  </td>
                  <td>
                    {lead.website && <a href={lead.website} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} className="btn btn-ghost btn-sm"><ExternalLink size={12}/></a>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
