import httpx
import os
from typing import Optional

ICD_API_BASE = "https://id.who.int/icd/entity/search"

ICD_HEADERS = {
    "Accept": "application/json",
    "Accept-Language": "en",
    "API-Version": "v2",
}

# Fast local lookup for common conditions — no API call needed
LOCAL_ICD_MAP = {
    "diabetes": {"code": "5A10", "title": "Type 2 diabetes mellitus"},
    "type 2 diabetes": {"code": "5A10", "title": "Type 2 diabetes mellitus"},
    "type 1 diabetes": {"code": "5A00", "title": "Type 1 diabetes mellitus"},
    "hypertension": {"code": "BA00", "title": "Essential hypertension"},
    "high blood pressure": {"code": "BA00", "title": "Essential hypertension"},
    "asthma": {"code": "CA23", "title": "Asthma"},
    "depression": {"code": "6A70", "title": "Single episode depressive disorder"},
    "anxiety": {"code": "6B00", "title": "Generalised anxiety disorder"},
    "alzheimer": {"code": "8A20", "title": "Alzheimer disease"},
    "heart disease": {"code": "BA80", "title": "Ischaemic heart disease"},
    "stroke": {"code": "8B20", "title": "Ischaemic stroke"},
    "cancer": {"code": "2C90", "title": "Malignant neoplasm"},
    "obesity": {"code": "5B81", "title": "Obesity"},
    "migraine": {"code": "8A80", "title": "Migraine"},
    "pneumonia": {"code": "CA40", "title": "Pneumonia"},
    "anemia": {"code": "3A00", "title": "Iron deficiency anaemia"},
    "kidney disease": {"code": "GB61", "title": "Chronic kidney disease"},
    "liver disease": {"code": "DB93", "title": "Chronic liver disease"},
    "arthritis": {"code": "FA20", "title": "Rheumatoid arthritis"},
    "covid": {"code": "RA01", "title": "COVID-19"},
    "covid-19": {"code": "RA01", "title": "COVID-19"},
    "flu": {"code": "1E32", "title": "Influenza"},
    "influenza": {"code": "1E32", "title": "Influenza"},
    "headache": {"code": "8A80", "title": "Headache disorder"},
    "chest pain": {"code": "MD81", "title": "Chest pain"},
    "back pain": {"code": "ME84", "title": "Low back pain"},
    "insomnia": {"code": "7A00", "title": "Insomnia disorders"},
    "thyroid": {"code": "5A00", "title": "Thyroid disorder"},
    "hypothyroidism": {"code": "5A00", "title": "Hypothyroidism"},
    "hyperthyroidism": {"code": "5A10", "title": "Hyperthyroidism"},
}

def map_to_icd11(question: str) -> Optional[dict]:
    q = question.lower()
    for keyword, data in LOCAL_ICD_MAP.items():
        if keyword in q:
            return {
                "code": data["code"],
                "title": data["title"],
                "system": "ICD-11",
            }
    return None