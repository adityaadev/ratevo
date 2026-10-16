import { createClient } from '@supabase/supabase-js'

let supabase = null

function getSupabase() {
  if (supabase) return supabase
  
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  } else {
    console.warn('Supabase server credentials not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    supabase = new Proxy({}, {
      get() {
        return () => {
          throw new Error('Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.')
        }
      }
    })
  }
  
  return supabase
}

export { getSupabase as supabase }