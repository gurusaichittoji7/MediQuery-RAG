import os
import json
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from api.drug_safety import get_drug_safety, format_drug_safety
from api.cache import get_cached, set_cache
from api.audit import log_query
import time
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, UploadFile, File, Form

load_dotenv()

app_state = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[MediQuery] Loading embedding model and FAISS index...")
    try:
        from langchain_huggingface import HuggingFaceEmbeddings
        from vectorstore.build_index import load_index
        from rag.chain import build_rag_chain

        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
        vectorstore = load_index(embeddings)
        app_state["chain"] = build_rag_chain(vectorstore)

        summary_path = Path(__file__).parent.parent / "vectorstore" / "faiss_index" / "summary.json"
        if summary_path.exists():
            with open(summary_path) as f:
                app_state["summary"] = json.load(f)

        print(f"[MediQuery] Ready — {app_state.get('summary', {}).get('total_documents', '?')} documents indexed.")
    except FileNotFoundError as e:
        print(f"[MediQuery] WARNING: {e}")
    yield
    app_state.clear()


app = FastAPI(
    title="MediQuery RAG API",
    description="Medical Q&A powered by ClinicalTrials.gov, disease.sh, and OpenFDA",
    version="1.0.0",
    lifespan=lifespan,
)

allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in allowed_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConversationMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class QueryRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=500)
    history: list[ConversationMessage] = []


class QueryResponse(BaseModel):
    answer: str
    sources: list[str]
    source_count: int
    icd_code: Optional[str] = None
    confidence: Optional[float] = None


@app.get("/health")
def health():
    ready = "chain" in app_state
    return {
        "status": "ready" if ready else "initializing",
        "index_loaded": ready,
        "provider": os.getenv("LLM_PROVIDER", "ollama"),
    }


@app.get("/stats")
def stats():
    from api.cache import cache_stats
    summary = app_state.get("summary", {})
    return {
        "total_documents": summary.get("total_documents", 0),
        "categories": summary.get("categories", {}),
        "embedding_model": summary.get("embedding_model", "unknown"),
        "llm_provider": os.getenv("LLM_PROVIDER", "ollama"),
        **cache_stats(),
    }

@app.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    if "chain" not in app_state:
        raise HTTPException(
            status_code=503,
            detail="RAG index not loaded. Run 'python -m vectorstore.build_index' first.",
        )
    try:
        from rag.chain import run_query
        from api.news import fetch_health_news, is_current_events_query
        from api.triage import check_emergency
        from api.icd_mapper import map_to_icd11
        from api.ddx import check_ddx, format_ddx_response

        # 🚨 Red flag check — bypasses LLM entirely
        emergency = check_emergency(request.question)
        if emergency:
            return QueryResponse(
                answer=f"EMERGENCY::{emergency['title']}::{emergency['message']}::{emergency['disclaimer']}",
                sources=[a['label'] for a in emergency['actions']],
                source_count=len(emergency['actions']),
            )

        # 🧠 DDx clarifying questions for ambiguous symptoms
        ddx = check_ddx(request.question)
        if ddx:
            return QueryResponse(
                answer=format_ddx_response(ddx),
                sources=[],
                source_count=0,
                icd_code=None,
            )
        # ⚡ Cache check — return instantly if same question asked before
        cached = get_cached(request.question)
        if cached:
            return QueryResponse(**cached)

# 💊 Drug safety layer
        drug_safety = get_drug_safety(request.question)
        if drug_safety and any(k in request.question.lower() for k in ["warning", "interaction", "side effect", "safe", "dose", "dosage", "contraindication", "cost", "tier", "price"]):
            return QueryResponse(
                answer=format_drug_safety(drug_safety),
                sources=["openfda.gov", "drugs.com"],
                source_count=2,
                icd_code=None,
            )

        # ICD-11 mapping — enriches the query with clinical codes
        icd = map_to_icd11(request.question)
        enriched_question = request.question
        if icd:
            default_doc_q = question if question.strip() else "Summarize this document and highlight any important medical findings, diagnoses, medications, lab values, or health recommendations."
            enriched_question = (
                f"{default_doc_q}\n\n"
                f"[DOCUMENT CONTENT — {parsed['filename']}]:\n{doc_context}"
            )

        start_ms = int(time.time() * 1000)
        result = run_query(app_state["chain"], enriched_question, 
                          [{"role": m.role, "content": m.content} for m in request.history])
        response_ms = int(time.time() * 1000) - start_ms

        if icd:
            result["icd_code"] = f"{icd['code']} — {icd['title']}"

        if is_current_events_query(request.question):
            news = fetch_health_news(request.question)
            if news:
                news_context = "\n".join([n["text"] for n in news])
                news_sources = [n["source"] for n in news]
                augmented_question = (
                    f"{request.question}\n\n"
                    f"[LIVE NEWS CONTEXT - use this for recent developments]:\n{news_context}"
                )
                new_result = run_query(app_state["chain"], augmented_question)
                new_result["sources"] = list(set(new_result["sources"] + news_sources))
                new_result["source_count"] = len(new_result["sources"])
                new_result["icd_code"] = result.get("icd_code")
                result = new_result

        log_query(
            question=request.question,
            answer=result["answer"],
            sources=result["sources"],
            icd_code=result.get("icd_code"),
            confidence=result.get("confidence"),
            query_type="rag",
            response_ms=response_ms,
        )
# Store in cache
        set_cache(request.question, result)
        return QueryResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/logs")
def get_logs(limit: int = 20):
    from api.audit import LOG_FILE
    if not LOG_FILE.exists():
        return {"logs": []}
    lines = LOG_FILE.read_text().strip().split("\n")
    recent = [json.loads(l) for l in lines[-limit:] if l]
    return {"logs": recent, "total": len(lines)}

class FeedbackRequest(BaseModel):
    question: str
    feedback: str  # "up" or "down"

@app.post("/feedback")
async def feedback(request: FeedbackRequest):
    from api.audit import LOG_DIR
    import json
    feedback_file = LOG_DIR / "feedback.log"
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "question": request.question[:300],
        "feedback": request.feedback,
    }
    with open(feedback_file, "a") as f:
        f.write(json.dumps(entry) + "\n")
    return {"status": "ok"}

@app.get("/admin/stats")
def admin_stats():
    from api.audit import LOG_FILE, LOG_DIR
    from api.cache import cache_stats
    import json

    stats = {
        "total_queries": 0,
        "avg_confidence": 0,
        "query_types": {},
        "top_questions": [],
        "feedback": {"up": 0, "down": 0},
        "cache": cache_stats(),
        "recent_queries": [],
    }

    # Parse audit log
    if LOG_FILE.exists():
        lines = [l for l in LOG_FILE.read_text().strip().split("\n") if l]
        entries = []
        for l in lines:
            try:
                entries.append(json.loads(l))
            except:
                continue

        stats["total_queries"] = len(entries)
        confidences = [e.get("confidence", 0) for e in entries if e.get("confidence")]
        stats["avg_confidence"] = round(sum(confidences) / len(confidences), 2) if confidences else 0

        for e in entries:
            qt = e.get("query_type", "rag")
            stats["query_types"][qt] = stats["query_types"].get(qt, 0) + 1

        stats["recent_queries"] = [
            {
                "question": e.get("question", ""),
                "confidence": e.get("confidence"),
                "icd_code": e.get("icd_code"),
                "response_ms": e.get("response_ms"),
                "timestamp": e.get("timestamp", ""),
            }
            for e in entries[-10:]
        ][::-1]

    # Parse feedback log
    feedback_file = LOG_DIR / "feedback.log"
    if feedback_file.exists():
        for l in feedback_file.read_text().strip().split("\n"):
            if not l:
                continue
            try:
                entry = json.loads(l)
                fb = entry.get("feedback", "")
                if fb in ("up", "down"):
                    stats["feedback"][fb] += 1
            except:
                continue

    return stats

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    question: str = Form(default="")
):
    try:
        from api.file_parser import parse_file
        from rag.chain import run_query

        file_bytes = await file.read()
        parsed = parse_file(file.filename, file_bytes)

        if parsed["type"] == "unsupported":
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.filename}")

        if parsed["type"] == "image":
            from groq import Groq
            client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
            default_q = question if question.strip() else "Describe what you see in this image. If there are any medical conditions, symptoms, skin issues, rashes, injuries, or health-related concerns visible, identify them and provide relevant medical information and treatment options."
            response = client.chat.completions.create(
                model="meta-llama/llama-4-scout-17b-16e-instruct",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{parsed['media_type']};base64,{parsed['content']}"
                                }
                            },
                            {
                                "type": "text",
                                "text": f"You are MediQuery, a clinical AI assistant. {default_q}"
                            }
                        ]
                    }
                ],
                max_tokens=1024,
            )
            answer = response.choices[0].message.content

        else:
            default_doc_q = question if question.strip() else "Summarize this document and highlight any important medical findings, diagnoses, medications, lab values, or health recommendations."
            enriched_question = (
                f"{default_doc_q}\n\n"
                f"[DOCUMENT CONTENT — {parsed['filename']}]:\n{parsed['content']}"
            )
            if "chain" not in app_state:
                raise HTTPException(status_code=503, detail="RAG index not loaded.")
            result = run_query(app_state["chain"], enriched_question)
            answer = result["answer"]

        return {
            "answer": answer,
            "filename": parsed["filename"],
            "type": parsed["type"],
            "sources": [f"Uploaded: {parsed['filename']}"],
            "source_count": 1,
            "confidence": 0.9,
            "icd_code": None,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))