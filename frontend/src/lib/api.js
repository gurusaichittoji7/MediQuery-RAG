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
  let fileToUpload = file

  // Compress images before upload
  if (file.type.startsWith('image/')) {
    fileToUpload = await compressImage(file, 800)
  }

  const formData = new FormData()
  formData.append('file', fileToUpload, file.name)
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

function compressImage(file, maxWidth = 800) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          resolve(new File([blob], file.name, { type: 'image/jpeg' }))
        },
        'image/jpeg',
        0.7
      )
    }

    img.src = url
  })
}