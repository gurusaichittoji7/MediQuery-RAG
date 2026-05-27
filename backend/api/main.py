import os
import json
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

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


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=500)


class QueryResponse(BaseModel):
    answer: str
    sources: list[str]
    source_count: int
    icd_code: Optional[str] = None


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
    summary = app_state.get("summary", {})
    return {
        "total_documents": summary.get("total_documents", 0),
        "categories": summary.get("categories", {}),
        "embedding_model": summary.get("embedding_model", "unknown"),
        "llm_provider": os.getenv("LLM_PROVIDER", "ollama"),
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

        # 🚨 Red flag check — bypasses LLM entirely
        emergency = check_emergency(request.question)
        if emergency:
            return QueryResponse(
                answer=f"EMERGENCY::{emergency['title']}::{emergency['message']}::{emergency['disclaimer']}",
                sources=[a['label'] for a in emergency['actions']],
                source_count=len(emergency['actions']),
            )

        # ICD-11 mapping — enriches the query with clinical codes
        icd = map_to_icd11(request.question)
        enriched_question = request.question
        if icd:
            enriched_question = (
                f"{request.question} "
                f"[ICD-11 Code: {icd['code']} — {icd['title']}]"
            )

        result = run_query(app_state["chain"], enriched_question)
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
                result = run_query(app_state["chain"], augmented_question)
                result["sources"] = list(set(result["sources"] + news_sources))
                result["source_count"] = len(result["sources"])

        return QueryResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))