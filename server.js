const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.get('/', (req, res) => {
  res.json({ status: 'NovAgent API en ligne ✅' });
});

app.post('/generate-response', async (req, res) => {
  const { reviewerName, reviewText, stars } = req.body;
  if (!reviewerName || !reviewText || !stars) {
    return res.status(400).json({ error: 'Champs manquants' });
  }
  const sentiment = stars >= 4 ? 'positif' : stars === 3 ? 'neutre' : 'négatif';
  const prompt = `Tu es le community manager d'un restaurant. Rédige une réponse professionnelle et chaleureuse à cet avis Google ${sentiment} (${stars}/5 étoiles).
Avis de ${reviewerName} : "${reviewText}"
Règles : 2-4 phrases maximum, ton chaleureux, personnalisé, pas de formule générique.
Réponds uniquement avec le texte de la réponse.`;

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });
    res.json({ response: message.content[0].text.trim() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/test-avis', async (req, res) => {
  const { reviewerName, reviewText, stars } = req.body;
  const sentiment = stars >= 4 ? 'positif' : stars === 3 ? 'neutre' : 'négatif';
  const prompt = `Tu es le community manager d'un restaurant. Rédige une réponse professionnelle et chaleureuse à cet avis Google ${sentiment} (${stars}/5 étoiles).
Avis de ${reviewerName} : "${reviewText}"
Règles : 2-4 phrases maximum, ton chaleureux, personnalisé, pas de formule générique.
Réponds uniquement avec le texte de la réponse.`;

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });
    res.json({ response: message.content[0].text.trim() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ NovAgent Server démarré sur le port ${PORT}`);
});
