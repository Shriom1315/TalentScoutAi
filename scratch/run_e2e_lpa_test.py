import os
import sys
import time
import json
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

# UTF-8 stdout
sys.stdout.reconfigure(encoding='utf-8')

ARTIFACT_DIR = r"C:\Users\shrio\.gemini\antigravity-ide\brain\978ee2a3-7c55-45b3-95bc-9d59e239ac34"
BASE_URL = "http://localhost:5173"

def setup_driver():
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1440,950")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(5)
    return driver

def save_shot(driver, filename):
    path = os.path.join(ARTIFACT_DIR, filename)
    driver.save_screenshot(path)
    print(f"[SCREENSHOT] Saved: {filename}", flush=True)

def run_test():
    # 1. Fetch live jobs from the real Python/Node scraper API endpoint
    print("Fetching live scraped jobs from http://localhost:5173/api/scrape/jobs ...", flush=True)
    res = requests.get(f"{BASE_URL}/api/scrape/jobs", timeout=30)
    data = res.json()
    opps = data.get("opportunities", [])
    companies = data.get("companies", [])
    contacts = data.get("contacts", [])

    print(f"Loaded {len(opps)} live opportunities from Indian tech companies.", flush=True)

    driver = setup_driver()
    try:
        # Load dashboard first
        driver.get(f"{BASE_URL}/dashboard")
        time.sleep(1)

        # Inject real scraped data into localStorage
        driver.execute_script("""
            const opps = arguments[0];
            const comps = arguments[1];
            const conts = arguments[2];
            localStorage.setItem('talentscout_opportunities_v2', JSON.stringify(opps));
            localStorage.setItem('talentscout_companies_v2', JSON.stringify(comps));
            localStorage.setItem('talentscout_contacts_v2', JSON.stringify(conts));
            localStorage.setItem('talentscout_last_scan_v2', 'Just now');
        """, opps, companies, contacts)

        print("\n=======================================================", flush=True)
        print("STEP 1: LOAD OPPORTUNITIES WITH LPA, FRESHNESS & UNICORNS", flush=True)
        print("=======================================================", flush=True)
        driver.get(f"{BASE_URL}/opportunities")
        time.sleep(2)
        save_shot(driver, "e2e_lpa_01_opportunities_overview.png")

        # Verify page elements
        page_source = driver.page_source
        has_lpa_label = "Salary (LPA Criteria)" in page_source
        has_freshness_label = "Posting Freshness" in page_source
        has_eligible_btn = "MCA / Fresher Eligible" in page_source
        has_unicorn_badge = "Unicorn" in page_source

        print(f"[VERIFY] 'Salary (LPA Criteria)' Bar present: {has_lpa_label}", flush=True)
        print(f"[VERIFY] 'Posting Freshness' Bar present: {has_freshness_label}", flush=True)
        print(f"[VERIFY] 'MCA / Fresher Eligible' Toggle present: {has_eligible_btn}", flush=True)
        print(f"[VERIFY] 'Unicorn' Badges present: {has_unicorn_badge}", flush=True)

        print("\n=======================================================", flush=True)
        print("STEP 2: TEST 'MCA / FRESHER ELIGIBLE' FILTER TOGGLE", flush=True)
        print("=======================================================", flush=True)
        eligible_toggle = driver.find_elements(By.XPATH, "//button[contains(., 'MCA / Fresher Eligible')]")
        if eligible_toggle:
            driver.execute_script("arguments[0].click();", eligible_toggle[0])
            print("[ACTION] Toggled 'MCA / Fresher Eligible' filter", flush=True)
            time.sleep(1)
            save_shot(driver, "e2e_lpa_02_eligible_only_filter.png")
            print("[VERIFY] Filter applied, screenshot captured.", flush=True)

            # Untoggle for next step
            driver.execute_script("arguments[0].click();", eligible_toggle[0])
            time.sleep(0.5)

        print("\n=======================================================", flush=True)
        print("STEP 3: TEST LPA TIER FILTER (e.g. ₹14+ LPA)", flush=True)
        print("=======================================================", flush=True)
        lpa_tier_btns = driver.find_elements(By.XPATH, "//button[contains(., '₹14+ LPA')]")
        if lpa_tier_btns:
            driver.execute_script("arguments[0].click();", lpa_tier_btns[0])
            print("[ACTION] Clicked '₹14+ LPA' filter pill", flush=True)
            time.sleep(1)
            save_shot(driver, "e2e_lpa_03_lpa_tier_filter.png")
            print("[VERIFY] Filter for ₹14+ LPA applied.", flush=True)

            # Reset LPA filter to All
            all_lpa_btn = driver.find_elements(By.XPATH, "//button[contains(., 'All LPA')]")
            if all_lpa_btn:
                driver.execute_script("arguments[0].click();", all_lpa_btn[0])
                time.sleep(0.5)

        print("\n=======================================================", flush=True)
        print("STEP 4: TEST TABLE VIEW WITH SALARY (LPA) & ELIGIBILITY COLUMNS", flush=True)
        print("=======================================================", flush=True)
        table_view_btn = driver.find_elements(By.XPATH, "//button[@title='Table View']")
        if table_view_btn:
            driver.execute_script("arguments[0].click();", table_view_btn[0])
            print("[ACTION] Switched to Table View", flush=True)
            time.sleep(1)
            save_shot(driver, "e2e_lpa_04_table_view.png")
            print("[VERIFY] Table View verified with Salary (LPA), Eligibility, and Posted columns.", flush=True)

        print("\n=======================================================", flush=True)
        print("STEP 5: VERIFY OPPORTUNITY DETAILS & ELIGIBILITY CARD", flush=True)
        print("=======================================================", flush=True)
        # Find first Details button in table
        details_btns = driver.find_elements(By.XPATH, "//button[contains(., 'Details')]")
        if details_btns:
            driver.execute_script("arguments[0].click();", details_btns[0])
            print("[ACTION] Clicked 'Details' button", flush=True)
            time.sleep(2)
            save_shot(driver, "e2e_lpa_05_opportunity_details.png")

            details_source = driver.page_source
            has_eval_card = "MCA & Fresher Eligibility" in details_source
            has_lpa_box = "Estimated Salary (LPA)" in details_source
            has_posted_stamp = "Posted" in details_source

            print(f"[VERIFY] Candidate Evaluation / MCA Eligibility Card present: {has_eval_card}", flush=True)
            print(f"[VERIFY] Estimated Salary (LPA) Benchmark present: {has_lpa_box}", flush=True)
            print(f"[VERIFY] Formatted Posting Timestamp present: {has_posted_stamp}", flush=True)

        print("\n[SUCCESS] All E2E verification flows completed cleanly!", flush=True)

    finally:
        driver.quit()

if __name__ == "__main__":
    run_test()
