import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLead } from '../services/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Globe, Phone, Mail, Star, Copy, ExternalLink, CheckCircle, Brain, Target, Zap } from 'lucide-react'

const InfoRow = ({ label, value, mono }) => value ? (
  <div style={{display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
    <div style={{width:150,flexShrink:0,fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text3)',letterSpacing:'0.06em',textTransform:'uppercase',paddingTop:1}}>{label}</div>
    <div style={{fontFamily:mono?'var(--font-mono)':'var(--font-body)',fontSize:13,color:'var(--text)',flex:1}}>{value}</div>
  </div>
) : null

const ScoreBar = ({ label, value, max=25 }) => (
  <div style={{marginBottom:10}}>
    <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
      <span style={{fontSize:12,color:'var(--text2)'}}>{label}</span>
      <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--accent)'}}>{value}/{max}</span>
    </div>
    <div className="progress-bar"><div className="progress-fill" style={{width:`${(value/max)*100}%`}}/></div>
  </div>
)

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState('')

  useEffect(() => { getLead(id).then(r=>{setLead(r.data);setLoading(false)}).catch(()=>setLoading(false)) }, [id])

  const copy = (text, key) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(()=>setCopied(''),2000); toast.success('Copied!') }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:60}}><span className="animate-spin" style={{width:24,height:24,border:'2px solid var(--border)',borderTopColor:'var(--accent)',borderRadius:'50%',display:'block'}}/></div>
  if (!lead) return <div style={{color:'var(--text3)',padding:40,textAlign:'center'}}>Lead not found</div>

  const scoreColor = { High:'var(--green)', Medium:'var(--yellow)', Low:'var(--red)', Unscored:'var(--text3)' }
  const allEmails = [...(lead.email?[lead.email]:[]), ...(lead.emailGuesses||[])].filter((v,i,a)=>a.indexOf(v)===i)

  return (
    <div className="animate-fade" style={{maxWidth:900}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'flex-start',gap:14,marginBottom:24}}>
        <button className="btn btn-ghost btn-sm" onClick={()=>navigate(-1)} style={{marginTop:4}}><ArrowLeft size={15}/></button>
        <div style={{flex:1}}>
          <h1 style={{fontFamily:'var(--font-display)',fontSize:26,fontWeight:800,letterSpacing:'-0.03em'}}>{lead.businessName}</h1>
          {lead.category && <div style={{color:'var(--text3)',fontSize:13,marginTop:4}}>{lead.category}</div>}
        </div>
        <div style={{textAlign:'center',background:`${scoreColor[lead.score]}18`,border:`1px solid ${scoreColor[lead.score]}35`,borderRadius:12,padding:'12px 20px'}}>
          <div style={{fontFamily:'var(--font-display)',fontSize:32,fontWeight:800,color:scoreColor[lead.score],lineHeight:1}}>{lead.scoreValue||'—'}</div>
          <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:scoreColor[lead.score],letterSpacing:'0.08em',marginTop:3}}>{lead.score?.toUpperCase()} LEAD</div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:16}}>
        {/* Left */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>

          {/* Contact */}
          <div className="card">
            <div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:14,marginBottom:6,display:'flex',alignItems:'center',gap:8}}><Phone size={15} color="var(--accent)"/> Contact Information</div>
            <InfoRow label="Address" value={lead.address}/>
            <InfoRow label="Phone"   value={lead.phone} mono/>
            {lead.website && (
              <div style={{display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)',alignItems:'center'}}>
                <div style={{width:150,fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.06em'}}>WEBSITE</div>
                <a href={lead.website} target="_blank" rel="noreferrer" style={{color:'var(--accent)',fontSize:13,display:'flex',alignItems:'center',gap:6}}>{lead.website} <ExternalLink size={11}/></a>
              </div>
            )}
            {lead.rating>0 && (
              <div style={{display:'flex',gap:12,padding:'10px 0',alignItems:'center'}}>
                <div style={{width:150,fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.06em'}}>RATING</div>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <Star size={13} color="var(--yellow)" fill="var(--yellow)"/>
                  <span style={{fontFamily:'var(--font-mono)',fontWeight:600}}>{lead.rating}</span>
                  <span style={{color:'var(--text3)',fontSize:12}}>({lead.reviewCount} reviews)</span>
                </div>
              </div>
            )}
          </div>

          {/* Emails */}
          {allEmails.length>0 && (
            <div className="card">
              <div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:14,marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
                <Mail size={15} color="var(--green)"/> Email Addresses
                <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--text3)',marginLeft:4}}>(AI-guessed formats)</span>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {allEmails.map((email,i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:i===0&&lead.email?'rgba(0,229,160,0.08)':'var(--bg2)',border:`1px solid ${i===0&&lead.email?'rgba(0,229,160,0.2)':'var(--border)'}`,borderRadius:8,padding:'8px 14px'}}>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:13}}>{email}</span>
                    <button className="btn btn-ghost btn-sm" onClick={()=>copy(email,email)}>
                      {copied===email ? <CheckCircle size={13} color="var(--green)"/> : <Copy size={13}/>}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Summary */}
          {lead.aiSummary && (
            <div className="card" style={{background:'linear-gradient(135deg,rgba(0,212,255,0.05),rgba(180,124,255,0.05))'}}>
              <div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:14,marginBottom:12,display:'flex',alignItems:'center',gap:8}}><Brain size={15} color="var(--purple)"/> AI Business Summary</div>
              <p style={{fontSize:14,lineHeight:1.7}}>{lead.aiSummary}</p>
            </div>
          )}

          {/* Key services */}
          {lead.keyServices?.length>0 && (
            <div className="card">
              <div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:14,marginBottom:14,display:'flex',alignItems:'center',gap:8}}><Zap size={15} color="var(--yellow)"/> Key Services</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {lead.keyServices.map((s,i)=>(
                  <span key={i} style={{background:'var(--surface2)',border:'1px solid var(--border2)',borderRadius:6,padding:'5px 12px',fontSize:12,color:'var(--text2)'}}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* AI Insights */}
          {lead.aiInsights && Object.keys(lead.aiInsights).length>0 && (
            <div className="card">
              <div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:14,marginBottom:14,display:'flex',alignItems:'center',gap:8}}><Target size={15} color="var(--accent)"/> AI Insights</div>
              {Object.entries(lead.aiInsights).map(([k,v])=>v&&<InfoRow key={k} label={k.replace(/([A-Z])/g,' $1').trim()} value={v}/>)}
            </div>
          )}
        </div>

        {/* Right */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {/* Score breakdown */}
          {lead.scoreValue>0 && (
            <div className="card">
              <div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:14,marginBottom:16}}>Score Breakdown</div>
              <ScoreBar label="Website Quality"    value={lead.scoreBreakdown?.websiteQuality||0}/>
              <ScoreBar label="Keyword Match"      value={lead.scoreBreakdown?.keywordMatch||0}/>
              <ScoreBar label="Review Score"       value={lead.scoreBreakdown?.reviewScore||0}/>
              <ScoreBar label="Contact Completeness" value={lead.scoreBreakdown?.contactCompleteness||0}/>
              <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text3)'}}>TOTAL</span>
                <span style={{fontFamily:'var(--font-display)',fontSize:20,fontWeight:800,color:scoreColor[lead.score]}}>{lead.scoreValue}/100</span>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="card">
            <div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:14,marginBottom:14}}>Lead Status</div>
            {[
              {label:'Scraping',    done:true},
              {label:'AI Enriched', done:lead.enriched},
              {label:'Scored',      done:lead.score!=='Unscored'},
            ].map(s=>(
              <div key={s.label} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <CheckCircle size={16} color={s.done?'var(--green)':'var(--text3)'}/>
                <span style={{fontSize:13,color:s.done?'var(--text)':'var(--text3)'}}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Categories */}
          {lead.aiCategories?.length>0 && (
            <div className="card">
              <div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:14,marginBottom:12}}>Categories</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {lead.aiCategories.map((c,i)=>(
                  <span key={i} style={{background:'rgba(180,124,255,0.12)',border:'1px solid rgba(180,124,255,0.25)',borderRadius:20,padding:'3px 10px',fontSize:11,color:'var(--purple)',fontFamily:'var(--font-mono)'}}>{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
