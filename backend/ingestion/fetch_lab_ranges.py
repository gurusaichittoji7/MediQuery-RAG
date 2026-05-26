import json
from typing import List, Dict

LAB_TESTS = [
    {
        "name": "Fasting Blood Glucose",
        "normal": "70–99 mg/dL",
        "prediabetes": "100–125 mg/dL",
        "diabetes": "126 mg/dL or higher",
        "notes": "Test done after 8 hours of fasting. Used to diagnose diabetes and prediabetes.",
        "category": "metabolic",
    },
    {
        "name": "HbA1c (Glycated Hemoglobin)",
        "normal": "Below 5.7%",
        "prediabetes": "5.7–6.4%",
        "diabetes": "6.5% or higher",
        "notes": "Reflects average blood sugar over 2–3 months. Key marker for diabetes management.",
        "category": "metabolic",
    },
    {
        "name": "Total Cholesterol",
        "normal": "Below 200 mg/dL",
        "borderline": "200–239 mg/dL",
        "high": "240 mg/dL or higher",
        "notes": "High cholesterol increases risk of heart disease and stroke.",
        "category": "lipid",
    },
    {
        "name": "LDL Cholesterol (Bad Cholesterol)",
        "optimal": "Below 100 mg/dL",
        "near_optimal": "100–129 mg/dL",
        "borderline": "130–159 mg/dL",
        "high": "160 mg/dL or higher",
        "notes": "LDL carries cholesterol to arteries. Lower is better for heart health.",
        "category": "lipid",
    },
    {
        "name": "HDL Cholesterol (Good Cholesterol)",
        "low_risk": "60 mg/dL or higher",
        "acceptable": "40–59 mg/dL",
        "high_risk": "Below 40 mg/dL",
        "notes": "HDL removes cholesterol from arteries. Higher is better.",
        "category": "lipid",
    },
    {
        "name": "Triglycerides",
        "normal": "Below 150 mg/dL",
        "borderline": "150–199 mg/dL",
        "high": "200–499 mg/dL",
        "very_high": "500 mg/dL or higher",
        "notes": "High triglycerides linked to heart disease, diabetes, and pancreatitis.",
        "category": "lipid",
    },
    {
        "name": "Hemoglobin",
        "normal_male": "13.5–17.5 g/dL",
        "normal_female": "12.0–15.5 g/dL",
        "anemia": "Below 12.0 g/dL (female) or 13.5 g/dL (male)",
        "notes": "Low hemoglobin indicates anemia. High levels may suggest dehydration or lung disease.",
        "category": "blood-count",
    },
    {
        "name": "White Blood Cell Count (WBC)",
        "normal": "4,500–11,000 cells/mcL",
        "low": "Below 4,500 cells/mcL (leukopenia)",
        "high": "Above 11,000 cells/mcL (leukocytosis)",
        "notes": "High WBC may indicate infection or inflammation. Low WBC may suggest immune issues.",
        "category": "blood-count",
    },
    {
        "name": "Platelet Count",
        "normal": "150,000–400,000 platelets/mcL",
        "low": "Below 150,000 (thrombocytopenia)",
        "high": "Above 400,000 (thrombocytosis)",
        "notes": "Platelets help blood clot. Low counts increase bleeding risk.",
        "category": "blood-count",
    },
    {
        "name": "Creatinine (Kidney Function)",
        "normal_male": "0.74–1.35 mg/dL",
        "normal_female": "0.59–1.04 mg/dL",
        "high": "Above 1.35 mg/dL may indicate kidney dysfunction",
        "notes": "Creatinine is a waste product filtered by kidneys. High levels suggest kidney disease.",
        "category": "kidney",
    },
    {
        "name": "eGFR (Estimated Glomerular Filtration Rate)",
        "normal": "90 mL/min/1.73m² or higher",
        "mild_loss": "60–89 mL/min/1.73m²",
        "moderate_loss": "30–59 mL/min/1.73m²",
        "severe_loss": "15–29 mL/min/1.73m²",
        "kidney_failure": "Below 15 mL/min/1.73m²",
        "notes": "eGFR estimates how well kidneys filter blood. Used to stage chronic kidney disease.",
        "category": "kidney",
    },
    {
        "name": "ALT (Alanine Aminotransferase — Liver)",
        "normal_male": "7–56 units/L",
        "normal_female": "7–45 units/L",
        "elevated": "Above normal suggests liver damage or disease",
        "notes": "ALT is a liver enzyme. Elevated levels may indicate hepatitis, fatty liver, or cirrhosis.",
        "category": "liver",
    },
    {
        "name": "TSH (Thyroid Stimulating Hormone)",
        "normal": "0.4–4.0 mIU/L",
        "hypothyroid": "Above 4.0 mIU/L",
        "hyperthyroid": "Below 0.4 mIU/L",
        "notes": "TSH regulates thyroid function. Abnormal levels indicate hypothyroidism or hyperthyroidism.",
        "category": "thyroid",
    },
    {
        "name": "Sodium (Electrolyte)",
        "normal": "136–145 mEq/L",
        "low": "Below 136 mEq/L (hyponatremia)",
        "high": "Above 145 mEq/L (hypernatremia)",
        "notes": "Sodium regulates fluid balance. Imbalances can affect brain function and heart rhythm.",
        "category": "electrolyte",
    },
    {
        "name": "Potassium (Electrolyte)",
        "normal": "3.5–5.0 mEq/L",
        "low": "Below 3.5 mEq/L (hypokalemia)",
        "high": "Above 5.0 mEq/L (hyperkalemia)",
        "notes": "Potassium is critical for heart and muscle function. Imbalance can cause arrhythmias.",
        "category": "electrolyte",
    },
    {
        "name": "Blood Pressure",
        "normal": "Below 120/80 mmHg",
        "elevated": "120–129 systolic",
        "stage1_hypertension": "130–139/80–89 mmHg",
        "stage2_hypertension": "140+/90+ mmHg",
        "crisis": "Above 180/120 mmHg",
        "notes": "High blood pressure increases risk of heart attack, stroke, and kidney damage.",
        "category": "cardiovascular",
    },
    {
        "name": "BMI (Body Mass Index)",
        "underweight": "Below 18.5",
        "normal": "18.5–24.9",
        "overweight": "25.0–29.9",
        "obese": "30.0 or higher",
        "notes": "BMI is a screening tool for weight categories. Does not directly measure body fat.",
        "category": "metabolic",
    },
    {
        "name": "Vitamin D (25-hydroxyvitamin D)",
        "deficient": "Below 20 ng/mL",
        "insufficient": "20–29 ng/mL",
        "sufficient": "30–100 ng/mL",
        "toxic": "Above 100 ng/mL",
        "notes": "Vitamin D is essential for bone health and immune function. Deficiency is common.",
        "category": "vitamin",
    },
    {
        "name": "Iron (Serum Iron)",
        "normal_male": "60–170 mcg/dL",
        "normal_female": "50–170 mcg/dL",
        "low": "Below 50 mcg/dL suggests iron deficiency",
        "notes": "Low iron leads to iron-deficiency anemia. High levels may indicate hemochromatosis.",
        "category": "blood-count",
    },
    {
        "name": "CRP (C-Reactive Protein — Inflammation)",
        "normal": "Below 1.0 mg/L",
        "low_risk": "1.0–3.0 mg/L",
        "high_risk": "Above 3.0 mg/L",
        "notes": "CRP is a marker of inflammation. Elevated levels are associated with infection and heart disease.",
        "category": "inflammation",
    },
]


def fetch_all() -> List[Dict]:
    chunks = []
    for test in LAB_TESTS:
        name = test["name"]
        notes = test.get("notes", "")
        ranges = {
            k: v for k, v in test.items()
            if k not in ("name", "notes", "category")
        }
        range_text = ". ".join(
            f"{k.replace('_', ' ').title()}: {v}"
            for k, v in ranges.items()
        )
        text = (
            f"Lab Test Reference Range — {name}: "
            f"{range_text}. "
            f"Clinical Notes: {notes}"
        )
        chunks.append({
            "text": text,
            "source": "lab-reference-ranges",
            "category": "lab-ranges",
            "test": name,
            "lab_category": test.get("category", "general"),
        })

    print(f"[Lab Ranges] Loaded {len(chunks)} lab test reference chunks.")
    return chunks

if __name__ == "__main__":
    results = fetch_all()
    print(json.dumps(results[:2], indent=2))