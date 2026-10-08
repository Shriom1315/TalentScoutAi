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
        print("[1] Navigating to dashboard...", flush=True)
        driver.get(f"{BASE_URL}/dashboard")
        time.sleep(2)
        
        # Check if already completed or if we need to click scrape
        view_buttons = driver.find_elements(By.XPATH, "//button[contains(., 'View Discovered Roles')]")
        if not view_buttons:
            scrape_buttons = driver.find_elements(By.XPATH, "//button[contains(., 'Run Live Scrape') or contains(., 'Live Scrape')]")
            if scrape_buttons:
                print(f"[2] Clicking scrape button...", flush=True)
                scrape_buttons[0].click()

        print("[3] Waiting for live discovery to complete (View Discovered Roles button to appear)...", flush=True)
        wait = WebDriverWait(driver, 60)
        btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'View Discovered Roles')]")))
        print("[4] Discovery completed!", flush=True)
        time.sleep(1)

        # Save screenshot of 100% completed modal
        complete_shot = os.path.join(ARTIFACT_DIR, "modal_100_percent_verified.png")
        driver.save_screenshot(complete_shot)
        print(f"[5] Saved completed modal screenshot to: {complete_shot}", flush=True)

        # Click "View Discovered Roles"
        print("[6] Clicking 'View Discovered Roles' button...", flush=True)
        btn.click()
        time.sleep(2)

        current_url = driver.current_url
        print(f"[7] Current URL: {current_url}", flush=True)
        assert "/opportunities" in current_url, f"Failed: Expected URL to contain /opportunities, got {current_url}"
        print("[8] PASSED: Successfully navigated to /opportunities!", flush=True)

        opp_shot = os.path.join(ARTIFACT_DIR, "opportunities_page_verified.png")
        driver.save_screenshot(opp_shot)
        print(f"[9] Saved opportunities screenshot to: {opp_shot}", flush=True)

    finally:
        driver.quit()

if __name__ == "__main__":
    main()
