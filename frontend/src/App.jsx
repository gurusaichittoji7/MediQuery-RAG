import { useState, useRef, useEffect } from 'react'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { signOutUser } from './firebase'
import LandingPage from './LandingPage'
import './index.css'
import AdminDashboard from './AdminDashboard'
import { queryMediQuery, fetchStats, submitFeedback, uploadFile } from './lib/api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'
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

function DosageCalculator({ drug }) {
  const [weight, setWeight] = useState('')
  const [unit, setUnit] = useState('kg')
  const [result, setResult] = useState(null)

  const DOSAGE_RULES = {
    metformin: { mgPerKg: null, fixedDose: '500–2550mg/day', note: 'Fixed dosing — not weight-based. Start at 500mg twice daily with meals.' },
    ibuprofen: { mgPerKg: 10, maxDose: 400, note: 'Children: 5–10mg/kg every 6–8hrs. Adults: 200–400mg every 4–6hrs. Max 1200mg/day OTC.' },
    amoxicillin: { mgPerKg: 25, maxDose: 500, note: 'Standard: 25mg/kg/day divided every 8hrs. Severe infections: 40mg/kg/day.' },
    lisinopril: { mgPerKg: null, fixedDose: '10–40mg once daily', note: 'Fixed dosing — not weight-based. Start at 10mg/day.' },
    aspirin: { mgPerKg: null, fixedDose: '81mg (heart) or 325–650mg (pain)', note: 'Fixed dosing. Do not use in children under 16.' },
  }

  const rule = DOSAGE_RULES[drug?.toLowerCase()]
  if (!rule) return null

  function calculate() {
    const w = parseFloat(weight)
    if (!w || w <= 0) return
    const weightKg = unit === 'lbs' ? w * 0.453592 : w

    if (rule.fixedDose) {
      setResult({ dose: rule.fixedDose, note: rule.note })
    } else {
      const dose = Math.min(rule.mgPerKg * weightKg, rule.maxDose)
      setResult({
        dose: `${Math.round(dose)}mg per dose`,
        note: rule.note,
      })
    }
  }

  return (
    <div style={{
      marginTop: '12px',
      background: 'var(--color-background-secondary)',
      borderRadius: '10px',
      padding: '14px 16px',
      border: '0.5px solid var(--color-border-tertiary)',
    }}>
      <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
        💊 Dosage Calculator — {drug.charAt(0).toUpperCase() + drug.slice(1)}
      </p>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
        <input
          type="number"
          placeholder="Weight"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          style={{
            width: '100px',
            padding: '6px 10px',
            borderRadius: '6px',
            border: '0.5px solid var(--color-border-tertiary)',
            background: 'var(--color-background-primary)',
            color: 'var(--color-text-primary)',
            fontSize: '13px',
          }}
        />
        <select
          value={unit}
          onChange={e => setUnit(e.target.value)}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: '0.5px solid var(--color-border-tertiary)',
            background: 'var(--color-background-primary)',
            color: 'var(--color-text-primary)',
            fontSize: '13px',
          }}
        >
          <option value="kg">kg</option>
          <option value="lbs">lbs</option>
        </select>
        <button
          onClick={calculate}
          style={{
            background: 'var(--color-background-info)',
            border: '0.5px solid var(--color-border-info)',
            borderRadius: '6px',
            padding: '6px 14px',
            fontSize: '13px',
            color: 'var(--color-text-info)',
            cursor: 'pointer',
          }}
        >
          Calculate
        </button>
      </div>
      {result && (
        <div style={{
          background: 'var(--color-background-primary)',
          borderRadius: '8px',
          padding: '10px 12px',
          border: '0.5px solid var(--color-border-success)',
        }}>
          <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-success)', margin: '0 0 4px' }}>
            {result.dose}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
            {result.note}
          </p>
        </div>
      )}
    </div>
  )
}

function StructuredAnswer({ text, icdCode }) {
  if (text.startsWith('EMERGENCY::')) {
    return <EmergencyAlert text={text} />
  }

  const TRACKED_DRUGS = ['metformin', 'ibuprofen', 'amoxicillin', 'lisinopril', 'aspirin']
  const detectedDrug = TRACKED_DRUGS.find(d => text.toLowerCase().includes(d))

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
      {detectedDrug && <DosageCalculator drug={detectedDrug} />}
    </div>
  )
}

function PlusMenu({ onFile, onCamera, isMobile }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const options = isMobile
    ? [
        { icon: '📄', label: 'Upload PDF / DOCX / TXT', action: () => { onFile(); setOpen(false) } },
        { icon: '🖼️', label: 'Upload Image', action: () => { onFile(); setOpen(false) } },
        { icon: '📷', label: 'Take Photo', action: () => { onCamera(); setOpen(false) } },
      ]
    : [
        { icon: '📄', label: 'Upload PDF / DOCX / TXT', action: () => { onFile(); setOpen(false) } },
        { icon: '🖼️', label: 'Upload Image', action: () => { onFile(); setOpen(false) } },
      ]

  return (
    <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Attach file"
        style={{
          background: open ? 'var(--color-background-secondary)' : 'none',
          border: 'none', borderRadius: '10px',
          width: '40px', height: '40px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--color-text-secondary)',
          transition: 'all 0.15s',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', bottom: '52px', left: 0,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px', overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 100, minWidth: '200px',
        }}>
          {options.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              style={{
                width: '100%', padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left',
                fontSize: '13px', color: '#0f172a',
                fontFamily: 'DM Sans, sans-serif',
                borderBottom: i < options.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
function Message({ msg, setMessages }) {
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState(null)

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
            : (
              <div>
                {msg.attachment && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    marginBottom: '6px',
                    padding: '4px 10px',
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '6px', fontSize: '12px',
                  }}>
                    <span>{msg.attachment.match(/\.(jpg|jpeg|png|webp)$/i) ? '🖼️' : '📄'}</span>
                    <span>{msg.attachment}</span>
                  </div>
                )}
                <p>{msg.text}</p>
              </div>
            )}
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
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <button
                onClick={copyAnswer}
                title="Copy"
                style={{
                  background: 'none',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px',
                  cursor: 'pointer',
                  color: copied ? 'var(--color-text-success)' : 'var(--color-text-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.15s',
                }}
              >
                {copied
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                }
              </button>
              <button
                onClick={() => {
  console.log('clicked up, current feedback:', feedback)
  submitFeedback(msg.text.slice(0, 100), 'up').catch(() => {})
  setFeedback('up')
}}
                title="Good response"
                style={{
                  background: 'none',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px',
                  cursor: 'pointer',
                  color: feedback === 'up' ? 'var(--color-text-success)' : 'var(--color-text-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.15s',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={feedback === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
              </button>
              <button
                onClick={() => {
                  submitFeedback(msg.text.slice(0, 100), 'down').catch(() => {})
                  setFeedback('down')
                }}
                title="Bad response"
                style={{
                  background: 'none',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px',
                  cursor: 'pointer',
                  color: feedback === 'down' ? 'var(--color-text-danger)' : 'var(--color-text-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.15s',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={feedback === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
              </button>
              <button
                onClick={() => {
                  setMessages(prev => prev.filter((_, i) => i < prev.findIndex(m => m === msg) ))
                  localStorage.removeItem('mediquery_history')
                }}
                title="Retry"
                style={{
                  background: 'none',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px',
                  cursor: 'pointer',
                  color: 'var(--color-text-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.15s',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
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
  const [user, setUser] = useState(undefined) // undefined = loading, null = logged out
  const [showAdmin, setShowAdmin] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)
  const [listening, setListening] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])

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

  function handleFileSelect(file) {
    if (!file) return
    setPendingFile(file)
    inputRef.current?.focus()
  }

  async function send(question) {
    if (listening) {
      window._recognition?.stop()
      setListening(false)
    }
    const q = (question || input).trim()
    if (!q && !pendingFile) return
    if (loading || uploadLoading) return

    setInput('')
    if (pendingFile) {
      const file = pendingFile
      setPendingFile(null)
      setUploadLoading(true)
      setMessages(prev => [...prev, {
        role: 'user',
        text: q || `Summarize this document and highlight any important medical findings.`,
        attachment: file.name,
      }])
      try {
        const res = await uploadFile(
        file,
        q || '',
        messages.map(m => ({ role: m.role, content: m.text }))
      )
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
          text: `Sorry, couldn't process the file: ${e.message}`,
          sources: [],
        }])
      } finally {
        setUploadLoading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
        if (cameraInputRef.current) cameraInputRef.current.value = ''
        inputRef.current?.focus()
      }
      return
    }

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

  async function handleFileUpload(file) {
    if (!file) return
    setUploadLoading(true)
    const fileMsg = `📎 Uploaded: ${file.name}`
    setMessages(prev => [...prev, { role: 'user', text: fileMsg }])
    try {
      const res = await uploadFile(file, input.trim() || '')
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: res.answer,
        sources: res.sources,
        icd_code: res.icd_code,
        confidence: res.confidence,
      }])
      setInput('')
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `Sorry, couldn't process the file: ${e.message}`,
        sources: [],
      }])
    } finally {
      setUploadLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (listening) {
        window._recognition?.stop()
        setListening(false)
      }
      send()
    }
  }
  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    if (listening) {
      window._recognition?.stop()
      setListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = true

    window._recognition = recognition

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('')
      setInput(transcript)
    }

    recognition.start()
  }
  if (user === undefined) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
    </div>
  )
  if (!user) return <LandingPage onLogin={setUser} />
  if (showAdmin && user?.email === 'gurusaic3x@gmail.com') {
    return <AdminDashboard user={user} onBack={() => setShowAdmin(false)} />
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
        <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              Clear
            </button>
            
          )}
          {user?.photoURL && (
            <img src={user.photoURL} alt="avatar" style={{
              width: '28px', height: '28px',
              borderRadius: '50%',
              border: '1px solid var(--color-border-tertiary)',
            }} />
          )}
          <button
            onClick={() => { signOutUser(); setUser(null) }}
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
            Sign out
          </button>
          {user?.email === 'gurusaic3x@gmail.com' && (
            <button
              onClick={() => setShowAdmin(true)}
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
              Admin
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
            {messages.map((m, i) => <Message key={i} msg={m} setMessages={setMessages} />)}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      <footer>
        <div className="input-wrap">
          <div className="input-row" style={{ flexDirection: 'column', alignItems: 'stretch', padding: pendingFile ? '8px 8px 8px 12px' : undefined }}>
            {pendingFile && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 8px',
                background: 'var(--color-background-secondary)',
                borderRadius: '8px', marginBottom: '6px',
              }}>
                <span style={{ fontSize: '16px' }}>
                  {pendingFile.type.includes('image') ? '🖼️' : '📄'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-primary)', flex: 1 }}>
                  {pendingFile.name}
                </span>
                <button
                  onClick={() => { setPendingFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  style={{
                    background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: '14px',
                    color: 'var(--color-text-secondary)',
                    padding: '0 4px',
                  }}
                >✕</button>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.webp"
                style={{ display: 'none' }}
                onChange={e => handleFileSelect(e.target.files[0])}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={e => handleFileSelect(e.target.files[0])}
              />
              <PlusMenu
                onFile={() => fileInputRef.current?.click()}
                onCamera={() => cameraInputRef.current?.click()}
                isMobile={window.innerWidth < 768}
              />
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={pendingFile ? `Ask about this ${pendingFile.type?.includes('image') ? 'image' : 'document'}... (or press → to analyze)` : "Ask about diseases, treatments, clinical trials, drugs..."}
                rows={1}
                disabled={loading || uploadLoading}
              />
              <button
                onClick={startListening}
                disabled={loading || uploadLoading}
                title="Speak"
                style={{
                  background: listening ? 'var(--color-background-danger)' : 'none',
                  border: 'none', borderRadius: '10px',
                  width: '40px', height: '40px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0,
                  color: listening ? 'var(--color-text-danger)' : 'var(--color-text-secondary)',
                  transition: 'all 0.15s',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={listening ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </button>
              <button
                onClick={() => send()}
                disabled={(!input.trim() && !pendingFile) || loading || uploadLoading}
                className="send-btn"
              >
                {loading || uploadLoading ? '...' : '→'}
              </button>
            </div>
          </div>
          <p className="disclaimer">
            For informational purposes only. Not a substitute for professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  )
}