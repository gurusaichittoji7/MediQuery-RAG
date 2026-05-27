import json
import os
from datetime import datetime, timezone
from pathlib import Path

LOG_DIR = Path(__file__).parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)
LOG_FILE = LOG_DIR / "audit.log"


def log_query(
    question: str,
    answer: str,
    sources: list,
    icd_code: str | None,
    confidence: float | None,
    query_type: str = "rag",
    response_ms: int = 0,
):
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "query_type": query_type,
        "question": question[:300],
        "answer_length": len(answer),
        "sources": sources,
        "icd_code": icd_code,
        "confidence_score": confidence,
        "response_ms": response_ms,
    }
    with open(LOG_FILE, "a") as f:
        f.write(json.dumps(entry) + "\n")