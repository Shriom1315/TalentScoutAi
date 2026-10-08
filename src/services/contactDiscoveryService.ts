import { Contact } from '../types'

export interface ContactDiscoveryService {
  getContacts(): Promise<Contact[]>
  getContactById(id: string): Promise<Contact | undefined>
  getContactsForJob(jobId: string): Promise<Contact[]>
  getContactsForCompany(companyId: string): Promise<Contact[]>
  setDiscoveredContacts(contacts: Contact[]): void
}

class LiveContactDiscoveryService implements ContactDiscoveryService {
  private contacts: Contact[] = []

  setDiscoveredContacts(contacts: Contact[]) {
    this.contacts = [...contacts]
  }

  async getContacts(): Promise<Contact[]> {
    return [...this.contacts]
  }

  async getContactById(id: string): Promise<Contact | undefined> {
    return this.contacts.find((c) => c.id === id)
  }

  async getContactsForJob(jobId: string): Promise<Contact[]> {
    return this.contacts.filter((c) => c.relatedOpportunityId === jobId)
  }

  async getContactsForCompany(companyId: string): Promise<Contact[]> {
    return this.contacts.filter((c) => c.companyId === companyId)
  }
}

export const contactDiscoveryService = new LiveContactDiscoveryService()
