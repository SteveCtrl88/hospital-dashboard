"use client";

import { useState, useEffect } from "react";
import { IDN_DATA, HOSPITAL_DATA, BED_DISTRIBUTION } from "@/lib/data";
import type { IDN } from "@/lib/data";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const OWNERSHIP_COLOR: Record<string, string> = {
  "For-Profit": "#e74c3c",
  "Non-Profit": "#2980b9",
  "Religious":  "#8e44ad",
  "Government": "#27ae60",
};

function AnimNum({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const dur = 1400;
    let startTs = 0;
    const step = (ts: number) => {
      if (!startTs) startTs = ts;
      const p = Math.min((ts - startTs) / dur, 1);
      const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      setVal(Math.round(target * ease));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return <>{prefix}{val.toLocaleString()}{suffix}</>;
}

export default function Dashboard() {
  const [tab, setTab] = useState<"idns" | "hospitals" | "distribution">("idns");
  const [selectedIDN, setSelectedIDN] = useState<IDN | null>(null);
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterIDN, setFilterIDN] = useState("");
  const [filterBeds, setFilterBeds] = useState("");
  const [sortBy, setSortBy] = useState<"beds" | "name" | "state">("beds");
  const [page, setPage] = useState(1);
  const PER = 20;

  const hosps = HOSPITAL_DATA
    .filter(h =>
      (!search || h.name.toLowerCase().includes(search.toLowerCase())) &&
      (!filterState || h.state === filterState) &&
      (!filterIDN || h.idn_name === filterIDN) &&
      (!filterBeds || (h.beds !== null && h.beds >= parseInt(filterBeds)))
    )
    .sort((a, b) =>
      sortBy === "beds" ? (b.beds ?? 0) - (a.beds ?? 0) :
      sortBy === "name" ? a.name.localeCompare(b.name) :
      a.state.localeCompare(b.state)
    );

  const totalPgs = Math.max(1, Math.ceil(hosps.length / PER));
  const visible = hosps.slice((page - 1) * PER, page * PER);
  const states = [...new Set(HOSPITAL_DATA.map(h => h.state))].sort();
  const idns = [...new Set(HOSPITAL_DATA.map(h => h.idn_name).filter(Boolean))].sort() as string[];

  const sortedIDNs = [...IDN_DATA].sort((a, b) => b.hospital_count - a.hospital_count);
  const maxH = Math.max(...IDN_DATA.map(x => x.hospital_count));

  return (
    <div className="min-h-screen bg-[#0d1117] text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');`}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 px-6 py-3 flex items-center justify-between bg-[#0d1117]/90 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 grid place-items-center text-sm">🏥</div>
          <div>
            <p className="text-sm font-bold leading-tight">US Hospital Intelligence</p>
            <p className="text-[10px] text-white/30">~6,100 hospitals · 20 IDNs · May 2026</p>
          </div>
        </div>
        <span className="text-[10px] text-white/25 font-mono flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" /> LIVE DATA
        </span>
      </header>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-white/10">
        {[
          { label: "Total US Hospitals",   val: 6100,  col: "text-cyan-400"  },
          { label: "Total Staffed Beds",   val: 916752,col: "text-blue-400"  },
          { label: "Hospitals > 500 Beds", val: 158,   col: "text-amber-400" },
          { label: "Hospitals > 800 Beds", val: 33,    col: "text-rose-400"  },
        ].map((k, i) => (
          <div key={k.label} className={`px-5 py-4 bg-white/[0.015] ${i < 3 ? "border-r border-white/5" : ""}`}>
            <p className="text-[9px] text-white/35 uppercase tracking-widest font-mono mb-1">{k.label}</p>
            <p className={`text-2xl font-black ${k.col}`}><AnimNum target={k.val} /></p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-5 border-b border-white/10">
        {(["idns", "hospitals", "distribution"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded-t-lg transition-all ${
              tab === t ? "bg-white/10 text-white border border-b-0 border-white/20" : "text-white/30 hover:text-white/60"
            }`}>
            {t === "idns" ? "Top 20 IDNs" : t === "hospitals" ? "Hospital Explorer" : "Bed Distribution"}
          </button>
        ))}
      </div>

      <main className="p-5 md:p-6">

        {/* ── IDN TAB ─────────────────────────────────────────────── */}
        {tab === "idns" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 space-y-2">
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono mb-3">Click a row to explore</p>
              {sortedIDNs.map((idn, i) => {
                const pct = (idn.hospital_count / maxH) * 100;
                const sel = selectedIDN?.id === idn.id;
                return (
                  <button key={idn.id} onClick={() => setSelectedIDN(sel ? null : idn)}
                    className={`w-full text-left rounded-lg px-4 py-3 border transition-all ${
                      sel ? "border-white/30 bg-white/10" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                    }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-white/25 w-5">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-semibold truncate">{idn.name}</span>
                          <div className="flex gap-3 shrink-0 ml-2 text-[10px] font-mono text-white/40">
                            <span>{idn.hospital_count} hosp</span>
                            <span>{idn.total_beds.toLocaleString()} beds</span>
                            <span className="text-emerald-400">${idn.net_patient_revenue.toFixed(1)}B</span>
                          </div>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: idn.color }} />
                        </div>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded font-mono"
                        style={{ background: idn.color + "25", color: idn.color }}>{idn.hq_state}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              {selectedIDN ? (
                <div className="rounded-xl border border-white/10 p-5 space-y-4 bg-white/[0.03]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-black leading-tight">{selectedIDN.name}</h2>
                      <p className="text-xs text-white/40 mt-1">{selectedIDN.ownership} · {selectedIDN.hq_state}</p>
                    </div>
                    <div className="w-3 h-3 rounded-full mt-1" style={{ background: selectedIDN.color }} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { l: "Hospitals",     v: selectedIDN.hospital_count.toLocaleString()  },
                      { l: "Total Beds",    v: selectedIDN.total_beds.toLocaleString()       },
                      { l: "Net Revenue",   v: `$${selectedIDN.net_patient_revenue.toFixed(1)}B` },
                      { l: "Discharges",    v: (selectedIDN.annual_discharges/1000).toFixed(0)+"K" },
                    ].map(s => (
                      <div key={s.l} className="bg-white/5 rounded-lg p-3">
                        <p className="text-[9px] text-white/35 uppercase tracking-widest">{s.l}</p>
                        <p className="text-xl font-black mt-0.5" style={{ color: selectedIDN.color }}>{s.v}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Hospitals in database</p>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {HOSPITAL_DATA.filter(h => h.idn_id === selectedIDN.id)
                        .sort((a, b) => (b.beds ?? 0) - (a.beds ?? 0))
                        .map(h => (
                          <div key={h.id} className="flex justify-between items-center px-2 py-1.5 rounded bg-white/[0.03] text-xs">
                            <span className="truncate text-white/70">{h.name}</span>
                            <span className="font-mono shrink-0 ml-2" style={{ color: selectedIDN.color }}>
                              {h.beds?.toLocaleString() ?? "—"}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-3">Ownership Mix</p>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie data={
                          Object.entries(IDN_DATA.reduce((a, i) => ({ ...a, [i.ownership]: (a[i.ownership] || 0) + 1 }), {} as Record<string,number>))
                            .map(([name, value]) => ({ name, value }))
                        } cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                          {Object.keys(OWNERSHIP_COLOR).map(k => <Cell key={k} fill={OWNERSHIP_COLOR[k]} />)}
                        </Pie>
                        <Legend iconSize={7} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-3">Top 8 IDNs by Beds</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={[...IDN_DATA].sort((a,b)=>b.total_beds-a.total_beds).slice(0,8)
                          .map(i=>({ name: i.name.split(" ").slice(0,2).join(" "), beds: i.total_beds, fill: i.color }))}
                        layout="vertical" margin={{ left: 0, right: 16 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={82} tick={{ fontSize: 9, fill: "#ffffff66" }} />
                        <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #ffffff22", borderRadius: 8, fontSize: 11 }}
                          formatter={(v: unknown) => [(v as number).toLocaleString() + " beds", ""]} />
                        <Bar dataKey="beds" radius={[0,3,3,0]}>
                          {[...IDN_DATA].sort((a,b)=>b.total_beds-a.total_beds).slice(0,8)
                            .map(i => <Cell key={i.id} fill={i.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── HOSPITALS TAB ────────────────────────────────────────── */}
        {tab === "hospitals" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <input placeholder="Search hospital..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-500/50" />
              <select value={filterState} onChange={e => { setFilterState(e.target.value); setPage(1); }}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                <option value="">All States</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filterIDN} onChange={e => { setFilterIDN(e.target.value); setPage(1); }}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                <option value="">All IDNs</option>
                {idns.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <select value={filterBeds} onChange={e => { setFilterBeds(e.target.value); setPage(1); }}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                <option value="">Any Size</option>
                <option value="100">100+ beds</option>
                <option value="300">300+ beds</option>
                <option value="500">500+ beds</option>
                <option value="800">800+ beds</option>
                <option value="1000">1,000+ beds</option>
              </select>
            </div>

            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="text-white/30">Sort:</span>
              {(["beds","name","state"] as const).map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`px-2 py-1 rounded uppercase transition-all ${sortBy===s ? "bg-cyan-500/20 text-cyan-400" : "text-white/30 hover:text-white/60"}`}>{s}</button>
              ))}
              <span className="ml-auto text-white/25">{hosps.length} results · pg {page}/{totalPgs}</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-xs min-w-[700px]">
                <thead className="bg-white/5">
                  <tr className="text-white/35 uppercase tracking-widest text-[9px] font-mono">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Hospital Name</th>
                    <th className="px-4 py-3 text-left">City</th>
                    <th className="px-3 py-3 text-center">ST</th>
                    <th className="px-4 py-3 text-right">Beds</th>
                    <th className="px-4 py-3 text-left">IDN Group</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Ownership</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {visible.map((h, i) => {
                    const idn = IDN_DATA.find(x => x.id === h.idn_id);
                    const bc = h.beds && h.beds >= 1000 ? "#e74c3c" : h.beds && h.beds >= 500 ? "#27ae60" : h.beds && h.beds >= 100 ? "#2980b9" : "#6b7280";
                    return (
                      <tr key={h.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-3 font-mono text-white/20">{(page-1)*PER+i+1}</td>
                        <td className="px-4 py-3 font-semibold text-white/85 max-w-[240px] truncate">{h.name}</td>
                        <td className="px-4 py-3 text-white/45">{h.city}</td>
                        <td className="px-3 py-3 text-center">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/50 font-mono">{h.state}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {h.beds
                            ? <span className="font-mono font-bold text-sm" style={{ color: bc }}>{h.beds.toLocaleString()}</span>
                            : <span className="text-white/15">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {h.idn_name
                            ? <span className="text-[9px] px-2 py-0.5 rounded-full font-mono"
                                style={{ background: (idn?.color ?? "#888")+"22", color: idn?.color ?? "#aaa" }}>
                                {h.idn_name.split(" ").slice(0,3).join(" ")}
                              </span>
                            : <span className="text-white/20 text-[9px]">Independent</span>}
                        </td>
                        <td className="px-4 py-3 text-white/45">{h.type}</td>
                        <td className="px-4 py-3">
                          <span className="text-[9px] px-2 py-0.5 rounded font-mono"
                            style={{ background: OWNERSHIP_COLOR[h.ownership]+"22", color: OWNERSHIP_COLOR[h.ownership] }}>
                            {h.ownership}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center gap-1.5 pt-1">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                className="px-3 py-1.5 text-[11px] rounded bg-white/5 text-white/40 hover:bg-white/10 disabled:opacity-25">← Prev</button>
              {Array.from({ length: Math.min(totalPgs, 7) }, (_, j) => j+1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 text-[10px] rounded font-mono transition-all ${page===p?"bg-cyan-500/25 text-cyan-400":"text-white/25 hover:text-white/60"}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPgs,p+1))} disabled={page===totalPgs}
                className="px-3 py-1.5 text-[11px] rounded bg-white/5 text-white/40 hover:bg-white/10 disabled:opacity-25">Next →</button>
            </div>
          </div>
        )}

        {/* ── DISTRIBUTION TAB ─────────────────────────────────────── */}
        {tab === "distribution" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1">US Hospitals by Bed Size</p>
                <p className="text-[9px] text-white/20 font-mono mb-4">AHA 2022 Annual Survey · ~6,100 community hospitals</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={BED_DISTRIBUTION} margin={{ bottom: 5 }}>
                    <XAxis dataKey="range" tick={{ fontSize: 10, fill:"#ffffff77" }} />
                    <YAxis tick={{ fontSize: 10, fill:"#ffffff77" }} />
                    <Tooltip contentStyle={{ background:"#1a1f2e", border:"1px solid #ffffff22", borderRadius:8 }}
                      formatter={(v:unknown) => [(v as number).toLocaleString()+" hospitals","Count"]} />
                    <Bar dataKey="aha_count" radius={[4,4,0,0]}>
                      {BED_DISTRIBUTION.map((d,i) => (
                        <Cell key={i} fill={
                          d.range==="800+"?"#e74c3c":d.range==="500–799"?"#e67e22":
                          ["400–499","300–399"].includes(d.range)?"#f1c40f":
                          ["200–299","100–199"].includes(d.range)?"#2980b9":"#3d5a80"
                        } />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">Key Stats & Sources</p>
                {[
                  { l:"Total AHA-registered hospitals",     v:"~6,100",    sub:"All types incl. federal & psychiatric",      c:"#3498db" },
                  { l:"Community hospitals",                v:"5,129",     sub:"Non-federal, short-term (AHA 2022)",         c:"#2980b9" },
                  { l:"Hospitals with < 200 beds",          v:"~76%",      sub:"Approx. 4,634 facilities",                  c:"#7f8c8d" },
                  { l:"Hospitals with 500+ beds (AHA est.)",v:"~120–158",  sub:"~2% of all hospitals · AHA statistic",      c:"#f39c12" },
                  { l:"Hospitals with 800+ beds (AHA est.)",v:"~230–250",  sub:"National estimate (exact data paywalled)",  c:"#e67e22" },
                  { l:"Definitive Health DB — 500+ beds",   v:"158",       sub:"Direct count from uploaded CSV",            c:"#e74c3c" },
                  { l:"Definitive Health DB — 800+ beds",   v:"33",        sub:"Direct count from uploaded CSV",            c:"#c0392b" },
                ].map(s => (
                  <div key={s.l} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="w-0.5 self-stretch rounded-full shrink-0" style={{ background: s.c }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/75">{s.l}</p>
                      <p className="text-[9px] text-white/25 mt-0.5">{s.sub}</p>
                    </div>
                    <p className="font-black text-lg font-mono shrink-0" style={{ color: s.c }}>{s.v}</p>
                  </div>
                ))}
                <div className="p-3 rounded-lg bg-amber-500/8 border border-amber-500/20 text-[9px] text-amber-400/70 font-mono leading-relaxed">
                  ⚠️ AHA publishes total counts publicly but gates the full bed-size breakdown behind its paid annual publication. The 500+/800+ estimates above combine AHA&#39;s own &quot;~2% have 500+ beds&quot; statement with Definitive Health CSV data.
                </div>
              </div>
            </div>

            {/* AdventHealth spotlight */}
            <div className="rounded-xl border border-[#00857c]/30 bg-[#00857c]/5 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#00857c] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00857c] inline-block" /> AdventHealth Deep Dive
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { l:"Total Hospitals",      v:"57",       s:"9 states"                           },
                  { l:"Est. System Beds",      v:"~22,000",  s:"Licensed system-wide"               },
                  { l:"Hospitals > 500 beds",  v:"5",        s:"Orlando, Tampa, WP, SM, Redmond"    },
                  { l:"Hospitals > 800 beds",  v:"1",        s:"AdventHealth Orlando only"          },
                  { l:"Largest Campus",        v:"2,247",    s:"Orlando multi-campus licensed total"},
                ].map(s => (
                  <div key={s.l} className="bg-white/5 rounded-lg p-3">
                    <p className="text-[9px] text-white/35 uppercase tracking-widest mb-1">{s.l}</p>
                    <p className="text-xl font-black text-[#00857c]">{s.v}</p>
                    <p className="text-[9px] text-white/25 mt-0.5">{s.s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 px-6 py-4 text-[9px] text-white/20 font-mono flex flex-wrap gap-x-5 gap-y-1">
        <span>Sources: AHA Hospital Statistics 2023–2026</span>
        <span>Definitive Healthcare HospitalView 2025</span>
        <span>Becker&#39;s Hospital Review Feb 2026</span>
        <span>Ampliz IDN Database 2026</span>
        <span>Wikipedia · Official hospital press releases</span>
        <span className="ml-auto">Next.js + Vercel · Built May 2026</span>
      </footer>
    </div>
  );
}
