"""
RFC-5321 DNS MX Mailbox Verification Module
Powered by dnspython and email-validator.
"""

from typing import Dict, Any, List
import dns.resolver
try:
    import email_validator
    HAS_EMAIL_VALIDATOR = True
except ImportError:
    HAS_EMAIL_VALIDATOR = False
    email_validator = None


def verify_email_with_dns(email_address: str) -> Dict[str, Any]:
    """
    Verifies an email address using:
    1. Syntax & domain normalization via email-validator (or standard RFC regex fallback).
    2. Real-time DNS MX lookup via dnspython.
    3. Mail gateway provider classification.
    """
    clean_email = email_address.strip().lower()

    # 1. Syntax check
    if HAS_EMAIL_VALIDATOR and email_validator:
        try:
            validated = email_validator.validate_email(clean_email, check_deliverability=False)
            domain = validated.domain
            normalized_email = validated.normalized
        except email_validator.EmailNotValidError as e:
            return {
                "email": clean_email,
                "mxValid": False,
                "exchanges": [],
                "provider": "Invalid Syntax",
                "confidence": 20,
                "notes": f"Invalid email syntax: {str(e)}",
                "status": "Needs verification",
            }
    else:
        import re
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", clean_email):
            return {
                "email": clean_email,
                "mxValid": False,
                "exchanges": [],
                "provider": "Invalid Syntax",
                "confidence": 20,
                "notes": "Invalid email syntax format",
                "status": "Needs verification",
            }
        domain = clean_email.split("@")[-1]
        normalized_email = clean_email


    # 2. DNS MX lookup via dnspython
    try:
        resolver = dns.resolver.Resolver()
        resolver.timeout = 4.0
        resolver.lifetime = 4.0

        answers = resolver.resolve(domain, "MX")
        if not answers:
            return {
                "email": normalized_email,
                "mxValid": False,
                "exchanges": [],
                "provider": "None",
                "confidence": 30,
                "notes": f"No MX records returned for @{domain}",
                "status": "Needs verification",
            }

        records: List[Dict[str, Any]] = []
        for rdata in answers:
            records.append({
                "exchange": str(rdata.exchange).rstrip(".").lower(),
                "preference": int(rdata.preference),
            })

        # Sort by preference (lower is higher priority)
        records.sort(key=lambda x: x["preference"])
        exchanges = [r["exchange"] for r in records]
        primary_mx = exchanges[0] if exchanges else ""

        # 3. Classify provider
        provider = "Corporate Mail Gateway"
        confidence = 92

        if "google" in primary_mx or "aspmx" in primary_mx:
            provider = "Google Workspace"
            confidence = 96
        elif "outlook" in primary_mx or "protection.outlook" in primary_mx:
            provider = "Microsoft 365 Exchange"
            confidence = 96
        elif "protonmail" in primary_mx or "proton" in primary_mx:
            provider = "ProtonMail Professional"
            confidence = 94
        elif "pphosted" in primary_mx or "proofpoint" in primary_mx:
            provider = "Proofpoint Enterprise"
            confidence = 95
        elif "mimecast" in primary_mx:
            provider = "Mimecast Secure Gateway"
            confidence = 95
        elif "amazonses" in primary_mx:
            provider = "Amazon SES / AWS WorkMail"
            confidence = 93

        return {
            "email": normalized_email,
            "mxValid": True,
            "exchanges": exchanges,
            "provider": provider,
            "confidence": confidence,
            "notes": f"RFC-5321 active mail routing confirmed via {primary_mx} ({provider}).",
            "status": "Verified",
        }

    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
        return {
            "email": normalized_email,
            "mxValid": False,
            "exchanges": [],
            "provider": "Domain Unresolvable",
            "confidence": 25,
            "notes": f"Domain @{domain} does not have valid DNS MX configuration.",
            "status": "Needs verification",
        }
    except dns.exception.Timeout:
        return {
            "email": normalized_email,
            "mxValid": False,
            "exchanges": [],
            "provider": "DNS Timeout",
            "confidence": 40,
            "notes": f"DNS query timed out for domain @{domain}.",
            "status": "Needs verification",
        }
    except Exception as e:
        return {
            "email": normalized_email,
            "mxValid": False,
            "exchanges": [],
            "provider": "Error",
            "confidence": 35,
            "notes": f"Verification error: {str(e)}",
            "status": "Needs verification",
        }
