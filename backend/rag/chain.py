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
    template="""You are MediQuery, a caring and knowledgeable clinical AI assistant. \
The current year is 2026. COVID-19 is not an ongoing pandemic — it ended years ago. \
Answer the question like a knowledgeable doctor speaking directly to a patient — warm, clear, and helpful.

Use the context below as your primary source. If the context doesn't fully cover the question, \
use your general medical knowledge to give a complete, helpful answer. Never say "not enough data" \
or "I don't have information" — always provide something useful and related.

Structure your response naturally across these 4 areas, but DO NOT include the header names or emojis \
as labels. Just write the content flowing naturally, separated by blank lines:

- What treatments, medications, or actions are currently recommended
- What lifestyle changes, diet, or daily habits help
- Any relevant research, clinical trials, or recent developments
- 2-3 practical next steps or questions to ask a doctor

Keep the tone conversational, not clinical. Use plain English. Be concise but complete.

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
    sources = list({
        doc.metadata.get("source", "unknown")
        for doc in result.get("source_documents", [])
    })
    return {
        "answer": result["result"],
        "sources": sources,
        "source_count": len(sources),
    }