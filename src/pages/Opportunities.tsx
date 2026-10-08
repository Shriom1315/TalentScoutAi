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
  CheckCircle2,
  IndianRupee,
  Calendar,
  Award,
  Globe2,
  Radio,
  Flame,
  Briefcase,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { MatchScoreBadge, Badge } from '../components/common/Badge'
import { Opportunity } from '../types'

export const Opportunities: React.FC = () => {
  const navigate = useNavigate()
  const {
    opportunities,
    contacts,
    savedJobIds,
    toggleSaveJob,
    openContactDrawer,
    openOutreachModal,
    openDiscoveryModal,
    runDiscovery,
    isDiscovering,
  } = useApp()

  // Filter States
  const [search, setSearch] = useState('')
  const [selectedHub, setSelectedHub] = useState<string>('All')
  const [selectedBoard, setSelectedBoard] = useState<string>('All')
  const [selectedCompany, setSelectedCompany] = useState<string>('All')
  const [selectedLpaTier, setSelectedLpaTier] = useState<string>('All')
  const [selectedExpBracket, setSelectedExpBracket] = useState<string>('All')
  const [selectedFreshness, setSelectedFreshness] = useState<string>('All')
  const [eligibleOnly, setEligibleOnly] = useState<boolean>(false)
  const [famousOnly, setFamousOnly] = useState<boolean>(false)
  const [selectedTech, setSelectedTech] = useState<string[]>([])
  const [selectedEducation, setSelectedEducation] = useState<string[]>([])
  const [selectedStage, setSelectedStage] = useState<string[]>([])
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [minMatch, setMinMatch] = useState<number>(0)
  const [sortBy, setSortBy] = useState<'match' | 'date' | 'salary' | 'company'>('match')
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

  const jobspyBoards = [
    { id: 'All', label: 'All JobSpy Boards' },
    { id: 'naukri', label: 'Naukri' },
    { id: 'indeed', label: 'Indeed (India)' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'glassdoor', label: 'Glassdoor' },
  ]

  const lpaOptions = [
    { id: 'All', label: 'All LPA' },
    { id: '6', label: '₹6+ LPA' },
    { id: '10', label: '₹10+ LPA' },
    { id: '14', label: '₹14+ LPA' },
    { id: '18', label: '₹18+ LPA' },
  ]

  const freshnessOptions = [
    { id: 'All', label: 'All Dates' },
    { id: 'today', label: 'Posted Today' },
    { id: '3d', label: 'Past 3 Days' },
    { id: 'week', label: 'Past Week' },
  ]

  const famousCompanyOptions = [
    'All',
    'Meesho',
    'CRED',
    'InMobi',
    'Mindtickle',
    'PubMatic',
    'Druva',
    'Zeta',
    'Pocket FM',
    'Porter',
    'Qualcomm',
    'Rubrik',
    'Amazon',
    'Bosch',
  ]

  const techOptions = [
    'React',
    'Node.js',
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'SQL',
    'Full Stack',
  ]
  const expBrackets = [
    { id: 'All', label: 'All Experience' },
    { id: 'fresher', label: 'Fresher (0–1 Yrs)' },
    { id: 'entry', label: '0–2 Yrs (Entry Level)' },
    { id: 'early', label: '1–3 Yrs (Early Career)' },
    { id: 'mid', label: '3–5 Yrs (Mid-Level)' },
    { id: 'senior', label: '5+ Yrs (Senior / Lead)' },
    { id: 'intern', label: 'Internships' },
  ]

  const matchesExperienceBracket = (opp: Opportunity, bracketId: string): boolean => {
    if (bracketId === 'All') return true
    const expLower = (opp.experience || '').toLowerCase()
    const minE = opp.minExpYears ?? (
      expLower.includes('intern') ? 0 :
      expLower.includes('5+') || expLower.includes('senior') || expLower.includes('lead') ? 5 :
      expLower.includes('3–5') || expLower.includes('3-5') ? 3 :
      expLower.includes('2–4') || expLower.includes('2-4') ? 2 :
      expLower.includes('1–3') || expLower.includes('1-3') ? 1 :
      expLower.includes('0–2') || expLower.includes('0-2') ? 0 :
      expLower.includes('0–1') || expLower.includes('0-1') || expLower.includes('fresher') ? 0 : 0
    )
    const maxE = opp.maxExpYears ?? (
      expLower.includes('intern') ? 0 :
      expLower.includes('5+') || expLower.includes('senior') || expLower.includes('lead') ? 10 :
      expLower.includes('3–5') || expLower.includes('3-5') ? 5 :
      expLower.includes('2–4') || expLower.includes('2-4') ? 4 :
      expLower.includes('1–3') || expLower.includes('1-3') ? 3 :
      expLower.includes('0–2') || expLower.includes('0-2') ? 2 :
      expLower.includes('0–1') || expLower.includes('0-1') || expLower.includes('fresher') ? 1 : 2
    )

    if (bracketId === 'intern') {
      return expLower.includes('intern') || (minE === 0 && maxE === 0)
    }
    if (bracketId === 'fresher') {
      return !expLower.includes('intern') && minE <= 1
    }
    if (bracketId === 'entry') {
      return !expLower.includes('intern') && minE <= 2
    }
    if (bracketId === 'early') {
      return minE <= 3 && maxE >= 1
    }
    if (bracketId === 'mid') {
      return (minE >= 3 && minE <= 5) || (maxE >= 3 && maxE <= 5) || expLower.includes('3–5') || expLower.includes('2–4')
    }
    if (bracketId === 'senior') {
      return minE >= 4 || maxE >= 5 || expLower.includes('senior') || expLower.includes('lead') || expLower.includes('5+')
    }
    return true
  }

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
    setSelectedBoard('All')
    setSelectedCompany('All')
    setSelectedLpaTier('All')
    setSelectedExpBracket('All')
    setSelectedFreshness('All')
    setEligibleOnly(false)
    setFamousOnly(false)
    setSelectedTech([])
    setSelectedEducation([])
    setSelectedStage([])
    setRemoteOnly(false)
    setMinMatch(0)
    setSavedOnly(false)
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

  const hasActiveFilters =
    search ||
    selectedHub !== 'All' ||
    selectedBoard !== 'All' ||
    selectedCompany !== 'All' ||
    selectedLpaTier !== 'All' ||
    selectedExpBracket !== 'All' ||
    selectedFreshness !== 'All' ||
    eligibleOnly ||
    famousOnly ||
    selectedTech.length > 0 ||
    selectedEducation.length > 0 ||
    selectedStage.length > 0 ||
    remoteOnly ||
    savedOnly ||
    minMatch > 0

  // Filtered and Sorted Opportunities
  const filteredOpportunities = useMemo(() => {
    return opportunities
      .filter((opp) => {
        // Search Term
        if (search) {
          const q = search.toLowerCase()
          const matched =
            opp.role.toLowerCase().includes(q) ||
            opp.company.toLowerCase().includes(q) ||
            opp.description.toLowerCase().includes(q) ||
            opp.technologies.some((t) => t.toLowerCase().includes(q)) ||
            opp.location.toLowerCase().includes(q)
          if (!matched) return false
        }

        // JobSpy Board
        if (selectedBoard !== 'All') {
          const b = selectedBoard.toLowerCase()
          const site = (opp.jobspySite || opp.source || '').toLowerCase()
          if (!site.includes(b)) return false
        }

        // Indian IT Hub
        if (selectedHub !== 'All') {
          const hubObj = indianHubs.find((h) => h.id === selectedHub)
          if (hubObj && hubObj.pattern) {
            const reg = new RegExp(hubObj.pattern, 'i')
            if (!reg.test(opp.location)) return false
          }
        }

        // Salary in LPA
        if (selectedLpaTier !== 'All') {
          const minRequired = parseFloat(selectedLpaTier)
          const oppLpa = opp.salaryLpa || opp.salaryMaxLpa || opp.salaryMinLpa || 0
          if (oppLpa < minRequired) return false
        }

        // Posting Freshness
        if (selectedFreshness !== 'All') {
          const now = Date.now()
          const ageHours = (now - opp.postedTimestamp) / (1000 * 60 * 60)
          if (selectedFreshness === 'today' && ageHours > 24) return false
          if (selectedFreshness === '3d' && ageHours > 72) return false
          if (selectedFreshness === 'week' && ageHours > 168) return false
        }

        // MCA / Fresher Eligibility
        if (eligibleOnly && !opp.eligibility?.isEligible) {
          return false
        }

        // Top Company Tier
        if (famousOnly && !opp.isFamousCompany) {
          return false
        }

        // Company filter
        if (selectedCompany !== 'All') {
          if (!opp.company.toLowerCase().includes(selectedCompany.toLowerCase())) {
            return false
          }
        }

        // Remote
        if (remoteOnly && !opp.remote) return false

        // Saved
        if (savedOnly && !savedJobIds.has(opp.id)) return false

        // Minimum match score
        if (opp.matchScore < minMatch) return false

        // Required Experience Bracket
        if (selectedExpBracket !== 'All') {
          if (!matchesExperienceBracket(opp, selectedExpBracket)) return false
        }

        // Tech stack
        if (
          selectedTech.length > 0 &&
          !selectedTech.some((t) => opp.technologies.includes(t))
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
        if (sortBy === 'match') return b.matchScore - a.matchScore
        if (sortBy === 'date') return b.postedTimestamp - a.postedTimestamp
        if (sortBy === 'salary') return (b.salaryLpa || b.salaryMinLpa || 0) - (a.salaryLpa || a.salaryMinLpa || 0)
        if (sortBy === 'company') return a.company.localeCompare(b.company)
        return 0
      })
  }, [
    opportunities,
    search,
    selectedHub,
    selectedBoard,
    selectedCompany,
    selectedLpaTier,
    selectedExpBracket,
    selectedFreshness,
    eligibleOnly,
    famousOnly,
    remoteOnly,
    savedOnly,
    minMatch,
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
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Job Opportunities
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              100% Pure JobSpy Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Live tech openings harvested in real time from Naukri, Indeed (India), LinkedIn & Glassdoor with authentic LPA compensation and direct ATS application links.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200/80 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
            <span>{opportunities.length} Harvested Roles</span>
          </div>
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
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                showFilters || hasActiveFilters
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              )}
            </button>

            {/* MCA / Fresher Eligible Quick Pill */}
            <button
              onClick={() => setEligibleOnly(!eligibleOnly)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                eligibleOnly
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${eligibleOnly ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>MCA / Fresher Eligible</span>
            </button>

            {/* Top Unicorns Quick Pill */}
            <button
              onClick={() => setFamousOnly(!famousOnly)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                famousOnly
                  ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Award className={`w-3.5 h-3.5 ${famousOnly ? 'text-amber-600' : 'text-slate-400'}`} />
              <span>Top Tech Leaders</span>
            </button>

            {/* Saved Jobs Toggle */}
            <button
              onClick={() => setSavedOnly(!savedOnly)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                savedOnly
                  ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${savedOnly ? 'text-amber-600 fill-amber-500' : 'text-slate-400'}`} />
              <span>Saved ({savedJobIds.size})</span>
            </button>

            {/* Remote Only */}
            <button
              onClick={() => setRemoteOnly(!remoteOnly)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                remoteOnly
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Remote Only
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-blue-600 transition-colors shadow-2xs"
            >
              <option value="match">Sort: Match Score</option>
              <option value="salary">Sort: Highest Salary (LPA)</option>
              <option value="date">Sort: Most Recent Date & Time</option>
              <option value="company">Sort: Company Name</option>
            </select>

            {/* View Mode Grid / Table */}
            <div className="hidden sm:flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
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
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
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

        {/* JobSpy Source Board Bar */}
        <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 shrink-0">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Globe2 className="w-3.5 h-3.5 text-blue-600" />
              JobSpy Boards:
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {jobspyBoards.map((board) => {
              const count =
                board.id === 'All'
                  ? opportunities.length
                  : opportunities.filter((o) => {
                      const site = (o.jobspySite || o.source || '').toLowerCase()
                      return site.includes(board.id.toLowerCase())
                    }).length
              const active = selectedBoard === board.id

              return (
                <button
                  key={board.id}
                  onClick={() => setSelectedBoard(board.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                  }`}
                >
                  <span>{board.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      active ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-500 border border-slate-200/60'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Indian IT Hubs Quick Filter Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 shrink-0">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
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

        {/* Salary in LPA Quick Filter Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              Salary (LPA Criteria):
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {lpaOptions.map((opt) => {
              const active = selectedLpaTier === opt.id
              const count =
                opt.id === 'All'
                  ? opportunities.length
                  : opportunities.filter((o) => {
                      const lpa = o.salaryLpa || o.salaryMaxLpa || o.salaryMinLpa || 0
                      return lpa >= parseFloat(opt.id)
                    }).length

              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedLpaTier(opt.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      active ? 'bg-emerald-700 text-emerald-100' : 'bg-white text-slate-500 border border-slate-200/60'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Required Experience Quick Filter Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-amber-600" />
              Required Experience:
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {expBrackets.map((bracket) => {
              const active = selectedExpBracket === bracket.id
              const count =
                bracket.id === 'All'
                  ? opportunities.length
                  : opportunities.filter((o) => matchesExperienceBracket(o, bracket.id)).length

              return (
                <button
                  key={bracket.id}
                  onClick={() => setSelectedExpBracket(bracket.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-amber-600 text-white shadow-xs font-semibold'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                  }`}
                >
                  <span>{bracket.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      active ? 'bg-amber-700 text-amber-100' : 'bg-white text-slate-500 border border-slate-200/60'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Posting Freshness & Top Companies Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 shrink-0">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              Posting Freshness:
            </span>
            <div className="flex items-center gap-1.5">
              {freshnessOptions.map((f) => {
                const active = selectedFreshness === f.id
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFreshness(f.id)}
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      active
                        ? 'bg-blue-600 text-white shadow-xs font-semibold'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    {f.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              Top Company:
            </span>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-blue-600"
            >
              {famousCompanyOptions.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Famous Companies' : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Expandable Advanced Filter Panel */}
        {showFilters && (
          <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">

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
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
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
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
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

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500">
                Active filters: {filteredOpportunities.length} of {opportunities.length} roles shown
              </span>
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          Showing <span className="font-bold text-slate-800">{filteredOpportunities.length}</span> opportunities
          {hasActiveFilters && ' (filtered)'}
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          Ranked by Profile Fit (MCA / Fresher)
        </div>
      </div>

      {/* Empty State */}
      {filteredOpportunities.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">No opportunities match criteria</h3>
            <p className="text-xs text-slate-500">
              Try resetting your filters or run a live JobSpy scrape for a new role or hub.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Clear All Filters
            </button>
            <button
              onClick={openDiscoveryModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run Discovery</span>
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
            const boardBadge = getJobspyBadge(opp)

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
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-sm truncate">{opp.company}</span>
                          {opp.isFamousCompany && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                              <Award className="w-2.5 h-2.5 text-amber-600" />
                              {opp.companyTier || 'Unicorn'}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{opp.location}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSaveJob(opp.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
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

                  {/* Role Title */}
                  <div className="mt-3.5">
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-1">
                      {opp.role}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {opp.experience}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600 text-[11px]">{opp.employmentType}</span>
                    </div>
                  </div>

                  {/* JobSpy Source Badge + Salary in LPA & Eligibility Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    {/* JobSpy Source Badge */}
                    <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${boardBadge.bg}`}>
                      <Globe2 className="w-3 h-3 shrink-0" />
                      <span>{boardBadge.name}</span>
                    </span>

                    {/* Salary LPA */}
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                      <IndianRupee className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{opp.salaryRange ? opp.salaryRange.replace(/^₹\s*/, '') : (opp.salaryLpa ? `${opp.salaryLpa} LPA` : 'Competitive LPA')}</span>
                    </div>

                    {/* Eligibility Badge */}
                    {opp.eligibility?.isEligible ? (
                      <div
                        className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-50/90 text-emerald-700 border border-emerald-200"
                        title={opp.eligibility.reason}
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>MCA / Fresher Fit</span>
                      </div>
                    ) : (
                      <div
                        className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500"
                        title={opp.eligibility?.reason}
                      >
                        <span>Req: {opp.eligibility?.minExp ?? 0}–{opp.eligibility?.maxExp ?? 3}y</span>
                      </div>
                    )}
                  </div>

                  {/* Tech stack badges */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
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
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <MatchScoreBadge score={opp.matchScore} size="sm" />
                    {lead ? (
                      <button
                        onClick={() => openContactDrawer(lead)}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Users2 className="w-3.5 h-3.5" />
                        <span>Hiring Lead</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">JobSpy Verified</span>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium truncate max-w-[45%]">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{opp.postedTimeFormatted || opp.postedDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Direct ATS Link */}
                    <a
                      href={opp.directUrl || opp.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Direct application on ATS / platform"
                    >
                      <span>Apply</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => navigate(`/opportunities/${opp.id}`)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
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
                  <th className="py-3 px-3">Board (JobSpy)</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Salary (LPA)</th>
                  <th className="py-3 px-3">Eligibility</th>
                  <th className="py-3 px-3">Match</th>
                  <th className="py-3 px-3">Posted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOpportunities.map((opp) => {
                  const isSaved = savedJobIds.has(opp.id)
                  const boardBadge = getJobspyBadge(opp)

                  return (
                    <tr key={opp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{opp.role}</div>
                        <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                          <span>{opp.company}</span>
                          {opp.isFamousCompany && (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 rounded border border-amber-200">
                              {opp.companyTier || 'Unicorn'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${boardBadge.bg}`}>
                          <span>{boardBadge.name}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{opp.location}</td>
                      <td className="py-3 px-3 font-bold text-emerald-700 whitespace-nowrap">
                        <div className="flex items-center gap-0.5">
                          <IndianRupee className="w-3 h-3 text-emerald-600" />
                          <span>{opp.salaryRange ? opp.salaryRange.replace(/^₹\s*/, '') : (opp.salaryLpa ? `${opp.salaryLpa} LPA` : 'Competitive')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {opp.eligibility?.isEligible ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Eligible
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">{opp.experience}</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <MatchScoreBadge score={opp.matchScore} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{opp.postedTimeFormatted || opp.postedDate}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <a
                          href={opp.directUrl || opp.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 inline-flex items-center gap-1"
                        >
                          <span>Apply</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => toggleSaveJob(opp.id)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isSaved
                              ? 'border-amber-300 bg-amber-50 text-amber-700'
                              : 'border-slate-200 text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/opportunities/${opp.id}`)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 cursor-pointer"
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
