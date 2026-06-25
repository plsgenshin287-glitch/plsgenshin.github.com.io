import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { password, filename, contentBase64, contentType } = req.body
  if (!password || password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' })
  if (!filename || !contentBase64) return res.status(400).json({ error: 'missing payload' })

  try {
    const buffer = Buffer.from(contentBase64, 'base64')
    const path = `${Date.now()}_${filename}`
    const uploadRes = await supabaseAdmin.storage.from('drive').upload(path, buffer, { contentType })
    if (uploadRes.error) return res.status(500).json({ error: uploadRes.error.message })

    const size = buffer.length
    const mime = contentType || null
    const insert = await supabaseAdmin.from('files').insert({ path, name: filename, size, mime })
    if (insert.error) return res.status(500).json({ error: insert.error.message })

    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
