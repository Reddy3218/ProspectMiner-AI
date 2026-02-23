import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLeads, exportLeadsCSV, deleteLead } from '../services/api'
import toast from 'react-hot-toast'
import { Users, Search, Download, Trash2, ExternalLink, Star, Globe, Phone, Mail } from 'lucide-react'

const ScoreBadge = ({ score }) => {
  const cls = { High:'badge-high', Medium:'badge-med', Low:'badge-low', Unscored:'badge-none' }
  return <span className={`badge ${cls[score]||'badge-none'}`}>{score}</span>
}

export default function LeadsPage() {
  const navigate = useNavigate()
  const [leads, setLeads]           = useState([])
  const [pagination, setPagination] = useState({ total:0, page:1, pages:1 })
  const [loading, setLoading]       = useState(true)
  const [filters, setFilters]       = useState({ score:'', search:'', page:1 })

  const load = useCallback(() => {
    setLoading(true)
    const params = { page:filters.page, limit:50 }
    if (filters.score)  params.score  = filters.score
    if (filters.search) params.search = filters.search
    getLeads(params)
      .then(r => { setLeads(r.data.leads); setPagination(r.data.pagination) })
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this lead?')) return
    try { await deleteLead(id); toast.success('Deleted'); load() } catch(err){ toast.error(err.message) }
  }

  return (
    <div className="animate-fade">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
        <div>
          <h1 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:800,letterSpacing:'-0.03em'}}>All Leads</h1>
          <p style={{color:'var(--text2)',marginTop:4,fontSize:14}}>{pagination.total} total leads</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={()=>exportLeadsCSV({score:filters.score||undefined})}><Download size={13}/> Export</button>
      </div>

      <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
        {['','High','Medium','Low'].map(s => (
          <button key={s} className={`btn btn-sm ${filters.score===s?'btn-primary':'btn-secondary'}`} onClick={()=>setFilters(f=>({...f,score:s,page:1}))}>
            {s||'All Scores'}
          </button>
        ))}
        <div style={{flex:1}}/>
        <div style={{position:'relative'}}>
          <Search size={13} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text3)'}}/>
          <input className="input" style={{paddingLeft:32,maxWidth:240,padding:'7px 12px 7px 30px'}} placeholder="Search leads..."
            value={filters.search} onChange={e=>setFilters(f=>({...f,search:e.target.value,page:1}))}/>
        </div>
      </div>

      <div className="card" style={{padding:0}}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Business</th><th>Score</th><th>Contact</th><th>Rating</th><th>AI Summary</th><th>Services</th><th></th></tr></thead>
            <tbody>
              {loading
                ? Array.from({length:8}).map((_,i)=><tr key={i}><td colSpan={7}><div className="skeleton" style={{height:36,borderRadius:6}}/></td></tr>)
                : !leads.length
                  ? <tr><td colSpan={7} style={{textAlign:'center',padding:'50px',color:'var(--text3)'}}><Users size={36} style={{marginBottom:12}}/><div>No leads found</div></td></tr>
                  : leads.map(lead => (
                      <tr key={lead._id} style={{cursor:'pointer'}} onClick={()=>navigate(`/leads/${lead._id}`)}>
                        <td>
                          <div style={{fontWeight:600,fontSize:13}}>{lead.businessName}</div>
                          {lead.category && <div style={{fontSize:11,color:'var(--text3)'}}>{lead.category}</div>}
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
                          {lead.rating>0
                            ? <div><div style={{display:'flex',alignItems:'center',gap:4}}><Star size={11} color="var(--yellow)" fill="var(--yellow)"/><span style={{fontFamily:'var(--font-mono)',fontWeight:600,fontSize:12}}>{lead.rating}</span></div><div style={{fontSize:11,color:'var(--text3)'}}>{lead.reviewCount} reviews</div></div>
                            : <span style={{color:'var(--text3)'}}>—</span>}
                        </td>
                        <td style={{maxWidth:220}}>
                          {lead.aiSummary ? <div style={{fontSize:12,color:'var(--text2)',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{lead.aiSummary}</div>
                            : <span style={{fontSize:11,color:'var(--text3)'}}>—</span>}
                        </td>
                        <td>
                          {lead.keyServices?.slice(0,2).map((s,i)=>(
                            <span key={i} style={{display:'inline-block',background:'var(--surface2)',borderRadius:4,padding:'2px 7px',fontSize:10,color:'var(--text3)',marginRight:4}}>{s}</span>
                          ))}
                        </td>
                        <td>
                          <div style={{display:'flex',gap:6}}>
                            {lead.website && <a href={lead.website} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} className="btn btn-ghost btn-sm"><ExternalLink size={12}/></a>}
                            <button className="btn btn-danger btn-sm" onClick={e=>handleDelete(lead._id,e)}><Trash2 size={12}/></button>
                          </div>
                        </td>
                      </tr>
                    ))
              }
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div style={{display:'flex',justifyContent:'center',gap:8,padding:'16px',borderTop:'1px solid var(--border)'}}>
            {Array.from({length:pagination.pages},(_,i)=>i+1).map(p=>(
              <button key={p} className={`btn btn-sm ${filters.page===p?'btn-primary':'btn-secondary'}`} onClick={()=>setFilters(f=>({...f,page:p}))}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
