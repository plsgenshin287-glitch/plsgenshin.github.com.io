# Supabase Drive MVP

This project is a minimal "Google Drive–like" public viewer with admin-only upload/delete using Supabase Storage and a Next.js frontend.

Important notes:
- Do NOT commit your real keys. Use the environment variables described below.
- Create a Supabase project with a private Storage bucket named `drive` and a Postgres table `files` (SQL below).

Required environment variables (.env.local):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server-side service role key)
- ADMIN_PASSWORD (set this to your admin password — do NOT commit it)

Supabase SQL to create the metadata table (run in Supabase SQL editor):

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  name text NOT NULL,
  size bigint,
  mime text,
  uploaded_at timestamptz DEFAULT now(),
  description text
);

Setup and run locally:
1. Copy `.env.example` to `.env.local` and fill values.
2. Install dependencies: `npm install` or `pnpm install`.
3. Run locally: `npm run dev`.

How it works (high level):
- Admin UI (/admin) sends base64-encoded files to the server API (/api/admin/upload) together with the ADMIN_PASSWORD.
- Server validates the password, uploads the file to the Supabase Storage bucket `drive` using the SUPABASE_SERVICE_ROLE_KEY, and inserts metadata into the `files` table.
- Public listing (/api/files and the index page) shows available files and uses short-lived signed URLs (generated server-side) for preview-only embedding. The UI intentionally does not show raw download links.

Limitations and security notes:
- The ADMIN_PASSWORD is used to gate uploads/deletes. Keep it secret.
- Signed view URLs are short-lived but can be saved by determined users; this is a view-only UX pattern but not a DRM.
- File upload uses base64 in JSON for simplicity; for very large files you may want to switch to multipart uploads or direct presigned uploads.

If you want, I can add direct presigned uploads, chunked uploads, thumbnails, or streaming handling next.
