import { supabaseAdmin } from '../../lib/supabaseAdmin'

export default async function handler(req, res) {
  // Public listing of metadata
  const { data, error } = await supabaseAdmin.from('files').select('*').order('uploaded_at', { ascending: false }).limit(1000)
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}
