import { useState } from 'react'
import { signInWithGoogle } from './firebase'

export default function LandingPage({ onLogin }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [openFaq, setOpenFaq] = useState(null)

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

  const faqs = [
    {
      q: 'Is MediQuery a replacement for a doctor?',
      a: 'Absolutely not. MediQuery is an information retrieval tool designed to synthesize official medical documentation. It does not provide diagnoses, medical advice, or treatment plans. Always consult a licensed healthcare professional for medical decisions.',
    },
    {
      q: 'How does MediQuery prevent AI hallucinations?',
      a: 'Traditional AI models guess based on patterns. MediQuery uses a strict RAG grounding framework. It pulls exact reference documents from verified medical databases and forces the AI to only summarize those specific texts. If the answer isn\'t in the data, it won\'t make it up.',
    },
    {
      q: 'Where does the data come from?',
      a: 'All answers are extracted from verified public datasets including ClinicalTrials.gov (400k+ trials), OpenFDA (100k+ drug labels), WHO Global Health Observatory, MedlinePlus, and real time health news from CDC and NIH.',
    },
    {
      q: 'Is my personal health data safe?',
      a: 'Yes. MediQuery operates on a zero-retention privacy model. We do not store personal health information (PHI), do not log permanent patient history, and do not sell query data. Every session is private and secure.',
    },
    {
      q: 'Can I use this for professional clinical research?',
      a: 'MediQuery maps data to ICD-11 codes, retrieves active clinical trials, and surfaces drug safety profiles, making it a powerful rapid discovery tool. All generated citations should be cross referenced with official sources for formal clinical decisions.',
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'DM Sans, sans-serif' }}>

      {/* Navbar */}
      <nav style={{
        background: '#ffffff', borderBottom: '1px solid #e2e8f0',
        padding: '0 48px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #0ea5e9, #10b981)',
            borderRadius: '10px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '18px',
          }}>⚕</div>
          <span style={{ fontSize: '20px', fontFamily: 'DM Serif Display, serif', color: '#0f172a' }}>
            MediQuery
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {['Features', 'How it works', 'About', 'FAQ'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} style={{
              fontSize: '14px', color: '#64748b', textDecoration: 'none',
            }}>{item}</a>
          ))}
          <button onClick={handleGoogleLogin} disabled={loading} style={{
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            border: 'none', borderRadius: '8px', padding: '8px 20px',
            fontSize: '14px', color: '#fff', cursor: 'pointer',
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
        display: 'flex', alignItems: 'center', gap: '60px',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: '20px', padding: '4px 14px',
            fontSize: '12px', color: '#3b82f6', marginBottom: '24px',
          }}>
            🔬 Powered by ClinicalTrials.gov · OpenFDA · WHO · MedlinePlus
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
            fontSize: '17px', color: '#64748b', lineHeight: 1.7,
            marginBottom: '16px', maxWidth: '480px',
          }}>
            Hospital grade accuracy for everyone. MediQuery is a clinical AI assistant
            powered by real verified medical data. Ask about diseases, drug interactions,
            clinical trials, and get grounded answers instantly.
          </p>
          <p style={{
            fontSize: '13px', color: '#94a3b8',
            marginBottom: '36px', maxWidth: '480px',
          }}>
            Backed by 400k+ clinical trials, 100k+ FDA drug labels, and real-time WHO health data.
          </p>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleGoogleLogin} disabled={loading} style={{
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              border: 'none', borderRadius: '10px', padding: '14px 32px',
              fontSize: '16px', color: '#fff', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              boxShadow: '0 4px 14px rgba(14,165,233,0.3)',
            }}>
              {loading ? 'Signing in...' : 'Get Started →'}
            </button>
            <a href="mailto:gurusaichittoji7@gmail.com" style={{
              background: 'none',
              border: '1px solid #e2e8f0', borderRadius: '10px',
              padding: '14px 32px', fontSize: '16px',
              color: '#64748b', textDecoration: 'none',
              fontFamily: 'DM Sans, sans-serif',
            }}>
              Request Enterprise Demo
            </a>
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '12px' }}>{error}</p>}
        </div>

        {/* Hero stats */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '16px', width: '100%', maxWidth: '380px',
          }}>
            {[
              { label: 'Clinical Trials', value: '400k+', color: '#0ea5e9', icon: '🔬' },
              { label: 'FDA Drug Labels', value: '100k+', color: '#10b981', icon: '💊' },
              { label: 'Health Topics', value: '75+', color: '#8b5cf6', icon: '📚' },
              { label: 'WHO Indicators', value: '60+', color: '#f59e0b', icon: '🌍' },
              { label: 'ICD-11 Mapped', value: '30+', color: '#ef4444', icon: '🧬' },
              { label: 'Live News Sources', value: '8+', color: '#06b6d4', icon: '📡' },
            ].map((s, i) => (
              <div key={i} style={{
                background: '#ffffff', border: '1px solid #e2e8f0',
                borderRadius: '14px', padding: '20px 16px',
                textAlign: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.icon}</div>
                <div style={{ fontSize: '24px', fontFamily: 'DM Serif Display, serif', color: s.color, marginBottom: '4px' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ background: '#ffffff', padding: '80px 48px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '36px', fontFamily: 'DM Serif Display, serif',
            color: '#0f172a', textAlign: 'center',
            fontWeight: 400, marginBottom: '12px',
          }}>
            Enterprise grade clinical intelligence
          </h2>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '15px', marginBottom: '48px' }}>
            Hospital grade accuracy for everyone, not just clinicians.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
          }}>
            {[
              { icon: '🚨', title: 'Emergency Triage', desc: 'Instant red flag detection & bypasses AI entirely for life-threatening symptoms. Zero latency 911 alerts.', color: '#fef2f2', border: '#fecaca' },
              { icon: '💊', title: 'Drug Safety Layer', desc: 'Full interaction checker, contraindications, formulary tiers, and demographic-specific warnings from FDA labels.', color: '#f0fdf4', border: '#bbf7d0' },
              { icon: '🔬', title: 'Clinical Trials', desc: 'Real-time access to 400k+ active trials from ClinicalTrials.gov matched to your condition and stage.', color: '#eff6ff', border: '#bfdbfe' },
              { icon: '🌍', title: 'Live Health News', desc: 'WHO, CDC, NIH news injected into answers for current outbreaks, drug approvals, and emerging research.', color: '#fefce8', border: '#fde68a' },
              { icon: '🧠', title: 'ICD-11 Mapping', desc: 'Every query mapped to standardized clinical codes, the same system used by hospitals and insurers worldwide.', color: '#faf5ff', border: '#e9d5ff' },
              { icon: '🏥', title: 'DDx Assistance', desc: 'Ambiguous symptoms trigger clarifying questions - differential diagnosis support like a real clinical workflow.', color: '#f0fdfa', border: '#99f6e4' },
            ].map((f, i) => (
              <div key={i} style={{
                background: f.color, border: `1px solid ${f.border}`,
                borderRadius: '14px', padding: '24px',
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
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '36px', fontFamily: 'DM Serif Display, serif',
            color: '#0f172a', fontWeight: 400, marginBottom: '12px',
          }}>How it works</h2>
          <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '48px' }}>
            MediQuery doesn't "know" medicine on its own. It securely fetches real documents from trusted sources and reads them to answer your question.
          </p>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'stretch', marginBottom: '48px' }}>
            {[
              { step: '01', title: 'Ask anything', desc: 'Type or speak your question about symptoms, drugs, conditions, or clinical trials. Supports voice input.', icon: '🎤' },
              { step: '02', title: 'RAG retrieves', desc: 'Our pipeline semantically searches 306 verified medical documents using FAISS vector similarity.', icon: '🔍' },
              { step: '03', title: 'Grounded answer', desc: 'The LLM generates a response using only retrieved context with no hallucinations, fully cited.', icon: '✅' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: 1, background: '#ffffff',
                border: '1px solid #e2e8f0', borderRadius: '14px',
                padding: '28px 24px',
              }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{s.icon}</div>
                <div style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  borderRadius: '8px', padding: '2px 10px',
                  fontSize: '11px', color: '#fff',
                  fontFamily: 'JetBrains Mono, monospace',
                  marginBottom: '12px',
                }}>STEP {s.step}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 500, color: '#0f172a', marginBottom: '8px' }}>{s.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Sample query mockup */}
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: '14px', padding: '24px', textAlign: 'left',
          }}>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
              SAMPLE QUERY
            </p>
            <div style={{
              background: '#f1f5f9', borderRadius: '8px',
              padding: '12px 16px', marginBottom: '16px',
              fontSize: '14px', color: '#0f172a',
            }}>
              👤 What are the current treatments for Type 2 diabetes?
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontFamily: 'JetBrains Mono, monospace' }}>
              SOURCES RETRIEVED
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {['🔬 clinicaltrials.gov/NCT04215523', '💊 openfda.gov/drug/metformin', '📚 medlineplus.gov/diabetes', '🌍 who.int/gho/NCD'].map((s, i) => (
                <span key={i} style={{
                  background: '#eff6ff', border: '1px solid #bfdbfe',
                  borderRadius: '6px', padding: '4px 10px',
                  fontSize: '11px', color: '#3b82f6',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>{s}</span>
              ))}
            </div>
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: '8px', padding: '12px 16px',
              fontSize: '13px', color: '#166534', lineHeight: 1.6,
            }}>
              ⚕ <strong>MediQuery:</strong> For Type 2 diabetes, metformin hydrochloride is typically the first line medication. Active clinical trial NCT04215523 is investigating dapagliflozin for improved outcomes. ICD-11 Code: 5A10.
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" style={{ background: '#ffffff', padding: '80px 48px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '36px', fontFamily: 'DM Serif Display, serif',
            color: '#0f172a', fontWeight: 400, marginBottom: '32px',
            textAlign: 'center',
          }}>About MediQuery</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[
              {
                icon: '🎯', title: 'Our Mission',
                body: 'MediQuery bridges the gap between complex clinical databases like OpenFDA, ClinicalTrials.gov, and WHO and everyday language. We make accurate, verified health data accessible to everyone, not just clinicians.',
              },
              {
                icon: '🏗', title: 'How the RAG Pipeline Works',
                body: 'MediQuery uses a Retrieval-Augmented Generation (RAG) architecture. The AI doesn\'t "know" medicine on its own, it securely fetches real-time documents from trusted sources and reads them to answer your question. Every answer is grounded in retrieved evidence.',
              },
              {
                icon: '🔄', title: 'Data Sourcing & Freshness',
                body: 'Our pipelines ingest data directly from official federal and global healthcare endpoints like ClinicalTrials.gov, OpenFDA, WHO GHO, and MedlinePlus. Live health news is fetched in real-time from CDC, NIH, and WHO at query time.',
              },
              {
                icon: '🔒', title: 'Privacy & HIPAA Commitment',
                body: 'MediQuery is built on a zero-retention data privacy model. We do not store personal health information (PHI), do not log permanent patient history, and do not sell user query data. Audit logs are anonymized and retained only for system integrity.',
              },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: '20px', alignItems: 'flex-start',
                padding: '24px', background: '#f8fafc',
                borderRadius: '14px', border: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: '28px', flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 500, color: '#0f172a', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7, margin: 0 }}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '36px', fontFamily: 'DM Serif Display, serif',
            color: '#0f172a', fontWeight: 400, marginBottom: '12px',
            textAlign: 'center',
          }}>Frequently asked questions</h2>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '15px', marginBottom: '40px' }}>
            Everything you need to know before trusting a medical AI.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{
                background: '#ffffff', border: '1px solid #e2e8f0',
                borderRadius: '12px', overflow: 'hidden',
              }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', padding: '18px 20px',
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', background: 'none',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  <span style={{ fontSize: '15px', fontWeight: 500, color: '#0f172a' }}>{faq.q}</span>
                  <span style={{ fontSize: '18px', color: '#94a3b8', flexShrink: 0, marginLeft: '16px' }}>
                    {openFaq === i ? '−' : '+'}
                  </span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 20px 18px' }}>
                    <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        padding: '80px 48px', textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: '36px', fontFamily: 'DM Serif Display, serif',
          color: '#ffffff', fontWeight: 400, marginBottom: '16px',
        }}>Ready to get started?</h2>
        <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '32px' }}>
          Hospital grade medical intelligence, available to everyone.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleGoogleLogin} disabled={loading} style={{
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            border: 'none', borderRadius: '10px', padding: '14px 32px',
            fontSize: '16px', color: '#fff', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            boxShadow: '0 4px 14px rgba(14,165,233,0.3)',
          }}>
            {loading ? 'Signing in...' : 'Get Started Free →'}
          </button>
          <a href="mailto:gurusaichittoji7@gmail.com" style={{
            background: 'none', border: '1px solid #334155',
            borderRadius: '10px', padding: '14px 32px',
            fontSize: '16px', color: '#94a3b8', textDecoration: 'none',
            fontFamily: 'DM Sans, sans-serif',
          }}>
            Request Enterprise Demo
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0f172a', padding: '32px 48px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 8px' }}>
          ⚕ MediQuery - Clinical AI Research Assistant
        </p>
        <p style={{ fontSize: '11px', color: '#475569', margin: 0 }}>
          For informational purposes only. Not a substitute for professional medical advice.
          MediQuery does not store personal health information. HIPAA-conscious design. Zero data retention.
        </p>
      </footer>

    </div>
  )
}