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
  eligibleDegrees: string[] // e.g. ['MCA', 'BCA', 'B.Tech', 'BE', 'CS Graduate']
  experienceRange: string // e.g. 'Freshers / 0–2 years'
  eligibleBatches: string[] // e.g. ['2024', '2025', '2026 Batch']
  minMatchPercent: number // e.g. 75
  isEligible: boolean // true for candidate
  summary: string // e.g. 'Eligible: MCA / Freshers & 0–2 Yrs'
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
  remote: boolean
  experience: 'Internship' | 'Fresher' | '0–1 years' | '0–2 years' | '1–2 years' | '2–3 years'
  employmentType: 'Full-time' | 'Internship' | 'Contract'
  technologies: string[]
  education: string[]
  postedDate: string // e.g. "Today at 02:15 PM" or "Oct 8, 2026"
  postedRelative?: string // e.g. "2 hours ago", "Today"
  postedTimestamp: number
  source:
    | 'LinkedIn Jobs'
    | 'Wellfound'
    | 'Careers Page'
    | 'X / Twitter'
    | 'Cutshort'
    | 'Y Combinator'
    | 'Hacker News'
    | 'Arbeitnow'
    | 'RemoteOK'
    | 'Jobicy'
    | string
  sourceUrl: string
  matchScore: number
  matchBreakdown: MatchBreakdown
  contactId?: string
  status: JobStatus
  salaryRange: string // e.g. "₹14 LPA – ₹22 LPA"
  salaryLpaMin?: number // e.g. 14
  salaryLpaMax?: number // e.g. 22
  eligibility: EligibilityCriteria
  requirements: string[]
  niceToHave: string[]
  prototypeIdea: PrototypeIdea
  isMockData?: boolean
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
