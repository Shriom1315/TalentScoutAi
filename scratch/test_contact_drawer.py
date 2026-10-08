import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

def run_test():
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1600,1050")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")

    driver = webdriver.Chrome(options=options)
    try:
        driver.get("http://localhost:5173")
        time.sleep(1)

        # Pre-seed the exact items from user's screenshot
        sample_contacts = [
            {
                "id": "cont-opp-creative-1",
                "name": "Creative industrial plant eqpt & spare parts Trd. Talent Acquisition Lead",
                "role": "Lead Technical Recruiter",
                "company": "Creative industrial plant eqpt & spare parts Trd.",
                "companyId": "comp-creative-1",
                "linkedinUrl": "https://www.linkedin.com/search/results/people/?keywords=Creative+industrial+plant+eqpt", # old search url to test auto-enrichment!
                "email": "", # empty to test auto-enrichment!
                "emailStatus": "Needs verification",
                "source": "JobSpy Live Scrape",
                "confidence": 85,
                "relatedOpportunityId": "opp-creative-1",
                "whyRelevant": "Key talent acquisition lead associated with Technical Developer – AI & Automation opening at Creative industrial plant eqpt & spare parts Trd.",
                "department": "Engineering Talent Acquisition",
                "location": "Bengaluru, Karnataka (India)",
                "verifiedAt": "10:12:00 PM"
            },
            {
                "id": "cont-opp-meesho-2",
                "name": "Meesho Talent Acquisition Lead",
                "role": "Lead Technical Recruiter",
                "company": "Meesho",
                "companyId": "comp-meesho-2",
                "linkedinUrl": "https://www.linkedin.com/company/meesho",
                "email": "careers@meesho.com",
                "emailStatus": "Verified",
                "source": "Corporate Gateway & DNS MX (Active Mail Gateway)",
                "confidence": 94,
                "relatedOpportunityId": "opp-meesho-2",
                "whyRelevant": "Lead technical recruiter hiring frontend & full-stack engineers at Meesho Bengaluru HQ.",
                "department": "Engineering Talent Acquisition",
                "location": "Bengaluru, Karnataka (India)",
                "verifiedAt": "10:12:00 PM",
                "twitterUrl": "https://twitter.com/meeshotech",
                "careersUrl": "https://meesho.io/jobs",
                "companyWebsite": "https://meesho.com",
                "relatedAccounts": [
                    {"platform": "LinkedIn", "url": "https://www.linkedin.com/company/meesho", "type": "company_page"},
                    {"platform": "Twitter / X", "url": "https://twitter.com/meeshotech", "type": "social"},
                    {"platform": "Careers Portal", "url": "https://meesho.io/jobs", "type": "jobs"}
                ]
            }
        ]

        sample_opps = [
            {
                "id": "opp-creative-1",
                "company": "Creative industrial plant eqpt & spare parts Trd.",
                "companyId": "comp-creative-1",
                "companyWebsite": "https://creativeindustrialplant.com",
                "role": "Technical Developer – AI & Automation",
                "description": "Building automation workflows, Python scripting, and AI integrations for industrial systems.",
                "location": "Bengaluru, Karnataka (India)",
                "remote": False,
                "experience": "0–2 years",
                "employmentType": "Full-time",
                "technologies": ["Python", "AI", "Automation", "REST APIs"],
                "education": ["MCA", "B.Tech", "CS Graduate"],
                "postedDate": "Today at 08:30 PM",
                "postedTimestamp": int(time.time() * 1000),
                "source": "JobSpy (Indeed India)",
                "sourceUrl": "https://in.indeed.com",
                "matchScore": 89,
                "matchBreakdown": {
                    "technicalSkills": 90,
                    "experience": 92,
                    "education": 88,
                    "location": 85,
                    "roleAlignment": 90
                },
                "contactId": "cont-opp-creative-1",
                "status": "active",
                "salaryRange": "₹6 – 10 LPA",
                "salaryLpa": 8.0,
                "isFamousCompany": False,
                "companyTier": "Growth Leader",
                "requirements": ["Python automation", "REST microservices"],
                "niceToHave": ["Side projects"],
                "prototypeIdea": {
                    "title": "Industrial Automation Dashboard",
                    "description": "Proof of skill prototype",
                    "techStack": ["React", "Python"],
                    "estimatedEffort": "1 weekend"
                }
            }
        ]

        sample_comps = [
            {
                "id": "comp-creative-1",
                "name": "Creative industrial plant eqpt & spare parts Trd.",
                "website": "https://creativeindustrialplant.com",
                "industry": "Industrial & Tech Automation",
                "stage": "Growth",
                "location": "Bengaluru, India"
            }
        ]

        driver.execute_script("localStorage.setItem('talentscout_contacts_v2', arguments[0]);", json.dumps(sample_contacts))
        driver.execute_script("localStorage.setItem('talentscout_opportunities_v2', arguments[0]);", json.dumps(sample_opps))
        driver.execute_script("localStorage.setItem('talentscout_companies_v2', arguments[0]);", json.dumps(sample_comps))
        print("Pre-seeded localStorage successfully")

        # Now navigate to /contacts
        driver.get("http://localhost:5173/contacts")
        time.sleep(2)

        rows = driver.find_elements(By.XPATH, "//tr[contains(@class, 'cursor-pointer')]")
        print(f"Found {len(rows)} contact rows on /contacts")
        if rows:
            rows[0].click()
            print("Clicked Creative Industrial contact row! Waiting for enrichment...")
            for _ in range(12):
                time.sleep(1)
                enriching_banners = driver.find_elements(By.XPATH, "//*[contains(text(), 'Harvesting corporate email')]")
                if not enriching_banners:
                    print("Enrichment finished!")
                    break

        # Slight pause for render
        time.sleep(1)
        artifact_path = r"C:\Users\shrio\Desktop\TalentScoutAi\verified_contact_drawer_harvested.png"
        driver.save_screenshot(artifact_path)
        print("Saved screenshot to:", artifact_path)

        # Print drawer contents
        drawer = driver.find_elements(By.XPATH, "//div[contains(@class, 'slide-in-from-right')]")
        if drawer:
            print("=== DRAWER CONTENT ===")
            print(drawer[0].text)

    finally:
        driver.quit()

if __name__ == "__main__":
    run_test()
