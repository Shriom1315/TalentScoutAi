import sys
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

sys.stdout.reconfigure(encoding='utf-8')

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
}

EMAIL_REGEX = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")

def scrape_website_contacts(domain_or_url: str, company_name: str):
    print(f"Scraping contacts for: {company_name} ({domain_or_url})...", flush=True)
    
    if not domain_or_url.startswith("http"):
        base_url = f"https://{domain_or_url}"
    else:
        base_url = domain_or_url

    parsed = urlparse(base_url)
    domain = parsed.netloc.replace("www.", "")

    emails = set()
    social_links = {
        "linkedin": None,
        "twitter": None,
        "github": None,
        "website": base_url
    }

    # Common pages to check
    targets = [
        base_url,
        urljoin(base_url, "/contact"),
        urljoin(base_url, "/careers"),
        urljoin(base_url, "/about")
    ]

    for target in targets:
        try:
            res = requests.get(target, headers=HEADERS, timeout=4)
            if res.status_code != 200:
                continue
            
            text = res.text
            soup = BeautifulSoup(text, "html.parser")

            # Extract mailto links
            for a in soup.find_all("a", href=True):
                href = a["href"].strip()
                if href.startswith("mailto:"):
                    em = href.replace("mailto:", "").split("?")[0].strip()
                    if "@" in em and "." in em:
                        emails.add(em.lower())
                
                # Check for LinkedIn
                if "linkedin.com/company" in href and not social_links["linkedin"]:
                    social_links["linkedin"] = href
                elif "linkedin.com/in/" in href and not social_links["linkedin"]:
                    social_links["linkedin"] = href
                
                # Check for Twitter/X
                if ("twitter.com" in href or "x.com" in href) and not social_links["twitter"]:
                    if not any(x in href for x in ["intent", "share"]):
                        social_links["twitter"] = href

                # Check for GitHub
                if "github.com/" in href and not social_links["github"]:
                    social_links["github"] = href

            # Extract regex emails from body
            raw_emails = EMAIL_REGEX.findall(text)
            for em in raw_emails:
                em_clean = em.lower().strip(".,;:()")
                # Filter out images/assets that look like emails
                if not any(em_clean.endswith(ext) for ext in [".png", ".jpg", ".webp", ".svg", ".gif", ".js", ".css"]):
                    if domain in em_clean or any(k in em_clean for k in ["career", "job", "hr", "talent", "hire", "recruiting", "contact", "info", "hello"]):
                        emails.add(em_clean)

        except Exception as e:
            # print(f"Error on {target}: {e}")
            pass

    # Fallback LinkedIn company slug if none detected on site
    if not social_links["linkedin"]:
        clean_slug = re.sub(r"[^a-zA-Z0-9]", "-", company_name.strip()).lower().strip("-")
        social_links["linkedin"] = f"https://www.linkedin.com/company/{clean_slug}"

    # Pick prioritized email
    prioritized_email = None
    priority_keywords = ["career", "recruiting", "talent", "jobs", "hr", "contact", "hello", "info"]
    for kw in priority_keywords:
        for em in emails:
            if kw in em:
                prioritized_email = em
                break
        if prioritized_email:
            break
    
    if not prioritized_email and emails:
        prioritized_email = list(emails)[0]

    return {
        "company": company_name,
        "website": base_url,
        "primaryEmail": prioritized_email,
        "allEmails": list(emails),
        "social": social_links
    }

if __name__ == "__main__":
    test_companies = [
        ("infosys.com", "Infosys"),
        ("meesho.io", "Meesho"),
        ("cred.club", "CRED"),
        ("druva.com", "Druva"),
        ("mindtickle.com", "Mindtickle"),
    ]
    for url, comp in test_companies:
        data = scrape_website_contacts(url, comp)
        print(f"\nResult for {comp}:")
        print(f"  Primary Email: {data['primaryEmail']}")
        print(f"  All Emails: {data['allEmails']}")
        print(f"  LinkedIn: {data['social']['linkedin']}")
        print(f"  Twitter/X: {data['social']['twitter']}")
        print(f"  GitHub: {data['social']['github']}")
