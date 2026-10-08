import { Company, Contact, Opportunity, Outreach, SystemActivity, FilterState } from '../types'

/**
 * Initial state sets: zero mock or demo data.
 * All opportunities, companies, and contacts are discovered live via real-time scraping.
 */
export const INITIAL_COMPANIES: Company[] = []

export const INITIAL_OPPORTUNITIES: Opportunity[] = []

export const INITIAL_CONTACTS: Contact[] = []

export const INITIAL_OUTREACH: Outreach[] = []

export const INITIAL_SYSTEM_ACTIVITIES: SystemActivity[] = []

export const DEFAULT_FILTER_STATE: FilterState = {
  search: '',
  location: '',
  remoteOnly: false,
  experience: [],
  jobType: [],
  technologies: [],
  education: [],
  companyStage: [],
  minMatchScore: 0,
  sortBy: 'match',
}
