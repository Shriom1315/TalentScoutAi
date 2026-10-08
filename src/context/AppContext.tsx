import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import {
  Company,
  Contact,
  Opportunity,
  Outreach,
  OutreachStatus,
  SystemActivity,
} from '../types'
import { jobDiscoveryService } from '../services/jobDiscoveryService'
import { emailVerificationService } from '../services/emailVerificationService'
import { companyResearchService } from '../services/companyResearchService'
import { contactDiscoveryService } from '../services/contactDiscoveryService'

interface ToastState {
  id: string
  title: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
}

interface AppContextType {
  opportunities: Opportunity[]
  contacts: Contact[]
  companies: Company[]
  outreachRecords: Outreach[]
  systemActivities: SystemActivity[]
  savedJobIds: Set<string>
  lastScanText: string
  isDiscovering: boolean
  isDiscoveryModalOpen: boolean
  discoveryStep: number
  discoveryStepsCompleted: string[]
  discoveryStatusText: string
  activeContactDrawer: Contact | null
  activeOutreachModal: {
    contact?: Contact
    opportunity?: Opportunity
    outreach?: Outreach
  } | null
  activePrototypeBrief: { opportunity: Opportunity } | null
  globalSearch: string
  setGlobalSearch: (q: string) => void
  toast: ToastState | null
  showToast: (title: string, message: string, type?: ToastState['type']) => void
  dismissToast: () => void
  toggleSaveJob: (jobId: string) => void
  openContactDrawer: (contact: Contact) => void
  closeContactDrawer: () => void
  openOutreachModal: (contact?: Contact, opportunity?: Opportunity, outreach?: Outreach) => void
  closeOutreachModal: () => void
  openPrototypeBrief: (opportunity: Opportunity) => void
  closePrototypeBrief: () => void
  openDiscoveryModal: () => void
  closeDiscoveryModal: () => void
  runDiscovery: (query?: string) => Promise<void>
  verifyContactEmail: (contactId: string, email: string) => Promise<boolean>
  updateOutreachStatus: (id: string, status: OutreachStatus) => void
  saveOutreachRecord: (outreach: Outreach) => void
  getCompanyById: (id: string) => Company | undefined
  getContactById: (id: string) => Contact | undefined
  getOpportunityById: (id: string) => Opportunity | undefined
  clearAllData: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const STORAGE_KEY_SAVED_JOBS = 'talentscout_saved_jobs_v2'
const STORAGE_KEY_OUTREACH = 'talentscout_outreach_v2'
const STORAGE_KEY_OPPORTUNITIES = 'talentscout_opportunities_v2'
const STORAGE_KEY_CONTACTS = 'talentscout_contacts_v2'
const STORAGE_KEY_COMPANIES = 'talentscout_companies_v2'
const STORAGE_KEY_ACTIVITIES = 'talentscout_activities_v2'
const STORAGE_KEY_LAST_SCAN = 'talentscout_last_scan_v2'

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Saved jobs persistence
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SAVED_JOBS)
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })

  // Opportunities: starts empty or from user's saved scrape cache
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_OPPORTUNITIES)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Contacts
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONTACTS)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Companies
  const [companies, setCompanies] = useState<Company[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COMPANIES)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Outreach records persistence
  const [outreachRecords, setOutreachRecords] = useState<Outreach[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_OUTREACH)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // System activities
  const [systemActivities, setSystemActivities] = useState<SystemActivity[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ACTIVITIES)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Last scan text
  const [lastScanText, setLastScanText] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_LAST_SCAN) || 'Never'
  })

  // Global search query
  const [globalSearch, setGlobalSearch] = useState<string>('')

  // Toast
  const [toast, setToast] = useState<ToastState | null>(null)

  // Drawers and Modals
  const [activeContactDrawer, setActiveContactDrawer] = useState<Contact | null>(null)
  const [activeOutreachModal, setActiveOutreachModal] = useState<{
    contact?: Contact
    opportunity?: Opportunity
    outreach?: Outreach
  } | null>(null)
  const [activePrototypeBrief, setActivePrototypeBrief] = useState<{ opportunity: Opportunity } | null>(null)

  // Discovery live states
  const [isDiscoveryModalOpen, setIsDiscoveryModalOpen] = useState<boolean>(false)
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false)
  const [discoveryStep, setDiscoveryStep] = useState<number>(0)
  const [discoveryStepsCompleted, setDiscoveryStepsCompleted] = useState<string[]>([])
  const [discoveryStatusText, setDiscoveryStatusText] = useState<string>('')

  // Persistence helpers
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED_JOBS, JSON.stringify(Array.from(savedJobIds)))
    } catch {
      // safely ignore
    }
  }, [savedJobIds])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_OUTREACH, JSON.stringify(outreachRecords))
    } catch {
      // safely ignore
    }
  }, [outreachRecords])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_OPPORTUNITIES, JSON.stringify(opportunities))
    } catch {
      // safely ignore
    }
  }, [opportunities])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(contacts))
    } catch {
      // safely ignore
    }
  }, [contacts])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies))
    } catch {
      // safely ignore
    }
  }, [companies])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(systemActivities))
    } catch {
      // safely ignore
    }
  }, [systemActivities])

  const showToast = useCallback((title: string, message: string, type: ToastState['type'] = 'success') => {
    const id = Date.now().toString()
    setToast({ id, title, message, type })
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev))
    }, 3800)
  }, [])

  const dismissToast = useCallback(() => {
    setToast(null)
  }, [])

  const toggleSaveJob = useCallback((jobId: string) => {
    setSavedJobIds((prev) => {
      const next = new Set(prev)
      const isSaved = next.has(jobId)
      if (isSaved) {
        next.delete(jobId)
        showToast('Saved Opportunity Removed', 'Opportunity removed from your saved list.', 'info')
      } else {
        next.add(jobId)
        showToast('Opportunity Saved', 'Role added to your saved opportunities.', 'success')
      }
      return next
    })
  }, [showToast])

  const openContactDrawer = useCallback((contact: Contact) => {
    setActiveContactDrawer(contact)
  }, [])

  const closeContactDrawer = useCallback(() => {
    setActiveContactDrawer(null)
  }, [])

  const openOutreachModal = useCallback((contact?: Contact, opportunity?: Opportunity, outreach?: Outreach) => {
    setActiveOutreachModal({ contact, opportunity, outreach })
  }, [])

  const closeOutreachModal = useCallback(() => {
    setActiveOutreachModal(null)
  }, [])

  const openPrototypeBrief = useCallback((opportunity: Opportunity) => {
    setActivePrototypeBrief({ opportunity })
  }, [])

  const closePrototypeBrief = useCallback(() => {
    setActivePrototypeBrief(null)
  }, [])

  const openDiscoveryModal = useCallback(() => {
    setIsDiscoveryModalOpen(true)
  }, [])

  const closeDiscoveryModal = useCallback(() => {
    if (!isDiscovering) {
      setIsDiscoveryModalOpen(false)
    }
  }, [isDiscovering])

  // Real-Time Discovery Execution
  const runDiscovery = useCallback(async (query?: string) => {
    setIsDiscovering(true)
    setIsDiscoveryModalOpen(true)
    setDiscoveryStep(1)
    setDiscoveryStepsCompleted([])
    setDiscoveryStatusText('Initiating live multi-source scrape...')

    const steps = [
      'Connecting to Indian IT hubs & tech pipelines (Bengaluru, Hyderabad, Pune, NCR, Mumbai)',
      'Scraping live engineering and product vacancies across Indian tech companies & startups',
      'Filtering early-career, MCA, and React/Node/Full Stack roles',
      'Extracting hiring manager & recruiter decision makers',
      'Executing RFC-5321 DNS MX mailbox verification via dnspython',
      'Calculating dynamic match scores against candidate credentials',
    ]

    try {
      // Step 1
      setDiscoveryStepsCompleted((p) => [...p, steps[0]])
      setDiscoveryStep(2)

      // Step 2 & 3
      setDiscoveryStatusText('Scraping live feeds in real time...')
      const result = await jobDiscoveryService.runDiscovery(query, (msg) => {
        setDiscoveryStatusText(msg)
      })

      setDiscoveryStepsCompleted((p) => [...p, steps[1], steps[2]])
      setDiscoveryStep(4)

      // Step 4
      setDiscoveryStatusText('Extracting verified decision makers...')
      setDiscoveryStepsCompleted((p) => [...p, steps[3]])
      setDiscoveryStep(5)

      // Step 5 & 6
      setDiscoveryStatusText('Running RFC-5321 DNS verification & scoring match...')
      setDiscoveryStepsCompleted((p) => [...p, steps[4], steps[5]])
      setDiscoveryStep(6)

      // Commit discovered real data
      if (result.newJobs.length > 0) {
        setOpportunities(result.newJobs)
        setContacts(result.contacts)
        setCompanies(result.companies)
        companyResearchService.setDiscoveredCompanies(result.companies)
        contactDiscoveryService.setDiscoveredContacts(result.contacts)

        const now = 'Just now'
        setLastScanText(now)
        try {
          localStorage.setItem(STORAGE_KEY_LAST_SCAN, now)
        } catch {
          // ignore
        }

        const newActivity: SystemActivity = {
          id: `act-${Date.now()}`,
          title: 'Live Real-Time Scrape Completed',
          description: `Discovered ${result.discoveredCount} live tech postings from ${result.sources.join(', ')}. Scored ${result.strongMatchesCount} strong matches with ${result.contactsCount} verified contacts.`,
          timestamp: 'Just now',
          timestampMs: Date.now(),
          type: 'discovery',
        }
        setSystemActivities((prev) => [newActivity, ...prev])

        showToast(
          'Live Scraping Complete',
          `Scraped ${result.discoveredCount} live opportunities in real time from ${result.sources.length} sources.`,
          'success'
        )
      } else {
        showToast(
          'Scraping Finished',
          'No matching postings found for the specified parameters.',
          'info'
        )
      }
    } catch (err: unknown) {
      const error = err as Error
      showToast('Scraping Error', error.message || 'Failed to fetch live job feeds.', 'error')
    } finally {
      setIsDiscovering(false)
    }
  }, [showToast])

  // Live DNS MX verification on a contact
  const verifyContactEmail = useCallback(async (contactId: string, email: string): Promise<boolean> => {
    showToast('Checking MX Record', `Running live RFC-5321 DNS lookup on ${email}...`, 'info')
    try {
      const res = await emailVerificationService.verifyEmail(email)
      setContacts((prev) =>
        prev.map((c) =>
          c.id === contactId
            ? {
                ...c,
                emailStatus: res.status,
                confidence: res.confidence,
                verifiedAt: res.verifiedAt,
              }
            : c
        )
      )

      if (res.mxValid) {
        showToast(
          'Email DNS Verified',
          `Confirmed active mail exchange for ${email} (${res.provider || 'MX Active'})`,
          'success'
        )
        return true
      } else {
        showToast(
          'Verification Notice',
          `Domain MX check: ${res.notes}`,
          'warning'
        )
        return false
      }
    } catch (err: unknown) {
      const error = err as Error
      showToast('Verification Failed', error.message || 'DNS request failed', 'error')
      return false
    }
  }, [showToast])

  const updateOutreachStatus = useCallback((id: string, status: OutreachStatus) => {
    setOutreachRecords((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    )
    showToast('Outreach Updated', `Status moved to "${status}".`, 'info')
  }, [showToast])

  const saveOutreachRecord = useCallback((outreach: Outreach) => {
    setOutreachRecords((prev) => {
      const idx = prev.findIndex((o) => o.id === outreach.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = outreach
        return next
      }
      return [outreach, ...prev]
    })
    showToast('Outreach Saved', 'Your personalized message is saved to Outreach.', 'success')
  }, [showToast])

  const getCompanyById = useCallback((id: string) => companies.find((c) => c.id === id), [companies])
  const getContactById = useCallback((id: string) => contacts.find((c) => c.id === id), [contacts])
  const getOpportunityById = useCallback((id: string) => opportunities.find((o) => o.id === id), [opportunities])

  const clearAllData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY_SAVED_JOBS)
      localStorage.removeItem(STORAGE_KEY_OUTREACH)
      localStorage.removeItem(STORAGE_KEY_OPPORTUNITIES)
      localStorage.removeItem(STORAGE_KEY_CONTACTS)
      localStorage.removeItem(STORAGE_KEY_COMPANIES)
      localStorage.removeItem(STORAGE_KEY_ACTIVITIES)
      localStorage.removeItem(STORAGE_KEY_LAST_SCAN)
    } catch {
      // ignore
    }

    setSavedJobIds(new Set())
    setOpportunities([])
    setContacts([])
    setCompanies([])
    setOutreachRecords([])
    setSystemActivities([])
    setLastScanText('Never')

    showToast('All Data Cleared', 'Pipeline wiped completely. Ready for a clean scrape from scratch.', 'info')
  }, [showToast])

  return (
    <AppContext.Provider
      value={{
        opportunities,
        contacts,
        companies,
        outreachRecords,
        systemActivities,
        savedJobIds,
        lastScanText,
        isDiscovering,
        isDiscoveryModalOpen,
        discoveryStep,
        discoveryStepsCompleted,
        discoveryStatusText,
        activeContactDrawer,
        activeOutreachModal,
        activePrototypeBrief,
        globalSearch,
        setGlobalSearch,
        toast,
        showToast,
        dismissToast,
        toggleSaveJob,
        openContactDrawer,
        closeContactDrawer,
        openOutreachModal,
        closeOutreachModal,
        openPrototypeBrief,
        closePrototypeBrief,
        openDiscoveryModal,
        closeDiscoveryModal,
        runDiscovery,
        verifyContactEmail,
        updateOutreachStatus,
        saveOutreachRecord,
        getCompanyById,
        getContactById,
        getOpportunityById,
        clearAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
