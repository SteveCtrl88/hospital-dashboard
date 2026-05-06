'use client'

import { useState, useEffect, useMemo, CSSProperties } from 'react'
import { getDb } from '@/lib/firebase'
import { ref, get } from 'firebase/database'
import type { Hospital, IDNGroup, IDNHospital } from '@/lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import {
  Search, Building2, BedDouble, TrendingUp, Database, RefreshCw, X,
  ChevronDown, ChevronUp, Activity, Info, MapPin, DollarSign
} from 'lucide-react'

// ── colour helpers ────────────────────────────────────────────────────────────
const bedColour = (beds: number | null) => {
  if (!beds) return '#4a5a72'
  if (beds >= 1000) return '#ef4444'
  if (beds >= 500)  return '#f97316'
  if (beds >= 300)  return '#eab308'
  if (beds >= 100)  return '#10b981'
  return '#14b8a6'
}
const ownerColour = (t: string) =>
  t === 'For-Profit' ? '#f59e0b' : t === 'Non-Profit' ? '#10b981' : t === 'Government' ? '#6366f1' : '#4a5a72'

const BED_CATS = [
  { label: '<100',    min: 0,    max: 99,    fill: '#14b8a6' },
  { label: '100–199', min: 100,  max: 199,   fill: '#10b981' },
  { label: '200–299', min: 200,  max: 299,   fill: '#eab308' },
  { label: '300–399', min: 300,  max: 399,   fill: '#f97316' },
  { label: '400–499', min: 400,  max: 499,   fill: '#ef4444' },
  { label: '500–799', min: 500,  max: 799,   fill: '#dc2626' },
  { label: '800+',    min: 800,  max: 99999, fill: '#991b1b' },
]

// ── style helpers ─────────────────────────────────────────────────────────────
const S: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)',
    fontFamily: '"DM Sans", "Segoe UI", system-ui, sans-serif',
  },
  header: {
    background: 'linear-gradient(180deg, #0d1220 0%, #0a0d14 100%)',
    borderBottom: '1px solid var(--border)',
    padding: '0 24px',
    position: 'sticky', top: 0, zIndex: 50,
  },
  headerInner: {
    maxWidth: 1280, margin: '0 auto', display: 'flex',
    alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 0', gap: 16, flexWrap: 'wrap' as const,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 12,
  },
  logoIcon: {
    width: 40, height: 40, borderRadius: 10,
    background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 20px rgba(59,130,246,0.3)',
  },
  logoText: { fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1 },
  logoSub: { fontSize: 11, color: 'var(--text3)', marginTop: 2, letterSpacing: '0.03em' },
  tabBar: {
    background: 'var(--bg)',
    borderBottom: '1px solid var(--border)',
    padding: '0 24px',
  },
  tabBarInner: {
    maxWidth: 1280, margin: '0 auto',
    display: 'flex', gap: 4,
  },
  main: { maxWidth: 1280, margin: '0 auto', padding: '24px' },
  grid4: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24,
  },
  statCard: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '20px 22px',
    transition: 'border-color 0.15s',
  },
  statLabel: { fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 8 },
  statValue: { fontSize: 32, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 4 },
  statSub: { fontSize: 11, color: 'var(--text2)' },
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 12, marginBottom: 20,
  },
  cardHead: { padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text2)' },
  cardBody: { padding: '20px' },
  filterRow: { display: 'flex', gap: 10, flexWrap: 'wrap' as const, marginBottom: 16, alignItems: 'center' },
  searchWrap: { position: 'relative', flex: '1', minWidth: 200 },
  searchIcon: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none' as const },
  searchInput: {
    width: '100%', paddingLeft: 34, paddingRight: 10, paddingTop: 8, paddingBottom: 8,
    background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)',
    borderRadius: 8, fontSize: 13, outline: 'none',
  },
  select: {
    background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)',
    borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', cursor: 'pointer',
  },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: 13 },
  th: {
    padding: '10px 16px', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: 'var(--text3)',
    background: 'var(--surface2)', textAlign: 'left' as const,
    borderBottom: '1px solid var(--border)',
  },
  td: { padding: '12px 16px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' as const },
  pagination: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', borderTop: '1px solid var(--border)',
    background: 'var(--surface2)', borderRadius: '0 0 12px 12px',
  },
}

const tabStyle = (active: boolean): CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '12px 16px', fontSize: 13, fontWeight: 600,
  color: active ? 'var(--accent2)' : 'var(--text2)',
  cursor: 'pointer', background: 'none', border: 'none',
  borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
  transition: 'all 0.15s', whiteSpace: 'nowrap' as const,
  outline: 'none',
})

const pageBtnStyle = (disabled: boolean): CSSProperties => ({
  padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600,
  background: disabled ? 'transparent' : 'var(--border)',
  color: disabled ? 'var(--text3)' : 'var(--text)',
  border: '1px solid var(--border)',
  cursor: disabled ? 'default' : 'pointer',
  opacity: disabled ? 0.4 : 1,
  outline: 'none',
})

// ── small components ──────────────────────────────────────────────────────────
function StatCard({ label, value, sub, colour, delay = 0 }: { label: string; value: string; sub: string; colour: string; delay?: number }) {
  return (
    <div style={{ ...S.statCard, animationDelay: `${delay}ms` }} className="fade-up">
      <div style={S.statLabel}>{label}</div>
      <div style={{ ...S.statValue, color: colour }}>{value}</div>
      <div style={S.statSub}>{sub}</div>
    </div>
  )
}

function Badge({ text, colour }: { text: string; colour: string }) {
  return (
    <span className="badge" style={{ background: colour + '22', color: colour, border: `1px solid ${colour}44` }}>
      {text}
    </span>
  )
}

function BedBar({ beds, max = 1500 }: { beds: number; max?: number }) {
  const pct = Math.min((beds / max) * 100, 100)
  const c = bedColour(beds)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 64, height: 5, borderRadius: 3, background: 'var(--border)', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: c, borderRadius: 3, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: c }}>{beds.toLocaleString()}</span>
    </div>
  )
}

function TooltipContent({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: 'var(--text2)', marginBottom: 4 }}>{label}</div>
      <div style={{ color: 'var(--text)', fontWeight: 700 }}>{payload[0].value.toLocaleString()} hospitals</div>
    </div>
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
        setMsg(`✓ Seeded ${data.counts.idn_groups} IDN groups · ${data.counts.idn_hospitals} IDN hospitals · ${data.counts.hospitals} hospitals`)
        setTimeout(onDone, 2000)
      } else { setStatus('error'); setMsg(data.error) }
    } catch (e) { setStatus('error'); setMsg(String(e)) }
  }

  return (
    <div style={{ background: '#1a1500', border: '1px solid #44330033', borderColor: '#f59e0b44', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f59e0b22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Database size={16} style={{ color: '#f59e0b' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', marginBottom: 2 }}>Database setup required</div>
        <div style={{ fontSize: 12, color: '#92610a' }}>Click to populate Firebase with all hospital and IDN data.</div>
        {msg && <div style={{ fontSize: 11, marginTop: 4, fontFamily: 'monospace', color: status === 'error' ? '#ef4444' : '#10b981' }}>{msg}</div>}
      </div>
      <button onClick={seed} disabled={status === 'seeding'}
        style={{ padding: '8px 18px', borderRadius: 8, background: status === 'seeding' ? '#7c5202' : '#d97706', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', opacity: status === 'seeding' ? 0.6 : 1 }}>
        {status === 'seeding' ? 'Seeding…' : 'Seed Database'}
      </button>
    </div>
  )
}

// ── Hospitals Tab ─────────────────────────────────────────────────────────────
function HospitalsTab({ hospitals }: { hospitals: Hospital[] }) {
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [minBeds, setMinBeds] = useState(0)
  const [sort, setSort] = useState<'beds_desc'|'beds_asc'|'name'|'state'>('beds_desc')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 50

  const states = useMemo(() => ['ALL', ...Array.from(new Set(hospitals.map(h => h.state))).sort()], [hospitals])
  const types = useMemo(() => ['ALL', ...Array.from(new Set(hospitals.map(h => h.ownership).filter((x): x is string => Boolean(x)))).sort()], [hospitals])

  const filtered = useMemo(() => {
    let h = hospitals.filter(h =>
      (!search || h.name.toLowerCase().includes(search.toLowerCase()) || h.city.toLowerCase().includes(search.toLowerCase()))
      && (stateFilter === 'ALL' || h.state === stateFilter)
      && (typeFilter === 'ALL' || h.ownership === typeFilter)
      && (!minBeds || (h.beds !== null && h.beds >= minBeds))
    )
    h.sort((a, b) =>
      sort === 'beds_desc' ? (b.beds ?? 0) - (a.beds ?? 0) :
      sort === 'beds_asc'  ? (a.beds ?? 0) - (b.beds ?? 0) :
      sort === 'name'      ? a.name.localeCompare(b.name) :
      a.state.localeCompare(b.state)
    )
    return h
  }, [hospitals, search, stateFilter, typeFilter, minBeds, sort])

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  const distData = BED_CATS.map(c => ({
    ...c,
    count: hospitals.filter(h => h.beds !== null && h.beds >= c.min && h.beds <= c.max).length
  }))
  const above500 = hospitals.filter(h => (h.beds ?? 0) > 500).length
  const above800 = hospitals.filter(h => (h.beds ?? 0) > 800).length
  const maxBeds  = Math.max(...hospitals.map(h => h.beds ?? 0))

  return (
    <div className="fade-up">
      {/* Stats */}
      <div style={S.grid4}>
        <StatCard label="Total Hospitals" value={hospitals.length.toLocaleString()} sub="In this database" colour="var(--accent2)" delay={0} />
        <StatCard label="> 500 Beds" value={above500.toLocaleString()} sub="Large medical centers" colour="#f97316" delay={50} />
        <StatCard label="> 800 Beds" value={above800.toLocaleString()} sub="Major regional centers" colour="#ef4444" delay={100} />
        <StatCard label="Largest Campus" value={maxBeds.toLocaleString()} sub="Beds (AdventHealth Orlando)" colour="#991b1b" delay={150} />
      </div>

      {/* Bed distribution chart */}
      <div style={S.card} className="fade-up-1">
        <div style={S.cardHead}>
          <span style={S.cardTitle}>Distribution by Bed Size</span>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{hospitals.length} hospitals total</span>
        </div>
        <div style={{ padding: '20px 20px 8px' }}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={distData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text2)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipContent />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                {distData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div style={S.filterRow}>
        <div style={S.searchWrap}>
          <Search size={14} style={S.searchIcon} />
          <input className="input" style={{ paddingLeft: 34 }} placeholder="Search hospitals or cities…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 0, display: 'flex' }}>
              <X size={14} />
            </button>
          )}
        </div>
        <select style={S.select} value={stateFilter} onChange={e => { setStateFilter(e.target.value); setPage(0) }}>
          {states.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All States' : s}</option>)}
        </select>
        <select style={S.select} value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(0) }}>
          {types.map(t => <option key={t} value={t}>{t === 'ALL' ? 'All Ownership' : t}</option>)}
        </select>
        <select style={S.select} value={minBeds} onChange={e => { setMinBeds(Number(e.target.value)); setPage(0) }}>
          <option value={0}>All Sizes</option>
          <option value={100}>100+ beds</option>
          <option value={200}>200+ beds</option>
          <option value={500}>500+ beds</option>
          <option value={800}>800+ beds</option>
          <option value={1000}>1000+ beds</option>
        </select>
        <select style={S.select} value={sort} onChange={e => setSort(e.target.value as typeof sort)}>
          <option value="beds_desc">Beds ↓ Largest first</option>
          <option value="beds_asc">Beds ↑ Smallest first</option>
          <option value="name">Name A–Z</option>
          <option value="state">State A–Z</option>
        </select>
        <span style={{ fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap' }}>
          {filtered.length.toLocaleString()} results
        </span>
      </div>

      {/* Table */}
      <div style={{ ...S.card, marginBottom: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>
                {['#', 'Hospital', 'Location', 'Beds', 'Type', 'Network', 'Ownership'].map((h, i) => (
                  <th key={h} style={{ ...S.th, display: i >= 5 ? undefined : undefined }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((h, i) => (
                <tr key={h.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)')}>
                  <td style={{ ...S.td, color: 'var(--text3)', fontFamily: 'monospace', fontSize: 11, width: 40 }}>{page * PAGE_SIZE + i + 1}</td>
                  <td style={S.td}>
                    <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 13, lineHeight: 1.3 }}>{h.name}</div>
                    {h.type && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{h.type}</div>}
                  </td>
                  <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: 13, color: 'var(--text2)' }}>{h.city}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)' }}>{h.state}</div>
                  </td>
                  <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                    {h.beds ? <BedBar beds={h.beds} /> : <span style={{ color: 'var(--text3)', fontSize: 11 }}>—</span>}
                  </td>
                  <td style={S.td}>
                    {h.type ? (
                      <span style={{ fontSize: 11, color: 'var(--text2)', background: 'var(--surface2)', padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>
                        {h.type === 'Academic Medical Center' ? 'Academic' : h.type === 'General Acute Care' ? 'Acute Care' : h.type}
                      </span>
                    ) : <span style={{ color: 'var(--text3)' }}>—</span>}
                  </td>
                  <td style={S.td}>
                    {h.idn_name
                      ? <span style={{ fontSize: 11, background: 'rgba(59,130,246,0.12)', color: 'var(--accent2)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(59,130,246,0.2)', whiteSpace: 'nowrap' }}>{h.idn_name}</span>
                      : <span style={{ color: 'var(--text3)', fontSize: 11 }}>Independent</span>}
                  </td>
                  <td style={S.td}>
                    {h.ownership && <Badge text={h.ownership} colour={ownerColour(h.ownership)} />}
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No hospitals match these filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div style={S.pagination}>
            <button style={pageBtnStyle(page === 0)} disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>← Prev</button>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>
              Page <strong style={{ color: 'var(--text)' }}>{page + 1}</strong> of {totalPages} · {filtered.length.toLocaleString()} hospitals
            </span>
            <button style={pageBtnStyle(page === totalPages - 1)} disabled={page === totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}>Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── IDN Tab ───────────────────────────────────────────────────────────────────
function IDNTab({ groups, idnHospitals }: { groups: IDNGroup[]; idnHospitals: IDNHospital[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [ownerFilter, setOwnerFilter] = useState('ALL')

  const filtered = groups
    .filter(g => (!search || g.name.toLowerCase().includes(search.toLowerCase())) && (ownerFilter === 'ALL' || g.ownership_type === ownerFilter))
    .sort((a, b) => a.rank - b.rank)

  const chartData = groups.slice(0, 20).map(g => ({
    name: g.name.replace('Healthcare', 'HC').replace(' Health', '').replace(' System', '').slice(0, 16),
    hospitals: g.total_hospitals,
    beds: g.total_beds,
  }))

  const totalHospitals = groups.reduce((a, g) => a + g.total_hospitals, 0)
  const totalBeds      = groups.reduce((a, g) => a + g.total_beds, 0)

  return (
    <div className="fade-up">
      <div style={S.grid4}>
        <StatCard label="IDN Groups" value={groups.length.toLocaleString()} sub="Top 20 by hospital count" colour="var(--accent2)" />
        <StatCard label="Total Hospitals" value={totalHospitals.toLocaleString()} sub="Across all Top 20 IDNs" colour="var(--purple)" />
        <StatCard label="Total Beds" value={(totalBeds / 1000).toFixed(0) + 'K'} sub="Staffed beds combined" colour="#ef4444" />
        <StatCard label="#1 by Size" value="HCA" sub="190 hospitals · $56B revenue" colour="var(--amber)" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {[
          { key: 'hospitals', label: 'Hospital Count by IDN', fill: 'var(--accent)', fmt: (v: number) => `${v} hospitals` },
          { key: 'beds',      label: 'Total Beds by IDN',     fill: '#ef4444',       fmt: (v: number) => `${v.toLocaleString()} beds` },
        ].map(({ key, label, fill, fmt }) => (
          <div key={key} style={S.card}>
            <div style={S.cardHead}><span style={S.cardTitle}>{label}</span></div>
            <div style={{ padding: '16px 12px 8px' }}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 4, right: 16, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false}
                    tickFormatter={key === 'beds' ? v => `${(v / 1000).toFixed(0)}K` : undefined} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: 'var(--text2)' }} width={100} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: unknown) => [fmt(v as number), '']}
                    contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: 'var(--text2)' }} itemStyle={{ color: 'var(--text)' }} />
                  <Bar dataKey={key} fill={fill} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={S.filterRow}>
        <div style={S.searchWrap}>
          <Search size={14} style={S.searchIcon} />
          <input className="input" style={{ paddingLeft: 34 }} placeholder="Search IDN name…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select style={S.select} value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}>
          <option value="ALL">All Ownership Types</option>
          <option value="For-Profit">For-Profit</option>
          <option value="Non-Profit">Non-Profit</option>
          <option value="Government">Government</option>
        </select>
      </div>

      {/* IDN Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((group, idx) => {
          const hospitals = idnHospitals.filter(h => h.idn_id === group.id)
          const isExpanded = expanded === group.id
          const rankColour = group.rank <= 3 ? '#d97706' : group.rank <= 10 ? 'var(--accent)' : 'var(--text3)'

          return (
            <div key={group.id} style={{ ...S.card, marginBottom: 0, overflow: 'hidden' }} className={`fade-up-${Math.min(idx % 4, 4) as 0|1|2|3|4}`}>
              <button style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}
                onClick={() => setExpanded(isExpanded ? null : group.id)}>
                {/* Rank */}
                <div className="rank-badge" style={{ background: `${rankColour}22`, border: `1px solid ${rankColour}44`, color: rankColour }}>
                  {group.rank}
                </div>
                {/* Name + HQ */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2, color: 'var(--text)' }}>{group.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', gap: 12 }}>
                    <span><MapPin size={10} style={{ display: 'inline', marginRight: 3 }} />{group.hq_city}, {group.hq_state}</span>
                    <span>{group.states_covered} states</span>
                  </div>
                </div>
                {/* Stats */}
                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent2)', lineHeight: 1 }}>{group.total_hospitals}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>Hospitals</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#ef4444', lineHeight: 1 }}>{group.total_beds.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>Beds</div>
                  </div>
                  {group.net_patient_revenue_b && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981', lineHeight: 1 }}>${group.net_patient_revenue_b}B</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>Revenue</div>
                    </div>
                  )}
                  <Badge text={group.ownership_type} colour={ownerColour(group.ownership_type)} />
                  <span style={{ color: 'var(--text3)' }}>{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                </div>
              </button>

              {/* Progress bar */}
              <div style={{ height: 3, background: 'var(--border)' }}>
                <div style={{ height: '100%', background: rankColour, width: `${Math.min((group.total_beds / 41000) * 100, 100)}%`, transition: 'width 0.8s ease' }} />
              </div>

              {/* Expanded hospitals */}
              {isExpanded && hospitals.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', background: 'var(--surface2)', padding: '16px 20px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12 }}>Key Hospitals</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
                    {hospitals.sort((a, b) => (b.beds ?? 0) - (a.beds ?? 0)).map(h => (
                      <div key={h.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{h.hospital_name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{h.city}, {h.state}</div>
                        </div>
                        {h.beds && <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: bedColour(h.beds), marginLeft: 12, flexShrink: 0 }}>{h.beds.toLocaleString()}</span>}
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

// ── AdventHealth Tab ──────────────────────────────────────────────────────────
function AdventHealthTab({ hospitals }: { hospitals: Hospital[] }) {
  const ah = hospitals.filter(h => h.idn_name === 'AdventHealth').sort((a, b) => (b.beds ?? 0) - (a.beds ?? 0))

  const byState = useMemo(() => {
    const map: Record<string, Hospital[]> = {}
    ah.forEach(h => { if (!map[h.state]) map[h.state] = []; map[h.state].push(h) })
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length)
  }, [ah])

  const chartData = ah.filter(h => h.beds && h.beds > 80).map(h => ({
    name: h.name.replace('AdventHealth ', '').replace('UChicago Medicine AdventHealth ', 'UCM-').slice(0, 22),
    beds: h.beds,
    fill: bedColour(h.beds),
  }))

  return (
    <div className="fade-up">
      {/* Hero Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0d4a3a 0%, #0d5545 50%, #0d4a3a 100%)', border: '1px solid #14b8a644', borderRadius: 16, padding: '24px 28px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(20,184,166,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 80, width: 80, height: 80, borderRadius: '50%', background: 'rgba(20,184,166,0.06)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5eead4', fontWeight: 700, marginBottom: 6 }}>IDN Deep-Dive · Rank #11</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', margin: 0, color: '#fff' }}>AdventHealth</h2>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#99f6e4', lineHeight: 1.5 }}>
              Seventh-day Adventist · Non-Profit · Altamonte Springs, FL<br />
              $14B+ annual revenue · Operates across 9 US states
            </p>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            {[['57', 'Hospitals'], ['9', 'States'], ['~22K', 'Total Beds'], ['#3', 'Largest US Hospital']].map(([val, lbl]) => (
              <div key={lbl} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: 11, color: '#99f6e4', marginTop: 3 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={S.grid4}>
        <StatCard label="In Database" value={ah.length.toString()} sub="AdventHealth hospitals tracked" colour="var(--teal)" />
        <StatCard label="With Bed Data" value={ah.filter(h => h.beds).length.toString()} sub="Verified bed counts" colour="var(--accent2)" />
        <StatCard label="> 500 Beds" value={ah.filter(h => (h.beds ?? 0) > 500).length.toString()} sub="Large AH campuses" colour="#f97316" />
        <StatCard label="Flagship Beds" value="1,364" sub="Orlando — #3 largest in USA" colour="#ef4444" />
      </div>

      {/* Chart */}
      <div style={S.card}>
        <div style={S.cardHead}><span style={S.cardTitle}>Bed Capacity by Hospital (100+ beds)</span></div>
        <div style={{ padding: '16px 16px 8px' }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 80, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--text2)' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: unknown) => [`${(v as number).toLocaleString()} beds`, '']}
                contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'var(--text2)' }} itemStyle={{ color: 'var(--text)' }}
              />
              <Bar dataKey="beds" radius={[5, 5, 0, 0]}>
                {chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* By State */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, marginBottom: 20 }}>
        {byState.map(([state, hs]) => (
          <div key={state} style={S.card}>
            <div style={S.cardHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--teal)' }}>{state}</div>
                <span style={S.cardTitle}>{state === 'FL' ? 'Florida' : state === 'CO' ? 'Colorado' : state === 'GA' ? 'Georgia' : state === 'IL' ? 'Illinois' : state === 'KS' ? 'Kansas' : state === 'KY' ? 'Kentucky' : state === 'NC' ? 'North Carolina' : state === 'TX' ? 'Texas' : state === 'WI' ? 'Wisconsin' : state}</span>
              </div>
              <span style={{ fontSize: 11, background: 'rgba(20,184,166,0.12)', color: 'var(--teal)', padding: '2px 8px', borderRadius: 999, border: '1px solid rgba(20,184,166,0.2)', fontWeight: 700 }}>
                {hs.length} hospital{hs.length > 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ padding: '12px 16px' }}>
              {hs.sort((a, b) => (b.beds ?? 0) - (a.beds ?? 0)).map((h, i) => (
                <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < hs.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{h.name.replace('AdventHealth ', '').replace('UChicago Medicine AdventHealth ', '')}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{h.city}</div>
                  </div>
                  {h.beds
                    ? <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: bedColour(h.beds), marginLeft: 12, flexShrink: 0 }}>{h.beds.toLocaleString()}</span>
                    : <span style={{ fontSize: 11, color: 'var(--text3)' }}>—</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Research Notes */}
      <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Info size={14} style={{ color: 'var(--accent2)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent2)', letterSpacing: '0.05em' }}>RESEARCH NOTES</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--text2)', lineHeight: 1.8 }}>
          <li><strong style={{ color: 'var(--text)' }}>AdventHealth Orlando</strong> operates under a single multi-campus license. Main campus: <strong style={{ color: 'var(--text)' }}>1,364 staffed beds</strong>, 2,247 total licensed — the <strong style={{ color: '#ef4444' }}>#3 largest hospital in the USA</strong>.</li>
          <li><strong style={{ color: 'var(--text)' }}>500+ bed hospitals:</strong> Orlando (1,364), Tampa (559), Redmond GA (530), Shawnee Mission KS (504), Winter Park (422–521)</li>
          <li>The Definitive Health CSV excluded the 5 largest AdventHealth hospitals due to consolidated multi-campus licensing structure.</li>
          <li>Sources: AHA Annual Survey 2022–2024 · AdventHealth press releases · Wikipedia · Becker&apos;s Hospital Review 2026</li>
        </ul>
      </div>
    </div>
  )
}

// ── Root Page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [tab, setTab]               = useState<'hospitals'|'idn'|'adventhealth'>('hospitals')
  const [hospitals, setHospitals]   = useState<Hospital[]>([])
  const [groups, setGroups]         = useState<IDNGroup[]>([])
  const [idnHospitals, setIdnHosp]  = useState<IDNHospital[]>([])
  const [loading, setLoading]       = useState(true)
  const [showSeeder, setShowSeeder] = useState(false)

  async function loadData() {
    setLoading(true)
    try {
      const db = getDb()
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
      setHospitals(h); setGroups(g); setIdnHosp(ih)
      setShowSeeder(h.length === 0)
    } catch { setShowSeeder(true) }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const TABS = [
    { id: 'hospitals',    label: 'All US Hospitals',       icon: BedDouble   },
    { id: 'idn',          label: 'Top 20 IDN Groups',      icon: Building2   },
    { id: 'adventhealth', label: 'AdventHealth Deep-Dive', icon: Activity    },
  ] as const

  return (
    <div style={S.page}>
      {/* Header */}
      <header style={S.header}>
        <div style={S.headerInner}>
          <div style={S.logo}>
            <div style={S.logoIcon}><BedDouble size={20} color="#fff" /></div>
            <div>
              <div style={S.logoText}>US Hospital Intelligence</div>
              <div style={S.logoSub}>AHA 2024 · Becker&apos;s 2026 · Definitive Health · Live Firebase DB</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => setShowSeeder(s => !s)}>
              <Database size={13} /> DB Setup
            </button>
            <button className="btn btn-ghost" onClick={loadData}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <div style={S.tabBar}>
        <div style={S.tabBarInner}>
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button key={t.id} style={tabStyle(tab === t.id)} onClick={() => setTab(t.id)}>
                <Icon size={15} />{t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <main style={S.main}>
        {showSeeder && <SeederPanel onDone={() => { setShowSeeder(false); loadData() }} />}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
            <RefreshCw size={28} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: 14, color: 'var(--text2)' }}>Loading from Firebase…</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 200px)', gap: 16, marginTop: 24 }}>
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 90 }} />)}
            </div>
          </div>
        ) : (
          <>
            {tab === 'hospitals'    && <HospitalsTab hospitals={hospitals} />}
            {tab === 'idn'          && <IDNTab groups={groups} idnHospitals={idnHospitals} />}
            {tab === 'adventhealth' && <AdventHealthTab hospitals={hospitals} />}
          </>
        )}

        <footer style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: 11, color: 'var(--text3)', lineHeight: 1.8 }}>
          Data sourced from AHA Annual Survey 2022–2024 · Becker&apos;s Hospital Review 2026 · Definitive Health HospitalView · Wikipedia · Hospital press releases<br />
          <span style={{ color: 'var(--border2)' }}>Last updated May 2026 · {hospitals.length} hospitals in database</span>
        </footer>
      </main>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
