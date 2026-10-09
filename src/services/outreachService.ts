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
    tpoTitle: string = 'Training & Placement Officer'
  ): Promise<GeneratedOutreachResult> {
    const companyName = opportunity.company
    const roleName = opportunity.role
    const techSkills = opportunity.technologies.slice(0, 3).join(', ')
    const contactSalutation = contact.name.includes(' ') ? contact.name : `${contact.name}`

    const subject = `Campus Placement Drive 2025–2026 Invitation | MCA & B.Tech Talent for ${companyName}`
    const openingSentence = `Dear ${contactSalutation},\n\nGreetings from the Training & Placement Office (TPO), Department of Computer Applications & Technology.`
    const mainMessage = `We noted with great interest ${companyName}'s active hiring for the ${roleName} role. We are writing to invite ${companyName} to partner with our department for your campus and early-career recruitment needs.\n\nOur graduating batch of MCA & B.Tech engineers is rigorously trained in hands-on software development, featuring strong competence in ${techSkills}, microservices architecture, and problem solving. Many of our students have published prototypes and solved 200+ LeetCode problems.`
    const cta = `We would be honored to organize an on-campus or virtual campus placement drive tailored to your schedule, or share a curated resume pool of pre-screened eligible candidates for the ${roleName} opening.\n\nCould we arrange a short 10-minute introductory call this week, or could you share your company's campus onboarding procedure?\n\nWarm regards,\nTraining & Placement Officer (TPO)\nDepartment of Computer Applications & Technology\nCampus Placement Cell\nplacement.department@college.edu.in`

    const fullBody = `${openingSentence}\n\n${mainMessage}\n\n${cta}`

    const whyGenerated = [
      `Official campus drive proposal addressed to ${contact.name} (${contact.role}) at ${companyName}`,
      `Aligned with the active ${roleName} role and required stack (${techSkills})`,
      `Includes department MCA / B.Tech candidate profile highlights and interview scheduling CTA`,
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
