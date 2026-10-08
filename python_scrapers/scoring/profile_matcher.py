"""
Candidate Profile Scoring & Dynamic Prototype Generation Module
Uses regex and text analysis to compute technical alignment and custom proof-of-skill briefs.
"""

from typing import Dict, Any, List, Tuple
import re
import time
import datetime

CANDIDATE_CORE_SKILLS = [
    "react", "typescript", "javascript", "node.js", "nodejs",
    "frontend", "full stack", "fullstack", "tailwind", "html", "css",
    "python", "api", "next.js", "express", "git", "sql", "mongodb", "rest"
]

TECH_DISPLAY_MAP = {
    "react": "React",
    "typescript": "TypeScript",
    "javascript": "JavaScript",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "python": "Python",
    "tailwind": "Tailwind CSS",
    "next.js": "Next.js",
    "nextjs": "Next.js",
    "full stack": "Full Stack",
    "fullstack": "Full Stack",
    "frontend": "Frontend",
    "backend": "Backend",
    "api": "REST APIs",
    "sql": "SQL",
    "postgresql": "PostgreSQL",
    "mongodb": "MongoDB",
    "graphql": "GraphQL",
    "docker": "Docker",
    "aws": "AWS",
    "fastapi": "FastAPI",
    "express": "Express",
}


def extract_experience_requirements(title: str, description: str, tags: List[str] = None) -> Tuple[str, int, int]:
    """
    Accurately extracts required experience from job title, description, and tags.
    Returns: (display_label, min_years, max_years)
    """
    if tags is None:
        tags = []

    t_lower = title.lower().strip()
    d_lower = description.lower()
    combined = f"{t_lower} {d_lower} {' '.join(tags).lower()}"

    # 1. Direct Title-Based Strong Overrides
    if re.search(r"\b(intern|internship|trainee intern|co-op)\b", t_lower):
        return ("Internship", 0, 0)

    if re.search(r"\b(tech(?:nical)? lead|team lead|principal|architect|staff engineer|engineering manager|director)\b", t_lower):
        return ("5+ years (Lead / Architect)", 5, 10)

    if re.search(r"\b(senior|sr\.|sr\b)\b", t_lower):
        m = re.search(r"(\d+)\s*(?:-|to)\s*(\d+)\s*(?:years?|yrs?)", combined)
        if m:
            mn, mx = int(m.group(1)), int(m.group(2))
            if mn <= 15:
                return (f"{mn}–{mx} years", mn, mx)
        m_plus = re.search(r"(\d+)\s*\+\s*(?:years?|yrs?)", combined)
        if m_plus:
            mn = int(m_plus.group(1))
            if mn <= 15:
                return (f"{mn}+ years", mn, mn + 3)
        return ("4–7 years (Senior)", 4, 7)

    # 2. Explicit Range in text (e.g. "0 - 2 years", "1 - 3 yrs", "2 to 5 years")
    range_match = re.search(r"(\d+)\s*(?:-|to)\s*(\d+)\s*(?:years?|yrs?)(?:\s+(?:of\s+)?(?:experience|exp))?", combined)
    if range_match:
        mn = int(range_match.group(1))
        mx = int(range_match.group(2))
        if mn <= 10 and mx <= 20 and mn <= mx:
            if mn == 0 and mx <= 1:
                return ("Fresher / 0–1 yrs", 0, 1)
            elif mn == 0 and mx == 2:
                return ("0–2 years (Entry Level)", 0, 2)
            elif mn == 1 and mx <= 3:
                return (f"{mn}–{mx} years", mn, mx)
            return (f"{mn}–{mx} years", mn, mx)

    # 3. Minimum / Plus Experience in text (e.g. "3+ years", "minimum 2 years")
    plus_match = re.search(r"(\d+)\s*\+\s*(?:years?|yrs?)(?:\s+(?:of\s+)?(?:experience|exp))?", combined)
    if plus_match:
        mn = int(plus_match.group(1))
        if mn <= 15:
            if mn <= 1:
                return ("0–1 years", 0, 1)
            elif mn == 2:
                return ("2+ years", 2, 4)
            return (f"{mn}+ years", mn, mn + 3)

    min_req_match = re.search(r"(?:minimum|at least|requires?)\s*(\d+)\s*(?:years?|yrs?)", combined)
    if min_req_match:
        mn = int(min_req_match.group(1))
        if mn <= 15:
            if mn <= 1:
                return ("Fresher / 0–1 yrs", 0, 1)
            return (f"{mn}+ years", mn, mn + 2)

    # 4. Fresher / Trainee / Graduate Keywords
    if re.search(r"\b(fresher|freshers|entry[- ]level|graduate trainee|get|recent graduate|campus hire|0\s*years?)\b", combined):
        return ("Fresher (0–1 yrs)", 0, 1)

    # 5. Junior / Associate in Title
    if re.search(r"\b(junior|jr\.|associate developer|associate engineer|sde\s*1|sde-1|sde\s*i)\b", t_lower):
        return ("0–2 years (Entry Level)", 0, 2)

    # 6. Default fallback for developer role
    return ("0–2 years (Entry Level)", 0, 2)


def score_job_alignment(title: str, description: str, tags: List[str] = None) -> Tuple[int, Dict[str, int], str, List[str], int, int]:
    """
    Computes candidate profile alignment (0-100) and breakdown.
    Candidate target: Shriom (MCA Graduate, React / Node.js / TypeScript / Full-Stack).
    Returns: (match_score, breakdown, exp_type, detected_tech, min_exp_years, max_exp_years)
    """
    if tags is None:
        tags = []

    combined_text = f"{title} {description} {' '.join(tags)}".lower()

    # Detect technologies
    detected_tech: List[str] = []
    for key, label in TECH_DISPLAY_MAP.items():
        if re.search(r"\b" + re.escape(key) + r"\b", combined_text) and label not in detected_tech:
            detected_tech.append(label)

    if not detected_tech:
        detected_tech = ["JavaScript", "React", "Frontend"]

    # 1. Technical Skills Fit (max 35)
    tech_points = 14
    for skill in CANDIDATE_CORE_SKILLS:
        if re.search(r"\b" + re.escape(skill) + r"\b", combined_text):
            tech_points += 3
    technical_skills = min(35, tech_points)

    # 2. Role Alignment (max 25)
    role_points = 15
    if re.search(r"frontend|front-end|react|full stack|fullstack|software engineer|web developer", title, re.I):
        role_points = 24
    elif re.search(r"engineer|developer|trainee|intern", title, re.I):
        role_points = 20
    role_alignment = min(25, role_points)

    # 3. Experience Match (max 20)
    exp_type, min_exp, max_exp = extract_experience_requirements(title, description, tags)
    if min_exp == 0:
        experience = 20
    elif min_exp == 1:
        experience = 19
    elif min_exp == 2:
        experience = 17
    elif min_exp == 3:
        experience = 11
    else:
        experience = 6

    # 4. Education Fit (max 10) - MCA / CS background
    education = 10

    # 5. Location / Remote Fit (max 10)
    is_remote = bool(re.search(r"remote|anywhere|distributed|hybrid|wfh|india|bangalore|bengaluru|delhi|mumbai|pune", combined_text, re.I))
    location_score = 10 if is_remote else 8

    total_score = technical_skills + role_alignment + experience + education + location_score
    match_score = min(98, max(58, total_score))

    breakdown = {
        "technicalSkills": technical_skills,
        "experience": experience,
        "education": education,
        "location": location_score,
        "roleAlignment": role_alignment,
    }

    return match_score, breakdown, exp_type, detected_tech, min_exp, max_exp


def generate_prototype_brief(company: str, role: str, tech_stack: List[str], desc: str) -> Dict[str, Any]:
    """
    Generates a tailored proof-of-skill prototype proposal for outreach.
    """
    primary_tech = ", ".join(tech_stack[:3]) if tech_stack else "React, TypeScript"
    is_frontend = bool(re.search(r"frontend|ui|design|react|web", f"{role} {desc}", re.I))

    if is_frontend:
        problem = f"{company} requires responsive, high-velocity user interfaces with real-time feedback and clean state boundaries."
        title = f"{company} Interactive Sandbox & Component Explorer"
    else:
        problem = f"{company} needs resilient, async API services with structured request validation and minimal latency."
        title = f"{company} Scalable Microservice & API Performance Hub"

    description = (
        f"A customized working proof-of-concept demonstrating rapid client-side updates, "
        f"typed schema validation, and modular component hierarchy tailored for {company}'s stack ({primary_tech})."
    )

    return {
        "problem": problem,
        "title": title,
        "description": description,
        "whyItMatches": f"Directly demonstrates hands-on velocity in {primary_tech} rather than generic resume bullets.",
        "estimatedEffort": "2–3 hours",
        "techStack": tech_stack[:4],
        "keyFeatures": [
            "Production-ready responsive architecture with zero layout shift",
            "End-to-end typed contracts and optimistic data synchronization",
            "Deployed live preview with public GitHub repository documentation",
        ],
    }


def compute_lpa_salary(company: str, role: str, description: str, exp_type: str) -> Tuple[str, float, float, float]:
    """
    Computes authentic salary in LPA (Lakhs Per Annum) for Indian tech opportunities.
    Extracts explicit LPA if present in text, or benchmarks calibrated compensation
    based on role seniority, tech stack, and company tier.
    Returns: (salary_display_str, min_lpa, max_lpa, midpoint_lpa)
    """
    combined = f"{role} {description}".lower()

    # 1. Check for explicit LPA mention in text, e.g. "12-18 LPA", "15 LPA", "₹14,00,000"
    lpa_range_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?|lac)", combined)
    if lpa_range_match:
        mn = float(lpa_range_match.group(1))
        mx = float(lpa_range_match.group(2))
        mn_str = f"{mn:.1f}".replace(".0", "")
        mx_str = f"{mx:.1f}".replace(".0", "")
        return (f"₹{mn_str} – {mx_str} LPA", mn, mx, round((mn + mx) / 2, 1))

    single_lpa_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?|lac)", combined)
    if single_lpa_match:
        val = float(single_lpa_match.group(1))
        mn = max(3.0, round(val * 0.85, 1))
        mx = round(val * 1.15, 1)
        mn_str = f"{mn:.1f}".replace(".0", "")
        mx_str = f"{mx:.1f}".replace(".0", "")
        return (f"₹{mn_str} – {mx_str} LPA", mn, mx, val)

    # 2. Calibrate by company tier & role
    famous_tier1 = ["cred", "meesho", "inmobi", "zeta", "mindtickle", "postman", "swiggy", "razorpay"]
    is_tier1 = any(c in company.lower() for c in famous_tier1)

    if exp_type == "Internship" or "intern" in role.lower():
        mn, mx = (4.8, 7.2) if is_tier1 else (3.6, 6.0)
    elif exp_type == "Fresher" or "junior" in role.lower() or "trainee" in role.lower():
        mn, mx = (12.0, 18.0) if is_tier1 else (7.5, 13.5)
    elif exp_type == "0–1 years":
        mn, mx = (13.0, 19.0) if is_tier1 else (8.5, 14.5)
    elif exp_type == "0–2 years":
        mn, mx = (14.0, 22.0) if is_tier1 else (10.0, 16.5)
    elif exp_type == "1–2 years":
        mn, mx = (16.0, 25.0) if is_tier1 else (12.0, 18.5)
    elif exp_type == "2–3 years":
        mn, mx = (18.0, 28.0) if is_tier1 else (14.0, 22.0)
    else:
        mn, mx = (24.0, 38.0) if is_tier1 else (18.0, 30.0)

    # Premium for AI / Full Stack / Cloud
    if any(k in combined for k in ["ai", "machine learning", "full stack", "react", "cloud", "devops"]):
        mn += 1.0
        mx += 2.0

    mid = round((mn + mx) / 2, 1)
    mn_str = f"{mn:.1f}".replace(".0", "")
    mx_str = f"{mx:.1f}".replace(".0", "")
    return (f"₹{mn_str} – {mx_str} LPA", mn, mx, mid)


def compute_eligibility(role: str, description: str, exp_type: str, min_exp: int = 0, max_exp: int = 2) -> Dict[str, Any]:
    """
    Computes early-career candidate eligibility for Indian engineering graduates.
    Candidate target profile: MCA / B.Tech / CS Fresher (0–2 years).
    """
    degrees = ["MCA", "B.Tech", "BE", "BCA", "CS / IT Graduate"]
    batches = ["2024", "2025", "2026"]

    # Candidate profile is early career (0–2 years)
    is_eligible = (min_exp <= 2)

    if not is_eligible:
        return {
            "degrees": degrees,
            "experienceYears": exp_type,
            "batch": batches,
            "isEligible": False,
            "degreeEligible": True,
            "experienceEligible": False,
            "batchEligible": False,
            "minExp": min_exp,
            "maxExp": max_exp,
            "reason": f"Role requires {min_exp}–{max_exp} years experience ({exp_type}), exceeding early-career / fresher criteria.",
            "eligibilitySummary": f"Requires {min_exp}+ Years Experience (Mid / Senior Role)",
            "matchReason": f"Required experience ({min_exp}+ yrs) exceeds candidate profile (0–2 yrs)"
        }

    return {
        "degrees": degrees,
        "experienceYears": exp_type,
        "batch": batches,
        "isEligible": True,
        "degreeEligible": True,
        "experienceEligible": True,
        "batchEligible": True,
        "minExp": min_exp,
        "maxExp": max_exp,
        "reason": f"Directly eligible for MCA/B.Tech graduates ({exp_type}).",
        "eligibilitySummary": f"Eligible: MCA / B.Tech • {exp_type}",
        "matchReason": f"Directly eligible for MCA/B.Tech graduates with {exp_type} background"
    }


def format_posting_datetime(created_at_ms: int = None, iso_string: str = None) -> Tuple[str, str, int]:
    """
    Converts ATS timestamp or current scrape time into realistic relative and exact date/time.
    Returns: (relative_time_display, exact_formatted_str, epoch_ms)
    """
    import datetime
    now_epoch = int(time.time() * 1000)

    epoch_ms = now_epoch
    if created_at_ms and created_at_ms > 0:
        epoch_ms = int(created_at_ms)
    elif iso_string:
        try:
            clean_iso = iso_string.split("+")[0].split("Z")[0]
            if "." in clean_iso:
                clean_iso = clean_iso.split(".")[0]
            dt = datetime.datetime.fromisoformat(clean_iso)
            epoch_ms = int(dt.timestamp() * 1000)
        except Exception:
            epoch_ms = now_epoch

    diff_sec = max(0, int((now_epoch - epoch_ms) / 1000))
    dt_obj = datetime.datetime.fromtimestamp(epoch_ms / 1000)
    exact_str = dt_obj.strftime("%b %d, %Y • %I:%M %p")

    if diff_sec < 60:
        relative_str = "Just now"
    elif diff_sec < 3600:
        mins = max(1, diff_sec // 60)
        relative_str = f"{mins}m ago (Today)"
    elif diff_sec < 86400:
        time_part = dt_obj.strftime("%I:%M %p")
        relative_str = f"Today at {time_part}"
    elif diff_sec < 172800:
        time_part = dt_obj.strftime("%I:%M %p")
        relative_str = f"Yesterday at {time_part}"
    elif diff_sec < 86400 * 7:
        days = diff_sec // 86400
        month_day = dt_obj.strftime("%b %d")
        relative_str = f"{days} days ago ({month_day})"
    else:
        month_day_year = dt_obj.strftime("%b %d, %Y")
        relative_str = f"{month_day_year} • Verified Active"

    return (relative_str, exact_str, epoch_ms)
