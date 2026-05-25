import httpx
import json
from typing import List, Dict

BASE = "https://clinicaltrials.gov/api/v2"
HEADERS = {"User-Agent": "MediQuery-RAG/1.0 (healthcare portfolio project)"}

TARGET_CONDITIONS = [
    "diabetes", "cancer", "hypertension", "alzheimer", "heart disease",
    "asthma", "depression", "COVID-19", "obesity", "stroke"
]


def fetch_trials_for_condition(condition: str, max_results: int = 10) -> List[Dict]:
    params = {
        "query.cond": condition,
        "pageSize": max_results,
        "format": "json",
    }
    try:
        r = httpx.get(f"{BASE}/studies", params=params, headers=HEADERS, timeout=20)
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        print(f"[ClinicalTrials] Failed for '{condition}': {e}")
        return []

    chunks = []
    for study in data.get("studies", []):
        proto = study.get("protocolSection", {})
        id_mod = proto.get("identificationModule", {})
        desc_mod = proto.get("descriptionModule", {})
        status_mod = proto.get("statusModule", {})
        design_mod = proto.get("designModule", {})
        interventions = proto.get("armsInterventionsModule", {}).get("interventions", [])

        nct_id = id_mod.get("nctId", "N/A")
        title = id_mod.get("briefTitle", "Untitled")
        summary = desc_mod.get("briefSummary", "").strip().replace("\n", " ")[:400]
        status = status_mod.get("overallStatus", "Unknown")
        phase = ", ".join(design_mod.get("phases", [])) or "Not specified"
        enrollment = design_mod.get("enrollmentInfo", {}).get("count", "N/A")
        intervention_names = [i.get("name", "") for i in interventions[:3]]

        text = (
            f"Clinical Trial [{nct_id}]: {title}. "
            f"Condition: {condition}. "
            f"Status: {status}. Phase: {phase}. "
            f"Enrollment: {enrollment} participants. "
            f"Interventions: {', '.join(intervention_names) if intervention_names else 'Not listed'}. "
            f"Summary: {summary}"
        )
        chunks.append({
            "text": text,
            "source": f"clinicaltrials.gov/{nct_id}",
            "category": "clinical-trial",
            "condition": condition,
        })
    return chunks


def fetch_all() -> List[Dict]:
    chunks = []
    for condition in TARGET_CONDITIONS:
        print(f"[ClinicalTrials] Fetching trials for: {condition}...")
        chunks += fetch_trials_for_condition(condition, max_results=8)
    print(f"[ClinicalTrials] Fetched {len(chunks)} total trial chunks.")
    return chunks

if __name__ == "__main__":
    results = fetch_all()
    print(json.dumps(results[:2], indent=2))