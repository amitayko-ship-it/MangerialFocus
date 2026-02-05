import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

app.post('/api/coach/reflect', async (req, res) => {
  try {
    const { visionText, language } = req.body;
    
    const systemPrompt = language === 'he' 
      ? `אתה מנחה ניהולי מקצועי. תפקידך לשקף בקצרה את תמונת ההצלחה שהמשתמש כתב.
         החזר JSON עם:
         - themes: מערך של 3 תמות מרכזיות שזיהית
         - summary: ניסוח מרוכז של תמונת ההצלחה (לא יותר מ-2 משפטים)
         היה תמציתי ומדויק.`
      : `You are a professional management coach. Your role is to briefly reflect the user's success vision.
         Return JSON with:
         - themes: array of 3 main themes you identified
         - summary: concise phrasing of the success vision (max 2 sentences)
         Be concise and precise.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: visionText }
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 500,
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    res.json(result);
  } catch (error) {
    console.error('Coach reflect error:', error);
    res.status(500).json({ error: 'Failed to get reflection' });
  }
});

app.post('/api/coach/clarify-rock', async (req, res) => {
  try {
    const { rockText, language } = req.body;
    
    const systemPrompt = language === 'he'
      ? `אתה מנחה ניהולי. בדוק אם הניסוח הוא "אבן גדולה" (מהלך אסטרטגי) או משימה/רצון כללי.
         החזר JSON עם:
         - isRock: boolean - האם זו אבן גדולה
         - feedback: משפט אחד של משוב
         - suggestion: הצעה לניסוח טוב יותר (אם רלוונטי)`
      : `You are a management coach. Check if the wording is a "big rock" (strategic move) or a general task/wish.
         Return JSON with:
         - isRock: boolean - is this a big rock
         - feedback: one sentence of feedback
         - suggestion: better phrasing suggestion (if relevant)`;

    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: rockText }
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 300,
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    res.json(result);
  } catch (error) {
    console.error('Coach clarify error:', error);
    res.status(500).json({ error: 'Failed to clarify rock' });
  }
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Coach API server running on port ${PORT}`);
});
