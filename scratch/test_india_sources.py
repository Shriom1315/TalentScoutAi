"""
Explore and test real live sources for Indian IT Hub tech jobs.
Indian IT Hubs:
- Bengaluru / Bangalore
- Hyderabad
- Pune
- NCR (Gurgaon / Gurugram, Noida, Delhi)
- Mumbai
- Chennai
"""

import requests
import re
import json

INDIAN_HUBS = [
    'bengaluru', 'bangalore', 'hyderabad', 'pune', 'mumbai',
    'gurgaon', 'gurugram', 'noida', 'delhi', 'ncr', 'chennai',
    'india', 'remote - india', 'remote, india'
]

def is_indian_hub(location_text):
    if not location_text:
        return False
    loc = location_text.lower()
    return any(hub in loc for hub in INDIAN_HUBS)

print("=== 1. TESTING TOP INDIAN TECH COMPANIES ON GREENHOUSE ===")
greenhouse_boards = [
    ('InMobi', 'inmobi'),
    ('Groww', 'groww'),
    ('Postman', 'postman'),
    ('BrowserStack', 'browserstack'),
    ('Swiggy', 'swiggy'),
    ('Razorpay', 'razorpay'),
    ('Zepto', 'zepto'),
    ('CRED', 'cred'),
    ('Meesho', 'meesho'),
    ('Urban Company', 'urbancompany'),
    ('Khatabook', 'khatabook'),
    ('PhonePe', 'phonepe'),
    ('Juspay', 'juspay'),
    ('Licious', 'licious'),
    ('Spinny', 'spinny'),
    ('Rupeek', 'rupeek'),
    ('PhysicsWallah', 'physicswallah'),
    ('CoinSwitch', 'coinswitch'),
    ('Pocket FM', 'pocketfm'),
]

gh_jobs = []
for name, board in greenhouse_boards:
    for base in ['https://boards-api.greenhouse.io/v1/boards/', 'https://job-boards.eu.greenhouse.io/']:
        url = f'{base}{board}/jobs?content=true'
        try:
            r = requests.get(url, timeout=4)
            if r.status_code == 200:
                data = r.json()
                items = data.get('jobs', [])
                india_items = [j for j in items if is_indian_hub(j.get('location', {}).get('name'))]
                if india_items:
                    print(f"  [GH] {name} ({board}): {len(india_items)} Indian hub jobs! (Total {len(items)})")
                    gh_jobs.extend([(name, j) for j in india_items])
                break
        except Exception:
            pass

print(f"Total Greenhouse India jobs found: {len(gh_jobs)}")
if gh_jobs:
    print(f"Sample 1: {gh_jobs[0][0]} -> {gh_jobs[0][1].get('title')} ({gh_jobs[0][1].get('location', {}).get('name')})")

print("\n=== 2. TESTING TOP INDIAN TECH COMPANIES ON LEVER ===")
lever_companies = [
    ('Freshworks', 'freshworks'),
    ('Hasura', 'hasura'),
    ('CleverTap', 'clevertap'),
    ('MoEngage', 'moengage'),
    ('Darwinbox', 'darwinbox'),
    ('LeadSquared', 'leadsquared'),
    ('Signzy', 'signzy'),
    ('Whatfix', 'whatfix'),
    ('Unacademy', 'unacademy'),
    ('Chargebee', 'chargebee'),
    ('Yellow.ai', 'yellowai'),
    ('Haptik', 'haptik'),
]

lever_jobs = []
for name, comp in lever_companies:
    url = f'https://api.lever.co/v0/postings/{comp}?mode=json'
    try:
        r = requests.get(url, timeout=4)
        if r.status_code == 200:
            items = r.json()
            if isinstance(items, list):
                india_items = [j for j in items if is_indian_hub(j.get('categories', {}).get('location'))]
                if india_items:
                    print(f"  [Lever] {name} ({comp}): {len(india_items)} Indian hub jobs! (Total {len(items)})")
                    lever_jobs.extend([(name, j) for j in india_items])
    except Exception:
        pass

print(f"Total Lever India jobs found: {len(lever_jobs)}")
if lever_jobs:
    print(f"Sample 1: {lever_jobs[0][0]} -> {lever_jobs[0][1].get('text')} ({lever_jobs[0][1].get('categories', {}).get('location')})")

print("\n=== 3. TESTING HACKER NEWS FOR INDIAN HUBS ===")
try:
    hn_url = 'https://hn.algolia.com/api/v1/search_by_date?tags=comment,author_whoishiring&query=Bangalore%20OR%20Bengaluru%20OR%20Hyderabad%20OR%20Pune%20OR%20Gurgaon%20OR%20Noida%20OR%20India&hitsPerPage=30'
    r = requests.get(hn_url, timeout=8)
    if r.status_code == 200:
        hits = r.json().get('hits', [])
        print(f"HN Algolia search for Indian hubs returned {len(hits)} hits!")
except Exception as e:
    print("HN err:", e)
