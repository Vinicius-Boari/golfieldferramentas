/// <reference types="npm:@types/react@18.3.1" />

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

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu código de verificação Golfield</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={brand}>GOLFIELD</Heading>
        </Section>
        <Section style={card}>
          <Heading style={h1}>Código de verificação</Heading>
          <Text style={text}>
            Use o código abaixo para confirmar sua identidade:
          </Text>
          <Section style={codeWrap}>
            <Text style={codeStyle}>{token}</Text>
          </Section>
          <Text style={footer}>
            Este código expira em alguns minutos. Se você não solicitou,
            ignore este email com segurança.
          </Text>
        </Section>
        <Text style={brandFooter}>
          © {new Date().getFullYear()} Golfield · Vendas exclusivas para revendedores
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, Arial, sans-serif",
  margin: '0',
  padding: '0',
}
const container = { maxWidth: '560px', margin: '0 auto', padding: '32px 20px' }
const header = { textAlign: 'center' as const, marginBottom: '24px' }
const brand = {
  fontSize: '28px',
  fontWeight: '800' as const,
  color: '#e22020',
  letterSpacing: '0.08em',
  margin: '0',
}
const card = {
  backgroundColor: '#fafafa',
  border: '1px solid #ececec',
  borderRadius: '14px',
  padding: '36px 32px',
}
const h1 = {
  fontSize: '24px',
  fontWeight: '700' as const,
  color: '#111111',
  margin: '0 0 16px',
  letterSpacing: '-0.02em',
}
const text = {
  fontSize: '15px',
  color: '#444444',
  lineHeight: '1.6',
  margin: '0 0 16px',
}
const codeWrap = {
  textAlign: 'center' as const,
  backgroundColor: '#ffffff',
  border: '2px solid #e22020',
  borderRadius: '12px',
  padding: '20px',
  margin: '8px 0 24px',
}
const codeStyle = {
  fontFamily: "'Courier New', monospace",
  fontSize: '32px',
  fontWeight: '700' as const,
  color: '#e22020',
  letterSpacing: '0.3em',
  margin: '0',
}
const footer = {
  fontSize: '12px',
  color: '#888888',
  margin: '24px 0 0',
  paddingTop: '16px',
  borderTop: '1px solid #ececec',
}
const brandFooter = {
  fontSize: '11px',
  color: '#999999',
  textAlign: 'center' as const,
  margin: '20px 0 0',
}
