import sys
from jobspy import scrape_jobs

sys.stdout.reconfigure(encoding='utf-8')

for site in ["indeed", "google", "linkedin"]:
    print(f"\n--- Testing site: {site} ---")
    try:
        df = scrape_jobs(
            site_name=[site],
            search_term="React developer",
            location="Bengaluru, India",
            results_wanted=3,
            hours_old=72,
            country_indeed='India'
        )
        print(f"[{site}] Success: {len(df)} jobs returned!")
        if len(df) > 0:
            row = df.iloc[0]
            print(f"  Sample: {row.get('title')} at {row.get('company')} ({row.get('location')})")
            print(f"  URL: {row.get('job_url')}")
            print(f"  Salary: {row.get('min_amount')} - {row.get('max_amount')} {row.get('currency')}")
    except Exception as e:
        print(f"[{site}] Failed with error: {e}")
