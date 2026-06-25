import { supabaseAdmin } from '../../lib/supabaseAdmin'

export default async function handler(req, res) {
  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'missing id' })

  const { data: md, error: mdErr } = await supabaseAdmin.from('files').select('path').eq('id', id).single()
  if (mdErr) return res.status(404).json({ error: 'file not found' })

  try {
    const { data } = await supabaseAdmin.storage.from('drive').createSignedUrl(md.path, 60) // 60s
    return res.json({ url: data.signedUrl })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
