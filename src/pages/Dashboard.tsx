import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  TrendingUp,
  Target,
  Users2,
  Send,
  ArrowRight,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  Clock,
  Radio,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { MatchScoreBadge } from '../components/common/Badge'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const {
    opportunities,
    contacts,
    outreachRecords,
    systemActivities,
    openDiscoveryModal,
    openContactDrawer,
    isDiscovering,
    lastScanText,
    runDiscovery,
  } = useApp()

  // Top 5 opportunities sorted by matchScore
  const topOpportunities = [...opportunities]
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5)

  const strongMatchesCount = opportunities.filter((o) => o.matchScore >= 80).length
  const verifiedContactsCount = contacts.filter(
    (c) => c.emailStatus === 'Verified' || c.emailStatus === 'High confidence'
  ).length

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Primary Action Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Good morning, Shriom
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Radio className="w-3 h-3 animate-pulse text-emerald-600" />
              Real-Time Feed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Live scraping pipeline active across Indian IT hubs (Bengaluru, Hyderabad, Pune, Delhi NCR, Mumbai) & verified tech feeds.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-slate-400">Last Synced</div>
            <div className="text-xs font-semibold text-slate-700">{lastScanText}</div>
          </div>
          <button
            onClick={() => runDiscovery()}
            disabled={isDiscovering}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-75 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/15 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${isDiscovering ? 'animate-spin' : ''}`} />
            <span>{isDiscovering ? 'Scraping Live...' : 'Run Live Scrape'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Opportunities
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{opportunities.length}</span>
            {opportunities.length > 0 && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Scraped Live
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2">Active engineering postings harvested</p>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Strong Matches
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{strongMatchesCount}</span>
            {opportunities.length > 0 && (
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                {Math.round((strongMatchesCount / opportunities.length) * 100)}% of pipeline
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2">Scored 80%+ for React, Node.js & MCA</p>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Verified Contacts
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{verifiedContactsCount}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3" /> RFC-5321 MX
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Hiring leads & validated company inboxes</p>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Outreach Campaigns
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{outreachRecords.length}</span>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              Proof-of-Skill
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Personalized pitches drafted</p>
        </div>
      </div>

      {/* Main Grid: Top Opportunities (left 8 cols) & Activity Feed (right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Opportunities List */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold text-slate-900">Top Priority Opportunities</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Highest match scores aligned with your React, TypeScript & MCA credentials.
              </p>
            </div>
            {opportunities.length > 0 && (
              <Link
                to="/opportunities"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                <span>View all ({opportunities.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {opportunities.length === 0 ? (
            <div className="p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-bold text-slate-900">No Mock Data — Pipeline Ready for Live Scrape</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Click below to scrape real-time tech opportunities, hiring contacts, and companies directly from live hiring feeds.
                </p>
              </div>
              <button
                onClick={() => runDiscovery()}
                disabled={isDiscovering}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm inline-flex items-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run Real-Time Live Scrape</span>
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-4">Company & Role</th>
                      <th className="py-3 px-3">Location & Exp</th>
                      <th className="py-3 px-3">Match</th>
                      <th className="py-3 px-3">Contact Lead</th>
                      <th className="py-3 px-3">Posted</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {topOpportunities.map((opp) => {
                      const lead = contacts.find((c) => c.id === opp.contactId)
                      return (
                        <tr key={opp.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-xs">{opp.role}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span className="font-semibold text-slate-700">{opp.company}</span>
                              <span>•</span>
                              <span className="text-slate-400 font-mono text-[10px]">{opp.source}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="text-slate-700 font-medium">{opp.location}</div>
                            <div className="text-[11px] text-slate-400">{opp.experience}</div>
                          </td>
                          <td className="py-3.5 px-3">
                            <MatchScoreBadge score={opp.matchScore} size="sm" />
                          </td>
                          <td className="py-3.5 px-3">
                            {lead ? (
                              <button
                                onClick={() => openContactDrawer(lead)}
                                className="text-left group cursor-pointer"
                              >
                                <div className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                                  {lead.name}
                                </div>
                                <div className="text-[10px] text-slate-400">{lead.role}</div>
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Direct Apply</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                            {opp.postedDate}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => navigate(`/opportunities/${opp.id}`)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-blue-700 text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>View</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="sm:hidden divide-y divide-slate-100">
                {topOpportunities.map((opp) => (
                  <div key={opp.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs">{opp.role}</h3>
                        <div className="text-[11px] text-slate-600 font-semibold">{opp.company}</div>
                      </div>
                      <MatchScoreBadge score={opp.matchScore} size="sm" />
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>
                        {opp.location} • {opp.experience}
                      </span>
                      <span className="font-mono text-[10px]">{opp.postedDate}</span>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => navigate(`/opportunities/${opp.id}`)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Footer Note */}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500">
                <span>Displaying live verified opportunities scraped in real time.</span>
                <span className="font-mono text-[10px] text-emerald-600 font-semibold">Zero Mock Data</span>
              </div>
            </>
          )}
        </div>

        {/* Activity Feed (right 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Pipeline Activity</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time system events & discoveries</p>
          </div>

          <div className="p-5 flex-1 divide-y divide-slate-100 space-y-4">
            {systemActivities.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No recent activity recorded yet. Run a live scrape to see system events.
              </div>
            ) : (
              systemActivities.map((act) => (
                <div key={act.id} className="pt-3 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900">{act.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{act.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{act.description}</p>
                </div>
              ))
            )}
          </div>

          {/* Quick Tip Box */}
          <div className="p-4 m-4 rounded-xl bg-blue-50/80 border border-blue-100 text-xs text-blue-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Proof-of-Skill Strategy
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Target engineering leads with lightweight working prototypes
              instead of generic cold resumes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
