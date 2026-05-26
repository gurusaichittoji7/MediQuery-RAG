import os
import json
from pathlib import Path
from typing import List, Dict

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.schema import Document

import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from ingestion.fetch_disease import fetch_all as fetch_disease
from ingestion.fetch_trials import fetch_all as fetch_trials
from ingestion.fetch_fda import fetch_all as fetch_fda
from ingestion.fetch_medlineplus import fetch_all as fetch_medlineplus
from ingestion.fetch_who import fetch_all as fetch_who
from ingestion.fetch_lab_ranges import fetch_all as fetch_lab_ranges
from ingestion.fetch_cms import fetch_all as fetch_cms

INDEX_DIR = Path(__file__).parent / "faiss_index"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"


def chunks_to_documents(chunks: List[Dict]) -> List[Document]:
    docs = []
    for chunk in chunks:
        if not chunk.get("text", "").strip():
            continue
        docs.append(Document(
            page_content=chunk["text"],
            metadata={
                "source": chunk.get("source", "unknown"),
                "category": chunk.get("category", "general"),
            }
        ))
    return docs


def build_index():
    print("=" * 50)
    print("MediQuery RAG — Building FAISS Index")
    print("=" * 50)

    print("\n[1/4] Fetching data from all 3 APIs...")
    all_chunks = []
    all_chunks += fetch_disease()
    all_chunks += fetch_trials()
    all_chunks += fetch_fda()
    all_chunks += fetch_medlineplus()
    all_chunks += fetch_who()
    all_chunks += fetch_lab_ranges()
    all_chunks += fetch_cms()
    print(f"Total chunks collected: {len(all_chunks)}")

    print("\n[2/4] Converting to Documents...")
    docs = chunks_to_documents(all_chunks)
    print(f"Valid documents: {len(docs)}")

    print(f"\n[3/4] Loading embedding model: {EMBEDDING_MODEL}")
    print("(First run downloads ~90MB — cached after that)")
    embeddings = HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )

    print("\n[4/4] Building FAISS index...")
    INDEX_DIR.mkdir(exist_ok=True)
    vectorstore = FAISS.from_documents(docs, embeddings)
    vectorstore.save_local(str(INDEX_DIR))

    summary = {
        "total_documents": len(docs),
        "categories": {},
        "embedding_model": EMBEDDING_MODEL,
    }
    for doc in docs:
        cat = doc.metadata.get("category", "unknown")
        summary["categories"][cat] = summary["categories"].get(cat, 0) + 1

    with open(INDEX_DIR / "summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    print("\n✅ FAISS index built successfully!")
    print(f"   Location: {INDEX_DIR}")
    print(f"   Total documents: {len(docs)}")
    for cat, count in summary["categories"].items():
        print(f"   {cat}: {count} docs")


def load_index(embeddings=None):
    if not INDEX_DIR.exists():
        raise FileNotFoundError(
            f"FAISS index not found at {INDEX_DIR}. "
            "Run: python -m vectorstore.build_index"
        )
    if embeddings is None:
        embeddings = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
    return FAISS.load_local(str(INDEX_DIR), embeddings, allow_dangerous_deserialization=True)

if __name__ == "__main__":
    build_index()