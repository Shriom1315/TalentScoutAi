import { Company } from '../types'

export interface CompanyResearchService {
  getCompanies(): Promise<Company[]>
  getCompanyById(id: string): Promise<Company | undefined>
  searchCompanyByName(name: string): Promise<Company | undefined>
  setDiscoveredCompanies(companies: Company[]): void
}

class LiveCompanyResearchService implements CompanyResearchService {
  private companies: Company[] = []

  setDiscoveredCompanies(companies: Company[]) {
    this.companies = [...companies]
  }

  async getCompanies(): Promise<Company[]> {
    return [...this.companies]
  }

  async getCompanyById(id: string): Promise<Company | undefined> {
    return this.companies.find((c) => c.id === id)
  }

  async searchCompanyByName(name: string): Promise<Company | undefined> {
    const clean = name.toLowerCase().trim()
    return this.companies.find((c) => c.name.toLowerCase().includes(clean))
  }
}

export const companyResearchService = new LiveCompanyResearchService()
