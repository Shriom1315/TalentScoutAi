import sys
from jobspy import scrape_jobs

sys.stdout.reconfigure(encoding='utf-8')

print("Testing famous Indian companies with JobSpy...")

queries = [
    ("Meesho", "Bengaluru, India"),
    ("CRED", "Bengaluru, India"),
    ("Juspay", "Bengaluru, India"),
    ("Druva", "Pune, India"),
    ("Swiggy", "Bengaluru, India"),
]

for company, location in queries:
    print(f"\n--- Scraping {company} in {location} ---")
    try:
        df = scrape_jobs(
            site_name=["indeed", "linkedin"],
            search_term=f"{company} software",
            location=location,
            results_wanted=3,
            hours_old=168, # past week
            country_indeed='India'
        )
        print(f"[{company}] Found {len(df)} jobs:")
        for _, row in df.head(2).iterrows():
            sal = f"{row.get('min_amount')} - {row.get('max_amount')} {row.get('currency')}" if row.get('min_amount') else "Not disclosed in text"
            print(f"  • {row.get('title')} @ {row.get('company')} | Loc: {row.get('location')} | Sal: {sal} | Date: {row.get('date_posted')}")
            print(f"    URL: {row.get('job_url')}")
    except Exception as e:
        print(f"[{company}] Error: {e}")
