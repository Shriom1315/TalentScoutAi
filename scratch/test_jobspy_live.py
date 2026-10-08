import sys
import json
from jobspy import scrape_jobs

sys.stdout.reconfigure(encoding='utf-8')

print("Testing python-jobspy live scraping...")

try:
    jobs = scrape_jobs(
        site_name=["indeed", "linkedin"],
        search_term="Software Engineer",
        location="Bengaluru, Karnataka, India",
        results_wanted=5,
        hours_old=72,
        country_indeed='India'
    )

    print(f"Scraped {len(jobs)} jobs!")
    print("\nColumns:", list(jobs.columns))
    print("\n--- SAMPLE ROWS ---")
    for idx, row in jobs.head(3).iterrows():
        print(f"Job {idx+1}:")
        print(f"  Title: {row.get('title')}")
        print(f"  Company: {row.get('company')}")
        print(f"  Location: {row.get('location')}")
        print(f"  Date Posted: {row.get('date_posted')}")
        print(f"  Job URL: {row.get('job_url')}")
        print(f"  Direct URL: {row.get('job_url_direct')}")
        print(f"  Min Amount: {row.get('min_amount')}, Max Amount: {row.get('max_amount')}, Currency: {row.get('currency')}")
        print(f"  Emails: {row.get('emails')}")
        print(f"  Is Remote: {row.get('is_remote')}")
        print("-" * 50)

except Exception as e:
    print(f"Error during JobSpy live test: {e}")
    import traceback
    traceback.print_exc()
