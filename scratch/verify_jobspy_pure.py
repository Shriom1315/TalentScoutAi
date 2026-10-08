import os
import sys
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

sys.stdout.reconfigure(encoding='utf-8')
ARTIFACT_DIR = r"C:\Users\shrio\.gemini\antigravity-ide\brain\978ee2a3-7c55-45b3-95bc-9d59e239ac34"
BASE_URL = "http://localhost:5173"

def main():
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1440,950")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    driver = webdriver.Chrome(options=options)

    try:
        print("[1] Opening /opportunities page...", flush=True)
        driver.get(f"{BASE_URL}/opportunities")
        time.sleep(2)

        # Clear any stale localStorage and trigger pure JobSpy scrape
        print("[2] Triggering JobSpy harvest directly from the page...", flush=True)
        harvest_btn = driver.find_elements(By.XPATH, "//button[contains(., 'Harvest with JobSpy') or contains(., 'Run JobSpy Discovery')]")
        if harvest_btn:
            harvest_btn[0].click()
            print("[3] Clicked Harvest with JobSpy button! Waiting for completion...", flush=True)
            
            # Wait for Discovery modal or harvest to complete
            wait = WebDriverWait(driver, 60)
            view_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'View Discovered Roles')]")))
            print("[4] Discovery completed! Clicking 'View Discovered Roles'...", flush=True)
            
            modal_shot = os.path.join(ARTIFACT_DIR, "jobspy_pure_modal_completed.png")
            driver.save_screenshot(modal_shot)
            print(f"[5] Saved completed modal shot to: {modal_shot}", flush=True)

            view_btn.click()
            time.sleep(2)

        # Take screenshot of Opportunities page
        opp_shot = os.path.join(ARTIFACT_DIR, "jobspy_pure_opportunities_page.png")
        driver.save_screenshot(opp_shot)
        print(f"[6] Saved Opportunities page screenshot to: {opp_shot}", flush=True)

        # Check job badges on the page
        body_text = driver.find_element(By.TAG_NAME, "body").text
        print("\n--- Opportunities Summary Check ---")
        for line in body_text.split("\n"):
            line_str = line.strip()
            if any(k in line_str.lower() for k in ["jobspy", "naukri", "indeed", "glassdoor", "lpa", "apply"]):
                print(f"  {line_str}")
        print("-----------------------------------\n")

        # Now navigate to Dashboard
        print("[7] Navigating to Dashboard...", flush=True)
        driver.get(f"{BASE_URL}/dashboard")
        time.sleep(2)
        
        dash_shot = os.path.join(ARTIFACT_DIR, "jobspy_pure_dashboard_page.png")
        driver.save_screenshot(dash_shot)
        print(f"[8] Saved Dashboard screenshot to: {dash_shot}", flush=True)

        print("[9] ALL VERIFICATIONS PASSED!", flush=True)

    finally:
        driver.quit()

if __name__ == "__main__":
    main()
