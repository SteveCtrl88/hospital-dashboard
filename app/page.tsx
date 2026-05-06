'use client'

import { useState, useEffect, useMemo } from 'react'
import { db } from '@/lib/firebase'
import { ref, get } from 'firebase/database'
import type { Hospital, IDNGroup, IDNHospital } from '@/lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import {
  Search, Building2, BedDouble, TrendingUp, ChevronDown, ChevronUp,
  Database, RefreshCw, X, Info
} from 'lucide-react'

function bedColour(beds: number | null) {
  if (!beds) return '#6b7280'
  if (beds >= 1000) return '#dc2626'
  if (beds >= 500)  return '#ea580c'
  if (beds >= 200)  return '#d97706'
  if (beds >= 100)  return '#65a30d'
  return '#0891b2'
}

function ownershipColour(type: string) {
  if (type === 'For-Profit')  return '#f59e0b'
  if (type === 'Non-Profit')  return '#10b981'
  if (type === 'Government')  return '#6366f1'
  return '#6b7280'
}

const BED_CATEGORIES = [
  { label: '<25',      min: 0,   max: 24,   colour: '#0891b2' },
  { label: '25–49',   min: 25,  max: 49,   colour: '#06b6d4' },
  { label: '50–99',   min: 50,  max: 99,   colour: '#10b981' },
  { label: '100–199', min: 100, max: 199,  colour: '#65a30d' },
  { label: '200–299', min: 200, max: 299,  colour: '#eab308' },
  { label: '300–399', min: 300, max: 399,  colour: '#f97316' },
  { label: '400–499', min: 400, max: 499,  colour: '#ef4444' },
  { label: '500–799', min: 500, max: 799,  colour: '#dc2626' },
  { label: '800+',    min: 800, max: 99999,colour: '#991b1b' },
]

function StatCard({ label, value, sub, colour }: { label: string; value: string; sub: string; colour: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{label}</div>
      <div className="text-3xl font-bold mb-1" style={{ color: colour }}>{value}</div>
      <div className="text-xs text-gray-500">{sub}</div>
    </div>
  )
}

function Badge({ text, colour }: { text: string; colour: string }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: colour + '22', color: colour }}>
      {text}
    </span>
  )
}

function SeederPanel({ onDone }: { onDone: () => void }) {
  const [status, setStatus] = useState<'idle' | 'seeding' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function seed() {
    setStatus('seeding'); setMsg('')
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setStatus('done')
        setMsg(`✓ Seeded ${data.counts.idn_groups} IDN groups, ${data.counts.idn_hospitals} IDN hospitals, ${data.counts.hospitals} hospitals`)
        setTimeout(onDone, 1500)
      } else { setStatus('error'); setMsg(data.error) }
    } catch (e) { setStatus('error'); setMsg(String(e)) }
  }

  return (
    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4 flex-wrap">
      <Info size={18} className="text-amber-600 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-800">Database Setup Required</p>
        <p className="text-xs text-amber-700 mt-0.5">Click to populate Supabase with all hospital and IDN research data.</p>
        {msg && <p className={`text-xs mt-1 font-mono ${status === 'error' ? 'text-red-600' : 'text-green-700'}`}>{msg}</p>}
      </div>
      <button onClick={seed} disabled={status === 'seeding'}
        className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50">
        <Database size={15} />{status === 'seeding' ? 'Seeding…' : 'Seed Database'}
      </button>
    </div>
  )
}

function HospitalsTab({ hospitals }: { hospitals: Hospital[] }) {
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('ALL')
  const [minBeds, setMinBeds] = useState(0)
  const [sort, setSort] = useState<'beds_desc'|'beds_asc'|'name'|'state'>('beds_desc')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 50

  const states = useMemo(() => ['ALL', ...Array.from(new Set(hospitals.map(h => h.state))).sort()], [hospitals])

  const filtered = useMemo(() => {
    let h = hospitals.filter(h => {
      const q = search.toLowerCase()
      return (!q || h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q))
        && (stateFilter === 'ALL' || h.state === stateFilter)
        && (!minBeds || (h.beds !== null && h.beds >= minBeds))
    })
    h.sort((a, b) =>
      sort === 'beds_desc' ? (b.beds ?? 0) - (a.beds ?? 0) :
      sort === 'beds_asc'  ? (a.beds ?? 0) - (b.beds ?? 0) :
      sort === 'name'      ? a.name.localeCompare(b.name) :
      a.state.localeCompare(b.state)
    )
    return h
  }, [hospitals, search, stateFilter, minBeds, sort])

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const distData = BED_CATEGORIES.map(c => ({ ...c, count: hospitals.filter(h => h.beds !== null && h.beds >= c.min && h.beds <= c.max).length }))
  const above500 = hospitals.filter(h => h.beds !== null && h.beds > 500).length
  const above800 = hospitals.filter(h => h.beds !== null && h.beds > 800).length
  const maxBeds = Math.max(...hospitals.map(h => h.beds ?? 0))

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Hospitals" value={hospitals.length.toLocaleString()} sub="In this database" colour="#1e40af" />
        <StatCard label="> 500 Beds" value={above500.toLocaleString()} sub="Large hospitals" colour="#ea580c" />
        <StatCard label="> 800 Beds" value={above800.toLocaleString()} sub="Major medical centers" colour="#dc2626" />
        <StatCard label="Largest" value={maxBeds.toLocaleString()} sub="Beds (AdventHealth Orlando)" colour="#991b1b" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Distribution by Bed Size</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={distData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`${Number(v)} hospitals`, 'Count']} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>{distData.map((e, i) => <Cell key={i} fill={e.colour} />)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search hospitals or cities…" value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14}/></button>}
        </div>
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={stateFilter} onChange={e => { setStateFilter(e.target.value); setPage(0) }}>
          {states.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All States' : s}</option>)}
        </select>
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={minBeds} onChange={e => { setMinBeds(Number(e.target.value)); setPage(0) }}>
          <option value={0}>All Sizes</option>
          <option value={100}>100+ beds</option>
          <option value={200}>200+ beds</option>
          <option value={500}>500+ beds</option>
          <option value={800}>800+ beds</option>
          <option value={1000}>1000+ beds</option>
        </select>
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={sort} onChange={e => setSort(e.target.value as typeof sort)}>
          <option value="beds_desc">Beds ↓ (largest first)</option>
          <option value="beds_asc">Beds ↑ (smallest first)</option>
          <option value="name">Name A–Z</option>
          <option value="state">State A–Z</option>
        </select>
      </div>

      <p className="text-xs text-gray-500 mb-3">{filtered.length.toLocaleString()} hospitals matching filters</p>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-900 text-gray-300">
              {['#','Hospital','Location','Beds','IDN','Ownership'].map((h, i) => (
                <th key={h} className={`text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider ${i >= 4 ? 'hidden md:table-cell' : ''} ${i === 5 ? 'hidden lg:table-cell' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((h, i) => (
              <tr key={h.id} className={i % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 hover:bg-blue-50'}>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{page * PAGE_SIZE + i + 1}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-900 leading-tight">{h.name}</div>
                  {h.type && <div className="text-xs text-gray-400 mt-0.5">{h.type}</div>}
                </td>
                <td className="px-4 py-3 text-gray-600">{h.city}, <span className="font-semibold">{h.state}</span></td>
                <td className="px-4 py-3">
                  {h.beds ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min((h.beds / 1500) * 100, 100)}%`, background: bedColour(h.beds) }} />
                      </div>
                      <span className="font-bold font-mono text-sm" style={{ color: bedColour(h.beds) }}>{h.beds.toLocaleString()}</span>
                    </div>
                  ) : <span className="text-gray-400 text-xs">N/A</span>}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {h.idn_name
                    ? <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{h.idn_name}</span>
                    : <span className="text-gray-400 text-xs">Independent</span>}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {h.ownership && <Badge text={h.ownership} colour={ownershipColour(h.ownership)} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-100">← Prev</button>
            <span className="text-xs text-gray-500">Page {page + 1} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-100">Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}

function IDNTab({ groups, idnHospitals }: { groups: IDNGroup[]; idnHospitals: IDNHospital[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [ownerFilter, setOwnerFilter] = useState('ALL')

  const filtered = groups
    .filter(g => (!search || g.name.toLowerCase().includes(search.toLowerCase())) && (ownerFilter === 'ALL' || g.ownership_type === ownerFilter))
    .sort((a, b) => a.rank - b.rank)

  const chartData = groups.slice(0, 20).map(g => ({
    name: g.name.replace('Healthcare','HC').replace('Health','Hlth').replace(' System','').slice(0, 18),
    hospitals: g.total_hospitals,
    beds: g.total_beds,
  }))

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="IDN Groups" value={groups.length.toLocaleString()} sub="Top 20 by hospital count" colour="#1e40af" />
        <StatCard label="Total Hospitals" value={groups.reduce((a, g) => a + g.total_hospitals, 0).toLocaleString()} sub="Across top 20 IDNs" colour="#7c3aed" />
        <StatCard label="Total Beds" value={(groups.reduce((a, g) => a + g.total_beds, 0) / 1000).toFixed(0) + 'K+'} sub="Staffed beds combined" colour="#dc2626" />
        <StatCard label="#1 IDN" value="HCA" sub="190 hospitals · 41,000 beds" colour="#d97706" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[
          { key: 'hospitals', label: 'Hospitals per IDN', colour: '#3b82f6', fmt: (v: number) => `${v}` },
          { key: 'beds',      label: 'Total Beds per IDN', colour: '#dc2626', fmt: (v: number) => `${v.toLocaleString()}` },
        ].map(({ key, label, colour, fmt }) => (
          <div key={key} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{label}</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={key === 'beds' ? v => `${(v/1000).toFixed(0)}K` : undefined} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={110} />
                <Tooltip formatter={(v: unknown) => [fmt(v as number), '']} />
                <Bar dataKey={key} fill={colour} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Search IDN name…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}>
          <option value="ALL">All Types</option>
          <option value="For-Profit">For-Profit</option>
          <option value="Non-Profit">Non-Profit</option>
          <option value="Government">Government</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(group => {
          const hospitals = idnHospitals.filter(h => h.idn_id === group.id)
          const isExpanded = expandedId === group.id
          return (
            <div key={group.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <button className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition" onClick={() => setExpandedId(isExpanded ? null : group.id)}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: group.rank <= 3 ? '#d97706' : group.rank <= 10 ? '#3b82f6' : '#6b7280' }}>
                  {group.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 truncate">{group.name}</div>
                  <div className="text-xs text-gray-500">{group.hq_city}, {group.hq_state} · {group.states_covered} states</div>
                </div>
                <div className="hidden md:flex gap-6 text-right">
                  <div><div className="text-lg font-bold text-blue-600">{group.total_hospitals}</div><div className="text-xs text-gray-400">Hospitals</div></div>
                  <div><div className="text-lg font-bold text-red-600">{group.total_beds.toLocaleString()}</div><div className="text-xs text-gray-400">Beds</div></div>
                  {group.net_patient_revenue_b && <div><div className="text-lg font-bold text-green-600">${group.net_patient_revenue_b}B</div><div className="text-xs text-gray-400">Revenue</div></div>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge text={group.ownership_type} colour={ownershipColour(group.ownership_type)} />
                  {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>
              <div className="h-1.5 bg-gray-100">
                <div className="h-full" style={{ width: `${Math.min((group.total_beds / 41000) * 100, 100)}%`, background: group.rank <= 3 ? '#d97706' : '#3b82f6' }} />
              </div>
              {isExpanded && hospitals.length > 0 && (
                <div className="border-t border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Key Hospitals</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {hospitals.sort((a, b) => (b.beds ?? 0) - (a.beds ?? 0)).map(h => (
                      <div key={h.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-200">
                        <div><div className="text-sm font-semibold text-gray-800 leading-tight">{h.hospital_name}</div><div className="text-xs text-gray-500">{h.city}, {h.state}</div></div>
                        {h.beds && <span className="text-sm font-bold font-mono ml-3 flex-shrink-0" style={{ color: bedColour(h.beds) }}>{h.beds.toLocaleString()}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AdventHealthTab({ hospitals }: { hospitals: Hospital[] }) {
  const ah = hospitals.filter(h => h.idn_name === 'AdventHealth').sort((a, b) => (b.beds ?? 0) - (a.beds ?? 0))
  const byState = useMemo(() => {
    const map: Record<string, Hospital[]> = {}
    ah.forEach(h => { if (!map[h.state]) map[h.state] = []; map[h.state].push(h) })
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length)
  }, [ah])

  const chartData = ah.filter(h => h.beds).map(h => ({
    name: h.name.replace('AdventHealth ','').slice(0, 20),
    beds: h.beds, colour: bedColour(h.beds)
  }))

  return (
    <div>
      <div className="bg-gradient-to-r from-teal-700 to-teal-500 rounded-xl p-6 mb-6 text-white shadow-lg">
        <div className="flex items-center gap-4 flex-wrap">
          <div><h2 className="text-2xl font-bold">AdventHealth</h2><p className="text-teal-100 text-sm mt-1">Non-Profit · Altamonte Springs, FL · Seventh-day Adventist · Ranked #11 largest IDN</p></div>
          <div className="flex-1" />
          <div className="grid grid-cols-3 gap-6 text-center">
            <div><div className="text-3xl font-bold">57</div><div className="text-teal-200 text-xs">Hospitals</div></div>
            <div><div className="text-3xl font-bold">9</div><div className="text-teal-200 text-xs">States</div></div>
            <div><div className="text-3xl font-bold">~22K</div><div className="text-teal-200 text-xs">Total Beds</div></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="In Database" value={ah.length.toString()} sub="AdventHealth hospitals" colour="#0d9488" />
        <StatCard label="With Bed Data" value={ah.filter(h => h.beds).length.toString()} sub="Verified bed counts" colour="#0891b2" />
        <StatCard label="> 500 Beds" value={ah.filter(h => h.beds && h.beds > 500).length.toString()} sub="Large AH hospitals" colour="#ea580c" />
        <StatCard label="Flagship" value="1,364" sub="Orlando main campus beds (#3 in USA)" colour="#dc2626" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Bed Counts by Hospital</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 0, right: 10, bottom: 80, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-40} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`${v?.toLocaleString()} beds`, '']} />
            <Bar dataKey="beds" radius={[4, 4, 0, 0]}>{chartData.map((e, i) => <Cell key={i} fill={e.colour} />)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {byState.map(([state, hs]) => (
          <div key={state} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">{state}</h3>
              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-semibold">{hs.length} hospitals</span>
            </div>
            <div className="space-y-2">
              {hs.sort((a, b) => (b.beds ?? 0) - (a.beds ?? 0)).map(h => (
                <div key={h.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-800 leading-tight">{h.name.replace('AdventHealth ','')}</div>
                    <div className="text-xs text-gray-500">{h.city}</div>
                  </div>
                  {h.beds ? <span className="text-sm font-bold font-mono ml-2" style={{ color: bedColour(h.beds) }}>{h.beds.toLocaleString()}</span> : <span className="text-xs text-gray-400">N/A</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-2">📋 Research Notes</p>
        <ul className="list-disc list-inside space-y-1 text-xs leading-relaxed">
          <li>AdventHealth Orlando operates under a single multi-campus license covering 8 facilities — <strong>1,364 staffed main campus beds; 2,247 total licensed</strong>. It is the <strong>3rd largest hospital in the USA</strong>.</li>
          <li><strong>Hospitals over 500 beds:</strong> Orlando (1,364), Tampa (~559), Redmond (~530), Shawnee Mission (504), Winter Park (422–521)</li>
          <li><strong>Hospitals over 800 beds:</strong> Orlando only</li>
          <li>The Definitive Health CSV was missing the 5 largest AdventHealth hospitals due to consolidated licensing.</li>
          <li>Sources: AHA Annual Survey 2022–2024, AdventHealth press releases, Wikipedia, Becker&apos;s Hospital Review 2026.</li>
        </ul>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [tab, setTab] = useState<'hospitals'|'idn'|'adventhealth'>('hospitals')
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [groups, setGroups] = useState<IDNGroup[]>([])
  const [idnHospitals, setIdnHospitals] = useState<IDNHospital[]>([])
  const [loading, setLoading] = useState(true)
  const [showSeeder, setShowSeeder] = useState(false)

  async function loadData() {
    setLoading(true)
    try {
      const [hSnap, gSnap, ihSnap] = await Promise.all([
        get(ref(db, 'hospitals')),
        get(ref(db, 'idn_groups')),
        get(ref(db, 'idn_hospitals')),
      ])

      const h: Hospital[] = hSnap.exists()
        ? Object.values(hSnap.val() as Record<string, Hospital>).sort((a, b) => (b.beds ?? 0) - (a.beds ?? 0))
        : []
      const g: IDNGroup[] = gSnap.exists()
        ? Object.values(gSnap.val() as Record<string, IDNGroup>).sort((a, b) => a.rank - b.rank)
        : []
      const ih: IDNHospital[] = ihSnap.exists()
        ? Object.values(ihSnap.val() as Record<string, IDNHospital>)
        : []

      setHospitals(h)
      setGroups(g)
      setIdnHospitals(ih)
      setShowSeeder(h.length === 0)
    } catch {
      setShowSeeder(true)
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const TABS = [
    { id: 'hospitals',     label: 'All US Hospitals',        icon: BedDouble },
    { id: 'idn',           label: 'Top 20 IDN Groups',       icon: Building2 },
    { id: 'adventhealth',  label: 'AdventHealth Deep-Dive',  icon: TrendingUp },
  ] as const

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white px-6 py-5 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight">🏥 US Hospital Intelligence Dashboard</h1>
            <p className="text-gray-400 text-xs mt-0.5">AHA 2024 · Becker&apos;s 2026 · Definitive Health · Wikipedia · Live Supabase DB</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSeeder(s => !s)} className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-medium transition">
              <Database size={13} /> DB Setup
            </button>
            <button onClick={loadData} className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-medium transition">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 px-6">
        <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                <Icon size={16} />{t.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {showSeeder && <SeederPanel onDone={() => { setShowSeeder(false); loadData() }} />}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400">
            <RefreshCw size={24} className="animate-spin mr-3" /><span>Loading from Supabase…</span>
          </div>
        ) : (
          <>
            {tab === 'hospitals'    && <HospitalsTab hospitals={hospitals} />}
            {tab === 'idn'          && <IDNTab groups={groups} idnHospitals={idnHospitals} />}
            {tab === 'adventhealth' && <AdventHealthTab hospitals={hospitals} />}
          </>
        )}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          Data sourced from AHA Annual Survey 2022–2024 · Becker&apos;s Hospital Review 2026 · Definitive Health HospitalView · Wikipedia. May 2026.
        </div>
      </div>
    </div>
  )
}
