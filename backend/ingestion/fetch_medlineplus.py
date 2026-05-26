import httpx
import re
from typing import List, Dict
from xml.etree import ElementTree as ET

BASE = "https://wsearch.nlm.nih.gov/ws/query"
HEADERS = {"User-Agent": "MediQuery-RAG/1.0 (healthcare portfolio project)"}

CONDITIONS = [
    "diabetes", "hypertension", "asthma", "depression", "obesity",
    "alzheimer", "heart disease", "stroke", "cancer", "arthritis",
    "kidney disease", "liver disease", "pneumonia", "anemia", "migraine"
]


def clean_html(text: str) -> str:
    text = re.sub(r'<[^>]+>', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()


def fetch_condition(condition: str) -> List[Dict]:
    params = {
        "db": "healthTopics",
        "term": condition,
        "retmax": 5,
    }
    try:
        r = httpx.get(BASE, params=params, headers=HEADERS, timeout=15)
        r.raise_for_status()
        root = ET.fromstring(r.text)
    except Exception as e:
        print(f"[MedlinePlus] Failed for '{condition}': {e}")
        return []

    chunks = []
    for doc in root.findall(".//document"):
        url = doc.get("url", "")
        title = ""
        summary = ""
        for content in doc.findall("content"):
            name = content.get("name", "")
            value = clean_html(content.text or "")
            if name == "title":
                title = value
            elif name == "FullSummary" and not summary:
                summary = value[:500]

        if not title:
            continue

        text = (
            f"Medical Condition: {condition.title()}. "
            f"Topic: {title}. "
            f"Details: {summary if summary else 'See MedlinePlus for full details.'}"
        )
        chunks.append({
            "text": text,
            "source": url or f"medlineplus.gov/{condition.replace(' ', '-')}",
            "category": "medical-condition",
            "condition": condition,
        })
    return chunks


def fetch_all() -> List[Dict]:
    chunks = []
    for condition in CONDITIONS:
        print(f"[MedlinePlus] Fetching: {condition}...")
        chunks += fetch_condition(condition)
    print(f"[MedlinePlus] Fetched {len(chunks)} total chunks.")
    return chunks

if __name__ == "__main__":
    import json
    results = fetch_all()
    print(json.dumps(results[:2], indent=2))