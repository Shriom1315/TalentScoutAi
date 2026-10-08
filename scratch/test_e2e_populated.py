import os
import sys
import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

from python_scrapers.job_scraper import run_full_pipeline

ARTIFACT_DIR = r"C:\Users\shrio\.gemini\antigravity-ide\brain\978ee2a3-7c55-45b3-95bc-9d59e239ac34"
BASE_URL = "http://localhost:5173"

def setup_driver():
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1440,900")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(4)
    return driver

def save_shot(driver, filename):
    path = os.path.join(ARTIFACT_DIR, filename)
    driver.save_screenshot(path)
    print(f"[SCREENSHOT] Saved: {filename}", flush=True)

def run():
    print("Harvesting real JobSpy jobs for testing...", flush=True)
    pipeline_data = run_full_pipeline(query="React", location="Pune, India", max_jobs=12)
    opps = pipeline_data.get("opportunities", [])
    contacts = pipeline_data.get("contacts", [])
    companies = pipeline_data.get("companies", [])
    print(f"Harvested {len(opps)} opportunities, {len(contacts)} contacts.", flush=True)

    driver = setup_driver()
    try:
        driver.get(f"{BASE_URL}/dashboard")
        time.sleep(1)

        # Inject real jobs into localStorage
        driver.execute_script("""
            const opps = arguments[0];
            const contacts = arguments[1];
            const companies = arguments[2];
            localStorage.setItem('talentscout_opportunities_v2', JSON.stringify(opps));
            localStorage.setItem('talentscout_contacts_v2', JSON.stringify(contacts));
            localStorage.setItem('talentscout_companies_v2', JSON.stringify(companies));
            localStorage.setItem('talentscout_last_scan_v2', 'Just now');
        """, opps, contacts, companies)

        # Refresh dashboard to display seeded live data
        driver.get(f"{BASE_URL}/dashboard")
        time.sleep(2)
        save_shot(driver, "e2e_01_dashboard_optimized_live.png")

        # Navigate to Opportunities
        driver.get(f"{BASE_URL}/opportunities")
        time.sleep(2)
        save_shot(driver, "e2e_02_opportunities_all_exp.png")

        # Click '0–2 Yrs (Entry Level)'
        print("Testing filter '0–2 Yrs (Entry Level)'...", flush=True)
        try:
            btn_entry = driver.find_element(By.XPATH, "//button[contains(., '0–2 Yrs')]")
            btn_entry.click()
            time.sleep(1)
            save_shot(driver, "e2e_03_opportunities_entry_level.png")
        except Exception as e:
            print("Entry level btn click issue:", e)

        # Click '5+ Yrs (Senior / Lead)'
        print("Testing filter '5+ Yrs (Senior / Lead)'...", flush=True)
        try:
            btn_senior = driver.find_element(By.XPATH, "//button[contains(., '5+ Yrs')]")
            btn_senior.click()
            time.sleep(1)
            save_shot(driver, "e2e_04_opportunities_senior_lead.png")
        except Exception as e:
            print("Senior btn click issue:", e)

        # Reset to 'All Experience'
        try:
            btn_all = driver.find_element(By.XPATH, "//button[contains(., 'All Experience')]")
            btn_all.click()
            time.sleep(1)
        except Exception as e:
            pass

        # Switch to Table view
        try:
            table_btn = driver.find_element(By.XPATH, "//button[@title='Table View']")
            table_btn.click()
            time.sleep(1)
            save_shot(driver, "e2e_05_opportunities_table_view.png")
        except Exception as e:
            print("Table view click issue:", e)

        print("=== TEST RUN COMPLETE ===", flush=True)
    finally:
        driver.quit()

if __name__ == "__main__":
    run()
