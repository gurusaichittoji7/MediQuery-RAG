from typing import Optional

DRUG_SAFETY_DB = {
    "metformin": {
        "tier": "Tier 1 — Generic",
        "cost": "Low (~$4–$10/month)",
        "contraindications": [
            "Severe kidney disease (eGFR < 30)",
            "Liver disease or alcohol abuse",
            "Radiologic contrast procedures (hold 48hrs before/after)",
        ],
        "interactions": [
            {"drug": "Alcohol", "severity": "Moderate", "effect": "Increases risk of lactic acidosis"},
            {"drug": "Iodinated contrast dye", "severity": "Major", "effect": "Risk of acute kidney injury and lactic acidosis"},
            {"drug": "Topiramate", "severity": "Moderate", "effect": "May increase metformin levels"},
        ],
        "demographics": {
            "pregnancy": "Category B — generally considered safe, consult doctor",
            "elderly": "Use with caution — monitor kidney function regularly",
            "pediatric": "Approved for children 10+ years",
            "renal": "Reduce dose if eGFR 30–45. Contraindicated if eGFR < 30",
        },
        "pharmacokinetics": {
            "dosage": "500–2550mg daily in divided doses",
            "take_with": "Take with food to reduce GI side effects",
            "side_effects": ["Nausea", "Diarrhea", "Stomach upset", "Metallic taste"],
            "bioavailability": "50–60% oral bioavailability",
        },
    },
    "lisinopril": {
        "tier": "Tier 1 — Generic",
        "cost": "Low (~$5–$15/month)",
        "contraindications": [
            "History of angioedema",
            "Pregnancy (especially 2nd and 3rd trimester)",
            "Bilateral renal artery stenosis",
        ],
        "interactions": [
            {"drug": "Potassium supplements", "severity": "Major", "effect": "Risk of dangerous hyperkalemia"},
            {"drug": "NSAIDs (ibuprofen, naproxen)", "severity": "Moderate", "effect": "Reduced blood pressure effect and kidney risk"},
            {"drug": "Lithium", "severity": "Major", "effect": "Increased lithium toxicity"},
        ],
        "demographics": {
            "pregnancy": "Category D — contraindicated, causes fetal harm",
            "elderly": "Start low dose — increased risk of hypotension and kidney issues",
            "pediatric": "Approved for children 6+ years with hypertension",
            "renal": "Reduce dose based on kidney function",
        },
        "pharmacokinetics": {
            "dosage": "10–40mg once daily",
            "take_with": "Can be taken with or without food",
            "side_effects": ["Dry cough", "Dizziness", "Headache", "High potassium"],
            "bioavailability": "25% oral bioavailability",
        },
    },
    "atorvastatin": {
        "tier": "Tier 1 — Generic",
        "cost": "Low (~$5–$15/month)",
        "contraindications": [
            "Active liver disease",
            "Pregnancy and breastfeeding",
            "Unexplained persistent elevated liver enzymes",
        ],
        "interactions": [
            {"drug": "Clarithromycin", "severity": "Major", "effect": "Increases atorvastatin levels, risk of muscle damage"},
            {"drug": "Grapefruit juice", "severity": "Moderate", "effect": "Increases drug levels in blood"},
            {"drug": "Warfarin", "severity": "Moderate", "effect": "May increase bleeding risk"},
        ],
        "demographics": {
            "pregnancy": "Category X — strictly contraindicated",
            "elderly": "Generally safe — monitor for muscle pain",
            "pediatric": "Approved for children 10+ with familial hypercholesterolemia",
            "renal": "No dose adjustment needed",
        },
        "pharmacokinetics": {
            "dosage": "10–80mg once daily",
            "take_with": "Can be taken at any time of day, with or without food",
            "side_effects": ["Muscle pain", "Liver enzyme elevation", "Headache", "Nausea"],
            "bioavailability": "14% oral bioavailability",
        },
    },
    "ibuprofen": {
        "tier": "Tier 1 — OTC Generic",
        "cost": "Very Low (~$3–$8/month)",
        "contraindications": [
            "Active GI bleeding or ulcer",
            "Severe kidney or liver disease",
            "Last trimester of pregnancy",
            "After heart bypass surgery",
        ],
        "interactions": [
            {"drug": "Aspirin", "severity": "Moderate", "effect": "Ibuprofen may block aspirin's heart-protective effect"},
            {"drug": "Warfarin", "severity": "Major", "effect": "Significantly increases bleeding risk"},
            {"drug": "Lisinopril/ACE inhibitors", "severity": "Moderate", "effect": "Reduces blood pressure effect, increases kidney risk"},
        ],
        "demographics": {
            "pregnancy": "Category C (1st/2nd trimester), Category D (3rd trimester) — avoid",
            "elderly": "Use lowest effective dose — higher GI and kidney risk",
            "pediatric": "Safe for children 6 months and older at appropriate doses",
            "renal": "Avoid in kidney disease — worsens kidney function",
        },
        "pharmacokinetics": {
            "dosage": "200–400mg every 4–6 hours, max 1200mg/day OTC",
            "take_with": "Take with food or milk to reduce stomach upset",
            "side_effects": ["Stomach pain", "Nausea", "Heartburn", "Dizziness"],
            "bioavailability": "80% oral bioavailability",
        },
    },
    "aspirin": {
        "tier": "Tier 1 — OTC Generic",
        "cost": "Very Low (~$2–$5/month)",
        "contraindications": [
            "Children under 16 (Reye's syndrome risk)",
            "Active bleeding or bleeding disorders",
            "Severe kidney or liver disease",
        ],
        "interactions": [
            {"drug": "Warfarin", "severity": "Major", "effect": "Greatly increases bleeding risk"},
            {"drug": "Ibuprofen", "severity": "Moderate", "effect": "Ibuprofen blocks aspirin's antiplatelet effect"},
            {"drug": "Methotrexate", "severity": "Major", "effect": "Increases methotrexate toxicity"},
        ],
        "demographics": {
            "pregnancy": "Category D — avoid especially in 3rd trimester",
            "elderly": "Increased bleeding risk — use with caution",
            "pediatric": "Contraindicated under 16 — risk of Reye's syndrome",
            "renal": "Avoid in severe kidney disease",
        },
        "pharmacokinetics": {
            "dosage": "81mg daily for heart protection, 325–650mg for pain",
            "take_with": "Take with food or a full glass of water",
            "side_effects": ["Stomach irritation", "Bleeding", "Tinnitus at high doses"],
            "bioavailability": "80–100% oral bioavailability",
        },
    },
    "amoxicillin": {
        "tier": "Tier 1 — Generic",
        "cost": "Low (~$10–$20 per course)",
        "contraindications": [
            "Penicillin allergy",
            "History of amoxicillin-associated jaundice",
        ],
        "interactions": [
            {"drug": "Warfarin", "severity": "Moderate", "effect": "May increase bleeding risk"},
            {"drug": "Methotrexate", "severity": "Moderate", "effect": "Increases methotrexate toxicity"},
            {"drug": "Oral contraceptives", "severity": "Minor", "effect": "May reduce contraceptive effectiveness"},
        ],
        "demographics": {
            "pregnancy": "Category B — generally safe",
            "elderly": "Reduce dose if kidney function is impaired",
            "pediatric": "Safe and commonly used in children",
            "renal": "Reduce dose in severe kidney impairment",
        },
        "pharmacokinetics": {
            "dosage": "250–500mg every 8 hours or 500–875mg every 12 hours",
            "take_with": "Can be taken with or without food",
            "side_effects": ["Diarrhea", "Nausea", "Rash", "Vomiting"],
            "bioavailability": "90% oral bioavailability",
        },
    },
}


def get_drug_safety(question: str) -> Optional[dict]:
    q = question.lower()
    for drug, data in DRUG_SAFETY_DB.items():
        if drug in q:
            return {"drug": drug, **data}
    return None

def format_drug_safety(data: dict) -> str:
    drug = data["drug"].title()
    lines = []

    lines.append(f"💊 {drug} — Drug Safety Profile\n")
    lines.append(f"📦 Formulary Tier: {data['tier']}")
    lines.append(f"💰 Estimated Cost: {data['cost']}\n")

    pk = data.get("pharmacokinetics", {})
    lines.append(f"📋 Dosage: {pk.get('dosage', 'N/A')}")
    lines.append(f"🍽 Administration: {pk.get('take_with', 'N/A')}")
    lines.append(f"⚗️ Bioavailability: {pk.get('bioavailability', 'N/A')}")
    effects = pk.get("side_effects", [])
    if effects:
        lines.append(f"⚠️ Common Side Effects: {', '.join(effects)}\n")

    contraindications = data.get("contraindications", [])
    if contraindications:
        lines.append("🚫 Contraindications:")
        for c in contraindications:
            lines.append(f"  • {c}")
        lines.append("")

    interactions = data.get("interactions", [])
    if interactions:
        lines.append("⚡ Drug Interactions:")
        for i in interactions:
            lines.append(f"  • {i['drug']} ({i['severity']}): {i['effect']}")
        lines.append("")

    demographics = data.get("demographics", {})
    if demographics:
        lines.append("👥 Demographic Considerations:")
        for key, val in demographics.items():
            lines.append(f"  • {key.title()}: {val}")

    return "\n".join(lines)