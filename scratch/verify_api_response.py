import json
import urllib.request
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

url = "http://localhost:5173/api/scrape/jobs"
print(f"Requesting {url} ...")
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=30) as resp:
    data = json.loads(resp.read().decode('utf-8'))

opps = data.get('opportunities', [])
companies = data.get('companies', [])
contacts = data.get('contacts', [])

print(f"\n==========================================")
print(f"TOTAL OPPORTUNITIES DISCOVERED: {len(opps)}")
print(f"TOTAL UNIQUE COMPANIES: {len(companies)}")
print(f"TOTAL VERIFIED CONTACTS: {len(contacts)}")
print(f"==========================================\n")

famous_opps = [o for o in opps if o.get('isFamousCompany')]
eligible_opps = [o for o in opps if o.get('eligibility', {}).get('isEligible')]

print(f"Famous Indian Companies Count: {len(famous_opps)} / {len(opps)}")
print(f"MCA / Fresher Eligible Count: {len(eligible_opps)} / {len(opps)}")

print("\n--- SAMPLE OF FAMOUS INDIAN COMPANIES POSTINGS ---")
for i, o in enumerate(famous_opps[:8]):
    print(f"{i+1}. [{o.get('company')}] ({o.get('companyTier')})")
    print(f"   Role: {o.get('role')}")
    print(f"   Location: {o.get('location')}")
    print(f"   Salary: {o.get('salaryRange')} (LPA Value: {o.get('salaryLpa')})")
    print(f"   Eligible: {o.get('eligibility', {}).get('isEligible')} -> {o.get('eligibility', {}).get('reason')}")
    print(f"   Posted Date & Time: {o.get('postedTimeFormatted')} (Raw: {o.get('postedDate')})")
    print(f"   URL: {o.get('sourceUrl')}")
    print()

print("\n--- SAMPLE OF MCA / FRESHER ELIGIBLE POSTINGS ---")
for i, o in enumerate(eligible_opps[:5]):
    print(f"{i+1}. [{o.get('company')}] {o.get('role')}")
    print(f"   Salary: {o.get('salaryRange')} | Exp: {o.get('experience')}")
    print(f"   Location: {o.get('location')}")
    print(f"   Posted: {o.get('postedTimeFormatted')}")
    print()
