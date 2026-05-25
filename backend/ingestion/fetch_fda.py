import httpx
import json
from typing import List, Dict

BASE = "https://api.fda.gov/drug/label.json"
HEADERS = {"User-Agent": "MediQuery-RAG/1.0 (healthcare portfolio project)"}

DRUG_SEARCHES = [
    "metformin", "lisinopril", "atorvastatin", "amoxicillin",
    "ibuprofen", "aspirin", "insulin", "albuterol", "levothyroxine", "omeprazole"
]


def fetch_drug_labels(drug_name: str, limit: int = 3) -> List[Dict]:
    params = {
        "search": f'openfda.generic_name:"{drug_name}"',
        "limit": limit,
    }
    try:
        r = httpx.get(BASE, params=params, headers=HEADERS, timeout=15)
        if r.status_code == 404:
            return []
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        print(f"[OpenFDA] Failed for '{drug_name}': {e}")
        return []

    chunks = []
    for result in data.get("results", []):
        openfda = result.get("openfda", {})
        brand_names = openfda.get("brand_name", ["Unknown"])[:2]
        generic_names = openfda.get("generic_name", [drug_name])[:1]
        indications = result.get("indications_and_usage", ["Not available"])[0][:400].replace("\n", " ")
        warnings = result.get("warnings", ["Not available"])[0][:300].replace("\n", " ")
        dosage = result.get("dosage_and_administration", ["Not available"])[0][:300].replace("\n", " ")

        text = (
            f"Drug: {generic_names[0]} (Brand: {', '.join(brand_names)}). "
            f"Indications: {indications} "
            f"Warnings: {warnings} "
            f"Dosage: {dosage}"
        )
        chunks.append({
            "text": text,
            "source": f"openfda.gov/drug/{drug_name}",
            "category": "drug-label",
            "drug": drug_name,
        })
    return chunks


def fetch_all() -> List[Dict]:
    chunks = []
    for drug in DRUG_SEARCHES:
        print(f"[OpenFDA] Fetching labels for: {drug}...")
        chunks += fetch_drug_labels(drug)
    print(f"[OpenFDA] Fetched {len(chunks)} total drug chunks.")
    return chunks


if __name__ == "__main__":
    results = fetch_all()
    print(json.dumps(results[:2], indent=2))