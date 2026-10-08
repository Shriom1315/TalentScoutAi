import { Contact, Opportunity, Outreach, OutreachStatus } from '../types'

export interface GeneratedOutreachResult {
  subject: string
  openingSentence: string
  mainMessage: string
  cta: string
  fullBody: string
  whyGenerated: string[]
}

export interface OutreachService {
  getOutreachList(): Promise<Outreach[]>
  saveOutreach(outreach: Outreach): Promise<Outreach>
  updateStatus(id: string, status: OutreachStatus): Promise<boolean>
  generatePersonalizedOutreach(
    contact: Contact,
    opportunity: Opportunity,
    candidateName?: string
  ): Promise<GeneratedOutreachResult>
}

class LiveOutreachService implements OutreachService {
  private outreachList: Outreach[] = []

  async getOutreachList(): Promise<Outreach[]> {
    return [...this.outreachList]
  }

  async saveOutreach(outreach: Outreach): Promise<Outreach> {
    const existingIndex = this.outreachList.findIndex((o) => o.id === outreach.id)
    if (existingIndex >= 0) {
      this.outreachList[existingIndex] = outreach
    } else {
      this.outreachList.unshift(outreach)
    }
    return outreach
  }

  async updateStatus(id: string, status: OutreachStatus): Promise<boolean> {
    const item = this.outreachList.find((o) => o.id === id)
    if (item) {
      item.status = status
      return true
    }
    return false
  }

  async generatePersonalizedOutreach(
    contact: Contact,
    opportunity: Opportunity,
    candidateName: string = 'Shriom'
  ): Promise<GeneratedOutreachResult> {
    const companyName = opportunity.company
    const roleName = opportunity.role
    const prototypeTitle = opportunity.prototypeIdea?.title || `${companyName} Feature Prototype`
    const techSkills = opportunity.technologies.slice(0, 3).join(', ')
    const contactFirstName = contact.name.split(' ')[0]

    const subject = `Quick Prototype for ${companyName} (${prototypeTitle})`
    const openingSentence = `Hi ${contactFirstName},\n\nI noticed ${companyName}'s active hiring for the ${roleName} role and wanted to reach out directly.`
    const mainMessage = `Instead of sending a standard resume, I built a lightweight proof-of-concept tailored to ${companyName}: ${prototypeTitle}.\n\nIt addresses key requirements around ${opportunity.prototypeIdea?.problem.toLowerCase() || 'scalable responsive web systems'}.\n\nBuilt with: ${techSkills} with clean modular architecture.`
    const cta = `As an MCA graduate specializing in modern frontend and full-stack development, I would love 10 minutes to walk through how I approached this for ${companyName}.\n\nBest regards,\n${candidateName}\nshriom.dev@gmail.com`

    const fullBody = `${openingSentence}\n\n${mainMessage}\n\n${cta}`

    const whyGenerated = [
      `Tailored directly to ${contact.name}'s role (${contact.role}) at ${companyName}`,
      `Highlights active technical stack (${techSkills}) from the live job posting`,
      `Features a bespoke Proof-of-Skill demo (${prototypeTitle}) tailored to their stack`,
    ]

    return {
      subject,
      openingSentence,
      mainMessage,
      cta,
      fullBody,
      whyGenerated,
    }
  }
}

export const outreachService = new LiveOutreachService()
