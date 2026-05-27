from typing import Optional

# Ambiguous symptoms that need clarification before answering
DDX_TRIGGERS = {
    "headache": {
        "question": "To give you the most accurate information, can you tell me more?",
        "clarifications": [
            "Where is the pain located — front, back, or one side?",
            "How long have you had it — minutes, hours, or days?",
            "Is it throbbing, pressure-like, or sharp?",
            "Do you have any other symptoms like nausea, fever, or vision changes?",
        ],
    },
    "chest pain": {
        "question": "Chest pain can have several causes. Can you describe it more?",
        "clarifications": [
            "Is it sharp, dull, pressure-like, or burning?",
            "Does it radiate to your arm, jaw, or back?",
            "Did it start suddenly or gradually?",
            "Do you have shortness of breath or sweating with it?",
        ],
    },
    "stomach pain": {
        "question": "Abdominal pain can come from many sources. A few questions:",
        "clarifications": [
            "Where exactly is the pain — upper, lower, left, or right?",
            "Is it constant or does it come and go?",
            "Do you have nausea, vomiting, or changes in bowel habits?",
            "Does eating make it better or worse?",
        ],
    },
    "abdominal pain": {
        "question": "Abdominal pain can come from many sources. A few questions:",
        "clarifications": [
            "Where exactly is the pain — upper, lower, left, or right?",
            "Is it constant or does it come and go?",
            "Do you have nausea, vomiting, or changes in bowel habits?",
            "Does eating make it better or worse?",
        ],
    },
    "back pain": {
        "question": "Back pain has many potential causes. Can you tell me more?",
        "clarifications": [
            "Is it in your upper, middle, or lower back?",
            "Did it start after an injury or gradually?",
            "Does it radiate down your leg?",
            "Is it worse when sitting, standing, or moving?",
        ],
    },
    "fatigue": {
        "question": "Fatigue can have many causes. A few questions to help:",
        "clarifications": [
            "How long have you been feeling this way?",
            "Do you have trouble sleeping or sleep too much?",
            "Do you have any other symptoms like weight changes or mood changes?",
            "Does rest improve it?",
        ],
    },
    "dizziness": {
        "question": "Dizziness can mean different things. Can you describe it?",
        "clarifications": [
            "Does the room spin around you, or do you feel lightheaded?",
            "Does it happen when you stand up quickly?",
            "Do you have ringing in your ears or hearing changes?",
            "How long does each episode last?",
        ],
    },
    "shortness of breath": {
        "question": "Breathing difficulty can have several causes. A few questions:",
        "clarifications": [
            "Did it come on suddenly or gradually?",
            "Is it worse with activity or also at rest?",
            "Do you have chest pain, cough, or fever with it?",
            "Does lying flat make it worse?",
        ],
    },
    "fever": {
        "question": "Fever can indicate several conditions. Can you tell me more?",
        "clarifications": [
            "How high is your temperature?",
            "How long have you had the fever?",
            "Do you have any other symptoms like cough, rash, or pain?",
            "Have you traveled recently or been around sick people?",
        ],
    },
    "rash": {
        "question": "Rashes can have many causes. A few questions:",
        "clarifications": [
            "Where on your body is the rash?",
            "Is it itchy, painful, or neither?",
            "Did you start any new medications or come into contact with anything new?",
            "Is it spreading?",
        ],
    },
}

def check_ddx(question: str) -> Optional[dict]:
    q = question.lower()

    # Only trigger DDx if the question is JUST a symptom
    # Not if they're asking about treatments or information
    info_keywords = [
        "treatment", "treat", "medicine", "medication", "drug",
        "cause", "symptom", "diagnos", "what is", "tell me about",
        "information", "help with", "manage", "prevent", "cure",
        "clinical trial", "research", "study", "hospital",
    ]
    if any(k in q for k in info_keywords):
        return None

    for symptom, data in DDX_TRIGGERS.items():
        if symptom in q:
            return {
                "is_ddx": True,
                "symptom": symptom,
                "question": data["question"],
                "clarifications": data["clarifications"],
            }

    return None

def format_ddx_response(ddx: dict) -> str:
    lines = [ddx["question"], ""]
    for i, c in enumerate(ddx["clarifications"], 1):
        lines.append(f"{i}. {c}")
    return "\n".join(lines)