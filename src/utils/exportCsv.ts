import { Opportunity, Contact } from '../types'

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function escapeCsvCell(cell: any): string {
  if (cell === null || cell === undefined) return '""'
  const str = String(cell).replace(/"/g, '""')
  return `"${str}"`
}

export function exportOpportunitiesToCsv(
  opportunities: Opportunity[],
  filename: string = 'TPO_Live_Job_Openings.csv'
) {
  const headers = [
    'Job ID',
    'Company',
    'Role',
    'Location',
    'Work Model',
    'Salary Range (LPA)',
    'Experience Tier',
    'Eligible Batches',
    'Technologies',
    'Job Board',
    'Apply URL',
    'Company Website',
    'TPO Trust Score',
    'Verification Status',
    'Posted Date',
  ]

  const rows = opportunities.map((opp) => [
    opp.id,
    opp.company,
    opp.role,
    opp.location,
    opp.remote ? 'Remote' : 'On-Site / Hybrid',
    opp.salaryRange || (opp.salaryLpa ? `${opp.salaryLpa} LPA` : 'Disclosed during interview'),
    opp.experience,
    (opp.education || ['MCA', 'B.Tech']).join('; '),
    opp.technologies.join(', '),
    opp.jobspySite || opp.source,
    opp.directUrl || opp.sourceUrl,
    opp.companyWebsite,
    opp.trustScore || opp.verification?.trustScore || 85,
    opp.verificationBadge || 'TPO Verified',
    opp.postedDate,
  ])

  const csvContent =
    [headers.map(escapeCsvCell).join(',')]
      .concat(rows.map((row) => row.map(escapeCsvCell).join(',')))
      .join('\r\n')

  downloadCsv(csvContent, filename)
}

export function exportContactsToCsv(
  contacts: Contact[],
  filename: string = 'TPO_Recruiter_Directory.csv'
) {
  const headers = [
    'Contact ID',
    'Recruiter Name',
    'Designation / Role',
    'Company',
    'Corporate Email',
    'Email MX Status',
    'LinkedIn Profile',
    'Company Website',
    'Location / Office',
    'Department',
    'TPO Trust Score',
    'Mail Provider',
    'Verified At',
  ]

  const rows = contacts.map((c) => [
    c.id,
    c.name,
    c.role,
    c.company,
    c.email,
    c.emailStatus,
    c.linkedinUrl,
    c.companyWebsite || '',
    c.location || 'India',
    c.department,
    c.confidence || c.verification?.trustScore || 88,
    c.provider || c.verification?.mailProvider || 'Corporate Gateway',
    c.verifiedAt || '',
  ])

  const csvContent =
    [headers.map(escapeCsvCell).join(',')]
      .concat(rows.map((row) => row.map(escapeCsvCell).join(',')))
      .join('\r\n')

  downloadCsv(csvContent, filename)
}
