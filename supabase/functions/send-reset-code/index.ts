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

function generateCode(): string {
  // 6-digit numeric code
  const n = Math.floor(Math.random() * 1_000_000)
  return n.toString().padStart(6, '0')
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

  let cnpj = ''
  let email = ''
  try {
    const body = await req.json()
    cnpj = String(body.cnpj || '').trim()
    email = String(body.email || '').trim().toLowerCase()
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400)
  }

  if (!cnpj || !email) {
    return jsonResponse({ error: 'CNPJ e e-mail são obrigatórios' }, 400)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Confirm CNPJ + e-mail correspondem a um perfil cadastrado.
  const cnpjDigits = cnpj.replace(/\D/g, '')
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('email, cnpj, nome_responsavel')
    .ilike('email', email)

  if (profileError) {
    console.error('profile lookup error', profileError)
    return jsonResponse({ error: 'Erro interno' }, 500)
  }

  const matched = (profiles ?? []).find(
    (p) => (p.cnpj ?? '').replace(/\D/g, '') === cnpjDigits,
  )

  // Por segurança, sempre respondemos sucesso (não revela se conta existe),
  // mas só enviamos o e-mail se houver match.
  if (!matched) {
    console.log('no profile match — silent success')
    return jsonResponse({ success: true })
  }

  const code = generateCode()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  // Invalida códigos antigos não usados deste e-mail
  await supabase
    .from('password_reset_codes')
    .update({ used: true })
    .eq('email', email)
    .eq('used', false)

  const { error: insertError } = await supabase
    .from('password_reset_codes')
    .insert({
      email,
      cnpj: cnpjDigits,
      code,
      expires_at: expiresAt,
    })

  if (insertError) {
    console.error('insert reset code error', insertError)
    return jsonResponse({ error: 'Erro ao gerar código' }, 500)
  }

  // Dispara o e-mail via send-transactional-email
  const { error: sendError } = await supabase.functions.invoke(
    'send-transactional-email',
    {
      body: {
        templateName: 'password-reset-code',
        recipientEmail: email,
        idempotencyKey: `reset-${email}-${Date.now()}`,
        templateData: {
          code,
          name: matched.nome_responsavel || undefined,
        },
      },
    },
  )

  if (sendError) {
    console.error('send-transactional-email error', sendError)
    return jsonResponse({ error: 'Erro ao enviar e-mail' }, 500)
  }

  return jsonResponse({ success: true })
})
