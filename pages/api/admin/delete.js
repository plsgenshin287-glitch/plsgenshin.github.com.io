import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { password, id } = req.body
  if (!password || password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' })
  if (!id) return res.status(400).json({ error: 'missing id' })

  // find metadata
  const { data: md, error: mdErr } = await supabaseAdmin.from('files').select('path').eq('id', id).single()
  if (mdErr) return res.status(404).json({ error: 'file not found' })

  const { error: delErr } = await supabaseAdmin.storage.from('drive').remove([md.path])
  if (delErr) return res.status(500).json({ error: delErr.message })

  const { error: delMetaErr } = await supabaseAdmin.from('files').delete().eq('id', id)
  if (delMetaErr) return res.status(500).json({ error: delMetaErr.message })

  res.json({ ok: true })
}
