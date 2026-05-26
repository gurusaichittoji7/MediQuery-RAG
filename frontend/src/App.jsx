import { useState, useRef, useEffect } from 'react'
import { queryMediQuery, fetchStats } from './lib/api'
import './index.css'

const SUGGESTED = [
  'What are the current clinical trials for Type 2 diabetes?',
  'What are the warnings for metformin?',
  'How many COVID-19 cases are there globally?',
  'What treatments exist for Alzheimer\'s disease?',
  'What is the dosage for lisinopril?',
]

function SourceBadge({ source }) {
  const label = source.includes('clinicaltrials') ? '🔬 ClinicalTrials'
    : source.includes('disease.sh') ? '🦠 Disease.sh'
    : source.includes('openfda') ? '💊 OpenFDA'
    : '📄 Source'
  return <span className="badge">{label}</span>
}

function Message({ msg }) {
  return (
    <div className={`message ${msg.role}`}>
      <div className="bubble">
        {msg.role === 'assistant' && (
          <span className="role-icon">⚕</span>
        )}
        <div className="content">
          <p>{msg.text}</p>
          {msg.sources?.length > 0 && (
            <div className="sources">
              {msg.sources.map((s, i) => <SourceBadge key={i} source={s} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="message assistant">
      <div className="bubble">
        <span className="role-icon">⚕</span>
        <div className="typing">
          <span /><span /><span />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I\'m MediQuery — a medical Q&A assistant trained on real clinical trial data, disease statistics, and FDA drug labels. Ask me anything about diseases, treatments, or clinical research.',
      sources: [],
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    fetchStats().then(setStats).catch(() => {})
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(question) {
    const q = (question || input).trim()
    if (!q || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setLoading(true)
    try {
      const res = await queryMediQuery(q)
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: res.answer,
        sources: res.sources,
      }])
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `Sorry, I ran into an error: ${e.message}`,
        sources: [],
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="app">
      <header>
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">⚕</span>
            <div>
              <h1>MediQuery</h1>
              <p>Clinical AI Research Assistant</p>
            </div>
          </div>
          {stats && (
            <div className="stat-pills">
              <span className="pill">{stats.total_documents?.toLocaleString()} docs</span>
              <span className="pill">{stats.llm_provider?.toUpperCase()}</span>
            </div>
          )}
        </div>
      </header>

      <main>
        <div className="messages">
          {messages.map((m, i) => <Message key={i} msg={m} />)}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {messages.length === 1 && !loading && (
          <div className="suggestions">
            {SUGGESTED.map((s, i) => (
              <button key={i} className="suggestion" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
      </main>

      <footer>
        <div className="input-row">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about diseases, treatments, clinical trials, drugs..."
            rows={1}
            disabled={loading}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="send-btn"
          >
            {loading ? '...' : '→'}
          </button>
        </div>
        <p className="disclaimer">
          For informational purposes only. Not a substitute for professional medical advice.
        </p>
      </footer>
    </div>
  )
}
