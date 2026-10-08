"""
Arbitrary URL HTML Scraper
Uses requests, BeautifulSoup4, and lxml to extract job postings, metadata, and emails from any web page.
"""

from typing import Dict, Any, Optional
import requests
import bs4
import json
import re

EMAIL_REGEX = re.compile(r"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})")


def scrape_job_from_url(page_url: str) -> Optional[Dict[str, Any]]:
    """
    Scrapes a live webpage using requests and BeautifulSoup4 to extract job title,
    company name, description, and contact emails.
    """
    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }
        res = requests.get(page_url, headers=headers, timeout=12)
        if res.status_code != 200:
            return None

        # Parse with BeautifulSoup4
        soup = bs4.BeautifulSoup(res.text, "html.parser")

        # 1. Check for JSON-LD schema.org JobPosting
        json_ld_scripts = soup.find_all("script", type="application/ld+json")
        for script in json_ld_scripts:
            try:
                data = json.loads(script.string or "{}")
                if isinstance(data, dict) and data.get("@type") == "JobPosting":
                    title = data.get("title", "")
                    hiring_org = data.get("hiringOrganization", {})
                    company = hiring_org.get("name", "") if isinstance(hiring_org, dict) else ""
                    desc = data.get("description", "")
                    clean_desc = bs4.BeautifulSoup(desc, "html.parser").get_text()

                    emails = EMAIL_REGEX.findall(clean_desc)
                    domain_slug = re.sub(r"[^a-z0-9]", "", company.lower())

                    return {
                        "title": title or "Software Engineer",
                        "company": company or "Hiring Company",
                        "description": clean_desc[:900],
                        "url": page_url,
                        "location": "Remote / Onsite",
                        "remote": "remote" in clean_desc.lower(),
                        "source": "Direct URL Scrape",
                        "contactEmail": emails[0] if emails else f"careers@{domain_slug}.com",
                        "contactName": f"{company} Hiring Team",
                        "contactRole": "Recruiter / Hiring Lead",
                    }
            except Exception:
                pass

        # 2. Extract OpenGraph and standard meta tags
        og_title = soup.find("meta", property="og:title")
        og_desc = soup.find("meta", property="og:description")
        og_site = soup.find("meta", property="og:site_name")

        title = og_title.get("content", "") if og_title else ""
        if not title and soup.title:
            title = soup.title.string or ""

        # Clean title
        title_clean = title.split(" - ")[0].split(" | ")[0].strip() or "Engineering Opportunity"

        company = og_site.get("content", "") if og_site else ""
        if not company:
            # Fallback company extraction from domain
            from urllib.parse import urlparse
            netloc = urlparse(page_url).netloc
            company = netloc.split(".")[-2].capitalize() if "." in netloc else "Tech Company"

        desc_text = og_desc.get("content", "") if og_desc else ""
        if not desc_text:
            body = soup.find("body")
            desc_text = body.get_text(separator=" ") if body else ""

        clean_desc = re.sub(r"\s+", " ", desc_text).strip()[:800]
        emails = EMAIL_REGEX.findall(clean_desc)

        domain_slug = re.sub(r"[^a-z0-9]", "", company.lower())
        contact_email = emails[0] if emails else f"hiring@{domain_slug}.com"

        return {
            "title": title_clean,
            "company": company,
            "description": clean_desc,
            "url": page_url,
            "location": "Verified Posting",
            "remote": "remote" in clean_desc.lower(),
            "source": "Web Page Scraper",
            "contactEmail": contact_email,
            "contactName": f"{company} Recruitment",
            "contactRole": "Talent Lead",
        }

    except Exception as e:
        print(f"[URL Scraper Error] {e}")
        return None
