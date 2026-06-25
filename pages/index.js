import { useEffect, useState } from 'react'

export default function Home() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/files')
      .then((r) => r.json())
      .then((data) => {
        setFiles(data)
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Public Drive (view-only)</h1>
      <p>Files are view-only. No direct downloads are exposed in the UI.</p>
      <p>
        Admin: <a href="/admin">Upload / Manage</a>
      </p>

      {loading ? (
        <div>Loading...</div>
      ) : files.length === 0 ? (
        <div>No files yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {files.map((f) => (
            <FileCard key={f.id} file={f} />
          ))}
        </div>
      )}
    </div>
  )
}

function FileCard({ file }) {
  const [previewUrl, setPreviewUrl] = useState(null)

  async function loadPreview() {
    const res = await fetch(`/api/file?id=${file.id}`)
    if (!res.ok) return
    const { url } = await res.json()
    setPreviewUrl(url)
  }

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }} onMouseEnter={() => { if(!previewUrl) loadPreview() }}>
      <div style={{ fontWeight: 600 }}>{file.name}</div>
      <div style={{ fontSize: 12, color: '#6b7280' }}>{file.mime} • {Math.round((file.size||0)/1024)} KB</div>
      <div style={{ marginTop: 8 }}>
        {previewUrl ? (
          file.mime?.startsWith('image/') ? (
            // image preview
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt={file.name} style={{ maxWidth: '100%', borderRadius: 6 }} />
          ) : file.mime === 'application/pdf' ? (
            <iframe src={previewUrl} style={{ width: '100%', height: 320, border: 0 }} />
          ) : (
            <div style={{ padding: 12, background: '#f9fafb', borderRadius: 6 }}>No preview available</div>
          )
        ) : (
          <div style={{ padding: 12, background: '#f9fafb', borderRadius: 6 }}>Hover to load preview</div>
        )}
      </div>
    </div>
  )
}
