import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// The browser Fetch API rejects header values with code points > 0xFF.
// Some supabase-js versions can introduce non-Latin-1 chars (e.g. emoji in
// deprecation strings that bleed into header context). Strip them here.
function sanitiseHeaders(init: RequestInit | undefined): RequestInit | undefined {
  if (!init?.headers) return init
  const raw = init.headers as Record<string, string>
  const clean: Record<string, string> = {}
  for (const [k, v] of Object.entries(raw)) {
    clean[k] = typeof v === 'string' ? v.replace(/[^\x00-\xFF]/g, '') : v
  }
  return { ...init, headers: clean }
}

const safeFetch: typeof fetch = (input, init) => fetch(input, sanitiseHeaders(init))

export const supabase = createClient(url, key, {
  global: { fetch: safeFetch },
})
