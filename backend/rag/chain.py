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
            temperature=0.2,
            max_tokens=1024,
        )

    from langchain_community.llms import Ollama
    return Ollama(
        base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
        model=os.getenv("OLLAMA_MODEL", "llama3"),
        temperature=0.2,
    )


MEDICAL_PROMPT = PromptTemplate(
    input_variables=["context", "question"],
    template="""You are MediQuery, a clinical AI assistant powered by real medical data from ClinicalTrials.gov, MedlinePlus, OpenFDA, WHO, and lab reference databases.

Use ONLY the context below to answer. Do not make up any medical facts, drug names, or statistics not present in the context.

Structure your answer in EXACTLY these 4 sections with NO introduction, NO preamble, NO "Here's my response". Start directly with the first emoji marker. If you don't have enough context for a section, write "Not enough data available."

---
📋 CURRENT STANDARD
Approved medications, therapies, and clinical guidelines. Reference drug names and sources where possible.

🥗 LIFESTYLE & CARE
Diet, exercise, daily management tips, and preventive measures.

🔬 EMERGING RESEARCH
Active clinical trials, pipeline treatments, or recent research findings from the context.

❓ NEXT STEPS — QUESTIONS FOR YOUR DOCTOR
3 specific questions the patient should ask their doctor based on this condition.
---

Context:
{context}

Question: {question}

Answer:""",
)


def build_rag_chain(vectorstore: FAISS) -> RetrievalQA:
    llm = _load_llm()
    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 5},
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
    sources = list({
        doc.metadata.get("source", "unknown")
        for doc in result.get("source_documents", [])
    })
    return {
        "answer": result["result"],
        "sources": sources,
        "source_count": len(sources),
    }