/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu link de acesso para {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={brand}>GOLFIELD</Heading>
        </Section>
        <Section style={card}>
          <Heading style={h1}>Seu link de acesso</Heading>
          <Text style={text}>
            Clique no botão abaixo para entrar no portal {siteName}. Este link
            expira em alguns minutos por segurança.
          </Text>
          <Section style={buttonWrap}>
            <Button style={button} href={confirmationUrl}>
              Acessar portal
            </Button>
          </Section>
          <Text style={textSmall}>
            Se o botão não funcionar, copie e cole este link no navegador:
          </Text>
          <Text style={linkUrl}>{confirmationUrl}</Text>
          <Text style={footer}>
            Se você não solicitou este link, ignore este email com segurança.
          </Text>
        </Section>
        <Text style={brandFooter}>
          © {new Date().getFullYear()} Golfield · Vendas exclusivas para revendedores
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

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
  margin: '0 0 24px',
}
const buttonWrap = { textAlign: 'center' as const, margin: '8px 0 24px' }
const button = {
  backgroundColor: '#e22020',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '12px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}
const textSmall = {
  fontSize: '13px',
  color: '#666666',
  lineHeight: '1.5',
  margin: '0 0 6px',
}
const linkUrl = {
  fontSize: '12px',
  color: '#e22020',
  wordBreak: 'break-all' as const,
  margin: '0 0 24px',
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
