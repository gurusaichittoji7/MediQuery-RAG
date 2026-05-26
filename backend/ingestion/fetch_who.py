import httpx
import json
from typing import List, Dict

BASE = "https://ghoapi.azureedge.net/api"
HEADERS = {"User-Agent": "MediQuery-RAG/1.0 (healthcare portfolio project)"}

INDICATORS = [
    ("WHOSIS_000001", "Life expectancy at birth"),
    ("WHOSIS_000015", "Healthy life expectancy at birth"),
    ("MDG_0000000001", "Infant mortality rate"),
    ("NCDMORT3070", "Mortality from cardiovascular disease, cancer, diabetes or CRD"),
    ("NCD_BMI_30C", "Obesity prevalence among adults"),
    ("TOBACCO_0000000192", "Tobacco smoking prevalence"),
    ("UHC_INDEX_REPORTED", "Universal health coverage index"),
]

TOP_COUNTRIES = [
    "USA", "GBR", "IND", "CHN", "BRA", "DEU", "FRA", "JPN", "CAN", "AUS"
]


def fetch_indicator(code: str, label: str) -> List[Dict]:
    chunks = []
    seen = set()

    for country in TOP_COUNTRIES:
        try:
            r = httpx.get(
                f"{BASE}/{code}",
                params={"$filter": f"SpatialDim eq '{country}'"},
                headers=HEADERS,
                timeout=20,
            )
            r.raise_for_status()
            data = r.json()
        except Exception as e:
            print(f"[WHO GHO] Failed for '{label}' / {country}: {e}")
            continue

        # Get the most recent entry only
        entries = sorted(
            [e for e in data.get("value", []) if e.get("NumericValue")],
            key=lambda x: x.get("TimeDim", 0),
            reverse=True,
        )
        if not entries:
            continue

        entry = entries[0]
        key = f"{country}-{code}"
        if key in seen:
            continue
        seen.add(key)

        value = round(entry.get("NumericValue", 0), 2)
        year = entry.get("TimeDim", "N/A")
        sex = entry.get("Dim1", "")
        sex_label = f" ({sex})" if sex and sex != "SEX_BTSX" else ""

        text = (
            f"WHO Global Health — {label}{sex_label}: "
            f"Country: {country}. Year: {year}. "
            f"Value: {value}. Indicator: {code}."
        )
        chunks.append({
            "text": text,
            "source": f"who.int/gho/{code}/{country}",
            "category": "global-health",
            "indicator": label,
            "country": country,
        })

    return chunks


def fetch_all() -> List[Dict]:
    chunks = []
    for code, label in INDICATORS:
        print(f"[WHO GHO] Fetching: {label}...")
        chunks += fetch_indicator(code, label)
    print(f"[WHO GHO] Fetched {len(chunks)} total chunks.")
    return chunks

if __name__ == "__main__":
    results = fetch_all()
    print(json.dumps(results[:2], indent=2))