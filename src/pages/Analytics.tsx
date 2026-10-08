import React, { useMemo } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  BarChart3,
  Sparkles,
} from 'lucide-react'
import { useApp } from '../context/AppContext'

export const Analytics: React.FC = () => {
  const { opportunities, contacts, outreachRecords, openDiscoveryModal, isDiscovering } = useApp()

  // Dynamically compute Technology demand breakdown from real scraped opportunities
  const techDemandData = useMemo(() => {
    const counts: Record<string, number> = {}
    opportunities.forEach((opp) => {
      opp.technologies.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1
      })
    })
    const palette = ['#2563EB', '#3B82F6', '#10B981', '#6366F1', '#0EA5E9', '#F59E0B', '#EC4899', '#8B5CF6']
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name, count], idx) => ({
        name,
        count,
        fill: palette[idx % palette.length],
      }))

    return sorted.length > 0
      ? sorted
      : [{ name: 'React', count: 0, fill: '#2563EB' }]
  }, [opportunities])

  // Dynamically compute Experience level distribution from real scraped opportunities
  const experienceData = useMemo(() => {
    const counts: Record<string, number> = {}
    opportunities.forEach((opp) => {
      counts[opp.experience] = (counts[opp.experience] || 0) + 1
    })
    const colorMap: Record<string, string> = {
      Fresher: '#2563EB',
      Internship: '#10B981',
      '0–1 years': '#6366F1',
      '0–2 years': '#0EA5E9',
      '1–2 years': '#F59E0B',
      '2–3 years': '#8B5CF6',
    }
    const entries = Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: colorMap[name] || '#64748B',
    }))

    return entries.length > 0 ? entries : [{ name: 'Fresher', value: 0, color: '#2563EB' }]
  }, [opportunities])

  // Dynamically compute Match score buckets from real scraped opportunities
  const matchDistributionData = useMemo(() => {
    let superMatch = 0
    let high = 0
    let mod = 0
    let exp = 0
    opportunities.forEach((opp) => {
      if (opp.matchScore >= 90) superMatch++
      else if (opp.matchScore >= 85) high++
      else if (opp.matchScore >= 80) mod++
      else exp++
    })
    return [
      { range: '90–100%', count: superMatch, label: 'Super Match' },
      { range: '85–89%', count: high, label: 'High Alignment' },
      { range: '80–84%', count: mod, label: 'Moderate Fit' },
      { range: '< 80%', count: exp, label: 'Exploratory' },
    ]
  }, [opportunities])

  // Dynamically compute Contact verification status distribution from real scraped contacts
  const verificationBreakdownData = useMemo(() => {
    const counts: Record<string, number> = {}
    contacts.forEach((c) => {
      counts[c.emailStatus] = (counts[c.emailStatus] || 0) + 1
    })
    const colorMap: Record<string, string> = {
      Verified: '#10B981',
      'High confidence': '#3B82F6',
      'Company contact': '#F59E0B',
      'LinkedIn only': '#64748B',
      'Needs verification': '#EF4444',
    }
    const entries = Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: colorMap[name] || '#94A3B8',
    }))

    return entries.length > 0
      ? entries
      : [{ name: 'Verified', value: 0, color: '#10B981' }]
  }, [contacts])

  // Pipeline summary values
  const qualifiedCount = opportunities.filter((o) => o.matchScore >= 75).length
  const highMatchCount = opportunities.filter((o) => o.matchScore >= 88).length
  const verifiedLeadsCount = contacts.filter(
    (c) => c.emailStatus === 'Verified' || c.emailStatus === 'High confidence'
  ).length
  const dnsVerifiedOnly = contacts.filter((c) => c.emailStatus === 'Verified').length
  const dnsRate = contacts.length > 0 ? Math.round((dnsVerifiedOnly / contacts.length) * 100) : 0

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pipeline Analytics & Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Data-driven intelligence dynamically derived from real-time scraped job listings and DNS MX lookups.
          </p>
        </div>
        <button
          onClick={openDiscoveryModal}
          disabled={isDiscovering}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isDiscovering ? 'Scraping Live...' : 'Refresh Live Data'}</span>
        </button>
      </div>

      {opportunities.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <BarChart3 className="w-6 h-6 animate-pulse" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-slate-900">No Mock Data — Pipeline Empty</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Analytics are generated dynamically from live job postings. Run real-time discovery to populate tech demand, experience levels, and verification stats.
            </p>
          </div>
          <button
            onClick={openDiscoveryModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm inline-flex items-center gap-2 cursor-pointer transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run Real-Time Scraper</span>
          </button>
        </div>
      ) : (
        <>
          {/* Top 6 KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Discovered
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                {opportunities.length}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Live Scraped
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Qualified
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                {qualifiedCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">MCA / Early-Career</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Verified Leads
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                {verifiedLeadsCount}
              </div>
              <div className="text-[11px] text-blue-600 font-semibold mt-0.5">
                {dnsRate}% MX Valid
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                High-Match (&gt;88%)
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                {highMatchCount}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Top Priority</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Outreach Drafts
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                {outreachRecords.length}
              </div>
              <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">Proof-of-Skill</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Active Sources
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-1">4</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Live Job Feeds</div>
            </div>
          </div>

          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart 1: Tech Demand (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    In-Demand Technologies from Live Postings
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Extracted dynamically from currently scraped postings
                  </p>
                </div>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                  Live Stack
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={techDemandData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Bar dataKey="count" name="Open Roles" radius={[6, 6, 0, 0]}>
                      {techDemandData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Experience Distribution (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Experience Level Breakdown</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Seniority distribution of scraped roles
                </p>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={experienceData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={3}
                    >
                      {experienceData.map((entry, index) => (
                        <Cell key={`pie-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Match Distribution (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Match Score Distribution</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dynamic scores computed against candidate skills
                </p>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={matchDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Opportunities" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Verification Breakdown (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Contact Verification Status</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  RFC-5321 DNS MX check outcomes on discovered inboxes
                </p>
              </div>

              <div className="h-60 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={verificationBreakdownData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={40}
                      paddingAngle={3}
                    >
                      {verificationBreakdownData.map((entry, index) => (
                        <Cell key={`v-pie-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
