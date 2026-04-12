const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get('/', (req, res) => {
  res.json({ status: 'NovAgent API en ligne ✅' });
});

app.post('/test-avis', async (req, res) => {
  const { reviewerName, reviewText, stars } = req.body;
  const sentiment = stars >= 4 ? 'positif' : stars === 3 ? 'neutre' : 'negatif';
  const prompt = `Tu es le community manager d un restaurant. Redige une reponse professionnelle a cet avis Google ${sentiment} (${stars}/5 etoiles). Avis de ${reviewerName} : "${reviewText}". Regles : 2-4 phrases, ton chaleureux, personnalise. Reponds uniquement avec le texte de la reponse.`;

  let reponse_ia = null;
  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });
    reponse_ia = message.content[0].text.trim();
  } catch (error) {
    reponse_ia = null;
  }

  const { error: dbError } = await supabase.from('Avis').insert([{
    clients_nom: reviewerName,
    texte_avis: reviewText,
    nombre_etoiles: stars,
    reponse_ia: reponse_ia
  }]);

  if (dbError) {
    return res.status(500).json({ error: dbError.message });
  }

  res.json({ response: reponse_ia, saved: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`NovAgent Server demarre sur le port ${PORT}`);
});
