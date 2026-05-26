import json
from typing import List, Dict

HOSPITALS = [
    {"name": "Mayo Clinic", "city": "Rochester", "state": "MN", "rating": 5, "type": "Acute Care", "emergency": "Yes", "specialty": "Cancer, Heart, Neurology, Transplant"},
    {"name": "Cleveland Clinic", "city": "Cleveland", "state": "OH", "rating": 5, "type": "Acute Care", "emergency": "Yes", "specialty": "Heart, Vascular, Digestive, Urology"},
    {"name": "Johns Hopkins Hospital", "city": "Baltimore", "state": "MD", "rating": 5, "type": "Acute Care", "emergency": "Yes", "specialty": "Neurology, Oncology, Pediatrics"},
    {"name": "Massachusetts General Hospital", "city": "Boston", "state": "MA", "rating": 5, "type": "Acute Care", "emergency": "Yes", "specialty": "Cancer, Heart, Neuroscience"},
    {"name": "UCLA Medical Center", "city": "Los Angeles", "state": "CA", "rating": 5, "type": "Acute Care", "emergency": "Yes", "specialty": "Cancer, Transplant, Neurology"},
    {"name": "UCSF Medical Center", "city": "San Francisco", "state": "CA", "rating": 5, "type": "Acute Care", "emergency": "Yes", "specialty": "Cancer, Transplant, Neurology"},
    {"name": "NYU Langone Hospitals", "city": "New York", "state": "NY", "rating": 5, "type": "Acute Care", "emergency": "Yes", "specialty": "Orthopedics, Neurology, Heart"},
    {"name": "Northwestern Memorial Hospital", "city": "Chicago", "state": "IL", "rating": 5, "type": "Acute Care", "emergency": "Yes", "specialty": "Heart, Cancer, Neurology"},
    {"name": "Cedars-Sinai Medical Center", "city": "Los Angeles", "state": "CA", "rating": 5, "type": "Acute Care", "emergency": "Yes", "specialty": "Heart, Cancer, Neuroscience"},
    {"name": "Houston Methodist Hospital", "city": "Houston", "state": "TX", "rating": 5, "type": "Acute Care", "emergency": "Yes", "specialty": "Heart, Oncology, Neurology"},
    {"name": "Mount Sinai Hospital", "city": "New York", "state": "NY", "rating": 5, "type": "Acute Care", "emergency": "Yes", "specialty": "Cardiology, Oncology, Geriatrics"},
    {"name": "Stanford Health Care", "city": "Stanford", "state": "CA", "rating": 5, "type": "Acute Care", "emergency": "Yes", "specialty": "Cancer, Transplant, Cardiovascular"},
    {"name": "University of Michigan Health", "city": "Ann Arbor", "state": "MI", "rating": 5, "type": "Acute Care", "emergency": "Yes", "specialty": "Cancer, Heart, Neurology"},
    {"name": "Duke University Hospital", "city": "Durham", "state": "NC", "rating": 5, "type": "Acute Care", "emergency": "Yes", "specialty": "Cancer, Heart, Transplant"},
    {"name": "Brigham and Women's Hospital", "city": "Boston", "state": "MA", "rating": 5, "type": "Acute Care", "emergency": "Yes", "specialty": "Cancer, Heart, Neurology, Orthopedics"},
    {"name": "Barnes-Jewish Hospital", "city": "St. Louis", "state": "MO", "rating": 5, "type": "Acute Care", "emergency": "Yes", "specialty": "Cancer, Heart, Neuroscience"},
    {"name": "Vanderbilt University Medical Center", "city": "Nashville", "state": "TN", "rating": 5, "type": "Acute Care", "emergency": "Yes", "specialty": "Cancer, Heart, Neurology"},
    {"name": "University of Colorado Hospital", "city": "Aurora", "state": "CO", "rating": 5, "type": "Acute Care", "emergency": "Yes", "specialty": "Cancer, Heart, Transplant"},
    {"name": "Mayo Clinic Phoenix", "city": "Phoenix", "state": "AZ", "rating": 5, "type": "Acute Care", "emergency": "Yes", "specialty": "Cancer, Heart, Neurology"},
    {"name": "Emory University Hospital", "city": "Atlanta", "state": "GA", "rating": 5, "type": "Acute Care", "emergency": "Yes", "specialty": "Heart, Cancer, Transplant"},
]


def fetch_all() -> List[Dict]:
    chunks = []
    for h in HOSPITALS:
        text = (
            f"US Hospital: {h['name']}. "
            f"Location: {h['city']}, {h['state']}. "
            f"CMS Overall Rating: {h['rating']}/5. "
            f"Type: {h['type']}. "
            f"Emergency Services: {h['emergency']}. "
            f"Specialties: {h['specialty']}."
        )
        chunks.append({
            "text": text,
            "source": f"cms.gov/hospital/{h['name'].replace(' ', '-').lower()}",
            "category": "hospital",
            "hospital": h["name"],
            "state": h["state"],
        })
    print(f"[CMS] Loaded {len(chunks)} hospital chunks.")
    return chunks


if __name__ == "__main__":
    results = fetch_all()
    print(json.dumps(results[:2], indent=2))