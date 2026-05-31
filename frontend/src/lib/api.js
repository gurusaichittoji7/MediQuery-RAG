const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

export async function queryMediQuery(question) {
  const res = await fetch(`${API_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Server error ${res.status}`)
  }
  return res.json()
}

export async function fetchStats() {
  const res = await fetch(`${API_URL}/stats`)
  if (!res.ok) return null
  return res.json()
}
export async function submitFeedback(question, feedback) {
  const res = await fetch(`${API_URL}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, feedback }),
  })
  if (!res.ok) throw new Error('Feedback failed')
  return res.json()
}
export async function uploadFile(file, question = '') {
  const formData = new FormData()
  formData.append('file', file)
  if (question) formData.append('question', question)

  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Upload failed ${res.status}`)
  }
  return res.json()
}