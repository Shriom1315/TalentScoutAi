"""
Test DNS MX Re-verification on a contact with an authentic email.
"""

import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

ARTIFACT_DIR = r"C:\Users\shrio\.gemini\antigravity-ide\brain\978ee2a3-7c55-45b3-95bc-9d59e239ac34"
BASE_URL = "http://localhost:5173"

def test_dns_reverification():
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1440,900")
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(6)

    try:
        driver.get(f"{BASE_URL}/contacts")
        time.sleep(2)

        # Look for Verified Only tab or contact with email
        verified_tab = driver.find_elements(By.XPATH, "//button[contains(., 'Verified Only') or contains(., 'All Contacts')]")
        if verified_tab:
            driver.execute_script("arguments[0].click();", verified_tab[0])
            time.sleep(1)

        # Find row with an email address containing '@'
        rows = driver.find_elements(By.XPATH, "//tbody/tr")
        target_row = None
        for r in rows:
            if "@" in r.text:
                target_row = r
                break

        if not target_row and rows:
            target_row = rows[0]

        if target_row:
            print(f"[FOUND CONTACT ROW] {target_row.text[:80]}", flush=True)
            driver.execute_script("arguments[0].click();", target_row)
            time.sleep(2)

            # Look for Re-verify DNS MX button
            reverify_btn = driver.find_elements(By.XPATH, "//button[contains(., 'Re-verify DNS MX in Real Time')]")
            if reverify_btn:
                driver.execute_script("arguments[0].click();", reverify_btn[0])
                print("[ACTION] Triggered live DNS MX resolution on drawer...", flush=True)
                time.sleep(3)

            shot_path = os.path.join(ARTIFACT_DIR, "e2e_12_contact_email_mx_verified.png")
            driver.save_screenshot(shot_path)
            print(f"[SCREENSHOT] Saved: {shot_path}", flush=True)

    finally:
        driver.quit()

if __name__ == "__main__":
    test_dns_reverification()
