import re
from typing import Optional

RED_FLAG_SYMPTOMS = [
    # Cardiac
    "crushing chest pain", "chest pain", "chest tightness", "chest pressure",
    "heart attack", "cardiac arrest", "pain radiating to arm", "pain in left arm",
    # Stroke
    "sudden numbness", "face drooping", "arm weakness", "speech difficulty",
    "sudden severe headache", "worst headache of my life", "sudden confusion",
    "sudden vision loss", "sudden trouble seeing",
    # Breathing
    "can't breathe", "cannot breathe", "trouble breathing", "difficulty breathing",
    "shortness of breath", "choking", "stopped breathing",
    # Bleeding
    "uncontrolled bleeding", "coughing up blood", "vomiting blood",
    "blood in stool", "severe bleeding",
    # Neurological
    "seizure", "convulsion", "unconscious", "passed out", "not responding",
    "loss of consciousness", "unresponsive",
    # Severe pain
    "severe abdominal pain", "sudden abdominal pain", "worst pain of my life",
    "excruciating pain",
    # Allergic
    "anaphylaxis", "allergic reaction", "throat closing", "throat swelling",
    "tongue swelling", "can't swallow",
    # Mental health crisis
    "want to kill myself", "going to kill myself", "want to die",
    "suicidal", "overdose", "took too many pills",
    # Other emergencies
    "stroke", "overdosed", "poisoning", "severe burn",
    "broken bone", "head injury", "spinal injury",
]

EMERGENCY_RESPONSE = {
    "is_emergency": True,
    "title": "⚠️ This sounds like a medical emergency",
    "message": (
        "Based on your symptoms, you may need immediate medical attention. "
        "Please do not wait or search for information online."
    ),
    "actions": [
        {"label": "Call 911 immediately", "type": "emergency"},
        {"label": "Go to nearest Emergency Room", "type": "warning"},
        {"label": "Call Poison Control: 1-800-222-1222", "type": "info"},
    ],
    "disclaimer": (
        "If you are in the US, call 911 now. "
        "If you are outside the US, call your local emergency number."
    ),
}

MENTAL_HEALTH_KEYWORDS = [
    "want to kill myself", "going to kill myself", "want to die",
    "suicidal", "end my life", "no reason to live",
]

MENTAL_HEALTH_RESPONSE = {
    "is_emergency": True,
    "title": "💙 You are not alone — help is available right now",
    "message": (
        "It sounds like you may be going through an incredibly difficult time. "
        "Please reach out to a crisis counselor immediately — they are here to help."
    ),
    "actions": [
        {"label": "Call/Text 988 — Suicide & Crisis Lifeline", "type": "emergency"},
        {"label": "Text HOME to 741741 — Crisis Text Line", "type": "warning"},
        {"label": "Call 911 if in immediate danger", "type": "info"},
    ],
    "disclaimer": "You matter. Please reach out — support is available 24/7, free and confidential.",
}

def check_emergency(question: str) -> Optional[dict]:
    q = question.lower().strip()
    q = re.sub(r'[^\w\s]', ' ', q)

    for keyword in MENTAL_HEALTH_KEYWORDS:
        if keyword in q:
            return MENTAL_HEALTH_RESPONSE

    for symptom in RED_FLAG_SYMPTOMS:
        if symptom in q:
            return EMERGENCY_RESPONSE

    return None