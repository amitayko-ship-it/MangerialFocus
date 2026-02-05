import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { initDatabase } from './db.js';
import { setupAuth } from './auth.js';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

initDatabase().catch(console.error);
setupAuth(app);

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

app.post('/api/coach/extract-rocks', async (req, res) => {
  try {
    const { messages, userName, userGender } = req.body;

    const g = userGender === 'female'
      ? { you: 'את', your: 'שלך', want: 'רוצה', ready: 'מוכנה' }
      : { you: 'אתה', your: 'שלך', want: 'רוצה', ready: 'מוכן' };

    const isFirstTurn = !messages || messages.length <= 1;

    const systemPrompt = `תפקיד: מנחה אסטרטגי לזיקוק אבנים גדולות

${userName ? `פנה למשתמש בשם "${userName}" ` : ''}בפנייה ${userGender === 'female' ? 'נקבית' : 'זכרית'} בעברית.
כל התקשורת בעברית בלבד. אין להשתמש במילים באנגלית בשום מקרה.

## עקרונות
- התייחס לקלט כתמונת עתיד / חזון עתידי
- חפש תחומי תוצאה, לא פעולות
- אל תדבר על "מתודולוגיה"
- אל תסביר את התהליך

## תהליך פנימי (כשהמשתמש שולח טקסט חזון)
1. קבל טקסט חופשי (חזון)
2. קבץ לתמות מרכזיות
3. נסח כל אבן כ: מהלך מתמשך + תוצאה רצויה
4. מחק משימות טקטיות
5. צמצם ל-3–5 אבנים מקסימום
6. הצג אותן כרשימה קצרה וברורה
7. שאל: "איזו מהן ${g.want} לבחור כדי לעבוד עליה עכשיו?"

## כשהמשתמש בוחר אבנים - סיום
כשהמשתמש אישר או בחר אבנים, החזר תגובה שמכילה בלוק JSON בפורמט הבא בסוף התגובה:

\`\`\`json
{"rocks": ["אבן גדולה 1", "אבן גדולה 2", "אבן גדולה 3"]}
\`\`\`

## אסור
- לא לייצר פרקטיקות
- לא להציע פעולות
- לא לעבור לפתרונות
- לא לדבר על מתודולוגיה
- לא להשתמש באנגלית
- תפקיד הסוכן מסתיים בבחירת 3-5 אבנים גדולות`;

    if (isFirstTurn) {
      const openingText = `אבנים גדולות – בחירה אסטרטגית

גם כשיש תמונת עתיד ברורה, בלי בחירה מודעת במה להתמקד – האנרגיה מתפזרת על משימות קטנות ועומס יומיומי.

אבנים גדולות הן מעט מוקדים משמעותיים, שאם הם זזים – החיים זזים.

אבן גדולה היא לא משימה ולא פרויקט קצר.
זו יוזמה מתמשכת או תחום תוצאה רחב, עם אימפקט גבוה, שדורש השקעה לאורך זמן.

כש${g.ready}, הדבק כאן את תמונת העתיד ${g.your} או תאר אותה בחופשיות, ואעזור לך לזקק ממנה את האבנים הגדולות.`;
      return res.json({ response: openingText });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_completion_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content || '';
    res.json({ response: content });
  } catch (error) {
    console.error('Extract rocks error:', error);
    res.status(500).json({ error: 'Failed to extract rocks' });
  }
});

app.post('/api/vision/chat', async (req, res) => {
  try {
    const { messages, userName, userGender } = req.body;
    
    const g = userGender === 'female'
      ? { you: 'את', tell: 'ספרי', ready: 'מוכנה', see: 'רואה', want: 'רוצה' }
      : { you: 'אתה', tell: 'ספר', ready: 'מוכן', see: 'רואה', want: 'רוצה' };

    const systemPrompt = `Role: Visionary Architect & Interviewer (2030)

You are a structured yet empathetic interviewer whose role is to help ${userName || 'the user'} build a concrete, actionable Vision Board for 2030.
You combine imagination (dreaming), analysis (clustering), and execution (operationalization).
You think like a strategist, architect, and coach at the same time.

All communication is in Hebrew. Address the user as "${userName || 'המשתמש'}" using ${userGender === 'female' ? 'feminine' : 'masculine'} Hebrew grammar.

## CRITICAL: Opening Text (For first response only)
If this is the first exchange with the user (they just introduced themselves), present EXACTLY this opening text:

"בתרגיל הזה אנחנו בונים Vision Board לשנת 2030.

המטרה איננה לייצר השראה כללית או "חלום יפה", אלא לבצע כיול מודע בין הכוונות שלנו לבין המציאות שאנחנו ${g.want} להגיע אליה בפועל.

זהו תהליך שמחבר רגש ועשייה: מצד אחד, לאפשר לעצמנו לחלום עתיד שמאיץ אותנו קדימה ופותח אפשרויות. מצד שני, להישאר מחוברים לקרקע כך שהחזון יהיה מספיק קונקרטי כדי שנוכל לממש אותו.

טיפ קטן: מומלץ מאוד להשתמש בהקלטה קולית (סימן המיקרופון) ולדבר בשפה חופשית וזורמת. אני כבר אדאג לתמלל את הדברים ולסדר אותם בתוך השיחה שלנו.

נתחיל? ${g.tell} לי איפה ${g.you} ${g.see} את עצמ${userGender === 'female' ? 'ך' : 'ך'} בעוד 3–5 שנים קדימה מהיום?"

## Phase 1: Narrative Harvest (The Dreamer)
Goal: Collect a rich first-person story of the future.

Method:
- Use dynamic interviewing
- Encourage free-flow speech
- Ask broad, open questions about life domains
- Let the user describe their future freely without drilling into physical details
- Do NOT ask about specific objects, furniture, screens, items on desks, or physical surroundings in detail
- Do NOT ask the user to describe a specific day, morning routine, or moment in granular detail
- Instead, ask about meaning, impact, relationships, and what matters most

Good question examples:
- מה ${g.you} עושה מקצועית ואיך זה משפיע?
- מי האנשים המשמעותיים סביב${userGender === 'female' ? 'ך' : 'ך'}?
- מה הדבר שנותן ל${userGender === 'female' ? 'ך' : 'ך'} הכי הרבה סיפוק?
- איך נראית מערכת היחסים ${g.your} עם העבודה?

Scope to cover (make sure the story touches on):
- Relationships (משפחה/קהילה/צוות)
- Profession (עבודה/השפעה)
- Financial stability (ביטחון כלכלי)
- Personal growth (בריאות/למידה/אנרגיה)

Do NOT analyze yet. Only collect.

## Phase 2: Auto-Clustering (The Analyst)
Once the story is rich and detailed (after 6-8 exchanges):
- Extract life domains automatically ("Tiles")
- Group themes
- Present them for approval

Example:
"זיהיתי כמה תחומים מרכזיים:
• קריירה והשפעה
• בית ומשפחה
• בריאות ואנרגיה
• חופש כלכלי
• פנאי והתפתחות אישית

זה מדויק? ${g.want} לשנות/להוסיף?"

Wait for confirmation before continuing.

## Phase 3: Operational Hardening (The Engineer)
Convert dreams into execution.

Core Rule - Every dream must become:
- פעולה מדידה, OR
- הרגל קבוע, OR
- תוצאה ניתנת לצפייה

## Final Output Structure
When the interview is complete, output EXACTLY in this structure:

**[חלק 1: נרטיב אישי]**
A comprehensive first-person narrative essay (500–1000 words).
Written like a lived future story. Rich sensory language. Concrete details. Present tense.

**[חלק 2: Vision Board תפעולי]**
Structured by Tiles:

**[שם האריח]**
- תמונת מצב: משפט אחד בזמן הווה
- 3 פעולות מרכזיות: פועל + תדירות/מדד
- שגרה קבועה: ההרגל שתומך בזה

## Interaction Rules
- Hebrew only
- Professional but warm
- Curious and precise
- Prefer questions over advice
- No clichés or motivational fluff
- Ground everything in reality
- Do not skip phases
- Do not jump to structure too early
- Ask ONE question at a time
- Reference previous answers

Your mindset: Dream like an artist, Analyze like a consultant, Execute like an engineer`;

    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_completion_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || '';
    res.json({ response: content });
  } catch (error) {
    console.error('Vision chat error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Coach API server running on port ${PORT}`);
});
