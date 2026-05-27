import { useState, useRef, useEffect } from 'react'
import { queryMediQuery, fetchStats } from './lib/api'
import './index.css'

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

function EmergencyAlert({ text }) {
  const parts = text.replace('EMERGENCY::', '').split('::')
  const title = parts[0] || ''
  const message = parts[1] || ''
  const disclaimer = parts[2] || ''

  const isMentalHealth = title.includes('💙')

  return (
    <div style={{
      border: `2px solid ${isMentalHealth ? 'var(--color-border-info)' : 'var(--color-border-danger)'}`,
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <div style={{
        background: isMentalHealth ? 'var(--color-background-info)' : 'var(--color-background-danger)',
        padding: '12px 16px',
      }}>
        <p style={{
          fontSize: '15px',
          fontWeight: 500,
          color: isMentalHealth ? 'var(--color-text-info)' : 'var(--color-text-danger)',
          margin: 0,
        }}>{title}</p>
      </div>
      <div style={{ padding: '14px 16px', background: 'var(--color-background-primary)' }}>
        <p style={{ fontSize: '14px', lineHeight: 1.65, margin: '0 0 12px' }}>{message}</p>
        <p style={{
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
          margin: 0,
          fontStyle: 'italic',
        }}>{disclaimer}</p>
      </div>
    </div>
  )
}

function StructuredAnswer({ text, icdCode }) {
  if (text.startsWith('EMERGENCY::')) {
    return <EmergencyAlert text={text} />
  }

  const paragraphs = text
    .split(/\n{2,}/)
    .map(p => p.replace(/\*\*/g, '').replace(/^\* /gm, '• ').trim())
    .filter(p => p.length > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {paragraphs.map((para, i) => (
        <p key={i} style={{
          fontSize: '14.5px',
          lineHeight: 1.7,
          color: 'var(--color-text-primary)',
          margin: 0,
          whiteSpace: 'pre-wrap',
        }}>
          {para}
        </p>
      ))}
      {icdCode && (
        <p style={{
          fontSize: '11px',
          color: 'var(--color-text-secondary)',
          marginTop: '8px',
          fontFamily: 'monospace',
        }}>
          ICD-11: {icdCode}
        </p>
      )}
    </div>
  )
}

function Message({ msg }) {
  const [copied, setCopied] = useState(false)

  function copyAnswer() {
    navigator.clipboard.writeText(msg.text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className={`message ${msg.role}`}>
      <div className="bubble">
        <div className={`avatar ${msg.role === 'assistant' ? 'assistant' : 'user-av'}`}>
          {msg.role === 'assistant' ? '⚕' : '👤'}
        </div>
        <div className="content">
          {msg.role === 'assistant'
            ? <StructuredAnswer text={msg.text} icdCode={msg.icd_code} />
            : <p>{msg.text}</p>}
          {msg.role === 'assistant' && msg.confidence !== undefined && (
            <div style={{
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: '0.5px solid var(--color-border-tertiary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                Confidence
              </span>
              <div style={{
                flex: 1,
                height: '4px',
                background: 'var(--color-background-secondary)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${msg.confidence * 100}%`,
                  height: '100%',
                  background: msg.confidence > 0.7
                    ? 'var(--color-text-success)'
                    : msg.confidence > 0.4
                    ? 'var(--color-text-warning)'
                    : 'var(--color-text-danger)',
                  borderRadius: '4px',
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', minWidth: '32px' }}>
                {Math.round(msg.confidence * 100)}%
              </span>
            </div>
          )}
          {msg.role === 'assistant' && !msg.text.startsWith('EMERGENCY::') && (
            <div style={{
              marginTop: '8px',
              display: 'flex',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={copyAnswer}
                style={{
                  background: 'none',
                  border: '0.5px solid var(--color-border-tertiary)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  color: copied ? 'var(--color-text-success)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
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

  // Load chat history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mediquery_history')
    if (saved) {
      try {
        setMessages(JSON.parse(saved))
      } catch (e) {}
    }
  }, [])

  // Save chat history to localStorage on every message
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('mediquery_history', JSON.stringify(messages))
    }
  }, [messages])

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
        icd_code: res.icd_code,
        confidence: res.confidence,
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
        <div className="nav-right">
          {messages.length > 0 && (
            <button
              onClick={() => {
                setMessages([])
                localStorage.removeItem('mediquery_history')
              }}
              style={{
                background: 'none',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
            >
              Clear history
            </button>
          )}
        </div>
      </header>

      <main>
        {showHero ? (
          <>
            <div className="hero">
              <div className="hero-icon">⚕</div>
              <h2>What can I help you with?</h2>
              <p>
                Ask me anything about diseases, clinical trials, drug labels,
                or medical research, powered by real public health data.
              </p>
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
