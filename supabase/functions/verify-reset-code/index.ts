import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !supabaseServiceKey) {
    return jsonResponse({ error: 'Server configuration error' }, 500)
  }

  let email = ''
  let code = ''
  try {
    const body = await req.json()
    email = String(body.email || '').trim().toLowerCase()
    code = String(body.code || '').trim()
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400)
  }

  if (!email || !/^\d{6}$/.test(code)) {
    return jsonResponse({ valid: false, error: 'Dados inválidos' }, 400)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data: rows, error } = await supabase
    .from('password_reset_codes')
    .select('id, code, expires_at, used, attempts')
    .eq('email', email)
    .eq('used', false)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('lookup error', error)
    return jsonResponse({ valid: false, error: 'Erro interno' }, 500)
  }

  const row = rows?.[0]
  if (!row) {
    return jsonResponse({ valid: false, error: 'Código inválido ou expirado' }, 400)
  }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    await supabase.from('password_reset_codes').update({ used: true }).eq('id', row.id)
    return jsonResponse({ valid: false, error: 'Código expirado' }, 400)
  }

  if (row.attempts >= 5) {
    await supabase.from('password_reset_codes').update({ used: true }).eq('id', row.id)
    return jsonResponse({ valid: false, error: 'Muitas tentativas. Solicite um novo código.' }, 400)
  }

  if (row.code !== code) {
    await supabase
      .from('password_reset_codes')
      .update({ attempts: row.attempts + 1 })
      .eq('id', row.id)
    return jsonResponse({ valid: false, error: 'Código incorreto' }, 400)
  }

  // Mark used and return a short-lived signed token (id) the client must echo on password update
  await supabase.from('password_reset_codes').update({ used: true }).eq('id', row.id)

  return jsonResponse({ valid: true, resetId: row.id })
})
