export const DISCOVERY_STEPS = [
  'Initializing python-jobspy Engine for Naukri, Indeed (India), LinkedIn & Glassdoor',
  'Scraping live engineering openings across Indian tech hubs (Bengaluru, Pune, Hyderabad, NCR)',
  'Parsing authentic LPA salary criteria & calculating MCA / Fresher qualification fit',
  'Extracting hiring manager & recruiter decision makers via JobSpy',
  'Executing RFC-5321 DNS MX mailbox verification via dnspython',
  'Generating tailored proof-of-skill pitches and candidate fit scores',
] as const

export type DiscoveryStepText = typeof DISCOVERY_STEPS[number]
