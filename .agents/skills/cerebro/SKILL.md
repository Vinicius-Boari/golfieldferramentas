---
name: cerebro
description: Use para revisar e elevar a qualidade técnica de código existente — performance (CLS/LCP/INP, re-renders, bundle), acessibilidade (WCAG AA, contraste, foco, ARIA), tipagem estrita e responsividade. Triggers — "otimizar", "melhorar", "refatorar", "mais rápido", "acessível", "fluido", "lento", "performance", "cérebro".
---

# Cérebro — Otimização Verificável

Agente de revisão técnica. Antes de mudar qualquer linha, **diagnostica** o gargalo. Depois **corrige** com base em checklist. No fim, **verifica** o ganho.

## 1. Diagnóstico antes de mudar (obrigatório)

Não refatore "por estética". Antes de qualquer edit, identifique e cite:
- Qual métrica/comportamento está ruim (ex.: "input trava ao digitar", "LCP 4.2s", "tela quebra em 320px", "leitor de tela não anuncia o erro").
- Como observou (Profiler, Lighthouse, console, screenshot, log).
- Hipótese de causa em 1 linha.

Se não conseguir nomear o gargalo, **pare e pergunte ao usuário** o que está ruim. "Otimizar tudo" não é tarefa válida.

## 2. Checklist de correção

### Performance
- `memo`/`useMemo`/`useCallback` **só** quando o Profiler mostra re-render custoso. Memoização cega aumenta complexidade sem ganho.
- Lazy-load rotas e componentes pesados (`React.lazy` + `Suspense`).
- Imagens: `loading="lazy"`, `decoding="async"`, `width`/`height` explícitos (evita CLS).
- Evite layout thrash: não leia `offsetWidth` em loop; agrupe leituras/escritas DOM.
- Listas longas: virtualize a partir de ~100 itens.
- Bundle: remova dependências não usadas; prefira utilitários nativos a libs inteiras.

### Acessibilidade (WCAG AA)
- Alvos de toque ≥ 44×44px.
- Contraste de texto ≥ 4.5:1 (3:1 para texto grande).
- Foco visível em todo elemento interativo — **nunca** `outline: none` sem substituto.
- HTML semântico primeiro (`<button>`, `<nav>`, `<label htmlFor>`); ARIA só quando o semântico não cobre.
- Imagens decorativas: `alt=""`. Informativas: `alt` descritivo.
- Formulários: cada input com `<label>` associado e mensagem de erro vinculada por `aria-describedby`.

### Arquitetura / Tipagem
- Extraia um custom hook quando a lógica de um componente passa de ~30 linhas ou se repete.
- Componentes com mais de ~7 props → quebrar ou agrupar em objeto.
- Tipos explícitos nas fronteiras (props públicas, retornos de hooks, respostas de API). Evite `any`; prefira `unknown` + narrowing.
- Evite estado derivado: calcule no render quando o cálculo for barato.

## 3. Quando o projeto usa Canvas/3D (opcional)

Aplicar **apenas** se houver `<canvas>`, three.js, WebGL/WebGPU ou animações por `requestAnimationFrame`:
- Mantenha o trabalho do frame < 8ms (alvo 120fps) ou < 16ms (60fps).
- Reutilize geometrias/materiais; descarte (`.dispose()`) ao desmontar.
- Use `instancedMesh` para >100 cópias do mesmo objeto.
- Pause RAF quando a aba/elemento não está visível (`IntersectionObserver`, `document.hidden`).
- Shaders: faça contas pesadas no vertex, não no fragment, quando possível.

Em projetos sem canvas/3D, ignore esta seção.

## 4. Checklist de saída (obrigatório)

Antes de encerrar, responda em 2–3 linhas:
- **O que mudou:** 1 frase concreta (ex.: "memoizei `ProductList` e adicionei `key` estável").
- **Ganho esperado:** métrica ou comportamento (ex.: "≈1 re-render por digitação em vez de N").
- **Como verificar:** passo objetivo (ex.: "React DevTools → Profiler → digitar no campo de busca").

Sem essas 3 linhas, a tarefa não está concluída — é só impressão de otimização.
