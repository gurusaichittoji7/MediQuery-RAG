import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

export default function AdminDashboard({ user, onBack }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/admin/stats`)
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'DM Sans, sans-serif' }}>
      <p style={{ color: '#64748b' }}>Loading dashboard...</p>
    </div>
  )

  if (!stats) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'DM Sans, sans-serif' }}>
      <p style={{ color: '#ef4444' }}>Failed to load stats. Is the backend running?</p>
    </div>
  )

  const totalFeedback = stats.feedback.up + stats.feedback.down
  const satisfactionRate = totalFeedback > 0
    ? Math.round((stats.feedback.up / totalFeedback) * 100)
    : null

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'DM Sans, sans-serif' }}>

      {/* Header */}
      <div style={{
        background: '#ffffff', borderBottom: '1px solid #e2e8f0',
        padding: '0 32px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onBack} style={{
            background: 'none', border: '0.5px solid #e2e8f0',
            borderRadius: '8px', padding: '6px 14px',
            fontSize: '13px', color: '#64748b', cursor: 'pointer',
          }}>← Back</button>
          <span style={{ fontSize: '18px', fontFamily: 'DM Serif Display, serif', color: '#0f172a' }}>
            Admin Dashboard
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user?.photoURL && <img src={user.photoURL} alt="avatar" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />}
          <span style={{ fontSize: '13px', color: '#64748b' }}>{user?.email}</span>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px' }}>

        {/* Metric cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Queries', value: stats.total_queries, icon: '📊', color: '#0ea5e9' },
            { label: 'Avg Confidence', value: `${Math.round(stats.avg_confidence * 100)}%`, icon: '🎯', color: '#10b981' },
            { label: 'Cached Queries', value: stats.cache.cached_queries, icon: '⚡', color: '#8b5cf6' },
            { label: 'Satisfaction Rate', value: satisfactionRate !== null ? `${satisfactionRate}%` : 'N/A', icon: '👍', color: '#f59e0b' },
            { label: 'Thumbs Up', value: stats.feedback.up, icon: '✅', color: '#10b981' },
            { label: 'Thumbs Down', value: stats.feedback.down, icon: '❌', color: '#ef4444' },
          ].map((m, i) => (
            <div key={i} style={{
              background: '#ffffff', border: '1px solid #e2e8f0',
              borderRadius: '14px', padding: '20px',
            }}>
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>{m.icon}</div>
              <div style={{ fontSize: '24px', fontWeight: 500, color: m.color, marginBottom: '4px' }}>{m.value}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Recent queries */}
        <div style={{
          background: '#ffffff', border: '1px solid #e2e8f0',
          borderRadius: '14px', overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: '#0f172a' }}>Recent Queries</span>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>
              Last {stats.recent_queries.length} queries
            </span>
          </div>
          {stats.recent_queries.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
              No queries yet — ask MediQuery something first.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Question', 'ICD-11', 'Confidence', 'Response Time', 'Time'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontSize: '11px', color: '#94a3b8',
                      fontWeight: 500, borderBottom: '1px solid #e2e8f0',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recent_queries.map((q, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#0f172a', maxWidth: '280px' }}>
                      {q.question.slice(0, 60)}{q.question.length > 60 ? '...' : ''}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {q.icd_code ? (
                        <span style={{
                          background: '#eff6ff', border: '1px solid #bfdbfe',
                          borderRadius: '6px', padding: '2px 8px',
                          fontSize: '11px', color: '#3b82f6',
                          fontFamily: 'JetBrains Mono, monospace',
                        }}>{q.icd_code.split('—')[0].trim()}</span>
                      ) : <span style={{ color: '#cbd5e1', fontSize: '12px' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {q.confidence !== null && q.confidence !== undefined ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '60px', height: '4px',
                            background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden',
                          }}>
                            <div style={{
                              width: `${q.confidence * 100}%`, height: '100%',
                              background: q.confidence > 0.7 ? '#10b981' : q.confidence > 0.4 ? '#f59e0b' : '#ef4444',
                              borderRadius: '4px',
                            }} />
                          </div>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>{Math.round(q.confidence * 100)}%</span>
                        </div>
                      ) : <span style={{ color: '#cbd5e1', fontSize: '12px' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
                      {q.response_ms ? `${q.response_ms}ms` : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '11px', color: '#94a3b8' }}>
                      {q.timestamp ? new Date(q.timestamp).toLocaleTimeString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}