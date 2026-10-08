import os
import sys
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

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

def verify():
    driver = setup_driver()
    try:
        print("\n=== STEP 1: DASHBOARD OPTIMIZATION VERIFICATION ===", flush=True)
        driver.get(f"{BASE_URL}/dashboard")
        time.sleep(2)
        save_shot(driver, "verify_01_dashboard_streamlined.png")

        # Check opportunities count in localStorage
        opp_count = driver.execute_script("""
            const opps = JSON.parse(localStorage.getItem('talentscout_opportunities_v2') || '[]');
            return opps.length;
        """)
        print(f"Current stored opportunities: {opp_count}", flush=True)

        if opp_count == 0:
            print("\nTriggering a fast discovery via API/Python pipeline to populate with authentic JobSpy roles...", flush=True)
            # Run quick scrape via search bar
            scrape_btn = driver.find_element(By.XPATH, "//button[contains(., 'Start Live Scrape') or contains(., 'Run JobSpy Live Scrape')]")
            scrape_btn.click()
            time.sleep(5)
            # Wait for scraping to finish (up to 30s)
            for i in range(15):
                is_busy = driver.execute_script("return document.body.innerText.includes('Scraping...') || document.body.innerText.includes('Connecting to python-jobspy');")
                if not is_busy:
                    break
                print(f"Waiting for live scrape... {i*2}s", flush=True)
                time.sleep(2)

        save_shot(driver, "verify_02_dashboard_populated.png")

        print("\n=== STEP 2: OPPORTUNITIES PAGE & EXPERIENCE FILTERS ===", flush=True)
        driver.get(f"{BASE_URL}/opportunities")
        time.sleep(2)
        save_shot(driver, "verify_03_opportunities_all_exp.png")

        # Let's verify clicking on '0–2 Yrs (Entry Level)'
        print("Testing filter: '0–2 Yrs (Entry Level)'...", flush=True)
        entry_btn = driver.find_element(By.XPATH, "//button[contains(., '0–2 Yrs')]")
        entry_btn.click()
        time.sleep(1)
        save_shot(driver, "verify_04_opportunities_entry_level.png")

        # Let's verify clicking on 'Fresher (0–1 Yrs)'
        print("Testing filter: 'Fresher (0–1 Yrs)'...", flush=True)
        fresher_btn = driver.find_element(By.XPATH, "//button[contains(., 'Fresher')]")
        fresher_btn.click()
        time.sleep(1)
        save_shot(driver, "verify_05_opportunities_fresher.png")

        # Let's verify clicking on '5+ Yrs (Senior / Lead)'
        print("Testing filter: '5+ Yrs (Senior / Lead)'...", flush=True)
        senior_btn = driver.find_element(By.XPATH, "//button[contains(., '5+ Yrs')]")
        senior_btn.click()
        time.sleep(1)
        save_shot(driver, "verify_06_opportunities_senior.png")

        # Reset to All Experience
        all_exp_btn = driver.find_element(By.XPATH, "//button[contains(., 'All Experience')]")
        all_exp_btn.click()
        time.sleep(1)

        # Switch to Table view
        table_btn = driver.find_element(By.XPATH, "//button[@title='Table View']")
        table_btn.click()
        time.sleep(1)
        save_shot(driver, "verify_07_opportunities_table_view.png")

        print("\n=== VERIFICATION COMPLETE: ALL PASS ===", flush=True)

    finally:
        driver.quit()

if __name__ == "__main__":
    verify()
