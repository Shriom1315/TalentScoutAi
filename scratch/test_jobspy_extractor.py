import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.stdout.reconfigure(encoding='utf-8')

from python_scrapers.extractors.jobspy_extractor import scrape_with_jobspy

print("Testing JobSpy extractor...")
jobs = scrape_with_jobspy([
    ("Software Engineer", "Bengaluru, India"),
    ("React Developer", "Pune, India")
], results_per_query=3)

print(f"\nScraped {len(jobs)} live jobs via JobSpy:")
for i, j in enumerate(jobs):
    print(f"{i+1}. [{j['company']}] {j['title']}")
    print(f"   Location: {j['location']}")
    print(f"   Source: {j['source']}")
    print(f"   Date Posted: {j['datePosted']}")
    print(f"   Explicit LPA: {j.get('lpaExplicit')}")
    print(f"   URL: {j['url']}")
    print(f"   Famous: {j['isFamousCompany']} ({j['companyTier']})")
    print()
