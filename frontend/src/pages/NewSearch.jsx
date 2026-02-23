import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startSearch } from '../services/api'
import toast from 'react-hot-toast'
import { Search, MapPin, Tag, Settings, Zap, ChevronDown, ChevronUp } from 'lucide-react'

const examples = [
  { query:'Dentists',               location:'Chicago, IL' },
  { query:'Personal Injury Lawyers',location:'New York, NY' },
  { query:'HVAC Companies',         location:'Austin, TX' },
  { query:'Real Estate Agents',     location:'Miami, FL' },
  { query:'Plumbers',               location:'Los Angeles, CA' },
  { query:'Accountants',            location:'Dallas, TX' },
]

export default function NewSearch() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ query:'', location:'', name:'', targetKeywords:'', maxResults:20, enableAIEnrichment:true, enableLeadScoring:true })
  const [loading, setLoading] = useState(false)
  const [showAdv, setShowAdv] = useState(false)

  const set = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type==='checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.query.trim() || !form.location.trim()) { toast.error('Query and location are required'); return }
    setLoading(true)
    try {
      const res = await startSearch({
        query: form.query.trim(),
        location: form.location.trim(),
        name: form.name.trim() || `${form.query} in ${form.location}`,
        targetKeywords: form.targetKeywords.split(',').map(k=>k.trim()).filter(Boolean),
        settings: { maxResults:+form.maxResults, enableAIEnrichment:form.enableAIEnrichment, enableLeadScoring:form.enableLeadScoring }
      })
      toast.success('Campaign started!')
      navigate(`/campaigns/${res.data.campaign._id}`)
    } catch(err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="animate-fade" style={{ maxWidth:700 }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, letterSpacing:'-0.03em' }}>New Lead Search</h1>
        <p style={{ color:'var(--text2)', marginTop:4, fontSize:14 }}>Define your target market and let the AI engine do the rest.</p>
      </div>

      {/* Quick examples */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text3)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>Quick Examples</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {examples.map((ex,i) => (
            <button key={i} className="btn btn-secondary btn-sm" onClick={() => setForm(f=>({...f, query:ex.query, location:ex.location}))}>
              {ex.query} · {ex.location}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom:16 }}>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
            <Search size={16} color="var(--accent)" /> Search Parameters
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            <div>
              <label className="input-label"><Search size={11} style={{display:'inline',marginRight:4}}/>Business Type *</label>
              <input className="input" name="query" value={form.query} onChange={set} placeholder="e.g. Dentists, Lawyers..." required />
            </div>
            <div>
              <label className="input-label"><MapPin size={11} style={{display:'inline',marginRight:4}}/>Location *</label>
              <input className="input" name="location" value={form.location} onChange={set} placeholder="e.g. Chicago, IL" required />
            </div>
          </div>
          <div>
            <label className="input-label"><Tag size={11} style={{display:'inline',marginRight:4}}/>Campaign Name (optional)</label>
            <input className="input" name="name" value={form.name} onChange={set} placeholder="Auto-generated if blank" />
          </div>
        </div>

        {/* Advanced */}
        <div className="card" style={{ marginBottom:20 }}>
          <button type="button" className="btn btn-ghost" onClick={() => setShowAdv(!showAdv)}
            style={{ width:'100%', justifyContent:'space-between', padding:0, fontFamily:'var(--font-display)', fontWeight:700, fontSize:14 }}>
            <span style={{ display:'flex', alignItems:'center', gap:8 }}><Settings size={16} color="var(--text3)"/>Advanced Settings</span>
            {showAdv ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
          </button>
          {showAdv && (
            <div style={{ marginTop:20 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div>
                  <label className="input-label">Max Results</label>
                  <select className="input" name="maxResults" value={form.maxResults} onChange={set}>
                    <option value={10}>10 businesses</option>
                    <option value={20}>20 businesses</option>
                    <option value={30}>30 businesses</option>
                    <option value={50}>50 businesses</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Target Keywords</label>
                  <input className="input" name="targetKeywords" value={form.targetKeywords} onChange={set} placeholder="cosmetic, emergency, 24hr..." />
                </div>
              </div>
              <div style={{ display:'flex', gap:24 }}>
                {[
                  { name:'enableAIEnrichment', label:'AI Website Enrichment', desc:'Scrape & summarize business websites' },
                  { name:'enableLeadScoring',  label:'Lead Scoring',          desc:'AI-powered High/Medium/Low rating' },
                ].map(opt => (
                  <label key={opt.name} style={{ display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer', flex:1 }}>
                    <input type="checkbox" name={opt.name} checked={form[opt.name]} onChange={set} style={{ marginTop:3, accentColor:'var(--accent)', width:15, height:15 }} />
                    <div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{opt.label}</div>
                      <div style={{ fontSize:12, color:'var(--text3)' }}>{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width:'100%', justifyContent:'center' }}>
          {loading
            ? <><span className="animate-spin" style={{ display:'inline-block', width:16, height:16, border:'2px solid rgba(0,0,0,0.3)', borderTopColor:'var(--bg)', borderRadius:'50%' }}/>Starting...</>
            : <><Zap size={17} fill="currentColor"/>Start Mining Leads</>
          }
        </button>
      </form>

      <div style={{ marginTop:20, padding:'14px 18px', background:'rgba(0,212,255,0.05)', border:'1px solid rgba(0,212,255,0.12)', borderRadius:'var(--radius)' }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--accent)', letterSpacing:'0.06em', marginBottom:6 }}>⚡ HOW IT WORKS</div>
        <div style={{ fontSize:12, color:'var(--text3)', lineHeight:1.7 }}>
          1. Stealth scraper collects businesses from Google Maps · 2. AI visits each website and extracts insights · 3. Lead scoring rates each prospect · 4. Export qualified leads as CSV
        </div>
      </div>
    </div>
  )
}
