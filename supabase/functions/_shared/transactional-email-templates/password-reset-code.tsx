import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Golfield'

interface PasswordResetCodeProps {
  code?: string
  name?: string
}

const PasswordResetCodeEmail = ({ code, name }: PasswordResetCodeProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu código de verificação {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Recuperação de senha</Heading>
        <Text style={text}>
          {name ? `Olá, ${name}.` : 'Olá.'} Recebemos uma solicitação para
          redefinir a senha da sua conta {SITE_NAME}.
        </Text>
        <Text style={text}>Use o código abaixo para continuar:</Text>

        <Section style={codeBox}>
          <Text style={codeStyle}>{code ?? '------'}</Text>
        </Section>

        <Text style={text}>
          Este código expira em <strong>5 minutos</strong>. Se você não
          solicitou a redefinição, ignore este e-mail — sua senha permanecerá
          inalterada.
        </Text>

        <Text style={footer}>
          Atenciosamente,<br />
          Equipe {SITE_NAME}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PasswordResetCodeEmail,
  subject: 'Seu código de verificação Golfield',
  displayName: 'Código de redefinição de senha',
  previewData: { code: '482917', name: 'Cliente' },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Arial, Helvetica, sans-serif',
}
const container = {
  padding: '32px 28px',
  maxWidth: '520px',
  margin: '0 auto',
}
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#111111',
  margin: '0 0 24px',
}
const text = {
  fontSize: '15px',
  color: '#444444',
  lineHeight: '1.6',
  margin: '0 0 16px',
}
const codeBox = {
  backgroundColor: '#f4f4f5',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center' as const,
  margin: '24px 0',
  border: '2px solid #dc2626',
}
const codeStyle = {
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#dc2626',
  letterSpacing: '10px',
  margin: 0,
  fontFamily: 'monospace',
}
const footer = {
  fontSize: '13px',
  color: '#888888',
  margin: '32px 0 0',
}
