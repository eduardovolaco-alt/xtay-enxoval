# Xtay Calculadora de Enxoval — Setup Seguro

## 🔴 Problema Identificado

Seu site estava tentando chamar a API do Anthropic diretamente do navegador, sem autenticação segura. Isso causava erro de conexão.

## ✅ Solução Implementada

Criei um **backend serverless seguro** que:
- ✔️ Autentica com a API Anthropic usando variável de ambiente
- ✔️ Evita exposição de chaves sensíveis no frontend
- ✔️ Resolve problemas de CORS automaticamente
- ✔️ Suporta Vercel, Netlify, Firebase, AWS Lambda

## 🚀 Como Implantar

### 1️⃣ **Crie uma Chave API Anthropic**
```
https://console.anthropic.com/
```
Crie uma nova chave e copie.

### 2️⃣ **Implante no Vercel (Recomendado)**

```bash
# Instale Vercel CLI
npm install -g vercel

# Implante
vercel --prod
```

Quando solicitado:
- **Conecte seu GitHub?** → Sim
- **Deploy?** → Sim

### 3️⃣ **Configure Variáveis de Ambiente**

No **painel Vercel** > seu projeto > **Settings** > **Environment Variables**:

| Nome | Valor |
|------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` (sua chave) |
| `ALLOWED_ORIGIN` | `https://eduardovolaco-alt.github.io` |

### 4️⃣ **Ative GitHub Pages**

No seu repositório:
- **Settings** > **Pages**
- Source: `Deploy from a branch`
- Branch: `main`

## 📁 Arquivos Modificados

```
api/
├── chat.js              ← Novo: Backend seguro
vercel.json             ← Novo: Configuração Vercel
.env.example            ← Novo: Template de variáveis
index.html              ← Atualizado: Usa /api/chat
```

## 🧪 Testar Localmente

```bash
# Instale dependências
npm install

# Crie .env.local
cp .env.example .env.local
# Edite e adicione sua chave API

# Execute localmente
vercel dev

# Abra: http://localhost:3000
```

## 📊 Fluxo de Dados

```
Frontend (GitHub Pages)
    ↓ (HTTPS)
Backend Proxy (Vercel)
    ↓ (Autenticado com chave)
Anthropic API
    ↓ (Resposta)
Backend Proxy
    ↓ (JSON seguro)
Frontend (exibe resultado + Excel)
```

## ⚙️ Configurações Avançadas

### Aumentar Timeout (padrão 30s)
```json
// vercel.json
"functions": {
  "api/chat.js": {
    "memory": 1024,
    "maxDuration": 60  // até 300s em Pro
  }
}
```

### Usar em Netlify
```toml
# netlify.toml
[functions]
directory = "api"

[[env.production.redirects]]
from = "/api/*"
to = "/.netlify/functions/:splat"
status = 200

[build.environment]
NODE_VERSION = "18"
```

## 🔒 Segurança

- ✅ Chave API **nunca** exposta no frontend
- ✅ CORS restrito ao domínio autorizado
- ✅ Rate limiting (implementar conforme necessário)
- ✅ Validação de entrada no backend

## 📞 Suporte

Problemas? Confira:
1. Chave API ativa em `console.anthropic.com`
2. Variáveis de ambiente configuradas no Vercel
3. Domínio correto em `ALLOWED_ORIGIN`
4. Logs do Vercel: `vercel logs`
