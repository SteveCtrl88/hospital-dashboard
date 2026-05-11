'use client'
// @ts-nocheck
import { useState, useEffect, useMemo, CSSProperties, useCallback } from 'react'
import { getDb, getFirebaseAuth } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { MARKET_TIERS, BED_SIZE_ROBOTS, KEY_ASSUMPTIONS, ROBOT_FORMULA, calcRobots, NEAR_TERM, PROFILED_HOSPITALS, ROBOTS_PER_BED, REVENUE_MODEL, DEPLOYMENT_RAMP, RAMP_TOTAL } from '@/lib/thesisData'
import { useRouter } from 'next/navigation'
import { ref, get } from 'firebase/database'
import type { Hospital, IDNGroup, IDNHospital } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Search, Building2, BedDouble, TrendingUp, Database, RefreshCw, X, ChevronDown, ChevronUp, MapPin, Sun, Moon, Info } from 'lucide-react'
import Image from 'next/image'

// ── colour helpers ─────────────────────────────────────────────────────────────
const bedColour = (b:number|null) => !b?'#4a5a72':b>=1000?'#ef4444':b>=500?'#f97316':b>=300?'#eab308':b>=100?'#10b981':'#14b8a6'
const ownerColour = (t:string) => t==='For-Profit'?'#f59e0b':t==='Non-Profit'?'#10b981':t==='Government'?'#6366f1':'#4a5a72'
const campusColour = (t:string|null) => {
  if (!t) return '#4a5a72'
  if (t === 'Multi-Site Licensed') return '#ef4444'
  if (t === 'Multi-Building Campus') return '#f97316'
  if (t === 'Multi-Tower') return '#eab308'
  return '#10b981' // Single Building
}
const campusIcon = (t:string|null) => {
  if (!t) return '—'
  if (t === 'Multi-Site Licensed') return '🔴 Multi-Site'
  if (t === 'Multi-Building Campus') return '🟠 Multi-Bldg'
  if (t === 'Multi-Tower') return '🟡 Multi-Tower'
  return '🟢 Single'
}
const BED_CATS = [
  {label:'<100',min:0,max:99,fill:'#14b8a6'},{label:'100–199',min:100,max:199,fill:'#10b981'},
  {label:'200–299',min:200,max:299,fill:'#eab308'},{label:'300–399',min:300,max:399,fill:'#f97316'},
  {label:'400–499',min:400,max:499,fill:'#ef4444'},{label:'500–799',min:500,max:799,fill:'#dc2626'},
  {label:'800+',min:800,max:99999,fill:'#991b1b'},
]

// ── style factory ──────────────────────────────────────────────────────────────
const C: Record<string,(a?:boolean)=>CSSProperties> = {
  card: () => ({ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12 }),
  cardHead: () => ({ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }),
  cardTitle: () => ({ fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' as const, color:'var(--text3)' }),
  th: () => ({ padding:'10px 14px', fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' as const, color:'var(--text3)', background:'var(--surface2)', textAlign:'left' as const, borderBottom:'1px solid var(--border)' }),
  td: () => ({ padding:'11px 14px', borderBottom:'1px solid var(--border)', verticalAlign:'middle' as const }),
  tab: (active?:boolean) => ({ display:'flex', alignItems:'center', gap:7, padding:'12px 16px', fontSize:13, fontWeight:600, color:active?'var(--accent2)':'var(--text2)', background:'none', border:'none', borderBottom:`2px solid ${active?'var(--accent)':'transparent'}`, cursor:'pointer', whiteSpace:'nowrap' as const, outline:'none', transition:'all 0.15s' }),
  pageBtn: (disabled?:boolean) => ({ padding:'6px 14px', borderRadius:7, fontSize:12, fontWeight:600, background:disabled?'transparent':'var(--border)', color:disabled?'var(--text3)':'var(--text)', border:'1px solid var(--border)', cursor:disabled?'default':'pointer', opacity:disabled?0.4:1, outline:'none' }),
  select: () => ({ background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text)', borderRadius:8, padding:'8px 12px', fontSize:13, outline:'none', cursor:'pointer' }),
  input: () => ({ width:'100%', paddingLeft:34, paddingRight:10, paddingTop:8, paddingBottom:8, background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text)', borderRadius:8, fontSize:13, outline:'none' }),
}

// ── mini components ────────────────────────────────────────────────────────────
function StatCard({label,value,sub,colour,delay=0}:{label:string;value:string;sub:string;colour:string;delay?:number}){
  return (
    <div className="fade-up" style={{...C.card(), padding:'18px 20px', animationDelay:`${delay}ms`}}>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text3)',marginBottom:8}}>{label}</div>
      <div style={{fontSize:30,fontWeight:900,letterSpacing:'-0.02em',color:colour,lineHeight:1,marginBottom:4}}>{value}</div>
      <div style={{fontSize:11,color:'var(--text2)'}}>{sub}</div>
    </div>
  )
}
function Badge({text,colour}:{text:string;colour:string}){
  return <span className="badge" style={{background:colour+'20',color:colour,border:`1px solid ${colour}44`}}>{text}</span>
}
function BedBar({beds,max=3000}:{beds:number;max?:number}){
  const c=bedColour(beds), pct=Math.min((beds/max)*100,100)
  return (
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      <div style={{width:56,height:4,borderRadius:2,background:'var(--border)',overflow:'hidden',flexShrink:0}}>
        <div style={{width:`${pct}%`,height:'100%',background:c,borderRadius:2}}/>
      </div>
      <span style={{fontFamily:'monospace',fontSize:12,fontWeight:700,color:c}}>{beds.toLocaleString()}</span>
    </div>
  )
}
function TTip({active,payload,label}:{active?:boolean;payload?:{value:number}[];label?:string}){
  if(!active||!payload?.length)return null
  return <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 14px',fontSize:12}}><div style={{color:'var(--text2)',marginBottom:3}}>{label}</div><div style={{color:'var(--text)',fontWeight:700}}>{payload[0].value.toLocaleString()}</div></div>
}
function SeederPanel({onDone}:{onDone:()=>void}){
  const [status,setStatus]=useState<'idle'|'seeding'|'done'|'error'>('idle')
  const [msg,setMsg]=useState('')
  async function seed(){
    setStatus('seeding');setMsg('')
    try{
      const res=await fetch('/api/seed',{method:'POST'})
      const data=await res.json()
      if(data.success){
        setStatus('done')
        const c=data.counts
        setMsg(`✓ ${c.hospitals.toLocaleString()} hospitals · ${c.verified_large} verified large · ${c.from_cms} from CMS`)
        setTimeout(onDone,2000)
      }else{setStatus('error');setMsg(data.error)}
    }catch(e){setStatus('error');setMsg(String(e))}
  }
  return (
    <div style={{background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:12,padding:'14px 20px',marginBottom:20,display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
      <Database size={16} style={{color:'#f59e0b',flexShrink:0}}/>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:700,color:'#fbbf24',marginBottom:2}}>Database setup required</div>
        <div style={{fontSize:12,color:'var(--text2)'}}>Seeds Firebase with Definitive Health + CMS data + verified large hospital bed counts.</div>
        {msg&&<div style={{fontSize:11,marginTop:4,fontFamily:'monospace',color:status==='error'?'var(--red)':'var(--green)'}}>{msg}</div>}
      </div>
      <button onClick={seed} disabled={status==='seeding'} style={{padding:'8px 18px',borderRadius:8,background:'#d97706',color:'#fff',fontWeight:700,fontSize:13,border:'none',cursor:'pointer',opacity:status==='seeding'?0.6:1}}>
        {status==='seeding'?'Seeding…':'Seed Database'}
      </button>
    </div>
  )
}

// ── IDN Deep Dive (reusable for any IDN) ──────────────────────────────────────
function IDNDeepDive({group,hospitals}:{group:IDNGroup;hospitals:Hospital[]}){
  const byState = useMemo(()=>{
    const map:Record<string,Hospital[]>={}
    hospitals.forEach(h=>{if(!map[h.state])map[h.state]=[];map[h.state].push(h)})
    return Object.entries(map).sort((a,b)=>b[1].length-a[1].length)
  },[hospitals])

  const chartData = hospitals.filter(h=>h.beds&&h.beds>50)
    .sort((a,b)=>(b.beds??0)-(a.beds??0)).slice(0,20)
    .map(h=>({name:h.name.replace(group.name,'').replace(/^[\s,\-–]+/,'').slice(0,24)||h.name.slice(0,24),beds:h.beds??0,fill:bedColour(h.beds)}))

  const above500=hospitals.filter(h=>(h.beds??0)>=500).length
  const maxBeds=Math.max(...hospitals.map(h=>h.beds??0),0)
  const totalBeds=hospitals.reduce((a,h)=>a+(h.beds??0),0)
  const rankColour = group.rank<=3?'#d97706':group.rank<=10?'var(--accent)':'var(--text3)'

  return (
    <div style={{borderTop:'1px solid var(--border)',background:'var(--bg2)',padding:'20px'}}>
      {/* Hero */}
      <div style={{background:`linear-gradient(135deg, ${rankColour}18, ${rankColour}08)`,border:`1px solid ${rankColour}30`,borderRadius:12,padding:'20px 24px',marginBottom:20,display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:rankColour,marginBottom:4}}>Rank #{group.rank} IDN · {group.ownership_type}</div>
          <div style={{fontSize:22,fontWeight:900,letterSpacing:'-0.01em',marginBottom:4}}>{group.name}</div>
          <div style={{fontSize:12,color:'var(--text2)'}}>{group.hq_city}, {group.hq_state} · {group.states_covered} states</div>
        </div>
        <div style={{display:'flex',gap:28,flexWrap:'wrap'}}>
          {[
            [group.total_hospitals,'Total Hospitals'],
            [group.total_beds.toLocaleString(),'Network Beds'],
            [above500,'Sites 500+ Beds'],
            ...(group.net_patient_revenue_b?[[`$${group.net_patient_revenue_b}B`,'Annual Revenue']]:[] as [string|number,string][]),
          ].map(([v,l])=>(
            <div key={String(l)} style={{textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:900,color:rankColour,lineHeight:1}}>{v}</div>
              <div style={{fontSize:10,color:'var(--text3)',marginTop:3,textTransform:'uppercase',letterSpacing:'0.05em'}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:20}}>
        <StatCard label="In Database" value={hospitals.length.toString()} sub="Tracked hospitals" colour="var(--accent2)"/>
        <StatCard label="Largest Site" value={maxBeds>0?maxBeds.toLocaleString():'—'} sub="Beds (flagship building)" colour="var(--red)"/>
        <StatCard label="500+ Bed Sites" value={above500.toString()} sub="Large hospitals" colour="var(--orange)"/>
        <StatCard label="Total Tracked Beds" value={totalBeds>0?totalBeds.toLocaleString():'—'} sub="Sum of known bed counts" colour="var(--green)"/>
      </div>

      {/* Bar chart */}
      {chartData.length>0&&(
        <div style={{...C.card(),marginBottom:20}}>
          <div style={C.cardHead()}><span style={C.cardTitle()}>Bed Capacity by Hospital (top 20 with data)</span></div>
          <div style={{padding:'16px 12px 8px'}}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{top:4,right:8,bottom:70,left:-10}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                <XAxis dataKey="name" tick={{fontSize:9,fill:'var(--text2)'}} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:9,fill:'var(--text3)'}} axisLine={false} tickLine={false}/>
                <Tooltip formatter={(v:unknown)=>[`${(v as number).toLocaleString()} beds`,'']} contentStyle={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:8,fontSize:12}} labelStyle={{color:'var(--text2)'}} itemStyle={{color:'var(--text)'}}/>
                <Bar dataKey="beds" radius={[4,4,0,0]}>{chartData.map((_,i)=><Cell key={i} fill={chartData[i].fill}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* By state */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12}}>
        {byState.map(([state,hs])=>(
          <div key={state} style={C.card()}>
            <div style={C.cardHead()}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:28,height:28,borderRadius:6,background:`${rankColour}20`,border:`1px solid ${rankColour}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:rankColour,flexShrink:0}}>{state}</div>
                <span style={{...C.cardTitle(),letterSpacing:'0.06em'}}>{state}</span>
              </div>
              <span style={{fontSize:11,background:`${rankColour}15`,color:rankColour,padding:'2px 8px',borderRadius:999,fontWeight:700}}>{hs.length} site{hs.length>1?'s':''}</span>
            </div>
            <div style={{padding:'10px 14px'}}>
              {hs.sort((a,b)=>(b.beds??0)-(a.beds??0)).map((h,i)=>(
                <div key={h.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:i<hs.length-1?'1px solid var(--border)':'none'}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:'var(--text)',lineHeight:1.3}}>{h.name.replace(group.name+' ','')}</div>
                    <div style={{fontSize:11,color:'var(--text3)'}}>{h.city}</div>
                  </div>
                  {h.beds?<span style={{fontFamily:'monospace',fontSize:12,fontWeight:700,color:bedColour(h.beds),flexShrink:0,marginLeft:12}}>{h.beds.toLocaleString()}</span>:<span style={{fontSize:11,color:'var(--text3)'}}>—</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Hospitals Tab ──────────────────────────────────────────────────────────────
function HospitalsTab({hospitals}:{hospitals:Hospital[]}){
  const [search,setSearch]=useState('')
  const [stateF,setStateF]=useState('ALL')
  const [ownerF,setOwnerF]=useState('ALL')
  const [minBeds,setMinBeds]=useState(0)
  const [campusF,setCampusF]=useState('ALL')
  const [sort,setSort]=useState<'beds_desc'|'beds_asc'|'name'|'state'>('beds_desc')
  const [page,setPage]=useState(0)
  const PG=50

  const states=useMemo(()=>['ALL',...Array.from(new Set(hospitals.map(h=>h.state))).sort()],[hospitals])
  const owners=useMemo(()=>['ALL',...Array.from(new Set(hospitals.map(h=>h.ownership).filter((x):x is string=>Boolean(x)))).sort()],[hospitals])

  const filtered=useMemo(()=>{
    let h=hospitals.filter(h=>
      (!search||h.name.toLowerCase().includes(search.toLowerCase())||h.city.toLowerCase().includes(search.toLowerCase()))
      &&(stateF==='ALL'||h.state===stateF)
      &&(ownerF==='ALL'||h.ownership===ownerF)
      &&(!minBeds||(h.beds!==null&&h.beds>=minBeds))
      &&(campusF==='ALL'||h.campus_type===campusF||(campusF==='profiled'&&h.campus_type!==null))
    )
    h.sort((a,b)=>sort==='beds_desc'?(b.beds??0)-(a.beds??0):sort==='beds_asc'?(a.beds??0)-(b.beds??0):sort==='name'?a.name.localeCompare(b.name):a.state.localeCompare(b.state))
    return h
  },[hospitals,search,stateF,ownerF,minBeds,sort])

  const paged=filtered.slice(page*PG,(page+1)*PG)
  const totalPages=Math.ceil(filtered.length/PG)
  const distData=BED_CATS.map(c=>({...c,count:hospitals.filter(h=>h.beds!==null&&h.beds>=c.min&&h.beds<=c.max).length}))

  return (
    <div className="fade-up">
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14,marginBottom:20}}>
        <StatCard label="Hospitals in Database" value={hospitals.length.toLocaleString()} sub={`of ~6,093 US registered hospitals (AHA 2024)`} colour="var(--accent2)" delay={0}/>
        <StatCard label="With Bed Data" value={hospitals.filter(h=>h.beds).length.toLocaleString()} sub={`${Math.round(hospitals.filter(h=>h.beds).length/6093*100)}% coverage · AHA total ~917,000 beds`} colour="var(--green)" delay={60}/>
        <StatCard label="> 500 Beds" value={hospitals.filter(h=>(h.beds??0)>=500).length.toLocaleString()} sub="Verified large medical centers" colour="var(--orange)" delay={120}/>
        <StatCard label="Est. Deployments" value={hospitals.filter(h=>h.campus_type).reduce((a,h)=>a+(h.estimated_deployments??1),0).toLocaleString()} sub="Autonomi fleet units (profiled)" colour="#8b5cf6" delay={180}/>
      </div>

      <div style={{...C.card(),marginBottom:20}} className="fade-up-1">
        <div style={C.cardHead()}><span style={C.cardTitle()}>Distribution by Bed Size</span><span style={{fontSize:11,color:'var(--text3)'}}>{hospitals.filter(h=>h.beds).length.toLocaleString()} with verified bed data · AHA 2024: ~917K total US staffed beds</span></div>
        <div style={{padding:'16px 16px 8px'}}>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={distData} margin={{top:4,right:4,bottom:0,left:-10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="label" tick={{fontSize:11,fill:'var(--text2)'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:'var(--text3)'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<TTip/>} cursor={{fill:'rgba(255,255,255,0.03)'}}/>
              <Bar dataKey="count" radius={[5,5,0,0]}>{distData.map((_,i)=><Cell key={i} fill={distData[i].fill}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:14,alignItems:'center'}}>
        <div style={{position:'relative',flex:1,minWidth:200}}>
          <Search size={14} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text3)',pointerEvents:'none'}}/>
          <input style={C.input()} placeholder="Search hospitals or cities…" value={search} onChange={e=>{setSearch(e.target.value);setPage(0)}}/>
          {search&&<button onClick={()=>setSearch('')} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text3)',padding:0,display:'flex'}}><X size={13}/></button>}
        </div>
        <select style={C.select()} value={stateF} onChange={e=>{setStateF(e.target.value);setPage(0)}}>{states.map(s=><option key={s} value={s}>{s==='ALL'?'All States':s}</option>)}</select>
        <select style={C.select()} value={ownerF} onChange={e=>{setOwnerF(e.target.value);setPage(0)}}>{owners.map(t=><option key={t} value={t}>{t==='ALL'?'All Ownership':t}</option>)}</select>
        <select style={C.select()} value={minBeds} onChange={e=>{setMinBeds(Number(e.target.value));setPage(0)}}>
          <option value={0}>All Sizes</option><option value={100}>100+ beds</option><option value={200}>200+ beds</option>
          <option value={300}>300+ beds</option><option value={500}>500+ beds</option><option value={800}>800+ beds</option><option value={1000}>1000+ beds</option>
        </select>
        <select style={C.select()} value={campusF} onChange={e=>{setCampusF(e.target.value);setPage(0)}}>
          <option value="ALL">All Campus Types</option>
          <option value="profiled">Profiled Only</option>
          <option value="Multi-Site Licensed">🔴 Multi-Site Licensed</option>
          <option value="Multi-Building Campus">🟠 Multi-Building</option>
          <option value="Multi-Tower">🟡 Multi-Tower</option>
          <option value="Single Building">🟢 Single Building</option>
        </select>
        <select style={C.select()} value={sort} onChange={e=>setSort(e.target.value as typeof sort)}>
          <option value="beds_desc">Beds ↓</option><option value="beds_asc">Beds ↑</option><option value="name">Name A–Z</option><option value="state">State A–Z</option>
        </select>
        <span style={{fontSize:12,color:'var(--text3)',whiteSpace:'nowrap'}}>{filtered.length.toLocaleString()} results</span>
      </div>

      <div style={{...C.card(),overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead>
              <tr>{['#','Hospital','Location','Beds','Campus Type','Deployments','Network','Ownership'].map(h=><th key={h} style={C.th()}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {paged.map((h,i)=>(
                <tr key={h.id} style={{background:i%2===0?'transparent':'rgba(255,255,255,0.015)'}}
                  onMouseEnter={e=>(e.currentTarget.style.background='rgba(59,130,246,0.05)')}
                  onMouseLeave={e=>(e.currentTarget.style.background=i%2===0?'transparent':'rgba(255,255,255,0.015)')}>
                  <td style={{...C.td(),color:'var(--text3)',fontFamily:'monospace',fontSize:11,width:40}}>{page*PG+i+1}</td>
                  <td style={C.td()}>
                    <div style={{fontWeight:700,color:'var(--text)',lineHeight:1.3}}>{h.name}</div>
                    {h.type&&<div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>{h.type}</div>}
                  </td>
                  <td style={{...C.td(),whiteSpace:'nowrap'}}><div style={{fontSize:13,color:'var(--text2)'}}>{h.city}</div><div style={{fontSize:11,fontWeight:700,color:'var(--text3)'}}>{h.state}</div></td>
                  <td style={{...C.td(),whiteSpace:'nowrap'}}>{h.beds?<BedBar beds={h.beds}/>:<span style={{color:'var(--text3)',fontSize:11}}>—</span>}</td>
                  <td style={C.td()}>
                    {h.campus_type ? (
                      <div>
                        <span style={{fontSize:11,color:campusColour(h.campus_type),background:campusColour(h.campus_type)+'18',padding:'2px 7px',borderRadius:4,fontWeight:700,whiteSpace:'nowrap',border:`1px solid ${campusColour(h.campus_type)}33`}}>
                          {h.campus_type === 'Multi-Site Licensed' ? 'Multi-Site' : h.campus_type === 'Multi-Building Campus' ? 'Multi-Bldg' : h.campus_type === 'Multi-Tower' ? 'Multi-Tower' : 'Single'}
                        </span>
                        {h.building_count && <div style={{fontSize:10,color:'var(--text3)',marginTop:2}}>{h.building_count} buildings</div>}
                      </div>
                    ) : <span style={{color:'var(--text3)',fontSize:11}}>—</span>}
                  </td>
                  <td style={{...C.td(),textAlign:'center' as const}}>
                    {h.estimated_deployments ? (
                      <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:28,height:28,borderRadius:'50%',background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)',fontSize:13,fontWeight:800,color:'#8b5cf6'}}>
                        {h.estimated_deployments}
                      </div>
                    ) : <span style={{color:'var(--text3)',fontSize:11}}>1</span>}
                  </td>
                  <td style={C.td()}>{h.idn_name?<span style={{fontSize:11,background:'rgba(59,130,246,0.1)',color:'var(--accent2)',padding:'2px 7px',borderRadius:4,border:'1px solid rgba(59,130,246,0.2)',whiteSpace:'nowrap'}}>{h.idn_name}</span>:<span style={{color:'var(--text3)',fontSize:11}}>Independent</span>}</td>
                  <td style={C.td()}>{h.ownership&&<Badge text={h.ownership} colour={ownerColour(h.ownership)}/>}</td>
                </tr>
              ))}
              {paged.length===0&&<tr><td colSpan={8} style={{padding:'40px',textAlign:'center',color:'var(--text3)'}}>No hospitals match these filters</td></tr>}
            </tbody>
          </table>
        </div>
        {totalPages>1&&(
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',borderTop:'1px solid var(--border)',background:'var(--surface2)',borderRadius:'0 0 12px 12px'}}>
            <button style={C.pageBtn(page===0)} disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))}>← Prev</button>
            <span style={{fontSize:12,color:'var(--text2)'}}>Page <strong style={{color:'var(--text)'}}>{page+1}</strong> of {totalPages} · {filtered.length.toLocaleString()} hospitals</span>
            <button style={C.pageBtn(page===totalPages-1)} disabled={page===totalPages-1} onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))}>Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── IDN Tab ────────────────────────────────────────────────────────────────────
function IDNTab({groups,idnHospitals,allHospitals}:{groups:IDNGroup[];idnHospitals:IDNHospital[];allHospitals:Hospital[]}){
  const [expanded,setExpanded]=useState<string|null>(null)
  const [search,setSearch]=useState('')
  const [ownerF,setOwnerF]=useState('ALL')

  const filtered=groups.filter(g=>
    (!search||g.name.toLowerCase().includes(search.toLowerCase()))
    &&(ownerF==='ALL'||g.ownership_type===ownerF)
  ).sort((a,b)=>a.rank-b.rank)

  const chartData=groups.slice(0,20).map(g=>({
    name:g.name.replace(' Healthcare','').replace(' Health','').replace(' System','').slice(0,18),
    hospitals:g.total_hospitals,beds:g.total_beds,
  }))

  return (
    <div className="fade-up">
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14,marginBottom:20}}>
        <StatCard label="IDN Groups" value={groups.length.toLocaleString()} sub="Top 20 by hospital count" colour="var(--accent2)"/>
        <StatCard label="Combined Hospitals" value={groups.reduce((a,g)=>a+g.total_hospitals,0).toLocaleString()} sub="Across all Top 20 IDNs" colour="var(--purple)"/>
        <StatCard label="Combined Beds" value={(groups.reduce((a,g)=>a+g.total_beds,0)/1000).toFixed(0)+'K'} sub="Staffed beds combined" colour="var(--red)"/>
        <StatCard label="#1 by Size" value="HCA" sub="190 hospitals · $56B revenue" colour="var(--amber)"/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:20}}>
        {[{key:'hospitals',label:'Hospital Count by IDN',fill:'var(--accent)',fmt:(v:number)=>`${v} hospitals`},{key:'beds',label:'Total Beds by IDN',fill:'var(--red)',fmt:(v:number)=>`${v.toLocaleString()} beds`}].map(({key,label,fill,fmt})=>(
          <div key={key} style={C.card()}>
            <div style={C.cardHead()}><span style={C.cardTitle()}>{label}</span></div>
            <div style={{padding:'14px 10px 8px'}}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} layout="vertical" margin={{left:4,right:16,top:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false}/>
                  <XAxis type="number" tick={{fontSize:10,fill:'var(--text3)'}} axisLine={false} tickLine={false} tickFormatter={key==='beds'?v=>`${(v/1000).toFixed(0)}K`:undefined}/>
                  <YAxis type="category" dataKey="name" tick={{fontSize:9,fill:'var(--text2)'}} width={110} axisLine={false} tickLine={false}/>
                  <Tooltip formatter={(v:unknown)=>[fmt(v as number),'']} contentStyle={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:8,fontSize:12}} labelStyle={{color:'var(--text2)'}} itemStyle={{color:'var(--text)'}}/>
                  <Bar dataKey={key} fill={fill} radius={[0,4,4,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:14,alignItems:'center'}}>
        <div style={{position:'relative',flex:1,minWidth:200}}>
          <Search size={14} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text3)',pointerEvents:'none'}}/>
          <input style={C.input()} placeholder="Search IDN name…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select style={C.select()} value={ownerF} onChange={e=>setOwnerF(e.target.value)}>
          <option value="ALL">All Types</option><option value="For-Profit">For-Profit</option><option value="Non-Profit">Non-Profit</option><option value="Government">Government</option>
        </select>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {filtered.map((group)=>{
          const idnHosp=idnHospitals.filter(h=>h.idn_id===group.id)
          // Also pull matching hospitals from full list by idn_rank
          const matchingHosp=allHospitals.filter(h=>h.idn_rank===group.rank)
          const isExpanded=expanded===group.id
          const rankColour=group.rank<=3?'#d97706':group.rank<=10?'var(--accent)':'var(--text3)'
          return (
            <div key={group.id} style={{...C.card(),overflow:'hidden'}}>
              <button style={{width:'100%',textAlign:'left',display:'flex',alignItems:'center',gap:14,padding:'16px 20px',background:'none',border:'none',cursor:'pointer',color:'var(--text)'}}
                onClick={()=>setExpanded(isExpanded?null:group.id)}>
                <div style={{width:32,height:32,borderRadius:'50%',background:`${rankColour}22`,border:`1px solid ${rankColour}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:rankColour,flexShrink:0}}>{group.rank}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:14,color:'var(--text)'}}>{group.name}</div>
                  <div style={{fontSize:11,color:'var(--text3)',marginTop:2}}><MapPin size={10} style={{display:'inline',marginRight:3}}/>{group.hq_city}, {group.hq_state} · {group.states_covered} states</div>
                </div>
                <div style={{display:'flex',gap:20,alignItems:'center',flexWrap:'wrap'}}>
                  {[{v:group.total_hospitals,l:'Hospitals',c:'var(--accent2)'},{v:group.total_beds.toLocaleString(),l:'Beds',c:'var(--red)'},...(group.net_patient_revenue_b?[{v:`$${group.net_patient_revenue_b}B`,l:'Revenue',c:'var(--green)'}]:[])].map(({v,l,c})=>(
                    <div key={l} style={{textAlign:'center'}}>
                      <div style={{fontSize:16,fontWeight:800,color:c,lineHeight:1}}>{v}</div>
                      <div style={{fontSize:10,color:'var(--text3)',marginTop:2}}>{l}</div>
                    </div>
                  ))}
                  <Badge text={group.ownership_type} colour={ownerColour(group.ownership_type)}/>
                  <span style={{color:'var(--text3)'}}>{isExpanded?<ChevronUp size={15}/>:<ChevronDown size={15}/>}</span>
                </div>
              </button>
              <div style={{height:3,background:'var(--border)'}}>
                <div style={{height:'100%',background:rankColour,width:`${Math.min((group.total_beds/41000)*100,100)}%`,transition:'width 0.8s ease'}}/>
              </div>
              {isExpanded&&<IDNDeepDive group={group} hospitals={matchingHosp.length>0?matchingHosp:idnHosp.map(h=>({id:h.id,name:h.hospital_name,city:h.city,state:h.state,beds:h.beds??null,idn_name:group.name,idn_rank:group.rank,type:null,ownership:group.ownership_type} as Hospital))}/>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── AdventHealth Tab ───────────────────────────────────────────────────────────
function AdventHealthTab({hospitals}:{hospitals:Hospital[]}){
  const ah=hospitals.filter(h=>h.idn_name==='AdventHealth'||h.idn_rank===11).sort((a,b)=>(b.beds??0)-(a.beds??0))
  const fakeGroup:IDNGroup={id:'idn_11',rank:11,name:'AdventHealth',hq_city:'Altamonte Springs',hq_state:'FL',total_hospitals:57,total_beds:8809,net_patient_revenue_b:14.0,ownership_type:'Non-Profit',states_covered:9}
  return (
    <div className="fade-up">
      <div style={{background:'linear-gradient(135deg,#0d4a3a,#0d5545)',border:'1px solid rgba(20,184,166,0.3)',borderRadius:14,padding:'22px 28px',marginBottom:20}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'#5eead4',marginBottom:5}}>IDN Deep-Dive · Rank #11</div>
            <h2 style={{fontSize:26,fontWeight:900,letterSpacing:'-0.02em',margin:0,color:'#fff'}}>AdventHealth</h2>
            <p style={{margin:'5px 0 0',fontSize:12,color:'#99f6e4',lineHeight:1.5}}>Seventh-day Adventist · Non-Profit · Altamonte Springs, FL<br/>$14B+ annual revenue · 9 US states</p>
          </div>
          <div style={{display:'flex',gap:28,flexWrap:'wrap'}}>
            {[['57','Hospitals'],['9','States'],['~22K','Total Beds'],['#2','Largest US Hospital']].map(([v,l])=>(
              <div key={l} style={{textAlign:'center'}}><div style={{fontSize:24,fontWeight:900,color:'#fff',lineHeight:1}}>{v}</div><div style={{fontSize:10,color:'#99f6e4',marginTop:3}}>{l}</div></div>
            ))}
          </div>
        </div>
      </div>
      <IDNDeepDive group={fakeGroup} hospitals={ah}/>
      <div style={{background:'rgba(59,130,246,0.06)',border:'1px solid rgba(59,130,246,0.2)',borderRadius:12,padding:'14px 20px',marginTop:20}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}><Info size={13} style={{color:'var(--accent2)',flexShrink:0}}/><span style={{fontSize:11,fontWeight:700,color:'var(--accent2)',letterSpacing:'0.05em'}}>DATA NOTE</span></div>
        <p style={{margin:0,fontSize:12,color:'var(--text2)',lineHeight:1.7}}>AdventHealth Orlando (2,787 staffed beds per Medicare Cost Report) operates under a multi-building license — this is the #2 largest hospital in the US. The Definitive Health executive CSV excluded this flagship due to consolidated licensing. Bed counts sourced from Definitive Health HospitalView Aug 2025.</p>
      </div>
    </div>
  )
}


// ── Market Thesis Tab ─────────────────────────────────────────────────────────
function ThesisTab({hospitals}:{hospitals:Hospital[]}){
  const withBeds   = hospitals.filter(h=>h.beds&&h.beds>0)
  const above500   = withBeds.filter(h=>(h.beds??0)>=500).length
  const above300   = withBeds.filter(h=>(h.beds??0)>=300).length

  // Revenue calculations — 60% net margin, $10k capex per robot
  const nearRobots       = RAMP_TOTAL.robots
  const nearGrossMRR     = RAMP_TOTAL.grossMRR
  const nearNetMRR       = RAMP_TOTAL.netMRR
  const nearNetARR       = RAMP_TOTAL.netARR
  const nearCapex        = RAMP_TOTAL.capex
  const nearContractVal  = RAMP_TOTAL.contractVal
  const nearTrueProfit   = RAMP_TOTAL.trueProfit
  const somRobots        = MARKET_TIERS.find(t=>t.tier==='SAM')!.total_robots
  const somNetARR        = somRobots * REVENUE_MODEL.net_per_robot_year

  const bedRobotData = BED_SIZE_ROBOTS.map(r=>({
    ...r,
    pharmacy: Math.round(r.robots * (0.016/0.056) * 10)/10,
    labs:     Math.round(r.robots * (0.004/0.056) * 10)/10,
    food:     Math.round(r.robots * (0.012/0.056) * 10)/10,
    evs:      Math.round(r.robots * (0.024/0.056) * 10)/10,
  }))

  return (
    <div className="fade-up no-select">

      {/* ── HERO ── */}
      <div style={{background:"linear-gradient(135deg,#0a1628 0%,#0d1f3c 50%,#0a1628 100%)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:16,padding:"32px 36px",marginBottom:24,position:"relative" as const,overflow:"hidden"}}>
        <div style={{position:"absolute" as const,top:-60,right:-60,width:300,height:300,background:"radial-gradient(ellipse,rgba(59,130,246,0.08) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute" as const,bottom:-40,left:200,width:200,height:200,background:"radial-gradient(ellipse,rgba(16,185,129,0.06) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{position:"relative" as const,zIndex:1}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase" as const,color:"#60a5fa",marginBottom:10}}>Autonomi · Market Intelligence</div>
          <h1 style={{fontSize:26,fontWeight:900,letterSpacing:"-0.02em",margin:"0 0 10px",color:"#fff",lineHeight:1.2}}>U.S. Hospital Logistics Automation<br/>Investment Thesis</h1>
          <p style={{margin:"0 0 24px",fontSize:14,color:"rgba(255,255,255,0.6)",lineHeight:1.7,maxWidth:700}}>
            Hospitals are logistics machines disguised as care providers — and the system is breaking.
            A 600-bed hospital moves 37,000 items and 90,000 lbs daily, mostly by foot. Nurses and support teams spend
            countless hours on material movement instead of patient care. The result is a{" "}
            <strong style={{color:"#fff"}}>$34.46 billion annual internal logistics burden</strong> running almost entirely on manual labour,
            disconnected systems, and a workforce with 10% vacancy rates and 27% attrition.
            Autonomi exists to automate this — at scale, across every major US hospital.
          </p>
          <div style={{display:"flex",gap:28,flexWrap:"wrap" as const}}>
            {[
              {v:"$34.46B",    l:"Total annual US hospital logistics spend (TAM)", c:"#6366f1"},
              {v:"$8.6B",      l:"Addressable by automation (SAM)",                c:"#3b82f6"},
              {v:"$8.6B",      l:"Serviceable Addressable Market (SAM)",              c:"#10b981"},
              {v:"$3,000",     l:"Gross monthly revenue per deployed robot",       c:"#f59e0b"},
            ].map(({v,l,c})=>(
              <div key={l}>
                <div style={{fontSize:26,fontWeight:900,color:c,lineHeight:1}}>{v}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:4,maxWidth:160}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── REVENUE MODEL ── */}
      <div style={{...C.card(),marginBottom:20}}>
        <div style={C.cardHead()}><span style={C.cardTitle()}>Revenue Model — Robotics-as-a-Service (RaaS)</span></div>
        <div style={{padding:"20px"}}>
          <p style={{fontSize:13,color:"var(--text2)",lineHeight:1.7,marginBottom:20,maxWidth:800}}>
            Autonomi operates a subscription-based RaaS model — monthly per-robot revenue inclusive of fleet software,
            AI orchestration, and support. Contracts run 6 years with optional upgrade paths, providing strong recurring
            revenue visibility and customer retention. Average monthly gross revenue per deployed robot is <strong style={{color:"var(--text)"}}>$3,000</strong>.
          </p>
          <div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.25)",borderRadius:10,padding:"16px 20px",margin:"16px 0"}}>
            <div style={{fontSize:20,fontWeight:900,color:"#10b981",lineHeight:1,marginBottom:6}}>${"1,800"} net per robot per month</div>
            <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.5}}>60% net margin after 40% external servicing, insurance &amp; ops. <span style={{color:"var(--text3)",fontSize:12}}>Conservative base — this is an under-promise posture. Upside case as scale matures remains meaningful.</span></div>
          </div>
          <p style={{fontSize:13,color:"var(--text2)",lineHeight:1.7,marginBottom:20,maxWidth:800,marginTop:16}}>
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:24}}>
            {[
              {v:"$3,000",   l:"Gross MRR per robot",        sub:"Fixed monthly subscription",          c:"#3b82f6"},
              {v:"$1,800",   l:"Net MRR per robot (60%)",   sub:"Conservative base · upside ~$3,600+", c:"#10b981"},
              {v:"$21,600",  l:"Net ARR per robot",         sub:"$1,800 × 12 months",                  c:"#10b981"},
              {v:"$10,000",  l:"Capex per robot",           sub:"Production + installation (Autonomi absorbs)", c:"#f59e0b"},
              {v:"5.6 mo",   l:"Payback period",            sub:"$10k capex ÷ $1,800 net/month",       c:"#8b5cf6"},
              {v:"13.0×",    l:"Return on capex",           sub:"Over 6-year contract term",           c:"#ef4444"},
              {v:"$119,600", l:"True profit per robot",     sub:"$129.6k net contract − $10k capex",   c:"#ef4444"},
              {v:"6 years",  l:"Contract term",             sub:"With upgrade optionality",            c:"#6366f1"},
            ].map(({v,l,sub,c})=>(
              <div key={l} style={{background:"var(--surface2)",border:`1px solid ${c}33`,borderRadius:10,padding:"14px 16px"}}>
                <div style={{fontSize:22,fontWeight:900,color:c,lineHeight:1,marginBottom:4}}>{v}</div>
                <div style={{fontSize:12,fontWeight:700,color:"var(--text)",marginBottom:3}}>{l}</div>
                <div style={{fontSize:11,color:"var(--text3)"}}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Near-term pipeline summary */}
          <div style={{background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,padding:"16px 20px",marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:"#f59e0b",marginBottom:12,letterSpacing:"0.05em",textTransform:"uppercase" as const}}>7-Year Deployment Target — End State (2032)</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:16}}>
              {[
                {v:RAMP_TOTAL.robots.toLocaleString(),                         l:"Total robots by 2032 (ramp target)",c:"#8b5cf6"},
                {v:`$${(RAMP_TOTAL.capex/1000000).toFixed(1)}M`,              l:"Total capex (Autonomi absorbs)",  c:"#f59e0b"},
                {v:`$${(RAMP_TOTAL.grossMRR/1000000).toFixed(3)}M`,           l:"Gross MRR at full deployment",    c:"#3b82f6"},
                {v:`$${(RAMP_TOTAL.netMRR/1000000).toFixed(2)}M`,             l:"Net MRR to Autonomi (60%)",       c:"#10b981"},
                {v:`$${(RAMP_TOTAL.netARR/1000000).toFixed(1)}M`,             l:"Net ARR run-rate",                c:"#10b981"},
                {v:`$${(RAMP_TOTAL.contractVal/1000000).toFixed(0)}M`,        l:"6yr net contract value",          c:"#6366f1"},
                {v:`$${(RAMP_TOTAL.trueProfit/1000000).toFixed(0)}M`,         l:"True profit after capex",         c:"#ef4444"},
              ].map(({v,l,c})=>(
                <div key={l}>
                  <div style={{fontSize:22,fontWeight:900,color:c,lineHeight:1}}>{v}</div>
                  <div style={{fontSize:11,color:"var(--text2)",marginTop:3}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 7-Year deployment ramp */}
          <div style={{...C.card(),overflow:"hidden"}}>
            <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={C.cardTitle()}>7-Year Deployment Ramp — 2026 to 2032</span>
              <span style={{fontSize:11,color:"var(--text3)"}}>Years 1–2 capped at 200 robots · validation &amp; business case development</span>
            </div>
            {/* Bar chart */}
            <div style={{padding:"16px 16px 4px"}}>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={DEPLOYMENT_RAMP} margin={{top:4,right:8,bottom:0,left:-10}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                  <XAxis dataKey="label" tick={{fontSize:11,fill:"var(--text2)"}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10,fill:"var(--text3)"}} axisLine={false} tickLine={false}/>
                  <Tooltip formatter={(v:unknown)=>[`${(v as number).toLocaleString()} robots`,""]}
                    contentStyle={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,fontSize:12}}
                    labelStyle={{color:"var(--text)"}} itemStyle={{color:"var(--text2)"}}/>
                  <Bar dataKey="newRobots" name="New Robots" fill="var(--accent)" radius={[4,4,0,0]}>
                    {DEPLOYMENT_RAMP.map((d,i)=>(
                      <Cell key={i} fill={d.phase==="Validation"?"#6366f1":d.phase==="Early Scale"?"#3b82f6":d.phase==="Growth"?"#10b981":"#f59e0b"}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{display:"flex",gap:16,marginTop:4,marginBottom:12,flexWrap:"wrap" as const}}>
                {[["#6366f1","Validation (Yr 1–2)"],["#3b82f6","Early Scale (Yr 3)"],["#10b981","Growth (Yr 4–5)"],["#f59e0b","Scale (Yr 6–7)"]].map(([c,l])=>(
                  <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"var(--text2)"}}>
                    <div style={{width:8,height:8,borderRadius:2,background:c}}/>
                    {l}
                  </div>
                ))}
              </div>
            </div>
            {/* Year-by-year table */}
            <div style={{overflowX:"auto" as const}}>
              <table style={{width:"100%",borderCollapse:"collapse" as const,fontSize:12}}>
                <thead>
                  <tr>
                    {["Year","Phase","New Robots","Total Fleet","Gross MRR","Net MRR (60%)","Net ARR","Cumul Capex","Notes"].map(h=>(
                      <th key={h} style={{...C.th(),whiteSpace:"nowrap" as const}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DEPLOYMENT_RAMP.map((y,i)=>{
                    const phaseColor = y.phase==="Validation"?"#6366f1":y.phase==="Early Scale"?"#3b82f6":y.phase==="Growth"?"#10b981":"#f59e0b"
                    const cumulCapex = (y as {cumulCapex?: number}).cumulCapex ?? DEPLOYMENT_RAMP.slice(0,i+1).reduce((a,r)=>a+r.capexYear,0)
                    return (
                      <tr key={y.year} style={{background:i%2===0?"transparent":"rgba(255,255,255,0.015)"}}>
                        <td style={{...C.td(),fontWeight:700,color:"var(--text)"}}>{y.label}</td>
                        <td style={C.td()}>
                          <span style={{fontSize:11,fontWeight:700,color:phaseColor,background:phaseColor+"18",padding:"2px 7px",borderRadius:4,whiteSpace:"nowrap" as const}}>{y.phase}</span>
                        </td>
                        <td style={{...C.td(),textAlign:"center" as const}}>
                          <span style={{fontFamily:"monospace",fontWeight:700,color:phaseColor,fontSize:13}}>{y.newRobots}</span>
                        </td>
                        <td style={{...C.td(),textAlign:"center" as const}}>
                          <span style={{fontFamily:"monospace",fontWeight:800,color:"var(--text)",fontSize:13}}>{y.cumulative.toLocaleString()}</span>
                        </td>
                        <td style={{...C.td(),fontFamily:"monospace",fontSize:12,color:"#3b82f6"}}>${(y.grossMRR/1000).toFixed(0)}K</td>
                        <td style={{...C.td(),fontFamily:"monospace",fontSize:12,fontWeight:700,color:"#10b981"}}>${(y.netMRR/1000).toFixed(0)}K</td>
                        <td style={{...C.td(),fontFamily:"monospace",fontSize:12,fontWeight:700,color:"#10b981"}}>${(y.netARR/1000000).toFixed(2)}M</td>
                        <td style={{...C.td(),fontFamily:"monospace",fontSize:11,color:"var(--text3)"}}>${(cumulCapex/1000000).toFixed(1)}M</td>
                        <td style={{...C.td(),fontSize:11,color:"var(--text2)",maxWidth:220}}>{y.description}</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr style={{background:"var(--surface2)",fontWeight:700}}>
                    <td style={{...C.td(),fontWeight:800,color:"var(--text)"}}>End 2032</td>
                    <td style={C.td()}/>
                    <td style={{...C.td(),textAlign:"center" as const,fontFamily:"monospace",color:"#f59e0b",fontWeight:800}}>{RAMP_TOTAL.robots.toLocaleString()}</td>
                    <td style={{...C.td(),textAlign:"center" as const,fontFamily:"monospace",fontWeight:900,color:"#f59e0b"}}>{RAMP_TOTAL.robots.toLocaleString()}</td>
                    <td style={{...C.td(),fontFamily:"monospace",color:"#3b82f6",fontWeight:700}}>${(RAMP_TOTAL.grossMRR/1000000).toFixed(3)}M</td>
                    <td style={{...C.td(),fontFamily:"monospace",fontWeight:900,color:"#10b981",fontSize:13}}>${(RAMP_TOTAL.netMRR/1000000).toFixed(2)}M</td>
                    <td style={{...C.td(),fontFamily:"monospace",fontWeight:900,color:"#10b981",fontSize:13}}>${(RAMP_TOTAL.netARR/1000000).toFixed(1)}M</td>
                    <td style={{...C.td(),fontFamily:"monospace",color:"var(--text3)"}}>${(RAMP_TOTAL.capex/1000000).toFixed(1)}M</td>
                    <td style={{...C.td(),fontSize:11,color:"var(--text2)"}}>20% YoY growth from 2030 baseline</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Deployment scenario comparison */}
          <div style={{marginTop:16,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {/* Base case */}
            <div style={{background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:10,padding:"16px 20px"}}>
              <div style={{fontSize:10,fontWeight:700,color:"var(--accent2)",letterSpacing:"0.1em",textTransform:"uppercase" as const,marginBottom:8}}>Base Case — 34 Campuses</div>
              <div style={{fontSize:20,fontWeight:900,color:"var(--text)",marginBottom:4}}>2,344 profiled robots · ${(NEAR_TERM.net_arr/1e6).toFixed(2)}M net ARR</div>
              <div style={{fontSize:12,color:"var(--text2)",lineHeight:1.6,marginBottom:6}}>
                <strong style={{color:"var(--text)"}}>34 hospitals · 82 buildings · 2,344 robots</strong><br/>
                Avg 28.6 robots per building · Gross MRR: $7.03M · Net MRR: $4.22M<br/>
                Net ARR: $50.63M · Capex: $23.4M · 6yr contract: $303.8M · True profit: $280.3M
              </div>
              <div style={{fontSize:11,color:"var(--text3)",fontStyle:"italic" as const}}>Rate-limiting factor: IDN contracting timelines (12–24 months). Each deployment requires separate facilities agreement, IT integration, and elevator access provisioning.</div>
            </div>
            {/* Upside case */}
            <div style={{background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:10,padding:"16px 20px"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#10b981",letterSpacing:"0.1em",textTransform:"uppercase" as const,marginBottom:8}}>Upside Case — 68 Campuses (10–14 Month Cycle)</div>
              <div style={{fontSize:20,fontWeight:900,color:"var(--text)",marginBottom:4}}>4,688 robots · $101.26M net ARR</div>
              <div style={{fontSize:12,color:"var(--text2)",lineHeight:1.6,marginBottom:6}}>
                <strong style={{color:"var(--text)"}}>68 hospitals · 164 buildings · 4,688 robots</strong><br/>
                Avg 28.6 robots per building · Gross MRR: $14.06M · Net MRR: $8.44M<br/>
                Net ARR: $101.26M · Capex: $46.9M · 6yr contract: $607.6M · True profit: $560.7M
              </div>
              <div style={{fontSize:11,color:"#10b981",fontStyle:"italic" as const}}>Key lever: IDN contracting compressed from 18 months to 10–14 months via pre-negotiated MSA templates and reference customer pull.</div>
            </div>
          </div>

          {/* Sales cycle sensitivity table */}
          <div style={{marginTop:16,...C.card(),overflow:"hidden"}}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={C.cardTitle()}>Sales Cycle Sensitivity — Net ARR Impact by Deployment Rate</span>
              <span style={{fontSize:11,color:"var(--text3)"}}>Base assumption: 18 months · Strategic target: 10–14 months</span>
            </div>
            <div style={{overflowX:"auto" as const}}>
              <table style={{width:"100%",borderCollapse:"collapse" as const,fontSize:12}}>
                <thead>
                  <tr>
                    {["Sales Cycle","Deploys/Year","2028 ARR","2030 ARR","2032 ARR","Total Robots 2032","vs Base"].map(h=>(
                      <th key={h} style={{...C.th(),whiteSpace:"nowrap" as const}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {cycle:"24 months (slow)",  dpy:5,   y28:"$3.24M",y30:"$16.2M", y32:"$32.4M",robots:1500, delta:"–51%", c:"#ef4444", base:false},
                    {cycle:"18 months (base)",  dpy:8,   y28:"$10.8M",y30:"$32.4M", y32:"$63.76M",robots:2952, delta:"—",   c:"#f59e0b", base:true},
                    {cycle:"14 months (target)",dpy:11,  y28:"$21.6M",y30:"$48.6M", y32:"$86.4M",robots:4000, delta:"+36%", c:"#10b981", base:false},
                    {cycle:"10 months (upside)",dpy:15,  y28:"$32.4M",y30:"$64.8M", y32:"$118.8M",robots:5500,delta:"+86%", c:"#3b82f6", base:false},
                  ].map(({cycle,dpy,y28,y30,y32,robots,delta,c,base},i)=>(
                    <tr key={cycle} style={{background:base?"rgba(245,158,11,0.06)":i%2===0?"transparent":"rgba(255,255,255,0.01)"}}>
                      <td style={{...C.td(),fontWeight:base?800:600,color:c}}>{cycle}{base&&<span style={{fontSize:10,marginLeft:6,color:"#f59e0b",background:"rgba(245,158,11,0.15)",padding:"1px 6px",borderRadius:3}}>CURRENT</span>}</td>
                      <td style={{...C.td(),fontFamily:"monospace",textAlign:"center" as const,color:"var(--text2)"}}>{dpy}</td>
                      <td style={{...C.td(),fontFamily:"monospace",color:"var(--text2)"}}>{y28}</td>
                      <td style={{...C.td(),fontFamily:"monospace",color:"var(--text2)"}}>{y30}</td>
                      <td style={{...C.td(),fontFamily:"monospace",fontWeight:700,color:c}}>{y32}</td>
                      <td style={{...C.td(),fontFamily:"monospace",color:"var(--text2)"}}>{robots.toLocaleString()}</td>
                      <td style={{...C.td(),fontWeight:700,color:c,textAlign:"center" as const}}>{delta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{padding:"10px 16px",background:"var(--surface2)",fontSize:11,color:"var(--text3)",borderTop:"1px solid var(--border)"}}>
              ARR figures are net to Autonomi at $1,800/robot/month. All scenarios assume same 7-year horizon (2026–2032). Robots/year assumes avg 33 robots per new deployment. Compressing the sales cycle is the single highest-leverage commercial variable in the model.
            </div>
          </div>
        </div>
      </div>
      <div style={{...C.card(),marginBottom:20}}>
        <div style={C.cardHead()}><span style={C.cardTitle()}>Market Opportunity — TAM / SAM</span><span style={{fontSize:11,color:"var(--text3)"}}>Revenue figures from Autonomi Seed Investment Document</span></div>
        <div style={{padding:"20px"}}>
          <div style={{display:"flex",flexDirection:"column" as const,gap:12}}>
            {MARKET_TIERS.map((tier)=>{
              const widthPct = Math.max(15, (tier.revenue_b / 34.46) * 100)
              const robotRevNetARR = tier.total_robots * REVENUE_MODEL.net_per_robot_year
              return (
                <div key={tier.tier} style={{background:"var(--surface2)",border:`1px solid ${tier.color}33`,borderRadius:12,padding:"20px 24px",position:"relative" as const,overflow:"hidden"}}>
                  <div style={{position:"absolute" as const,left:0,top:0,bottom:0,width:`${widthPct}%`,background:`${tier.color}08`}}/>
                  <div style={{position:"relative" as const,zIndex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap" as const,gap:12,marginBottom:8}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                          <span style={{fontSize:12,fontWeight:800,color:tier.color,background:`${tier.color}15`,padding:"2px 10px",borderRadius:999,border:`1px solid ${tier.color}33`,flexShrink:0}}>{tier.tier}</span>
                          <span style={{fontSize:15,fontWeight:800,color:"var(--text)"}}>{tier.label}</span>
                        </div>
                        <p style={{fontSize:13,color:"var(--text2)",margin:0,lineHeight:1.6,maxWidth:580}}>{tier.description}</p>
                        <div style={{fontSize:10,color:"var(--text3)",marginTop:6,fontStyle:"italic" as const}}>Source: {tier.source}</div>
                      </div>
                      <div style={{display:"flex",gap:20,flexShrink:0,flexWrap:"wrap" as const}}>
                        <div style={{textAlign:"center" as const}}>
                          <div style={{fontSize:20,fontWeight:900,color:tier.color,lineHeight:1}}>{tier.revenue_label}</div>
                          <div style={{fontSize:10,color:"var(--text3)",marginTop:3,textTransform:"uppercase" as const,letterSpacing:"0.05em",maxWidth:120}}>{tier.revenue_basis}</div>
                        </div>
                        <div style={{textAlign:"center" as const}}>
                          <div style={{fontSize:20,fontWeight:900,color:"#8b5cf6",lineHeight:1}}>{tier.total_robots.toLocaleString()}</div>
                          <div style={{fontSize:10,color:"var(--text3)",marginTop:3,textTransform:"uppercase" as const,letterSpacing:"0.05em"}}>Robot units</div>
                        </div>
                        <div style={{textAlign:"center" as const}}>
                          <div style={{fontSize:20,fontWeight:900,color:"#10b981",lineHeight:1}}>{tier.deployments.toLocaleString()}</div>
                          <div style={{fontSize:10,color:"var(--text3)",marginTop:3,textTransform:"uppercase" as const,letterSpacing:"0.05em"}}>Deployments</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── ROBOT FORMULA ── */}
      <div style={{...C.card(),marginBottom:20}}>
        <div style={C.cardHead()}>
          <span style={C.cardTitle()}>Robot Density Formula — Derived from Live Deployment Data</span>
          <span style={{fontSize:11,background:"rgba(139,92,246,0.1)",padding:"2px 10px",borderRadius:999,border:"1px solid rgba(139,92,246,0.2)",fontWeight:700,color:"#8b5cf6"}}>–20% Conservative Factor Applied</span>
        </div>
        <div style={{padding:"20px"}}>
          <p style={{fontSize:13,color:"var(--text2)",lineHeight:1.7,marginBottom:20,maxWidth:800}}>
            A 600-bed hospital moves 37,000 items and 90,000 lbs daily — mostly by foot. 
            Autonomi&apos;s robot density formula is calibrated from actual throughput data across operating deployments 
            and reduced by 20% for conservatism. The result — <strong style={{color:"var(--text)"}}>0.056 robots per staffed bed</strong> — 
            is applied per hospital. Multi-building hospitals split this fleet across buildings; 
            the total robot count does not increase with deployment count.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginBottom:20}}>
            {(Object.entries(ROBOT_FORMULA) as [string,{ratio:number;label:string;description:string}][]).map(([key,f])=>{
              const colours:{[k:string]:string}={pharmacy_patient:"#3b82f6",pharmacy_restock:"#6366f1",labs:"#10b981",food:"#f59e0b",evs:"#ef4444"}
              const c=colours[key]||"#8b5cf6"
              return (
                <div key={key} style={{background:"var(--surface2)",border:`1px solid ${c}33`,borderRadius:10,padding:"14px 16px"}}>
                  <div style={{fontSize:10,fontWeight:700,color:c,letterSpacing:"0.05em",marginBottom:6,textTransform:"uppercase" as const}}>{f.label}</div>
                  <div style={{fontSize:22,fontWeight:900,color:"var(--text)",lineHeight:1}}>{f.ratio.toFixed(3)}<span style={{fontSize:12,color:"var(--text3)",marginLeft:4}}>per bed</span></div>
                  <div style={{fontSize:11,color:"var(--text2)",marginTop:6,lineHeight:1.4}}>{f.description}</div>
                </div>
              )
            })}
            <div style={{background:"var(--surface2)",border:"1px solid rgba(139,92,246,0.4)",borderRadius:10,padding:"14px 16px",display:"flex",flexDirection:"column" as const,justifyContent:"center"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#8b5cf6",letterSpacing:"0.05em",marginBottom:6,textTransform:"uppercase" as const}}>Total Combined</div>
              <div style={{fontSize:28,fontWeight:900,color:"#8b5cf6",lineHeight:1}}>0.056<span style={{fontSize:12,color:"var(--text3)",marginLeft:4}}>per bed</span></div>
              <div style={{fontSize:11,color:"var(--text2)",marginTop:6}}>= 1 robot per 17.9 beds</div>
              <div style={{fontSize:11,color:"var(--text2)"}}>600-bed hospital → 34 robots</div>
            </div>
          </div>
          <div style={{...C.card(),padding:0,overflow:"hidden"}}>
            <div style={{padding:"12px 16px 4px",borderBottom:"1px solid var(--border)"}}><span style={C.cardTitle()}>Robot Count by Hospital Size — Stacked by Use Case</span></div>
            <div style={{padding:"16px 12px 8px"}}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={bedRobotData} margin={{top:4,right:8,bottom:0,left:-10}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                  <XAxis dataKey="label" tick={{fontSize:10,fill:"var(--text2)"}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10,fill:"var(--text3)"}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,fontSize:12}} labelStyle={{color:"var(--text2)"}} itemStyle={{color:"var(--text)"}}/>
                  <Bar dataKey="pharmacy" name="Pharmacy" stackId="a" fill="#3b82f6"/>
                  <Bar dataKey="labs"     name="Labs"     stackId="a" fill="#10b981"/>
                  <Bar dataKey="food"     name="Food"     stackId="a" fill="#f59e0b"/>
                  <Bar dataKey="evs"      name="EVS"      stackId="a" fill="#ef4444" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
              <div style={{display:"flex",gap:16,marginTop:8,flexWrap:"wrap" as const}}>
                {[["#3b82f6","Pharmacy"],["#10b981","Labs"],["#f59e0b","Food & Nutrition"],["#ef4444","EVS"]].map(([c,l])=>(
                  <div key={l} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"var(--text2)"}}>
                    <div style={{width:10,height:10,borderRadius:2,background:c,flexShrink:0}}/>
                    {l}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 34 HOSPITAL BREAKDOWN ── */}
      <div style={{...C.card(),marginBottom:20}}>
        <div style={C.cardHead()}>
          <span style={C.cardTitle()}>Near-Term Pipeline — 34 Profiled Hospitals (82 Buildings)</span>
          <span style={{fontSize:11,color:"var(--text3)"}}>
            {NEAR_TERM.total_robots.toLocaleString()} profiled robots across {NEAR_TERM.hospitals} hospitals · {NEAR_TERM.deployments} buildings / deployments · avg {NEAR_TERM.robots_per_dep.toFixed(1)} robots per building · 2032 ramp target: {RAMP_TOTAL.robots.toLocaleString()} robots
          </span>
        </div>
        <div style={{padding:"16px 20px 12px"}}>
          <p style={{fontSize:13,color:"var(--text2)",lineHeight:1.6,marginBottom:16,maxWidth:800}}>
            Each hospital was individually profiled for building structure. Multi-building hospitals generate multiple deployment units
            but the same total robot count — the fleet is divided across buildings, not multiplied.
            At $3,000/robot/month gross, this pipeline represents{" "}
            <strong style={{color:"var(--text)"}}>$8.856M gross MRR</strong> and <strong style={{color:"var(--text)"}}>$63.76M net ARR</strong> at 2032 run-rate (2,952 robots).
          </p>
        </div>
        <div style={{overflowX:"auto" as const}}>
          <table style={{width:"100%",borderCollapse:"collapse" as const,fontSize:12}}>
            <thead>
              <tr>
                {["#","Hospital","Beds","Total Robots","Deploy Units","Robots/Unit","Pharmacy","Labs","Food","EVS","Net ARR"].map(h=>(
                  <th key={h} style={{...C.th(),whiteSpace:"nowrap" as const}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PROFILED_HOSPITALS.map((h,i)=>{
                const r=calcRobots(h.beds)
                const perDep=Math.round(r.total/h.deployments)
                const netARR=r.total*REVENUE_MODEL.net_per_robot_year  // $21,600 per robot per year
                const c=r.total>=100?"#ef4444":r.total>=60?"#f97316":r.total>=40?"#eab308":"#10b981"
                return (
                  <tr key={h.name} style={{background:i%2===0?"transparent":"rgba(255,255,255,0.015)"}}>
                    <td style={{...C.td(),color:"var(--text3)",fontFamily:"monospace",fontSize:11}}>{i+1}</td>
                    <td style={{...C.td(),fontWeight:600,color:"var(--text)"}}>{h.name}</td>
                    <td style={{...C.td(),fontFamily:"monospace",color:"var(--text2)"}}>{h.beds.toLocaleString()}</td>
                    <td style={{...C.td()}}><span style={{fontFamily:"monospace",fontWeight:800,fontSize:13,color:c}}>{r.total}</span></td>
                    <td style={{...C.td(),textAlign:"center" as const}}>
                      <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:24,height:24,borderRadius:"50%",background:"rgba(139,92,246,0.15)",border:"1px solid rgba(139,92,246,0.3)",fontSize:11,fontWeight:800,color:"#8b5cf6"}}>{h.deployments}</span>
                    </td>
                    <td style={{...C.td(),fontFamily:"monospace",color:"var(--text3)",textAlign:"center" as const}}>{perDep}</td>
                    <td style={{...C.td(),fontFamily:"monospace",fontSize:11,color:"#3b82f6"}}>{Math.round(r.pharmacy_patient+r.pharmacy_restock)}</td>
                    <td style={{...C.td(),fontFamily:"monospace",fontSize:11,color:"#10b981"}}>{Math.round(r.labs)}</td>
                    <td style={{...C.td(),fontFamily:"monospace",fontSize:11,color:"#f59e0b"}}>{Math.round(r.food)}</td>
                    <td style={{...C.td(),fontFamily:"monospace",fontSize:11,color:"#ef4444"}}>{Math.round(r.evs)}</td>
                    <td style={{...C.td(),fontFamily:"monospace",fontSize:11,color:"#10b981",fontWeight:700}}>${(netARR/1000).toFixed(0)}K</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{background:"var(--surface2)",fontWeight:700}}>
                <td style={C.td()}/>
                <td style={{...C.td(),fontWeight:800,color:"var(--text)"}}>TOTALS</td>
                <td style={{...C.td(),fontFamily:"monospace",color:"var(--text2)"}}>{NEAR_TERM.total_beds.toLocaleString()}</td>
                <td style={{...C.td(),fontFamily:"monospace",fontWeight:900,color:"#f59e0b",fontSize:14}}>{NEAR_TERM.total_robots.toLocaleString()}</td>
                <td style={{...C.td(),textAlign:"center" as const,fontFamily:"monospace",color:"#8b5cf6",fontWeight:800}}>{NEAR_TERM.deployments}</td>
                <td style={{...C.td(),fontFamily:"monospace",color:"var(--text3)",textAlign:"center" as const}}>{NEAR_TERM.robots_per_dep}</td>
                <td style={{...C.td(),fontFamily:"monospace",color:"#3b82f6"}}>{Math.round(PROFILED_HOSPITALS.reduce((a,h)=>{const r=calcRobots(h.beds);return a+Math.round(r.pharmacy_patient+r.pharmacy_restock)},0))}</td>
                <td style={{...C.td(),fontFamily:"monospace",color:"#10b981"}}>{Math.round(PROFILED_HOSPITALS.reduce((a,h)=>a+calcRobots(h.beds).labs,0))}</td>
                <td style={{...C.td(),fontFamily:"monospace",color:"#f59e0b"}}>{Math.round(PROFILED_HOSPITALS.reduce((a,h)=>a+calcRobots(h.beds).food,0))}</td>
                <td style={{...C.td(),fontFamily:"monospace",color:"#ef4444"}}>{Math.round(PROFILED_HOSPITALS.reduce((a,h)=>a+calcRobots(h.beds).evs,0))}</td>
                <td style={{...C.td(),fontFamily:"monospace",color:"#10b981",fontWeight:800}}>${(NEAR_TERM.net_arr/1000000).toFixed(1)}M</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── HOSPITAL SIZE TARGETS ── */}
      <div style={{...C.card(),marginBottom:20}}>
        <div style={C.cardHead()}><span style={C.cardTitle()}>Target Hospital Profile — ROI by Bed Size</span></div>
        <div style={{overflowX:"auto" as const}}>
          <table style={{width:"100%",borderCollapse:"collapse" as const,fontSize:12}}>
            <thead>
              <tr>
                {["Bed Range","Est. Hospitals","Robots/Site","Capex/Site","Net ARR/Year","6yr Net Contract","Verdict","Notes"].map(h=>(
                  <th key={h} style={{...C.th(),whiteSpace:"nowrap" as const}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {range:"100–199",  count:"~700",  robots:"6–11",   capex:"$60–110K",    arr:"$108–198K",    contract:"$648K–$1.2M",  verdict:"⚠️ Borderline",   c:"#6366f1", note:"Viable only via IDN system-wide deals. Fixed integration costs must be shared."},
                {range:"200–299",  count:"~500",  robots:"11–17",  capex:"$110–170K",   arr:"$198–306K",    contract:"$1.2M–$1.8M",  verdict:"🟡 Emerging",     c:"#eab308", note:"Min. viable standalone if high-acuity or IDN-affiliated. 5.6 month capex recovery."},
                {range:"300–499",  count:"~380",  robots:"17–28",  capex:"$170–280K",   arr:"$306–504K",    contract:"$1.8M–$3.0M",  verdict:"✅ Core SAM",     c:"#10b981", note:"Primary target. Strong ROI at exec level. 13.0× capex return. ~380 hospitals."},
                {range:"500–799",  count:"~190",  robots:"28–45",  capex:"$280–450K",   arr:"$504K–$810K",  contract:"$3.0M–$4.9M",  verdict:"🎯 Prime Target", c:"#3b82f6", note:"C-suite procurement. Multi-year budgets. Recovered by month 7. Long-term retention."},
                {range:"800–1,499",count:"~65",   robots:"45–84",  capex:"$450K–840K",  arr:"$810K–$1.5M",  contract:"$4.9M–$9.1M",  verdict:"🏆 Premium",     c:"#f97316", note:"Multi-building = 2–4 fleet deployments. $119.6K true profit per robot over 6 years."},
                {range:"1,500+",   count:"~10",   robots:"84–168+",capex:"$840K–$1.7M+",arr:"$1.5M–$3.0M+", contract:"$9.1M–$18M+",  verdict:"⭐ Landmark",    c:"#ef4444", note:"NYP: 184 robots → $18M 6yr net contract. AdventHealth Orlando: 166 robots → $16M 6yr net contract (2032 forecast based on 2,966 staffed beds × 0.056 formula; not current deployment)."},
              ].map(({range,count,robots,capex,arr,contract,verdict,c,note},i)=>(
                <tr key={range} style={{background:i%2===0?"transparent":"rgba(255,255,255,0.015)"}}>
                  <td style={{...C.td(),fontWeight:800,color:c,whiteSpace:"nowrap" as const}}>{range} beds</td>
                  <td style={{...C.td(),textAlign:"center" as const,color:"var(--text2)"}}>{count}</td>
                  <td style={{...C.td(),fontFamily:"monospace",fontWeight:700,color:c,textAlign:"center" as const}}>{robots}</td>
                  <td style={{...C.td(),fontFamily:"monospace",color:"#f59e0b"}}>{capex}</td>
                  <td style={{...C.td(),fontFamily:"monospace",fontWeight:700,color:"#10b981"}}>{arr}</td>
                  <td style={{...C.td(),fontFamily:"monospace",color:"#6366f1"}}>{contract}</td>
                  <td style={{...C.td(),whiteSpace:"nowrap" as const}}>
                    <span style={{fontSize:11,fontWeight:700,color:c,background:c+"18",padding:"2px 7px",borderRadius:4,border:`1px solid ${c}33`}}>{verdict}</span>
                  </td>
                  <td style={{...C.td(),color:"var(--text2)",fontSize:11,maxWidth:240}}>{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ASSUMPTIONS ── */}
      <div style={{...C.card(),marginBottom:20}}>
        <div style={C.cardHead()}><span style={C.cardTitle()}>Methodology & Key Assumptions</span></div>
        <div style={{padding:"20px"}}>
          <div style={{display:"flex",flexDirection:"column" as const,gap:16}}>
            {KEY_ASSUMPTIONS.map((a,i)=>(
              <div key={i} style={{display:"flex",gap:14,paddingBottom:16,borderBottom:i<KEY_ASSUMPTIONS.length-1?"1px solid var(--border)":"none"}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:"rgba(59,130,246,0.15)",border:"1px solid rgba(59,130,246,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"var(--accent2)",flexShrink:0}}>{i+1}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:5}}>{a.title}</div>
                  <p style={{fontSize:13,color:"var(--text2)",margin:0,lineHeight:1.7}}>{a.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DISCLAIMER ── */}
      <div style={{background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,padding:"14px 18px",marginBottom:20}}>
        <div style={{fontSize:10,fontWeight:700,color:"#f59e0b",marginBottom:6,letterSpacing:"0.05em",textTransform:"uppercase" as const}}>Confidential — Forward-Looking Statements</div>
        <p style={{fontSize:12,color:"var(--text2)",margin:0,lineHeight:1.7}}>
          Revenue figures (TAM $34.46B, SAM $8.6B) and unit economics ($3,000 gross/robot/month, 60% net, 6-year RaaS) sourced from the Autonomi/Ctrl Seed Investment Document.
          Robot density ratios derived from live deployments, reduced 20% for conservatism. Hospital counts from AHA Annual Survey 2024 and Definitive Health HospitalView August 2025.
          Forward-looking statements involve risks and uncertainties. This document is for authorised investors and partners only. Do not distribute.
        </p>
      </div>
    </div>
  )
}

// ── Root Page ──────────────────────────────────────────────────────────────────
export default function DashboardPage(){
  const [tab,setTab]=useState<'hospitals'|'idn'|'adventhealth'|'thesis'>('thesis')
  const [user,setUser]=useState<{email:string|null}|null>(null)
  const [authChecking,setAuthChecking]=useState(true)
  const router=useRouter()
  const [hospitals,setHospitals]=useState<Hospital[]>([])
  const [groups,setGroups]=useState<IDNGroup[]>([])
  const [idnHospitals,setIdnHosp]=useState<IDNHospital[]>([])
  const [loading,setLoading]=useState(true)
  const [showSeeder,setShowSeeder]=useState(false)
  const [dark,setDark]=useState(true)


  // Auth guard
  useEffect(()=>{
    const auth = getFirebaseAuth()
    const unsub = onAuthStateChanged(auth, u => {
      if (!u) { router.replace('/login'); return }
      setUser({ email: u.email })
      setAuthChecking(false)
    })
    return unsub
  },[router])

  useEffect(()=>{
    const saved=localStorage.getItem('theme')
    if(saved==='light'){setDark(false);document.documentElement.setAttribute('data-theme','light')}
  },[])

  const toggleTheme=useCallback(()=>{
    const next=!dark
    setDark(next)
    document.documentElement.setAttribute('data-theme',next?'dark':'light')
    localStorage.setItem('theme',next?'dark':'light')
  },[dark])

  const loadData=useCallback(async()=>{
    setLoading(true)
    try{
      const db=getDb()
      const [hSnap,gSnap,ihSnap]=await Promise.all([get(ref(db,'hospitals')),get(ref(db,'idn_groups')),get(ref(db,'idn_hospitals'))])
      const h:Hospital[]=hSnap.exists()?Object.values(hSnap.val() as Record<string,Hospital>).sort((a,b)=>(b.beds??0)-(a.beds??0)):[]
      const g:IDNGroup[]=gSnap.exists()?Object.values(gSnap.val() as Record<string,IDNGroup>).sort((a,b)=>a.rank-b.rank):[]
      const ih:IDNHospital[]=ihSnap.exists()?Object.values(ihSnap.val() as Record<string,IDNHospital>):[]
      setHospitals(h);setGroups(g);setIdnHosp(ih)
      setShowSeeder(h.length===0)
    }catch{setShowSeeder(true)}
    setLoading(false)
  },[])

  useEffect(()=>{loadData()},[loadData])

  const TABS=[
    {id:'thesis',       label:'Market Thesis',          icon:TrendingUp},
    {id:'hospitals',    label:'All US Hospitals',       icon:BedDouble},
    {id:'idn',          label:'Top 20 IDN Groups',      icon:Building2},
    {id:'adventhealth', label:'AdventHealth Deep-Dive', icon:TrendingUp},
  ]

  async function handleSignOut(){
    await signOut(getFirebaseAuth())
    router.replace('/login')
  }

  if (authChecking) return <div style={{minHeight:'100vh',background:'#080c14',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:28,height:28,border:'3px solid #1e2d42',borderTopColor:'#3b82f6',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',fontFamily:'"DM Sans","Segoe UI",system-ui,sans-serif'}}>
      {/* Header */}
      <header style={{background:'var(--bg2)',borderBottom:'1px solid var(--border)',padding:'0 24px',position:'sticky',top:0,zIndex:50}}>
        <div style={{maxWidth:1280,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',gap:16,flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <Image src={dark?'/logo-dark.png':'/logo-light.png'} alt="Autonomi" width={44} height={44} style={{borderRadius:8,objectFit:'contain'}}/>
            <div>
              <div style={{fontSize:17,fontWeight:800,letterSpacing:'-0.01em',lineHeight:1}}>US Hospital Intelligence</div>
              <div style={{fontSize:11,color:'var(--text3)',marginTop:2,letterSpacing:'0.03em'}}>AHA 2026 · Becker&apos;s · Definitive Health · Live Firebase</div>
            </div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            {user?.email&&<span style={{fontSize:11,color:'var(--text3)',marginRight:4}}>{user.email}</span>}
            <button onClick={handleSignOut} style={{width:34,height:34,borderRadius:8,background:'var(--surface2)',border:'1px solid var(--border)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text2)'}}><X size={14}/></button>
            <button onClick={toggleTheme} style={{width:34,height:34,borderRadius:8,background:'var(--surface2)',border:'1px solid var(--border)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text2)'}}>
              {dark?<Sun size={15}/>:<Moon size={15}/>}
            </button>
            <button onClick={()=>setShowSeeder(s=>!s)} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,background:'var(--surface2)',border:'1px solid var(--border)',cursor:'pointer',fontSize:13,fontWeight:600,color:'var(--text2)'}}>
              <Database size={13}/>DB Setup
            </button>
            <button onClick={loadData} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,background:'var(--surface2)',border:'1px solid var(--border)',cursor:'pointer',fontSize:13,fontWeight:600,color:'var(--text2)'}}>
              <RefreshCw size={13}/>Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{background:'var(--bg)',borderBottom:'1px solid var(--border)',padding:'0 24px'}}>
        <div style={{maxWidth:1280,margin:'0 auto',display:'flex',gap:4}}>
          {TABS.map(t=>{const Icon=t.icon;return(
            <button key={t.id} style={C.tab(tab===t.id)} onClick={()=>setTab(t.id as any)}><Icon size={15}/>{t.label}</button>
          )})}
        </div>
      </div>

      {/* Main */}
      <main style={{maxWidth:1280,margin:'0 auto',padding:'24px'}}>
        {showSeeder&&<SeederPanel onDone={()=>{setShowSeeder(false);loadData()}}/>}
        {loading?(
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:400,gap:16}}>
            <RefreshCw size={28} className="spin" style={{color:'var(--accent)'}}/>
            <div style={{fontSize:14,color:'var(--text2)'}}>Loading hospitals from Firebase…</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,180px)',gap:14,marginTop:20}}>
              {[...Array(4)].map((_,i)=><div key={i} className="skeleton" style={{height:88}}/>)}
            </div>
          </div>
        ):(
          <>
            {tab==='hospitals'&&<HospitalsTab hospitals={hospitals}/>}
            {tab==='idn'&&<IDNTab groups={groups} idnHospitals={idnHospitals} allHospitals={hospitals}/>}
            {tab==='adventhealth'&&<AdventHealthTab hospitals={hospitals}/>}
            {tab==='thesis'&&<ThesisTab hospitals={hospitals}/>}
          </>
        )}
        <footer style={{marginTop:48,paddingTop:20,borderTop:'1px solid var(--border)',textAlign:'center',fontSize:11,color:'var(--text3)',lineHeight:2}}>
          Sources: AHA Annual Survey 2026 · Becker&apos;s Hospital Review Dec 2024 · Definitive Health HospitalView Aug 2025 · CMS Hospital General Information · Hospital press releases<br/>
          {hospitals.length>0&&<span style={{color:'var(--border2)'}}>{hospitals.length.toLocaleString()} hospitals in database · Updated May 2026</span>}
        </footer>
      </main>
    </div>
  )
}
