export type EmailStatus =
  | 'Verified'
  | 'High confidence'
  | 'LinkedIn only'
  | 'Company contact'
  | 'Needs verification'

export type OutreachStatus = 'draft' | 'ready' | 'sent' | 'follow-up'

export type JobStatus = 'active' | 'saved' | 'applied' | 'archived'

export type CompanyStage = 'Seed' | 'Pre-Series A' | 'Series A' | 'Series B+' | 'Bootstrapped' | 'Public'

export interface MatchBreakdown {
  technicalSkills: number
  experience: number
  education: number
  location: number
  roleAlignment: number
}

export interface PrototypeIdea {
  problem: string
  title: string
  description: string
  whyItMatches: string
  estimatedEffort: string
  techStack: string[]
  keyFeatures: string[]
}

export interface EligibilityCriteria {
  degrees: string[]
  experienceYears: string
  batch: string[]
  isEligible: boolean
  eligibilitySummary?: string
  matchReason?: string
  degreeEligible?: boolean
  experienceEligible?: boolean
  batchEligible?: boolean
  minExp?: number
  maxExp?: number
  reason?: string
}

export interface Opportunity {
  id: string
  company: string
  companyId: string
  companyWebsite: string
  companyLogo?: string
  role: string
  description: string
  location: string
  remote?: boolean
  experience: string // e.g. "Fresher", "0–2 years", "1–3 years", "3–5 years", "5+ years", "Internship"
  minExpYears?: number
  maxExpYears?: number
  employmentType: 'Full-time' | 'Internship' | 'Contract'
  technologies: string[]
  education: string[]
  postedDate: string // e.g. "Today at 07:15 PM"
  postedTimestamp: number
  postedTimeFormatted?: string // e.g. "Oct 8, 2026 • 07:15 PM"
  source: string
  sourceUrl: string
  matchScore: number
  matchBreakdown: MatchBreakdown
  contactId?: string
  status: JobStatus
  salaryRange: string // e.g. "₹12 – 18 LPA"
  salaryLpa?: number // numeric LPA value for filtering/sorting
  salaryMinLpa?: number
  salaryMaxLpa?: number
  eligibility?: EligibilityCriteria
  isFamousCompany?: boolean
  companyTier?: 'Unicorn' | 'Tier-1 Tech' | 'Growth Leader' | 'Global Tech'
  requirements: string[]
  niceToHave: string[]
  prototypeIdea: PrototypeIdea
  isMockData?: boolean
  jobspySite?: string
  directUrl?: string
}


export interface Contact {
  id: string
  name: string
  role: string
  company: string
  companyId: string
  avatar?: string
  linkedinUrl: string
  email: string
  emailStatus: EmailStatus
  source: string // e.g. "Company Website (Engineering Blog)", "GitHub Commit & Domain Record", "Public Recruiter Post", etc.
  confidence: number // e.g. 94%
  relatedOpportunityId: string
  whyRelevant: string
  department: 'Founder / Leadership' | 'Engineering' | 'Talent / HR' | 'Product'
  location?: string
  verifiedAt?: string
  companyWebsite?: string
  twitterUrl?: string
  githubUrl?: string
  careersUrl?: string
  mxValid?: boolean
  provider?: string
  relatedAccounts?: Array<{ platform: string; url: string; type?: string }>
  isMockData?: boolean
}

export interface Outreach {
  id: string
  contactId: string
  opportunityId: string
  company: string
  contactName: string
  contactRole: string
  jobTitle: string
  subject: string
  body: string
  status: OutreachStatus
  createdAt: string
  followUpDate?: string
  keyPoints: string[]
  notes?: string
}

export interface Company {
  id: string
  name: string
  website: string
  logo?: string
  industry: string
  stage: CompanyStage
  location: string
  employeeRange: string
  description: string
  funding?: string
  foundedYear: number
  techStackHighlights: string[]
}

export interface SystemActivity {
  id: string
  title: string
  description: string
  timestamp: string
  timestampMs: number
  type: 'discovery' | 'verified' | 'filter' | 'score' | 'outreach'
}

export interface FilterState {
  search: string
  location: string
  remoteOnly: boolean
  experience: string[]
  jobType: string[]
  technologies: string[]
  education: string[]
  companyStage: string[]
  minMatchScore: number
  sortBy: 'match' | 'date' | 'company'
}
