import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Send,
  Sparkles,
  Code2,
  CheckCircle2,
  Users2,
  TrendingUp,
  Clock,
  GraduationCap,
  Banknote,
  Check,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { MatchScoreBadge, EmailStatusBadge, Badge } from '../components/common/Badge'

export const OpportunityDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    getOpportunityById,
    getCompanyById,
    getContactById,
    savedJobIds,
    toggleSaveJob,
    openContactDrawer,
    openOutreachModal,
    openPrototypeBrief,
  } = useApp()

  const opp = getOpportunityById(id || '')
  if (!opp) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Opportunity not found</h2>
        <p className="text-xs text-slate-500 mt-1">This role may have expired or been archived.</p>
        <Link
          to="/opportunities"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunities</span>
        </Link>
      </div>
    )
  }

  const comp = getCompanyById(opp.companyId)
  const contact = opp.contactId ? getContactById(opp.contactId) : undefined
  const isSaved = savedJobIds.has(opp.id)

  const matchBreakdownList = [
    { label: 'Technical Skills Fit', score: opp.matchBreakdown.technicalSkills, note: 'React, Node.js, TypeScript' },
    { label: 'Experience Level Fit', score: opp.matchBreakdown.experience, note: opp.experience },
    { label: 'Degree & Education', score: opp.matchBreakdown.education, note: 'MCA / CS Graduate' },
    { label: 'Location & Work Model', score: opp.matchBreakdown.location, note: opp.remote ? 'Remote / Hybrid' : opp.location },
    { label: 'Role Alignment', score: opp.matchBreakdown.roleAlignment, note: 'Software Engineering focus' },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation Back Link & Action Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <button
          onClick={() => navigate('/opportunities')}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Opportunities</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSaveJob(opp.id)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isSaved
                ? 'border-amber-300 bg-amber-50 text-amber-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save</span>
              </>
            )}
          </button>

          {contact && (
            <button
              onClick={() => openOutreachModal(contact, opp)}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Generate Outreach</span>
            </button>
          )}
        </div>
      </div>

      {/* Company & Role Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-xl shadow-md shrink-0">
              {opp.company.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {opp.company}
                </span>
                {comp?.stage && (
                  <Badge variant="primary" size="sm">
                    {comp.stage} Stage
                  </Badge>
                )}
                {opp.remote && (
                  <Badge variant="success" size="sm">
                    Remote Eligible
                  </Badge>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {opp.role}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1 text-slate-700 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {opp.location}
                </span>
                <span>•</span>
                <span>{opp.experience}</span>
                <span>•</span>
                <span>{opp.employmentType}</span>
                <span>•</span>
                <span className="font-mono text-[11px] flex items-center gap-1.5 text-blue-700 font-semibold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/80">
                  <Clock className="w-3 h-3 text-blue-600" />
                  <span>Posted {opp.postedDate}</span>
                  {opp.postedRelative && (
                    <span className="text-[10px] text-blue-500 font-normal">({opp.postedRelative})</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="sm:text-right shrink-0 bg-emerald-50/60 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-emerald-100">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 sm:text-slate-500 mb-1 flex items-center sm:justify-end gap-1">
              <Banknote className="w-3.5 h-3.5 text-emerald-600" />
              <span>Salary Criteria (LPA)</span>
            </div>
            <div className="text-base sm:text-lg font-black text-emerald-700 tracking-tight">
              {opp.salaryRange}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Benchmarked for Indian Tech Hubs • Freshers / 0–2 Yrs
            </div>
          </div>
        </div>

        {/* Company Quick Metadata Grid */}
        {comp && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Industry</span>
              <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                {comp.industry}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Team Size</span>
              <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                {comp.employeeRange}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Funding</span>
              <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                {comp.funding || 'Private / Bootstrapped'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Official Site</span>
              <a
                href={comp.website}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-blue-600 hover:text-blue-800 mt-0.5 flex items-center gap-1 truncate"
              >
                <span>{comp.website.replace('https://', '')}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Main 2-Column Split: Left (Job Specs & Requirements) vs Right (Match Analysis, Contact Intelligence, Proof-of-Skill) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Role Specs & Description */}
        <div className="lg:col-span-7 space-y-6">
          {/* Job Overview */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Role Overview</h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {opp.description}
            </p>

            {/* Target Technologies */}
            <div className="pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Required Tech Stack
              </div>
              <div className="flex flex-wrap gap-1.5">
                {opp.technologies.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 text-slate-800 border border-slate-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Target Education */}
            <div className="pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Eligible Degree Programs
              </div>
              <div className="flex flex-wrap gap-1.5">
                {opp.education.map((edu) => (
                  <span
                    key={edu}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                  >
                    {edu}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Dedicated Eligibility Criteria & Candidate Fit Card */}
          <div className="bg-gradient-to-br from-emerald-50/50 via-white to-blue-50/30 rounded-2xl border border-emerald-200/80 shadow-2xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Eligibility Criteria</h2>
                  <p className="text-[11px] text-slate-500">Degree, Experience, & Graduating Batch Requirements</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  opp.eligibility?.isEligible !== false
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{opp.eligibility?.isEligible !== false ? 'Candidate Eligible (MCA/Fresher)' : 'Review Criteria'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Eligible Degrees</span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {(opp.eligibility?.eligibleDegrees || opp.education || ['MCA', 'B.Tech (CS)', 'BE', 'BCA']).map((deg) => (
                    <span key={deg} className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                      {deg}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Experience Window</span>
                <span className="text-xs font-bold text-slate-900 mt-1.5 block">
                  {opp.eligibility?.experienceRange || opp.experience || 'Freshers / 0 - 2 Years'}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Entry Level / Early Career</span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Eligible Batches</span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {(opp.eligibility?.eligibleBatches || ['2024', '2025', '2026']).map((batch) => (
                    <span key={batch} className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {batch} Batch
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {opp.eligibility?.summary && (
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{opp.eligibility.summary}</span>
              </div>
            )}
          </div>

          {/* Core Requirements */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Key Requirements</h2>
            <ul className="space-y-2.5 text-xs text-slate-700">
              {opp.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{req}</span>
                </li>
              ))}
            </ul>

            {opp.niceToHave.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Nice to Have / Bonus
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {opp.niceToHave.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Source Reference */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span>Discovered via:</span>
                <span className="font-semibold text-slate-800">{opp.source}</span>
              </div>
              <a
                href={opp.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                <span>Original Posting</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Match Analysis, Contact Intelligence & Proof-of-Skill */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. MATCH ANALYSIS CARD */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Candidate Fit Analysis
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">Overall Fit: {opp.matchScore}%</h2>
              </div>
              <MatchScoreBadge score={opp.matchScore} size="md" />
            </div>

            {/* Horizontal Progress Bars Breakdown */}
            <div className="space-y-3.5">
              {matchBreakdownList.map((item) => (
                <div key={item.label} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-medium">{item.label}</span>
                    <span className="font-bold text-slate-900 font-mono">{item.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        item.score >= 90
                          ? 'bg-emerald-500'
                          : item.score >= 80
                          ? 'bg-blue-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400">{item.note}</div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                High percentile alignment with candidate skills (React, TypeScript & MCA).
              </span>
            </div>
          </div>

          {/* 2. CONTACT INTELLIGENCE CARD */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users2 className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Recommended Contact</h2>
              </div>
              {contact && <EmailStatusBadge status={contact.emailStatus} size="sm" />}
            </div>

            {contact ? (
              <div className="space-y-3.5">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="w-11 h-11 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {contact.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 text-xs truncate">{contact.name}</div>
                    <div className="text-[11px] text-slate-600 font-medium">{contact.role}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                      {contact.email || 'LinkedIn Connection Only'}
                    </div>
                  </div>
                </div>

                {/* Why contact them */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Why Contact Them
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-slate-700 leading-relaxed">
                    {contact.whyRelevant}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => openContactDrawer(contact)}
                    className="flex-1 py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    View Contact Details
                  </button>
                  <button
                    onClick={() => openOutreachModal(contact, opp)}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Outreach</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                No direct recruiter identified yet. Run discovery to update contacts.
              </div>
            )}
          </div>

          {/* 3. SUGGESTED PROOF-OF-SKILL PROTOTYPE IDEA CARD */}
          <div className="bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/50 rounded-2xl border border-indigo-200/80 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                <Code2 className="w-4 h-4" />
                <span>Suggested Proof-of-Skill</span>
              </div>
              <span className="text-[11px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded-lg border border-indigo-200 shadow-2xs">
                {opp.prototypeIdea.estimatedEffort}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm">{opp.prototypeIdea.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {opp.prototypeIdea.description}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-indigo-100 text-xs text-slate-700 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Why It Matches
              </span>
              <p className="text-[11px] leading-relaxed">{opp.prototypeIdea.whyItMatches}</p>
            </div>

            <button
              onClick={() => openPrototypeBrief(opp)}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Create Prototype Brief</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
