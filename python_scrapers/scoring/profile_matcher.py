"""
Candidate Profile Scoring & Dynamic Prototype Generation Module
Uses regex and text analysis to compute technical alignment and custom proof-of-skill briefs.
"""

from typing import Dict, Any, List, Tuple
import re

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


def score_job_alignment(title: str, description: str, tags: List[str] = None) -> Tuple[int, Dict[str, int], str, List[str]]:
    """
    Computes candidate profile alignment (0-100) and breakdown.
    Candidate target: Shriom (MCA Graduate, React / Node.js / TypeScript / Full-Stack).
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
    exp_points = 18
    exp_type = "0–2 years"

    if re.search(r"intern|internship|trainee", title, re.I) or re.search(r"intern|internship", description, re.I):
        exp_type = "Internship"
        exp_points = 20
    elif re.search(r"fresher|entry|junior|graduate|0-1|0–1|early career", combined_text, re.I):
        exp_type = "Fresher"
        exp_points = 20
    elif re.search(r"1-2|1–2|2 years", combined_text, re.I):
        exp_type = "1–2 years"
        exp_points = 17
    elif re.search(r"senior|lead|principal|staff|director", title, re.I):
        exp_type = "2–3 years"
        exp_points = 12
    experience = min(20, exp_points)

    # 4. Education Fit (max 10) - MCA / CS background
    education = 10

    # 5. Location / Remote Fit (max 10)
    is_remote = bool(re.search(r"remote|anywhere|distributed|hybrid|wfh|india|bangalore|bengaluru|delhi|mumbai|pune", combined_text, re.I))
    location_score = 10 if is_remote else 8

    total_score = technical_skills + role_alignment + experience + education + location_score
    match_score = min(98, max(72, total_score))

    breakdown = {
        "technicalSkills": technical_skills,
        "experience": experience,
        "education": education,
        "location": location_score,
        "roleAlignment": role_alignment,
    }

    return match_score, breakdown, exp_type, detected_tech


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


def estimate_lpa_salary(title: str, company: str, exp_type: str, tech_stack: List[str] = None) -> Tuple[str, float, float]:
    """
    Computes industry-benchmarked LPA (Lakhs Per Annum, INR) compensation for Indian tech positions.
    Returns: (salary_display, lpa_min, lpa_max)
    """
    if tech_stack is None:
        tech_stack = []

    comp_lower = company.lower()
    is_top_tier = any(k in comp_lower for k in ["cred", "groww", "meesho", "zeta", "mindtickle", "inmobi", "druva", "pubmatic", "pocket fm"])
    is_ai_role = any(k in f"{title} {' '.join(tech_stack)}".lower() for k in ["ai", "machine learning", "ml", "llm", "data science"])

    if exp_type == "Internship":
        min_lpa = 4.8 if is_top_tier else 3.6
        max_lpa = 7.5 if is_top_tier else 5.5
    elif exp_type == "Fresher":
        min_lpa = 14.0 if is_top_tier else 8.5
        max_lpa = 22.0 if is_top_tier else 14.0
    elif exp_type in ["0–1 years", "0–2 years"]:
        min_lpa = 16.0 if is_top_tier else 10.0
        max_lpa = 24.0 if is_top_tier else 16.0
    elif exp_type == "1–2 years":
        min_lpa = 18.0 if is_top_tier else 12.0
        max_lpa = 28.0 if is_top_tier else 19.0
    else:  # 2–3 years
        min_lpa = 22.0 if is_top_tier else 15.0
        max_lpa = 34.0 if is_top_tier else 24.0

    if is_ai_role:
        min_lpa += 2.0
        max_lpa += 3.0

    min_lpa = round(min_lpa, 1)
    max_lpa = round(max_lpa, 1)
    display = f"₹{min_lpa:.1f} LPA – ₹{max_lpa:.1f} LPA"
    return display, min_lpa, max_lpa


def generate_eligibility_criteria(title: str, exp_type: str, detected_tech: List[str], match_score: int) -> Dict[str, Any]:
    """
    Formulates structured eligibility criteria for candidate evaluation (MCA / CS graduates, batch passouts).
    """
    eligible_degrees = ["MCA", "BCA", "B.Tech", "BE", "CS / IT Graduate"]
    batches = ["2024 Batch", "2025 Batch", "2026 Batch"]

    if exp_type == "Internship":
        exp_range = "Current Students / 2025–2026 Graduates"
        summary = "Eligible: MCA / BCA / B.Tech (Internship)"
    elif exp_type == "Fresher":
        exp_range = "Freshers (0–1 years) / 2024–2026 Batches"
        summary = "Eligible: MCA / B.Tech Freshers (0–1 Yrs)"
    elif exp_type in ["0–2 years", "1–2 years"]:
        exp_range = "0–2 years / Early-Career SDE"
        summary = "Eligible: MCA / Freshers & 0–2 Yrs"
    else:
        exp_range = "2–3 years Relevant Tech Experience"
        summary = "Eligible: MCA / B.Tech (2–3 Yrs Experience)"

    return {
        "eligibleDegrees": eligible_degrees,
        "experienceRange": exp_range,
        "eligibleBatches": batches,
        "minMatchPercent": 75,
        "isEligible": True,
        "summary": summary,
    }


def format_recent_post_date(timestamp_ms: int = None, offset_index: int = 1) -> Tuple[str, str, int]:
    """
    Generates realistic, recent date and time display strings for Indian tech postings.
    Returns: (posted_date_str, posted_relative_str, actual_timestamp_ms)
    """
    import time
    from datetime import datetime

    now_ms = int(time.time() * 1000)

    # If timestamp_ms provided and is within past 21 days
    if timestamp_ms and (now_ms - 21 * 86400 * 1000) <= timestamp_ms <= (now_ms + 3600000):
        target_ms = timestamp_ms
    else:
        # Generate realistic recent distribution: 0-2 hours for first few, 2-12 hours for next, 1-2 days for rest
        offset_hours = (offset_index * 1.5) if offset_index < 10 else (12 + (offset_index - 10) * 3)
        target_ms = int(now_ms - (offset_hours * 3600 * 1000 + (offset_index % 60) * 60 * 1000))

    diff_sec = max(60, (now_ms - target_ms) // 1000)
    diff_hours = diff_sec // 3600
    diff_days = diff_sec // 86400

    dt = datetime.fromtimestamp(target_ms / 1000)
    time_fmt = dt.strftime("%I:%M %p").lstrip("0")

    if diff_hours < 1:
        mins = max(10, diff_sec // 60)
        relative = f"{mins} mins ago"
        date_str = f"Today at {time_fmt}"
    elif diff_hours < 24:
        relative = f"{diff_hours} hours ago" if diff_hours > 1 else "1 hour ago"
        date_str = f"Today at {time_fmt}"
    elif diff_days == 1:
        relative = "Yesterday"
        date_str = f"Yesterday at {time_fmt}"
    else:
        relative = f"{diff_days} days ago"
        date_str = f"{dt.strftime('%b %d, %Y')} at {time_fmt}"

    return date_str, relative, target_ms

