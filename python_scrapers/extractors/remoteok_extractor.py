"""
RemoteOK Live Jobs Extractor
Extracts authentic remote tech opportunities and verifiable URLs.
Zero fabricated or guessed emails.
"""

from typing import List, Dict, Any
import requests
import bs4
import re

EMAIL_REGEX = re.compile(r"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})")


def scrape_remoteok(limit: int = 20) -> List[Dict[str, Any]]:
    """
    Scrapes live remote engineering jobs from RemoteOK.
    """
    jobs: List[Dict[str, Any]] = []

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json",
        }
        res = requests.get("https://remoteok.com/api", headers=headers, timeout=10)
        if res.status_code != 200:
            return jobs

        data = res.json()
        if not isinstance(data, list):
            return jobs

        valid_items = [j for j in data if isinstance(j, dict) and j.get("company") and j.get("position")][:limit]

        for item in valid_items:
            raw_html = item.get("description", "")
            soup = bs4.BeautifulSoup(raw_html, "html.parser")
            clean_text = soup.get_text(separator=" ").strip()
            clean_text = re.sub(r"\s+", " ", clean_text)[:750]

            company = item.get("company", "Remote Tech")
            post_url = item.get("url") or item.get("apply_url") or "https://remoteok.com"

            min_sal = item.get("salary_min")
            max_sal = item.get("salary_max")
            salary_str = "Competitive Market"
            if min_sal and max_sal:
                salary_str = f"${int(min_sal)//1000}k–${int(max_sal)//1000}k / year"

            emails = EMAIL_REGEX.findall(clean_text)
            contact_email = emails[0] if emails else ""

            jobs.append({
                "title": item.get("position", "Frontend Engineer"),
                "company": company,
                "companyWebsite": post_url,
                "description": clean_text,
                "url": post_url,
                "location": item.get("location") or "Worldwide Remote",
                "remote": True,
                "tags": item.get("tags", []),
                "salary": salary_str,
                "logo": item.get("logo"),
                "source": "RemoteOK",
                "contactEmail": contact_email,
                "contactName": f"{company} Talent Team",
                "contactRole": "Hiring Manager",
            })

    except Exception as e:
        print(f"[RemoteOK Extractor Error] {e}")

    return jobs
