import { Company, Contact, Opportunity } from '../types'

export interface JobDiscoveryFilterParams {
  query?: string
  location?: string
  sites?: string[]
  hoursOld?: number
  remote?: boolean
  experience?: string[]
  technologies?: string[]
  education?: string[]
}

export interface DiscoveryRunResult {
  newJobs: Opportunity[]
  companies: Company[]
  contacts: Contact[]
  discoveredCount: number
  strongMatchesCount: number
  contactsCount: number
  sources: string[]
  scrapedAt: string
}

export interface JobDiscoveryService {
  getJobs(): Promise<Opportunity[]>
  getJobById(id: string): Promise<Opportunity | undefined>
  runDiscovery(
    paramsOrQuery?: string | JobDiscoveryFilterParams,
    onProgress?: (step: string, percent: number) => void
  ): Promise<DiscoveryRunResult>
  saveJob(id: string, isSaved: boolean): Promise<boolean>
}

class JobSpyDiscoveryService implements JobDiscoveryService {
  private jobs: Opportunity[] = []

  async getJobs(): Promise<Opportunity[]> {
    return [...this.jobs]
  }

  async getJobById(id: string): Promise<Opportunity | undefined> {
    return this.jobs.find((j) => j.id === id)
  }

  async runDiscovery(
    paramsOrQuery?: string | JobDiscoveryFilterParams,
    onProgress?: (step: string, percent: number) => void
  ): Promise<DiscoveryRunResult> {
    let query = ''
    let location = ''
    let sites: string[] = ['naukri', 'indeed', 'linkedin', 'glassdoor']
    let hoursOld = 168

    if (typeof paramsOrQuery === 'string') {
      query = paramsOrQuery
    } else if (paramsOrQuery) {
      query = paramsOrQuery.query || ''
      location = paramsOrQuery.location || ''
      if (paramsOrQuery.sites && paramsOrQuery.sites.length > 0) {
        sites = paramsOrQuery.sites
      }
      if (paramsOrQuery.hoursOld) {
        hoursOld = paramsOrQuery.hoursOld
      }
    }

    if (onProgress) onProgress('Connecting to python-jobspy multi-board engine...', 15)

    const searchParams = new URLSearchParams()
    if (query) searchParams.set('query', query)
    if (location) searchParams.set('location', location)
    if (sites.length) searchParams.set('sites', sites.join(','))
    searchParams.set('maxJobs', '35')
    searchParams.set('hoursOld', String(hoursOld))

    const url = `/api/scrape/jobs?${searchParams.toString()}`

    try {
      if (onProgress) {
        const target = location ? `${location}` : 'Indian tech hubs (Bengaluru, Pune, Hyderabad, NCR)'
        onProgress(`Querying JobSpy across ${target} on Naukri, Indeed, LinkedIn & Glassdoor...`, 35)
      }

      await new Promise((r) => setTimeout(r, 200))

      if (onProgress) {
        onProgress('Harvesting live tech postings and authentic LPA salary metrics...', 60)
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`JobSpy Scraper API returned HTTP ${response.status}`)
      }

      if (onProgress) {
        onProgress('Executing RFC-5321 DNS MX verification & calculating match scores...', 85)
      }

      const data = await response.json()
      const newJobs: Opportunity[] = data.opportunities || []
      const companies: Company[] = data.companies || []
      const contacts: Contact[] = data.contacts || []

      this.jobs = newJobs

      if (onProgress) {
        onProgress(`Discovery complete: ${newJobs.length} live vacancies harvested via JobSpy.`, 100)
      }

      const strongMatchesCount = newJobs.filter((j) => j.matchScore >= 80).length

      return {
        newJobs,
        companies,
        contacts,
        discoveredCount: newJobs.length,
        strongMatchesCount,
        contactsCount: contacts.length,
        sources: data.sources || [
          'JobSpy (Naukri)',
          'JobSpy (Indeed India)',
          'JobSpy (LinkedIn)',
          'JobSpy (Glassdoor)',
        ],
        scrapedAt: data.scrapedAt || new Date().toISOString(),
      }
    } catch (err: unknown) {
      const error = err as Error
      console.error('[JobSpy Discovery Service Error]', error)
      throw new Error(`JobSpy Discovery failed: ${error.message || 'Unable to connect to JobSpy engine'}`)
    }
  }

  async saveJob(id: string, isSaved: boolean): Promise<boolean> {
    const job = this.jobs.find((j) => j.id === id)
    if (job) {
      job.status = isSaved ? 'saved' : 'active'
      return true
    }
    return false
  }
}

export const jobDiscoveryService = new JobSpyDiscoveryService()
