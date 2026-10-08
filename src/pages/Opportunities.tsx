import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Sparkles,
  MapPin,
  Clock,
  Building2,
  ExternalLink,
  Users2,
  Send,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  Check,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { MatchScoreBadge, Badge } from '../components/common/Badge'

export const Opportunities: React.FC = () => {
  const navigate = useNavigate()
  const {
    opportunities,
    contacts,
    savedJobIds,
    toggleSaveJob,
    openContactDrawer,
    openDiscoveryModal,
  } = useApp()

  // Filter States
  const [search, setSearch] = useState('')
  const [selectedHub, setSelectedHub] = useState<string>('All')
  const [selectedCompany, setSelectedCompany] = useState<string>('All')
  const [minSalaryLpa, setMinSalaryLpa] = useState<number>(0)
  const [eligibleOnly, setEligibleOnly] = useState<boolean>(false)
  const [recencyFilter, setRecencyFilter] = useState<'all' | '24h' | '3d' | '7d'>('all')
  const [selectedExperience, setSelectedExperience] = useState<string[]>([])
  const [selectedTech, setSelectedTech] = useState<string[]>([])
  const [selectedEducation, setSelectedEducation] = useState<string[]>([])
  const [selectedStage, setSelectedStage] = useState<string[]>([])
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [minMatch, setMinMatch] = useState<number>(0)
  const [sortBy, setSortBy] = useState<'date' | 'match' | 'salary' | 'company'>('date')
  const [savedOnly, setSavedOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const indianHubs = [
    { id: 'All', label: 'All Hubs', pattern: '' },
    { id: 'Bengaluru', label: 'Bengaluru', pattern: 'bengaluru|bangalore' },
    { id: 'Hyderabad', label: 'Hyderabad', pattern: 'hyderabad' },
    { id: 'Pune', label: 'Pune', pattern: 'pune' },
    { id: 'Delhi NCR', label: 'Delhi NCR / Gurgaon', pattern: 'delhi|gurgaon|gurugram|noida' },
    { id: 'Mumbai', label: 'Mumbai', pattern: 'mumbai' },
    { id: 'Chennai', label: 'Chennai', pattern: 'chennai' },
    { id: 'Remote India', label: 'Remote (India)', pattern: 'remote|india' },
  ]

  // Unique Indian companies discovered
  const availableCompanies = useMemo(() => {
    const set = new Set<string>()
    opportunities.forEach((o) => {
      if (o.company) set.add(o.company)
    })
    return Array.from(set).sort()
  }, [opportunities])

  const lpaRanges = [
    { id: 0, label: 'All Salaries' },
    { id: 8, label: '₹8+ LPA' },
    { id: 12, label: '₹12+ LPA' },
    { id: 16, label: '₹16+ LPA' },
    { id: 20, label: '₹20+ LPA' },
    { id: 25, label: '₹25+ LPA' },
  ]

  const recencyOptions = [
    { id: 'all', label: 'All Dates' },
    { id: '24h', label: 'Last 24 Hours' },
    { id: '3d', label: 'Past 3 Days' },
    { id: '7d', label: 'Past Week' },
  ]

  const techOptions = [
    'React',
    'Node.js',
    'JavaScript',
    'TypeScript',
    'PHP',
    'Python',
    'Java',
    'AI',
    'Full Stack',
  ]
  const expOptions = ['Internship', 'Fresher', '0–1 years', '1–2 years', '2–3 years']
  const eduOptions = ['MCA', 'BCA', 'B.Tech', 'BE', 'Computer Science', 'IT']
  const stageOptions = ['Seed', 'Pre-Series A', 'Series A', 'Series B+']

  const toggleArrayFilter = (
    item: string,
    current: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(
      current.includes(item) ? current.filter((x) => x !== item) : [...current, item]
    )
  }

  const clearAllFilters = () => {
    setSearch('')
    setSelectedHub('All')
    setSelectedCompany('All')
    setMinSalaryLpa(0)
    setEligibleOnly(false)
    setRecencyFilter('all')
    setSelectedExperience([])
    setSelectedTech([])
    setSelectedEducation([])
    setSelectedStage([])
    setRemoteOnly(false)
    setMinMatch(0)
    setSavedOnly(false)
  }

  const hasActiveFilters =
    search ||
    selectedHub !== 'All' ||
    selectedCompany !== 'All' ||
    minSalaryLpa > 0 ||
    eligibleOnly ||
    recencyFilter !== 'all' ||
    selectedExperience.length > 0 ||
    selectedTech.length > 0 ||
    selectedEducation.length > 0 ||
    selectedStage.length > 0 ||
    remoteOnly ||
    minMatch > 0 ||
    savedOnly

  // Filter & Sort Logic
  const filteredOpportunities = useMemo(() => {
    return opportunities
      .filter((opp) => {
        // Indian Hub filter
        if (selectedHub !== 'All') {
          const hubDef = indianHubs.find((h) => h.id === selectedHub)
          if (hubDef && hubDef.pattern) {
            const reg = new RegExp(hubDef.pattern, 'i')
            if (!reg.test(opp.location)) return false
          }
        }

        // Famous Company filter
        if (selectedCompany !== 'All' && opp.company.toLowerCase() !== selectedCompany.toLowerCase()) {
          return false
        }

        // Salary in LPA filter
        if (minSalaryLpa > 0) {
          const jobMax = opp.salaryLpaMax || opp.salaryLpaMin || 0
          if (jobMax < minSalaryLpa) return false
        }

        // Eligibility Criteria filter (MCA / Fresher / Early Career)
        if (eligibleOnly) {
          const isElig = opp.eligibility
            ? opp.eligibility.isEligible
            : (opp.experience.includes('Fresher') || opp.experience.includes('0–') || opp.experience.includes('1–2') || opp.experience.includes('Intern'))
          if (!isElig) return false
        }

        // Recent Date & Time filter
        if (recencyFilter !== 'all') {
          const ageMs = Date.now() - opp.postedTimestamp
          if (recencyFilter === '24h' && ageMs > 24 * 3600 * 1000) return false
          if (recencyFilter === '3d' && ageMs > 3 * 24 * 3600 * 1000) return false
          if (recencyFilter === '7d' && ageMs > 7 * 24 * 3600 * 1000) return false
        }

        // Search
        if (search) {
          const q = search.toLowerCase()
          const matches =
            opp.company.toLowerCase().includes(q) ||
            opp.role.toLowerCase().includes(q) ||
            opp.location.toLowerCase().includes(q) ||
            opp.salaryRange?.toLowerCase().includes(q) ||
            opp.technologies.some((t) => t.toLowerCase().includes(q))
          if (!matches) return false
        }

        // Remote
        if (remoteOnly && !opp.remote) return false

        // Saved only
        if (savedOnly && !savedJobIds.has(opp.id)) return false

        // Min Match Score
        if (minMatch > 0 && opp.matchScore < minMatch) return false

        // Experience
        if (
          selectedExperience.length > 0 &&
          !selectedExperience.some((exp) => opp.experience.includes(exp))
        ) {
          return false
        }

        // Tech
        if (
          selectedTech.length > 0 &&
          !selectedTech.some((t) =>
            opp.technologies.some((tech) => tech.toLowerCase().includes(t.toLowerCase()))
          )
        ) {
          return false
        }

        // Education
        if (
          selectedEducation.length > 0 &&
          !selectedEducation.some((edu) => opp.education.includes(edu))
        ) {
          return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'date') return b.postedTimestamp - a.postedTimestamp
        if (sortBy === 'salary') return (b.salaryLpaMax || b.salaryLpaMin || 0) - (a.salaryLpaMax || a.salaryLpaMin || 0)
        if (sortBy === 'match') return b.matchScore - a.matchScore
        if (sortBy === 'company') return a.company.localeCompare(b.company)
        return 0
      })
  }, [
    opportunities,
    search,
    selectedHub,
    selectedCompany,
    minSalaryLpa,
    eligibleOnly,
    recencyFilter,
    remoteOnly,
    savedOnly,
    minMatch,
    selectedExperience,
    selectedTech,
    selectedEducation,
    savedJobIds,
    sortBy,
  ])

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Job Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover and prioritize early-career engineering roles that match your profile.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openDiscoveryModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run Discovery</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Search, Filters Toggle, Sort, View Toggle */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company, role (e.g. React, Full Stack), or keyword..."
              className="w-full pl-9 pr-8 py-2 text-xs font-medium text-slate-800 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Toolbar Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all ${
                showFilters || hasActiveFilters
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-blue-600 ml-0.5"></span>
              )}
            </button>

            {/* Saved Toggle */}
            <button
              onClick={() => setSavedOnly(!savedOnly)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all ${
                savedOnly
                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved ({savedJobIds.size})</span>
            </button>

            {/* Remote Quick Filter */}
            <button
              onClick={() => setRemoteOnly(!remoteOnly)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all ${
                remoteOnly
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Remote Only</span>
            </button>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-blue-600 transition-colors shadow-2xs"
            >
              <option value="date">Sort: Most Recent (Date & Time)</option>
              <option value="salary">Sort: Highest Salary (LPA)</option>
              <option value="match">Sort: Match Score</option>
              <option value="company">Sort: Company Name</option>
            </select>

            {/* View Mode Grid / Table */}
            <div className="hidden sm:flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Indian IT Hubs Quick Filter Bar */}
        <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Indian IT Hubs:
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {indianHubs.map((hub) => {
              const count =
                hub.id === 'All'
                  ? opportunities.length
                  : opportunities.filter((o) => {
                      const reg = new RegExp(hub.pattern, 'i')
                      return reg.test(o.location)
                    }).length
              const active = selectedHub === hub.id

              return (
                <button
                  key={hub.id}
                  onClick={() => setSelectedHub(hub.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                  }`}
                >
                  <span>{hub.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      active ? 'bg-blue-700 text-blue-100' : 'bg-white text-slate-500 border border-slate-200/60'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Famous Companies of India Quick Filter Bar */}
        {availableCompanies.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 shrink-0">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Famous Companies:
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                onClick={() => setSelectedCompany('All')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedCompany === 'All'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                }`}
              >
                <span>All Companies</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCompany === 'All'
                      ? 'bg-blue-700 text-blue-100'
                      : 'bg-white text-slate-500 border border-slate-200/60'
                  }`}
                >
                  {opportunities.length}
                </span>
              </button>
              {availableCompanies.map((comp) => {
                const count = opportunities.filter((o) => o.company.toLowerCase() === comp.toLowerCase()).length
                const active = selectedCompany.toLowerCase() === comp.toLowerCase()
                return (
                  <button
                    key={comp}
                    onClick={() => setSelectedCompany(comp)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      active
                        ? 'bg-blue-600 text-white shadow-xs font-semibold'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                    }`}
                  >
                    <span>{comp}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        active ? 'bg-blue-700 text-blue-100' : 'bg-white text-slate-500 border border-slate-200/60'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Salary in LPA Criteria & Recency & Eligibility Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Salary in LPA Criteria */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 whitespace-nowrap">
              <span>💰</span> Salary Criteria:
            </span>
            <div className="flex items-center gap-1">
              {lpaRanges.map((rng) => {
                const active = minSalaryLpa === rng.id
                return (
                  <button
                    key={rng.id}
                    onClick={() => setMinSalaryLpa(rng.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      active
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
                    }`}
                  >
                    {rng.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {/* Recency Date Filter */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/70">
              <Clock className="w-3.5 h-3.5 text-slate-400 ml-1" />
              {recencyOptions.map((opt) => {
                const active = recencyFilter === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => setRecencyFilter(opt.id as any)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      active
                        ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>

            {/* MCA / Fresher Eligible Only Toggle */}
            <button
              onClick={() => setEligibleOnly(!eligibleOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                eligibleOnly
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>MCA / Fresher Eligible</span>
            </button>
          </div>
        </div>

        {/* Expandable Advanced Filter Panel */}
        {showFilters && (
          <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
            {/* Experience Pills */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Experience Level
              </div>
              <div className="flex flex-wrap gap-1.5">
                {expOptions.map((exp) => {
                  const active = selectedExperience.includes(exp)
                  return (
                    <button
                      key={exp}
                      onClick={() =>
                        toggleArrayFilter(exp, selectedExperience, setSelectedExperience)
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        active
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {exp}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Technology Pills */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Technology
              </div>
              <div className="flex flex-wrap gap-1.5">
                {techOptions.map((t) => {
                  const active = selectedTech.includes(t)
                  return (
                    <button
                      key={t}
                      onClick={() => toggleArrayFilter(t, selectedTech, setSelectedTech)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        active
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Education Degree */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Education
              </div>
              <div className="flex flex-wrap gap-1.5">
                {eduOptions.map((edu) => {
                  const active = selectedEducation.includes(edu)
                  return (
                    <button
                      key={edu}
                      onClick={() =>
                        toggleArrayFilter(edu, selectedEducation, setSelectedEducation)
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        active
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {edu}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Match Score Minimum */}
            <div className="flex items-center gap-4 pt-1">
              <span className="text-xs font-semibold text-slate-600">
                Minimum Match Score: {minMatch > 0 ? `${minMatch}%` : 'Any'}
              </span>
              <input
                type="range"
                min="0"
                max="95"
                step="5"
                value={minMatch}
                onChange={(e) => setMinMatch(Number(e.target.value))}
                className="w-48 accent-blue-600"
              />
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 ml-auto"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-800">{filteredOpportunities.length}</strong>{' '}
          opportunities
        </span>
        <span className="font-mono text-[11px]">Ranked by Profile Fit (MCA / Fresher)</span>
      </div>

      {/* Empty State */}
      {filteredOpportunities.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No matching opportunities</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Try adjusting your technology or experience filters, or run a new discovery scan to
              fetch fresh openings.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Reset Filters
            </button>
            <button
              onClick={openDiscoveryModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
            >
              Run Discovery
            </button>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredOpportunities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOpportunities.map((opp) => {
            const isSaved = savedJobIds.has(opp.id)
            const lead = contacts.find((c) => c.id === opp.contactId)

            return (
              <div
                key={opp.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between p-5 group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                        {opp.company.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm truncate">{opp.company}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{opp.location}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSaveJob(opp.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isSaved
                          ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                      aria-label="Save opportunity"
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-600" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Role Title & Badges */}
                  <div className="mt-3.5 space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-1">
                      {opp.role}
                    </h3>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Salary in LPA */}
                      <span className="font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 shadow-2xs">
                        <span>💰</span>
                        <span>{opp.salaryRange || '₹12.0 LPA – ₹20.0 LPA'}</span>
                      </span>

                      {/* Eligibility Badge */}
                      <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1">
                        <Check className="w-3 h-3 text-blue-600" />
                        <span>{opp.eligibility?.summary || 'Eligible: MCA / Freshers'}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {opp.experience}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600 text-[11px]">{opp.employmentType}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        2024–2026 Batches
                      </span>
                    </div>
                  </div>

                  {/* Tech stack badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {opp.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                      >
                        {tech}
                      </span>
                    ))}
                    {opp.technologies.length > 4 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 font-mono">
                        +{opp.technologies.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Match & Hiring Contact Info */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <MatchScoreBadge score={opp.matchScore} size="sm" />
                    {lead ? (
                      <button
                        onClick={() => openContactDrawer(lead)}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                      >
                        <Users2 className="w-3.5 h-3.5" />
                        <span>Hiring Lead</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Public scan</span>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{opp.postedDate}</span>
                    {opp.postedRelative && (
                      <span className="text-slate-400 font-normal">({opp.postedRelative})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {lead && (
                      <button
                        onClick={() => openContactDrawer(lead)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                      >
                        Contact
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/opportunities/${opp.id}`)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>View</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && filteredOpportunities.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Role & Company</th>
                  <th className="py-3 px-3">Salary (LPA)</th>
                  <th className="py-3 px-3">Location & Hub</th>
                  <th className="py-3 px-3">Eligibility</th>
                  <th className="py-3 px-3">Experience</th>
                  <th className="py-3 px-3">Tech Stack</th>
                  <th className="py-3 px-3">Match</th>
                  <th className="py-3 px-3">Posted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOpportunities.map((opp) => {
                  const lead = contacts.find((c) => c.id === opp.contactId)
                  const isSaved = savedJobIds.has(opp.id)

                  return (
                    <tr key={opp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{opp.role}</div>
                        <div className="text-[11px] text-slate-500 font-semibold">{opp.company}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded text-[11px] whitespace-nowrap">
                          {opp.salaryRange || '₹12.0 LPA – ₹20.0 LPA'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{opp.location}</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 rounded whitespace-nowrap">
                          {opp.eligibility?.summary || 'Eligible: MCA / Freshers'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{opp.experience}</td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {opp.technologies.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <MatchScoreBadge score={opp.matchScore} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                        {opp.postedRelative || opp.postedDate}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => toggleSaveJob(opp.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isSaved
                              ? 'border-amber-300 bg-amber-50 text-amber-700'
                              : 'border-slate-200 text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/opportunities/${opp.id}`)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
