import os
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings


def _load_llm():
    provider = os.getenv("LLM_PROVIDER", "ollama").lower()

    if provider == "groq":
        from langchain_groq import ChatGroq
        return ChatGroq(
            groq_api_key=os.environ["GROQ_API_KEY"],
            model_name=os.getenv("GROQ_MODEL", "llama3-8b-8192"),
            temperature=0.3,
            max_tokens=1024,
        )

    from langchain_community.llms import Ollama
    return Ollama(
        base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
        model=os.getenv("OLLAMA_MODEL", "llama3"),
        temperature=0.3,
    )
MEDICAL_PROMPT = PromptTemplate(
    input_variables=["context", "question"],
    template="""You are MediQuery, a caring clinical AI assistant. The current year is 2026.
Answer like a knowledgeable doctor speaking directly to a patient — warm, clear, and concise.

RESPONSE LENGTH RULES — follow strictly:
- Simple factual questions (what is X, define X, how much is X): 1-2 sentences max
- Symptom or condition questions: 2-3 short paragraphs
- Complex treatment or research questions: up to 4 paragraphs with clear structure
- Emergency or crisis questions: handled separately

Use the context below as your primary source. If context doesn't fully cover it, use general medical knowledge.
Never say "not enough data" — always give something useful.
Do NOT repeat yourself. Do NOT pad answers. Be direct.

Context:
{context}

Question: {question}

Answer:""",
)


def build_rag_chain(vectorstore: FAISS) -> RetrievalQA:
    llm = _load_llm()
    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 6},
    )
    chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True,
        chain_type_kwargs={"prompt": MEDICAL_PROMPT},
    )
    return chain

def run_query(chain: RetrievalQA, question: str) -> dict:
    result = chain.invoke({"query": question})

    source_docs = result.get("source_documents", [])
    sources = list({
        doc.metadata.get("source", "unknown")
        for doc in source_docs
    })

    confidence = round(min(len(sources) / 5, 1.0), 2)

    return {
        "answer": result["result"],
        "sources": sources,
        "source_count": len(sources),
        "confidence": confidence,
    }