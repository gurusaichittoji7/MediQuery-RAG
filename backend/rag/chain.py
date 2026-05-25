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
    template="""You are MediQuery, a medical information assistant powered by clinical and epidemiological data.

Use ONLY the context below to answer the question. If the answer is not in
the context, say: "I don't have enough information in my knowledge base to
answer this accurately."

Do NOT make up statistics, drug names, or medical claims not present in
the context. Always mention your data source when possible (e.g.,
"According to ClinicalTrials.gov...").

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