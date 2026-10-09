"""
TalentScout AI — Production FastAPI Server
Powers 100% Free Cloud Deployment on Render, Railway, or VPS.
Provides high-performance ASGI endpoints for JobSpy multi-board scraping,
DNS MX verification, and contact enrichment, plus serves static frontend assets.
"""

import os
import sys
from typing import Optional, List
from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Ensure project root is on sys.path
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

from python_scrapers.job_scraper import run_full_pipeline
from python_scrapers.verifiers.dns_verifier import verify_email_with_dns
from python_scrapers.extractors.contact_harvester import harvest_company_contacts

app = FastAPI(
    title="TalentScout AI Engine",
    description="Real-time multi-board job scraping and hiring intelligence powered by python-jobspy",
    version="2.0.0",
)

# Enable CORS for Netlify, Vercel, and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EmailVerifyRequest(BaseModel):
    email: str


class EnrichContactRequest(BaseModel):
    company: str
    website: Optional[str] = ""
    role: Optional[str] = "Software Engineer"


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "engine": "TalentScout AI Pure JobSpy Multi-Board Engine",
        "boards": ["Naukri", "Indeed India", "LinkedIn", "Glassdoor"],
    }


@app.get("/api/scrape/jobs")
def api_scrape_jobs(
    query: str = Query("", description="Role or tech keyword"),
    location: str = Query("", description="City or Indian tech hub"),
    sites: str = Query("naukri,indeed,linkedin,glassdoor", description="Comma-separated boards"),
    maxJobs: int = Query(30, description="Max jobs to return"),
    hoursOld: int = Query(168, description="Max posting age in hours"),
):
    try:
        site_list = [s.strip().lower() for s in sites.split(",") if s.strip()]
        result = run_full_pipeline(
            query=query,
            location=location,
            sites=site_list,
            max_jobs=maxJobs,
            hours_old=hoursOld,
        )
        return result
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Scraper execution failed: {str(e)}"},
        )


@app.post("/api/verify/email")
def api_verify_email(payload: EmailVerifyRequest):
    try:
        result = verify_email_with_dns(payload.email)
        return result
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"error": f"Email verification failed: {str(e)}"},
        )


@app.post("/api/enrich/contact")
def api_enrich_contact(payload: EnrichContactRequest):
    try:
        result = harvest_company_contacts(
            company_name=payload.company,
            raw_website=payload.website or "",
            role_title=payload.role or "Software Engineer",
        )
        return result
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"error": f"Contact enrichment failed: {str(e)}"},
        )


class VerifyRecruiterRequest(BaseModel):
    company: str
    website: Optional[str] = ""
    email: Optional[str] = ""
    name: Optional[str] = ""
    role: Optional[str] = ""
    linkedin: Optional[str] = ""
    jobUrl: Optional[str] = ""
    source: Optional[str] = "JobSpy"
    description: Optional[str] = ""


@app.post("/api/verify/recruiter")
def api_verify_recruiter(payload: VerifyRecruiterRequest):
    try:
        from python_scrapers.verifiers.recruiter_verifier import verify_recruiter_and_job
        result = verify_recruiter_and_job(
            company_name=payload.company,
            website=payload.website or "",
            recruiter_email=payload.email or "",
            recruiter_name=payload.name or "",
            recruiter_role=payload.role or "",
            linkedin_url=payload.linkedin or "",
            job_url=payload.jobUrl or "",
            source=payload.source or "JobSpy",
            description=payload.description or "",
        )
        return result
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"error": f"Recruiter verification failed: {str(e)}"},
        )


# Serve Built React Frontend if dist/ folder exists (for all-in-one free Render hosting)
DIST_DIR = os.path.join(PROJECT_DIR, "dist")
if os.path.exists(DIST_DIR):
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend_spa(full_path: str):
        # Do not capture API routes
        if full_path.startswith("api/") or full_path == "health":
            raise HTTPException(status_code=404, detail="Not Found")

        file_path = os.path.join(DIST_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)

        # Fallback to SPA index.html
        index_file = os.path.join(DIST_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend build not found")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("python_scrapers.server:app", host="0.0.0.0", port=port, reload=True)
