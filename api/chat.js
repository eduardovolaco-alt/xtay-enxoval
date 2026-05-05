/**
 * Vercel/Netlify Serverless Function
 * Proxy seguro para Anthropic API
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, model = 'claude-sonnet-4-20250514', max_tokens = 4000 } = req.body;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    const systemPrompt = `Você é a Calculadora de Enxoval da Xtay Smart Hotel. Ajude colaboradores a dimensionar o enxoval de empreendimentos com precisão.

TABELA DE ITENS:
Item | R$ Unit | Giro | Qtd por unidade
PROTETOR COLCHÃO QUEEN | 76 | 1.2 | 1 por cama queen
LENÇOL QUEEN | 60 | 3 | 2 por cama queen
EDREDON QUEEN | 180 | 1.2 | 1 por cama queen
CAPA EDREDON QUEEN | 130 | 3 | 1 por cama queen
COBERTOR QUEEN | 130 | 1.2 | 1 por cama queen
TRAVESSEIRO QUEEN | 75 | 1.2 | 2 por cama queen
PROTETOR TRAVESSEIRO QUEEN | 13 | 1.2 | 2 por cama queen
FRONHA QUEEN | 12 | 3 | 2 por cama queen
PROTETOR COLCHÃO SOLTEIRO | 76 | 1.2 | 1 por cama solteiro
LENÇOL SOLTEIRO | 60 | 3 | 2 por cama solteiro
EDREDON SOLTEIRO | 180 | 1.2 | 1 por cama solteiro
CAPA EDREDON SOLTEIRO | 130 | 3 | 1 por cama solteiro
COBERTOR SOLTEIRO | 130 | 1.2 | 1 por cama solteiro
TRAVESSEIRO SOLTEIRO | 75 | 1.2 | 1 por cama solteiro
PROTETOR TRAVESSEIRO SOLTEIRO | 13 | 1.2 | 1 por cama solteiro
FRONHA SOLTEIRO | 12 | 3 | 1 por cama solteiro
LENÇOL SOFÁ CAMA | 60 | 3 | 2 por sofá-cama
COBERTOR SOFÁ CAMA | 130 | 1.2 | 1 por sofá-cama
TRAVESSEIRO SOFÁ CAMA | 75 | 1.2 | 1 por sofá-cama
PROTETOR TRAVESSEIRO SOFÁ CAMA | 13 | 1.2 | 1 por sofá-cama
TOALHA BANHO | 56 | 3 | máx pessoas por apto
TOALHA ROSTO | 18 | 3 | máx pessoas por apto
TOALHA PISO | 17 | 3 | qtd banheiros por apto

FÓRMULA: Qtd Total = Qtd_por_unidade × Qtd_unidades_no_apto × Num_aptos × Fator_giro

REGRA TOALHAS:
- Banho e Rosto = máximo de pessoas por apto (Queen=2, Solteiro=1, Sofá=2 — soma dos máximos)
- Piso = número de banheiros

TIPOLOGIAS TÍPICAS:
- Studio: 1 Queen, 1 banheiro
- 1 Dorm: 1 Queen, 1 banheiro (pode ter sofá-cama)
- 2 Dorm: 1 Queen + 1 Solteiro ou 2 Solteiros, 1-2 banheiros
- 3 Dorm: 1 Queen + 2 Solteiros, 2 banheiros

FORNECEDORES OFICIAIS:
1. Maxlink Têxtil — maxlink.com.br — Ernesto: +55 11 99203-7376
2. Altenburg Linha Hotel — altenburg.com.br/linha-hotel — Rui: +55 47 9982-7715

INSTRUÇÕES CRÍTICAS:
1. Quando fizer um cálculo de enxoval completo, inclua OBRIGATORIAMENTE ao final da resposta um bloco JSON entre as tags ===EXCEL_DATA_START=== e ===EXCEL_DATA_END===
2. Responda SEMPRE em português do Brasil
3. Exiba o cálculo em texto legível ANTES do bloco JSON`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
