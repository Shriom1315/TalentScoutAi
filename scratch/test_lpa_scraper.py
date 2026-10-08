import sys, os
sys.path.insert(0, os.getcwd())
# Ensure utf-8 stdout for Windows console
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from python_scrapers.job_scraper import run_full_pipeline

res = run_full_pipeline(max_jobs=6)
print("Discovered:", res["totalDiscovered"])
for o in res["opportunities"]:
    print(f"{o['company']} ({o.get('companyTier')}) | {o['role']}")
    print(f"  Location: {o['location']}")
    print(f"  Salary LPA: {o.get('salaryRange')} (numeric: {o.get('salaryLpa')})")
    print(f"  Eligible: {o.get('eligibility', {}).get('isEligible')} -> {o.get('eligibility', {}).get('eligibilitySummary')}")
    print(f"  Posted: {o.get('postedDate')} (Exact: {o.get('postedTimeFormatted')})")
    print()
