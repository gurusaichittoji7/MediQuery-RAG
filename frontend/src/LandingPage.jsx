import { useState } from 'react'
import { signInWithGoogle } from './firebase'

export default function LandingPage({ onLogin }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleGoogleLogin() {
    setLoading(true)
    setError(null)
    try {
      const user = await signInWithGoogle()
      onLogin(user)
    } catch (e) {
      setError('Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: 'DM Sans, sans-serif',
    }}>

      {/* Navbar */}
      <nav style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 48px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #0ea5e9, #10b981)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
          }}>⚕</div>
          <span style={{ fontSize: '20px', fontFamily: 'DM Serif Display, serif', color: '#0f172a' }}>
            MediQuery
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {['Features', 'How it works', 'About', 'FAQ'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} style={{
              fontSize: '14px', color: '#64748b', textDecoration: 'none',
              transition: 'color 0.15s',
            }}>{item}</a>
          ))}
          <button onClick={handleGoogleLogin} disabled={loading} style={{
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            border: 'none', borderRadius: '8px',
            padding: '8px 20px', fontSize: '14px',
            color: '#fff', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
          }}>
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '80px 48px',
        display: 'flex', alignItems: 'center',
        gap: '60px',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: '20px', padding: '4px 14px',
            fontSize: '12px', color: '#3b82f6',
            marginBottom: '24px',
          }}>
            <span>🔬</span> Powered by ClinicalTrials.gov · OpenFDA · WHO · MedlinePlus
          </div>
          <h1 style={{
            fontSize: '52px', fontFamily: 'DM Serif Display, serif',
            color: '#0f172a', lineHeight: 1.15,
            fontWeight: 400, marginBottom: '20px',
          }}>
            Your Health<br />
            <span style={{ color: '#0ea5e9' }}>is Our Priority</span>
          </h1>
          <p style={{
            fontSize: '17px', color: '#64748b',
            lineHeight: 1.7, marginBottom: '36px',
            maxWidth: '480px',
          }}>
            MediQuery is a clinical AI assistant powered by real medical data.
            Ask about diseases, drug interactions, clinical trials, and get
            grounded answers instantly.
          </p>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={handleGoogleLogin} disabled={loading} style={{
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              border: 'none', borderRadius: '10px',
              padding: '14px 32px', fontSize: '16px',
              color: '#fff', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              boxShadow: '0 4px 14px rgba(14,165,233,0.3)',
            }}>
              {loading ? 'Signing in...' : 'Get Started →'}
            </button>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
              Free · No credit card required
            </span>
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '12px' }}>{error}</p>}
        </div>

        {/* Hero illustration */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <svg viewBox="0 0 400 350" width="400" height="350" xmlns="http://www.w3.org/2000/svg">
            <circle cx="200" cy="175" r="160" fill="#e0f2fe" opacity="0.5"/>
            <circle cx="200" cy="175" r="120" fill="#bae6fd" opacity="0.4"/>
            {/* Doctor figure */}
            <circle cx="200" cy="90" r="35" fill="#ffffff" stroke="#0ea5e9" strokeWidth="2"/>
            <text x="200" y="98" textAnchor="middle" fontSize="30">👨‍⚕️</text>
            <rect x="160" y="130" width="80" height="100" rx="10" fill="#ffffff" stroke="#0ea5e9" strokeWidth="2"/>
            <text x="200" y="185" textAnchor="middle" fontSize="12" fill="#0ea5e9" fontFamily="DM Sans">DOCTOR</text>
            {/* Stats cards */}
            <rect x="30" y="120" width="110" height="55" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1"/>
            <text x="85" y="142" textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="DM Sans">Clinical Trials</text>
            <text x="85" y="162" textAnchor="middle" fontSize="18" fill="#0ea5e9" fontFamily="DM Serif Display">80+</text>
            <rect x="260" y="120" width="110" height="55" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1"/>
            <text x="315" y="142" textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="DM Sans">Drug Labels</text>
            <text x="315" y="162" textAnchor="middle" fontSize="18" fill="#10b981" fontFamily="DM Serif Display">30+</text>
            <rect x="30" y="210" width="110" height="55" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1"/>
            <text x="85" y="232" textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="DM Sans">Health Topics</text>
            <text x="85" y="252" textAnchor="middle" fontSize="18" fill="#8b5cf6" fontFamily="DM Serif Display">75+</text>
            <rect x="260" y="210" width="110" height="55" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1"/>
            <text x="315" y="232" textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="DM Sans">WHO Indicators</text>
            <text x="315" y="252" textAnchor="middle" fontSize="18" fill="#f59e0b" fontFamily="DM Serif Display">60+</text>
          </svg>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{
        background: '#ffffff',
        padding: '80px 48px',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '36px', fontFamily: 'DM Serif Display, serif',
            color: '#0f172a', textAlign: 'center',
            fontWeight: 400, marginBottom: '48px',
          }}>
            Enterprise-grade clinical intelligence
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
          }}>
            {[
              { icon: '🚨', title: 'Emergency Triage', desc: 'Instant red flag detection — bypasses AI entirely for life-threatening symptoms. Zero latency 911 alerts.', color: '#fef2f2', border: '#fecaca' },
              { icon: '💊', title: 'Drug Safety Layer', desc: 'Full drug interaction checker, contraindications, formulary tiers, and demographic-specific warnings.', color: '#f0fdf4', border: '#bbf7d0' },
              { icon: '🔬', title: 'Clinical Trials', desc: 'Real-time access to active trials from ClinicalTrials.gov — matched to your condition and stage.', color: '#eff6ff', border: '#bfdbfe' },
              { icon: '🌍', title: 'Live Health News', desc: 'WHO, CDC, NIH news injected into answers for current events, outbreaks, and emerging research.', color: '#fefce8', border: '#fde68a' },
              { icon: '🧠', title: 'ICD-11 Mapping', desc: 'Every query mapped to standardized clinical codes — the same system used by hospitals worldwide.', color: '#faf5ff', border: '#e9d5ff' },
              { icon: '🏥', title: 'DDx Assistance', desc: 'Ambiguous symptoms trigger clarifying questions — like a real doctor, not a search engine.', color: '#f0fdfa', border: '#99f6e4' },
            ].map((f, i) => (
              <div key={i} style={{
                background: f.color,
                border: `1px solid ${f.border}`,
                borderRadius: '14px',
                padding: '24px',
              }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 500, color: '#0f172a', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '36px', fontFamily: 'DM Serif Display, serif',
            color: '#0f172a', fontWeight: 400, marginBottom: '48px',
          }}>How it works</h2>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
            {[
              { step: '01', title: 'Ask anything', desc: 'Type or speak your question — symptoms, drugs, conditions, or clinical trials.' },
              { step: '02', title: 'RAG retrieves', desc: 'Our pipeline searches 306 verified medical documents using semantic similarity.' },
              { step: '03', title: 'Grounded answer', desc: 'The LLM generates a response using only retrieved context — no hallucinations.' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{
                  width: '48px', height: '48px',
                  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  borderRadius: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 500, color: '#fff',
                  margin: '0 auto 16px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>{s.step}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 500, color: '#0f172a', marginBottom: '8px' }}>{s.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#0f172a',
        padding: '32px 48px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 8px' }}>
          ⚕ MediQuery — Clinical AI Research Assistant
        </p>
        <p style={{ fontSize: '11px', color: '#475569', margin: 0 }}>
          For informational purposes only. Not a substitute for professional medical advice.
          MediQuery does not store personal health information. HIPAA-conscious design.
        </p>
      </footer>

    </div>
  )
}