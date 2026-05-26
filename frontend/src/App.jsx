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
  if (source.includes('clinicaltrials')) return <span className="badge trials">🔬 ClinicalTrials</span>
  if (source.includes('disease.sh')) return <span className="badge disease">🦠 Disease.sh</span>
  if (source.includes('openfda')) return <span className="badge fda">💊 OpenFDA</span>
  if (source.includes('medlineplus')) return <span className="badge trials">📚 MedlinePlus</span>
  if (source.includes('who.int')) return <span className="badge disease">🌍 WHO</span>
  if (source.includes('lab-reference')) return <span className="badge fda">🧪 Lab Ranges</span>
  if (source.includes('cms.gov')) return <span className="badge trials">🏥 CMS</span>
  return <span className="badge">📄 Source</span>
}

function parseAnswer(text) {
  const sections = [
    { key: 'current', label: 'Current standard', color: 'info', emoji: '📋' },
    { key: 'lifestyle', label: 'Lifestyle & care', color: 'success', emoji: '🥗' },
    { key: 'research', label: 'Emerging research', color: 'warning', emoji: '🔬' },
    { key: 'nextsteps', label: 'Next steps', color: 'secondary', emoji: '❓' },
  ]

  const markers = [
    '📋 CURRENT STANDARD',
    '🥗 LIFESTYLE & CARE',
    '🔬 EMERGING RESEARCH',
    '❓ NEXT STEPS',
  ]

  const altMarkers = [
    '**CURRENT STANDARD**',
    '**LIFESTYLE & CARE**',
    '**EMERGING RESEARCH**',
    '**NEXT STEPS',
  ]

  let workingText = text
  altMarkers.forEach((alt, i) => {
    workingText = workingText.replace(alt, markers[i])
  })

  const hasStructure = markers.some(m => workingText.includes(m))
  if (!hasStructure) return null

  const parts = {}
  markers.forEach((marker, i) => {
    const start = workingText.indexOf(marker)
    if (start === -1) return
    const nextStarts = markers
      .slice(i + 1)
      .map(m => workingText.indexOf(m))
      .filter(idx => idx !== -1)
    const end = nextStarts.length > 0 ? Math.min(...nextStarts) : workingText.length
    parts[sections[i].key] = workingText.slice(start + marker.length, end).trim()
  })

  return { sections, parts }
}

function StructuredAnswer({ text }) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map(p => p.replace(/\*\*/g, '').replace(/^\* /gm, '• ').trim())
    .filter(p => p.length > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {paragraphs.map((para, i) => (
        <p
          key={i}
          style={{
            fontSize: '14.5px',
            lineHeight: 1.7,
            color: 'var(--color-text-primary)',
            margin: 0,
            whiteSpace: 'pre-wrap',
          }}
        >
          {para}
        </p>
      ))}
    </div>
  )
}

function Message({ msg }) {
  return (
    <div className={`message ${msg.role}`}>
      <div className="bubble">
        <div className={`avatar ${msg.role === 'assistant' ? 'assistant' : 'user-av'}`}>
          {msg.role === 'assistant' ? '⚕' : '👤'}
        </div>
        <div className="content">
          {msg.role === 'assistant'
            ? <StructuredAnswer text={msg.text} />
            : <p>{msg.text}</p>}
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
        <div className="avatar assistant">⚕</div>
        <div className="typing">
          <span /><span /><span />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [messages, setMessages] = useState([])
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

  const showHero = messages.length === 0 && !loading

  return (
    <div className="app">
      <header>
        <div className="nav-left" />
        <div className="nav-center">
          <div className="nav-icon">⚕</div>
          <h1>MediQuery</h1>
        </div>
        <div className="nav-right" />
      </header>

      <main>
        {showHero ? (
          <>
            <div className="hero">
              <div className="hero-icon">⚕</div>
              <h2>What can I help you with?</h2>
              <p>
                Ask me anything about diseases, clinical trials, drug labels,
                or medical research — powered by real public health data.
              </p>
            </div>
            <div className="suggestions">
              {SUGGESTED.map((s, i) => (
                <button key={i} className="suggestion" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="messages">
            {messages.map((m, i) => <Message key={i} msg={m} />)}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      <footer>
        <div className="input-wrap">
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
              →
            </button>
          </div>
          <p className="disclaimer">
            For informational purposes only. Not a substitute for professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  )
}
