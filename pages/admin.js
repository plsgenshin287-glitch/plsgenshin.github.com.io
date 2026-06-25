import { useState, useEffect, useRef } from 'react'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [files, setFiles] = useState([])
  const [status, setStatus] = useState('')
  const fileRef = useRef(null)

  useEffect(() => { loadFiles() }, [])

  async function loadFiles() {
    const res = await fetch('/api/files')
    const data = await res.json()
    setFiles(data)
  }

  async function uploadFile(file) {
    setStatus('Uploading '+file.name)
    const buf = await new Promise((res) => {
      const reader = new FileReader()
      reader.onload = () => res(reader.result)
      reader.readAsDataURL(file)
    })
    // data:[<mediatype>][;base64],<data>
    const base64 = buf.split(',')[1]

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, filename: file.name, contentBase64: base64, contentType: file.type })
    })
    const data = await res.json()
    if (res.ok) {
      setStatus('Uploaded '+file.name)
      loadFiles()
    } else {
      setStatus('Error: '+(data?.error||res.statusText))
    }
  }

  async function onDrop(e) {
    e.preventDefault()
    const f = e.dataTransfer.files
    if (!f || f.length === 0) return
    for (const file of f) await uploadFile(file)
  }

  async function onDelete(id) {
    if (!confirm('Delete this file?')) return
    const res = await fetch('/api/admin/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password, id }) })
    if (res.ok) {
      setStatus('Deleted')
      loadFiles()
    } else {
      const data = await res.json()
      setStatus('Error: '+(data?.error||res.statusText))
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Admin Upload / Manage</h1>
      <p>Only admins with the ADMIN_PASSWORD can upload or delete files.</p>

      <div style={{ marginBottom: 12 }}>
        <input type="password" placeholder="Admin password" value={password} onChange={(e)=>setPassword(e.target.value)} style={{ padding: 8, width: 300 }} />
      </div>

      <div onDrop={onDrop} onDragOver={(e)=>e.preventDefault()} style={{ border: '2px dashed #e5e7eb', padding: 24, borderRadius: 8 }}>
        <div>Drag & drop files here to upload (or use the file picker)</div>
        <div style={{ marginTop: 12 }}>
          <input ref={fileRef} type="file" onChange={(e)=>{ const f=e.target.files; if(f && f[0]) uploadFile(f[0])}} />
        </div>
      </div>

      <div style={{ marginTop: 12, color: '#374151' }}>{status}</div>

      <h2 style={{ marginTop: 24 }}>Files</h2>
      {files.length===0 ? <div>No files</div> : (
        <div>
          {files.map(f => (
            <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, borderBottom: '1px solid #f3f4f6' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{f.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{f.mime} • {Math.round((f.size||0)/1024)} KB</div>
              </div>
              <div>
                <button onClick={()=>onDelete(f.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: 6 }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <a href="/">Back to public view</a>
      </div>
    </div>
  )
}
