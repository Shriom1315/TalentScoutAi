import React, { useState } from 'react'
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
  ExternalLink,
  MapPin,
  IndianRupee,
  Search,
  Globe2,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { MatchScoreBadge } from '../components/common/Badge'
import { Opportunity } from '../types'

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

  const [quickRole, setQuickRole] = useState('')
  const [quickHub, setQuickHub] = useState('Bengaluru, India')
  const [quickExp, setQuickExp] = useState('All')

  // Top 6 opportunities sorted by matchScore
  const topOpportunities = [...opportunities]
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6)

  const strongMatchesCount = opportunities.filter((o) => o.matchScore >= 80).length
  const verifiedContactsCount = contacts.filter(
    (c) => c.emailStatus === 'Verified' || c.emailStatus === 'High confidence'
  ).length

  const handleQuickScrape = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const parts = [quickRole.trim()]
    if (quickExp === 'fresher') parts.push('fresher')
    else if (quickExp === 'senior') parts.push('senior')

    runDiscovery({
      query: parts.filter(Boolean).join(' '),
      location: quickHub,
      sites: ['naukri', 'indeed', 'linkedin', 'glassdoor'],
    })
  }

  const getJobspyBadge = (opp: Opportunity) => {
    const site = (opp.jobspySite || opp.source || '').toLowerCase()
    if (site.includes('naukri')) {
      return { name: 'JobSpy • Naukri', bg: 'bg-blue-50 text-blue-700 border-blue-200' }
    }
    if (site.includes('indeed')) {
      return { name: 'JobSpy • Indeed India', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
    }
    if (site.includes('linkedin')) {
      return { name: 'JobSpy • LinkedIn', bg: 'bg-sky-50 text-sky-700 border-sky-200' }
    }
    if (site.includes('glassdoor')) {
      return { name: 'JobSpy • Glassdoor', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    }
    return { name: 'JobSpy Engine', bg: 'bg-slate-100 text-slate-700 border-slate-200' }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Status Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Good morning, Shriom
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Radio className="w-3 h-3 animate-pulse text-emerald-600" />
              100% Pure JobSpy Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time scraping powered exclusively by python-jobspy across Naukri, Indeed (India), LinkedIn & Glassdoor.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] text-slate-400">Last Synced</div>
            <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 justify-end mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{lastScanText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Unified JobSpy Harvester Command Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-900">JobSpy Real-Time Search & Live Scrape</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span>Direct Feeds: Naukri • Indeed India • LinkedIn • Glassdoor</span>
          </div>
        </div>

        <form onSubmit={handleQuickScrape} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={quickRole}
              onChange={(e) => setQuickRole(e.target.value)}
              placeholder="Search target role (e.g. React Developer, Software Engineer, MCA Fresher)..."
              className="w-full pl-9 pr-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
            />
          </div>

          <div className="sm:col-span-3 relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={quickHub}
              onChange={(e) => setQuickHub(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 cursor-pointer"
            >
              <option value="Bengaluru, India">Bengaluru, India</option>
              <option value="Pune, India">Pune, India</option>
              <option value="Hyderabad, India">Hyderabad, India</option>
              <option value="Delhi NCR, India">Delhi NCR / Gurgaon, India</option>
              <option value="Mumbai, India">Mumbai, India</option>
              <option value="India">All India</option>
            </select>
          </div>

          <div className="sm:col-span-2 relative">
            <select
              value={quickExp}
              onChange={(e) => setQuickExp(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 cursor-pointer"
            >
              <option value="All">All Experience</option>
              <option value="fresher">Fresher (0–2 Yrs)</option>
              <option value="senior">Senior (4+ Yrs)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isDiscovering}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-75 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-blue-500/10"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isDiscovering ? 'animate-spin' : ''}`} />
              <span>{isDiscovering ? 'Scraping...' : 'Start Live Scrape'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              JobSpy Postings
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{opportunities.length}</span>
            {opportunities.length > 0 && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> 100% JobSpy
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
              <h2 className="text-base font-bold text-slate-900">Top Priority JobSpy Opportunities</h2>
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
                <h3 className="text-sm font-bold text-slate-900">Zero Mock Data — Pure JobSpy Ready</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Trigger live scraping below across Naukri, Indeed India, LinkedIn & Glassdoor with LPA salary and direct ATS application links.
                </p>
              </div>
              <button
                onClick={() => handleQuickScrape()}
                disabled={isDiscovering}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm inline-flex items-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run JobSpy Live Scrape</span>
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
                      <th className="py-3 px-3">Board</th>
                      <th className="py-3 px-3">Location & Exp</th>
                      <th className="py-3 px-3">Salary (LPA)</th>
                      <th className="py-3 px-3">Match</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {topOpportunities.map((opp) => {
                      const boardBadge = getJobspyBadge(opp)

                      return (
                        <tr key={opp.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-xs">{opp.role}</div>
                            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                              {opp.company}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${boardBadge.bg}`}>
                              <span>{boardBadge.name}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="text-slate-700 font-medium truncate max-w-[140px]">{opp.location}</div>
                            <div className="text-[11px] text-slate-400">{opp.experience}</div>
                          </td>
                          <td className="py-3.5 px-3 font-bold text-emerald-700 whitespace-nowrap">
                            <div className="flex items-center gap-0.5">
                              <IndianRupee className="w-3 h-3 text-emerald-600" />
                              <span>{opp.salaryRange ? opp.salaryRange.replace(/^₹\s*/, '') : (opp.salaryLpa ? `${opp.salaryLpa} LPA` : 'Competitive')}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <MatchScoreBadge score={opp.matchScore} size="sm" />
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                            <a
                              href={opp.directUrl || opp.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-all inline-flex items-center gap-1"
                              title="Direct apply on job board"
                            >
                              <span>Apply</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <button
                              onClick={() => navigate(`/opportunities/${opp.id}`)}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all inline-flex items-center gap-1 cursor-pointer"
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
                {topOpportunities.map((opp) => {
                  const boardBadge = getJobspyBadge(opp)
                  return (
                    <div key={opp.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900 text-xs">{opp.role}</h3>
                          <div className="text-[11px] text-slate-600 font-semibold">{opp.company}</div>
                        </div>
                        <MatchScoreBadge score={opp.matchScore} size="sm" />
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${boardBadge.bg}`}>
                          <span>{boardBadge.name}</span>
                        </span>
                        <div className="font-bold text-emerald-700 flex items-center gap-0.5">
                          <IndianRupee className="w-3 h-3 text-emerald-600" />
                          <span>{opp.salaryRange ? opp.salaryRange.replace(/^₹\s*/, '') : (opp.salaryLpa ? `${opp.salaryLpa} LPA` : 'Competitive')}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <a
                          href={opp.directUrl || opp.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg inline-flex items-center gap-1"
                        >
                          <span>Apply</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => navigate(`/opportunities/${opp.id}`)}
                          className="px-3 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* System Activity Feed (right 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-900">JobSpy Pipeline Activity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time system events & discoveries</p>
            </div>

            <div className="p-5 divide-y divide-slate-100 max-h-[440px] overflow-y-auto">
              {systemActivities.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No recent activity recorded yet. Run a live scrape to see real-time events.
                </div>
              ) : (
                systemActivities.slice(0, 7).map((activity) => (
                  <div key={activity.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 text-[11px] truncate max-w-[70%]">
                        {activity.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{activity.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed text-[11px]">
                      {activity.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Genuine JobSpy Feeds
            </span>
            <span className="text-[11px] font-mono font-bold text-emerald-700">RFC-5321 MX</span>
          </div>
        </div>
      </div>
    </div>
  )
}
