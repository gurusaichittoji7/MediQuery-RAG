# MediQuery RAG 🏥

> **Hospital grade clinical AI assistant** powered by real medical data, not just a chatbot.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-medi--query--rag.vercel.app-blue?style=for-the-badge)](https://medi-query-rag.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-HuggingFace%20Spaces-yellow?style=for-the-badge)](https://huggingface.co/spaces/Gurusaic/mediquery-api)
[![GitHub](https://img.shields.io/badge/GitHub-MediQuery--RAG-black?style=for-the-badge&logo=github)](https://github.com/gurusaichittoji7/MediQuery-RAG)

---

## 🔗 Links

| | URL |
|---|---|
| 🌐 **Live App** | https://medi-query-rag.vercel.app |
| ⚙️ **API** | https://gurusaic-mediquery-api.hf.space |
| 📖 **API Docs** | https://gurusaic-mediquery-api.hf.space/docs |
| 💻 **GitHub** | https://github.com/gurusaichittoji7/MediQuery-RAG |

---

## 🧠 What Makes This Different from ChatGPT/Claude

| | Other AI Agents | MediQuery |
|---|---|---|
| **Knowledge source** | Baked into model weights at training time | Retrieved from verified medical databases at query time |
| **Hallucination risk** | High for medical facts | Low — forced to answer only from retrieved context |
| **Data freshness** | Knowledge cutoff date | Live data from ClinicalTrials.gov, WHO, OpenFDA at every query |
| **Emergency handling** | Gives advice, may delay action | Hard-coded bypass — instant 911 alert, zero LLM involved |
| **Clinical grounding** | No ICD codes, no trial IDs | ICD-11 mapped, NCT IDs cited, FDA label references |
| **Auditability** | Black box | Every query logged with confidence score, source, timestamp |

---

## 🏗️ Architecture

```
User Query
    │
    ▼
┌─────────────────────────────────────────────────┐
│              SAFETY LAYER (Zero Latency)         │
│  🚨 Emergency Triage → 911 Alert (bypasses LLM) │
│  🧠 DDx Clarifier → Follow-up questions         │
│  💊 Drug Safety → Interactions + Tier           │
└─────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────┐
│              RAG PIPELINE                        │
│  ICD-11 Mapping → Enrich query with codes       │
│  FAISS Vector Search → Top-5 relevant docs      │
│  Live News Injection → WHO/CDC/NIH articles     │
│  LangChain RetrievalQA → Grounded answer        │
└─────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────┐
│              KNOWLEDGE BASE (306 docs)           │
│  🔬 ClinicalTrials.gov — 80 active trials       │
│  💊 OpenFDA — 30 drug labels                    │
│  📚 MedlinePlus — 75 health topics              │
│  🦠 disease.sh — 21 COVID/disease stats         │
│  🌍 WHO GHO — 60 global health indicators       │
│  🧪 Lab Ranges — 20 reference tests             │
│  🏥 CMS Hospitals — 20 top-rated facilities     │
└─────────────────────────────────────────────────┘
```

---

## ✨ Features

### Clinical Intelligence
- **🚨 Emergency Triage Guardrail** — Hardcoded symptom lookup bypasses LLM entirely. Crushing chest pain → instant 911 alert in milliseconds
- **🧠 ICD-11 Mapping** — Every query mapped to standardized clinical codes (same system used by hospitals worldwide)
- **🔍 DDx Assistance** — Ambiguous symptoms trigger clarifying questions like a real clinical workflow
- **💊 Drug Safety Layer** — Full interaction checker, formulary tiers (Tier 1/2/3), demographic contraindications, pharmacokinetics
- **💉 Dosage Calculator** — Weight-based dosing for common medications

### Data & Retrieval
- **7 verified data sources** — ClinicalTrials.gov, OpenFDA, MedlinePlus, WHO GHO, disease.sh, Lab Ranges, CMS Hospitals
- **Live health news** — Real-time injection from WHO, CDC, NIH via NewsAPI
- **Conversation memory** — Follow-up questions reference previous answers
- **Query caching** — Same questions return instantly (in-memory, 1hr TTL)
- **Confidence scoring** — Every answer includes a retrieval confidence score

### File & Media Upload
- **📄 PDF / DOCX / TXT** — Upload lab reports, discharge summaries, medical records
- **🖼️ Image analysis** — Upload photos of rashes, wounds, medication labels
- **📷 Camera** — Take photos directly on mobile for real-time analysis
- **Auto image compression** — Mobile photos compressed before upload

### User Experience
- **🎤 Voice input** — Speak your question (continuous listening mode)
- **💬 Chat history** — Conversations persist across page refreshes
- **📋 Copy answers** — One-click copy for any response
- **👍👎 Feedback** — Thumbs up/down logged for model improvement
- **🔐 Google Auth** — Secure sign-in via Firebase
- **📱 Mobile responsive** — Full PWA-ready mobile experience

### Enterprise & Observability
- **Admin dashboard** — Query logs, confidence scores, feedback stats, cache metrics (admin-only)
- **Audit logging** — Every query logged with timestamp, ICD code, confidence, response time
- **Rate limiting ready** — Architecture supports Redis cache swap for production scale
- **HIPAA-conscious design** — Zero PHI retention, anonymized logging

---

## 🛠️ Tech Stack

### Backend
| Tech | Purpose |
|---|---|
| **FastAPI** | REST API — `/query`, `/upload`, `/health`, `/stats`, `/admin/stats` |
| **LangChain** | RetrievalQA chain + prompt engineering |
| **FAISS** | Vector store — IndexFlatL2, 306 documents |
| **HuggingFace** | `all-MiniLM-L6-v2` embeddings (384-dim) |
| **Groq** | LLM inference — `llama-3.1-8b-instant` |
| **Ollama** | Local dev LLM (llama3) |
| **NewsAPI** | Live health news injection |

### Frontend
| Tech | Purpose |
|---|---|
| **React + Vite** | Chat UI, landing page, admin dashboard |
| **Firebase** | Google Auth |
| **Web Speech API** | Voice input |
| **Canvas API** | Client-side image compression |

### Infrastructure
| Service | Purpose |
|---|---|
| **HuggingFace Spaces** | Backend deployment (Docker, 16GB RAM free) |
| **Vercel** | Frontend deployment (auto-deploy from GitHub) |
| **GitHub** | Source control |

---

## 🚀 Local Development

### Prerequisites
- Python 3.11
- Node.js 18+
- Ollama (for local LLM)

### Backend Setup
```bash
# 1. Clone repo
git clone https://github.com/gurusaichittoji7/MediQuery-RAG.git
cd MediQuery-RAG/backend

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment
cp .env.example .env
# Edit .env — defaults work for local dev with Ollama

# 5. Pull Ollama model
ollama pull llama3

# 6. Build FAISS index (fetches from all APIs ~2 min)
python -m vectorstore.build_index

# 7. Start backend
./venv/bin/uvicorn api.main:app --reload --port 8001
```

API docs: http://localhost:8001/docs

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:8001
npm run dev
```

Open: http://localhost:5173

---

## 📡 API Reference

### `POST /query`
```json
{
  "question": "What are the treatments for Type 2 diabetes?",
  "history": [
    { "role": "user", "content": "I have diabetes" },
    { "role": "assistant", "content": "..." }
  ]
}
```
Returns: `answer`, `sources`, `confidence`, `icd_code`

### `POST /upload`
Multipart form: `file` (PDF/DOCX/TXT/image) + `question` + `history`

### `GET /health`
Returns API readiness and LLM provider status.

### `GET /stats`
Returns index stats, document counts, cache metrics.

### `GET /admin/stats`
Returns query logs, confidence averages, feedback counts. *(Admin only)*

---

## 🎯 Interview Talking Points

- **RAG vs parametric models** — Why retrieval grounding matters for healthcare (hallucination risk)
- **FAISS index design** — Chunking strategy for medical text, keeping NCT IDs and condition names in same chunk
- **Emergency guardrail** — Zero-latency bypass, why LLM should never be in the critical path for life-threatening symptoms
- **Dual LLM support** — Ollama locally, Groq in production — swap via single env var
- **Confidence scoring** — Ratio of unique retrieved sources as a proxy for answer reliability
- **ICD-11 mapping** — Bridging to real EHR systems (Epic, Cerner use ICD codes for everything)
- **HIPAA-conscious design** — Zero PHI retention, audit logging, anonymization

---

## 📊 Data Sources

| Source | Data Type | Records |
|---|---|---|
| [ClinicalTrials.gov](https://clinicaltrials.gov) | Active trials, phases, interventions | 400k+ (80 indexed) |
| [OpenFDA](https://api.fda.gov) | Drug labels, adverse events | 100k+ (30 indexed) |
| [MedlinePlus](https://medlineplus.gov) | Health topics, symptoms, causes | 1000+ (75 indexed) |
| [WHO GHO](https://ghoapi.azureedge.net) | Global health indicators | 60 indexed |
| [disease.sh](https://disease.sh) | COVID/disease statistics | 21 indexed |
| Lab Reference Ranges | Normal values for 20 common tests | 20 (static) |
| [CMS](https://data.cms.gov) | Top-rated US hospitals | 20 (static) |

---

## 🔒 Privacy & Security

- Zero PHI (Personal Health Information) retention
- All queries anonymized before logging
- Google OAuth — no passwords stored
- HTTPS on all endpoints
- Admin dashboard restricted by email whitelist
- Audit logs auto-rotate (configurable TTL)

---

*For informational purposes only. Not a substitute for professional medical advice.*

*Built by [Gurusai Chittoji](https://github.com/gurusaichittoji7) — AI/ML Engineer*
