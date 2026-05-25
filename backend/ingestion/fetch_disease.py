import httpx
import json
from typing import List, Dict

BASE = "https://disease.sh/v3"
HEADERS = {"User-Agent": "MediQuery-RAG/1.0 (healthcare portfolio project)"}

def _safe_get(url: str, params: dict = None) -> dict | list | None:
    try:
        r = httpx.get(url, params=params, headers=HEADERS, timeout=15)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"[disease.sh] Failed {url}: {e}")
        return None


def fetch_global_covid() -> List[Dict]:
    data = _safe_get(f"{BASE}/covid-19/all")
    if not data:
        return []
    text = (
        f"Global COVID-19 Statistics: "
        f"Total cases: {data.get('cases', 'N/A'):,}. "
        f"Total deaths: {data.get('deaths', 'N/A'):,}. "
        f"Total recovered: {data.get('recovered', 'N/A'):,}. "
        f"Active cases: {data.get('active', 'N/A'):,}. "
        f"Critical cases: {data.get('critical', 'N/A'):,}. "
        f"Tests conducted: {data.get('tests', 'N/A'):,}. "
        f"Case fatality rate: {round(data.get('deaths', 0) / max(data.get('cases', 1), 1) * 100, 2)}%."
    )
    return [{"text": text, "source": "disease.sh/global-covid", "category": "covid"}]


def fetch_top_countries_covid(limit: int = 20) -> List[Dict]:
    data = _safe_get(f"{BASE}/covid-19/countries", params={"sort": "cases"})
    if not data:
        return []
    chunks = []
    for country in data[:limit]:
        name = country.get("country", "Unknown")
        text = (
            f"COVID-19 in {name}: "
            f"Cases: {country.get('cases', 0):,}. "
            f"Deaths: {country.get('deaths', 0):,}. "
            f"Recovered: {country.get('recovered', 0):,}. "
            f"Active: {country.get('active', 0):,}. "
            f"Cases per million: {country.get('casesPerOneMillion', 0):,}. "
            f"Deaths per million: {country.get('deathsPerOneMillion', 0):,}."
        )
        chunks.append({"text": text, "source": f"disease.sh/country/{name}", "category": "covid"})
    return chunks

def fetch_all() -> List[Dict]:
    print("[disease.sh] Fetching global stats...")
    chunks = []
    chunks += fetch_global_covid()
    chunks += fetch_top_countries_covid()
    print(f"[disease.sh] Fetched {len(chunks)} chunks.")
    return chunks

if __name__ == "__main__":
    results = fetch_all()
    print(json.dumps(results[:2], indent=2))