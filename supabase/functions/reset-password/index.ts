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

  let resetId = ''
  let email = ''
  let newPassword = ''
  try {
    const body = await req.json()
    resetId = String(body.resetId || '').trim()
    email = String(body.email || '').trim().toLowerCase()
    newPassword = String(body.newPassword || '')
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400)
  }

  if (!resetId || !email || !newPassword || newPassword.length < 8) {
    return jsonResponse({ error: 'Dados inválidos' }, 400)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Verifica que o resetId pertence ao e-mail e foi recém-validado (used=true,
  // dentro de janela de 10 min). Após uso, marcamos `attempts = -1` para
  // impedir reutilização.
  const { data: row, error: lookupError } = await supabase
    .from('password_reset_codes')
    .select('id, email, used, attempts, created_at')
    .eq('id', resetId)
    .maybeSingle()

  if (lookupError || !row) {
    return jsonResponse({ error: 'Token inválido' }, 400)
  }

  if (row.email.toLowerCase() !== email) {
    return jsonResponse({ error: 'Token inválido' }, 400)
  }

  if (!row.used) {
    return jsonResponse({ error: 'Código não verificado' }, 400)
  }

  if (row.attempts === -1) {
    return jsonResponse({ error: 'Token já utilizado' }, 400)
  }

  // Janela de 10 minutos após criação
  if (Date.now() - new Date(row.created_at).getTime() > 10 * 60 * 1000) {
    return jsonResponse({ error: 'Token expirado' }, 400)
  }

  // Localiza usuário pelo e-mail
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) {
    console.error('list users error', listErr)
    return jsonResponse({ error: 'Erro interno' }, 500)
  }
  const user = list.users.find((u) => (u.email || '').toLowerCase() === email)
  if (!user) {
    return jsonResponse({ error: 'Usuário não encontrado' }, 404)
  }

  const { error: updErr } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
  })
  if (updErr) {
    console.error('update user error', updErr)
    return jsonResponse({ error: updErr.message || 'Erro ao atualizar senha' }, 500)
  }

  // Invalida o token (não pode ser reutilizado)
  await supabase
    .from('password_reset_codes')
    .update({ attempts: -1 })
    .eq('id', resetId)

  return jsonResponse({ success: true })
})
