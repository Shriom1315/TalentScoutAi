"""
Fast parallel tester for Indian tech hub job sources
"""

import requests
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

INDIAN_HUBS = [
    'bengaluru', 'bangalore', 'hyderabad', 'pune', 'mumbai',
    'gurgaon', 'gurugram', 'noida', 'delhi', 'ncr', 'chennai',
    'india', 'remote - india', 'remote (india)'
]

def is_indian_hub(location_text):
    if not location_text:
        return False
    loc = location_text.lower()
    return any(hub in loc for hub in INDIAN_HUBS)

def check_greenhouse(name, board):
    for base in ['https://boards-api.greenhouse.io/v1/boards/', 'https://job-boards.eu.greenhouse.io/']:
        url = f'{base}{board}/jobs?content=true'
        try:
            r = requests.get(url, timeout=3)
            if r.status_code == 200:
                data = r.json()
                items = data.get('jobs', [])
                india_items = [j for j in items if is_indian_hub(j.get('location', {}).get('name'))]
                if india_items:
                    return {
                        'type': 'Greenhouse',
                        'name': name,
                        'board': board,
                        'count': len(india_items),
                        'sample': india_items[0].get('title'),
                        'loc': india_items[0].get('location', {}).get('name'),
                        'url': india_items[0].get('absolute_url')
                    }
                break
        except Exception:
            pass
    return None

def check_lever(name, comp):
    url = f'https://api.lever.co/v0/postings/{comp}?mode=json'
    try:
        r = requests.get(url, timeout=3)
        if r.status_code == 200:
            items = r.json()
            if isinstance(items, list):
                india_items = [j for j in items if is_indian_hub(j.get('categories', {}).get('location'))]
                if india_items:
                    return {
                        'type': 'Lever',
                        'name': name,
                        'board': comp,
                        'count': len(india_items),
                        'sample': india_items[0].get('text'),
                        'loc': india_items[0].get('categories', {}).get('location'),
                        'url': india_items[0].get('hostedUrl')
                    }
    except Exception:
        pass
    return None

def main():
    start = time.time()
    targets = [
        # (type, name, slug)
        ('gh', 'InMobi', 'inmobi'),
        ('gh', 'Groww', 'groww'),
        ('gh', 'Postman', 'postman'),
        ('gh', 'BrowserStack', 'browserstack'),
        ('gh', 'Swiggy', 'swiggy'),
        ('gh', 'Razorpay', 'razorpay'),
        ('gh', 'Zepto', 'zepto'),
        ('gh', 'CRED', 'cred'),
        ('gh', 'Urban Company', 'urbancompany'),
        ('gh', 'Khatabook', 'khatabook'),
        ('gh', 'Juspay', 'juspay'),
        ('gh', 'PhysicsWallah', 'physicswallah'),
        ('gh', 'Pocket FM', 'pocketfm'),
        ('lever', 'Freshworks', 'freshworks'),
        ('lever', 'Hasura', 'hasura'),
        ('lever', 'CleverTap', 'clevertap'),
        ('lever', 'MoEngage', 'moengage'),
        ('lever', 'Darwinbox', 'darwinbox'),
        ('lever', 'LeadSquared', 'leadsquared'),
        ('lever', 'Whatfix', 'whatfix'),
        ('lever', 'Unacademy', 'unacademy'),
        ('lever', 'Chargebee', 'chargebee'),
        ('lever', 'Yellow.ai', 'yellowai'),
    ]

    results = []
    with ThreadPoolExecutor(max_workers=12) as ex:
        futures = []
        for t, name, slug in targets:
            if t == 'gh':
                futures.append(ex.submit(check_greenhouse, name, slug))
            else:
                futures.append(ex.submit(check_lever, name, slug))

        for f in as_completed(futures):
            res = f.result()
            if res:
                results.append(res)
                print(f"[{res['type']}] {res['name']}: {res['count']} jobs in {res['loc']} | Sample: {res['sample']}", flush=True)

    print(f"\nDone in {time.time()-start:.2f}s. Total companies with Indian hub jobs: {len(results)}", flush=True)

if __name__ == '__main__':
    main()
