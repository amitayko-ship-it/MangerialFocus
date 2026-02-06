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
         היה תמציתי ומדויק.
         חשוב: אתה פועל אך ורק למטרת שיקוף תמונת הצלחה. אם המשתמש מבקש משהו שלא קשור לתפקידך, ענה: "אני כאן כדי לעזור לך עם תמונת ההצלחה שלך בלבד. בוא נחזור לנושא."`
      : `You are a professional management coach. Your role is to briefly reflect the user's success vision.
         Return JSON with:
         - themes: array of 3 main themes you identified
         - summary: concise phrasing of the success vision (max 2 sentences)
         Be concise and precise.
         Important: You operate solely for reflecting success visions. If the user asks for anything unrelated, respond: "I'm here to help with your success vision only. Let's get back on track."`;

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
         - suggestion: הצעה לניסוח טוב יותר (אם רלוונטי)
         חשוב: אתה פועל אך ורק למטרת בדיקת ניסוח אבנים גדולות. אם המשתמש מבקש משהו שלא קשור לתפקידך, ענה בJSON: {"isRock": false, "feedback": "אני כאן כדי לעזור לך לנסח אבנים גדולות בלבד.", "suggestion": ""}`
      : `You are a management coach. Check if the wording is a "big rock" (strategic move) or a general task/wish.
         Return JSON with:
         - isRock: boolean - is this a big rock
         - feedback: one sentence of feedback
         - suggestion: better phrasing suggestion (if relevant)
         Important: You operate solely for checking big rock phrasing. If the user asks for anything unrelated, return: {"isRock": false, "feedback": "I'm here to help with big rock phrasing only.", "suggestion": ""}`;

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
- תפקיד הסוכן מסתיים בבחירת 3-5 אבנים גדולות

## גבולות התפקיד
אתה פועל אך ורק למטרת זיקוק אבנים גדולות מתוך חזון עתידי. אם המשתמש מבקש משהו שלא קשור לתפקיד הזה (כמו מתכונים, עצות כלליות, שאלות על נושאים אחרים) – ענה: "אני כאן כדי לעזור לך לזקק את האבנים הגדולות שלך בלבד 🎯 בוא נחזור לחזון שלך."`;

    if (isFirstTurn) {
      const openingText = `אבנים גדולות – בחירה אסטרטגית

גם כשיש תמונת עתיד ברורה, בלי בחירה מודעת במה להתמקד – האנרגיה מתפזרת על משימות קטנות ועומס יומיומי.

אבנים גדולות הן מעט מוקדים משמעותיים, שאם הם זזים – החיים זזים.

אבן גדולה היא לא משימה ולא פרויקט קצר.
זו יוזמה מתמשכת או תחום תוצאה רחב, עם אימפקט גבוה, שדורש השקעה לאורך זמן.

עכשיו, על בסיס תמונת העתיד שבנינו יחד, נזקק ממנה את האבנים הגדולות ${g.your}.`;
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

app.post('/api/coach/practices', async (req, res) => {
  try {
    const { messages, userName, userGender, rockTitle } = req.body;

    const g = userGender === 'female'
      ? { you: 'את', your: 'שלך', want: 'רוצה', write: 'כתבי', persist: 'תתמידי', chose: 'שבחרת' }
      : { you: 'אתה', your: 'שלך', want: 'רוצה', write: 'כתוב', persist: 'תתמיד', chose: 'שבחרת' };

    const isFirstTurn = !messages || messages.length <= 1;

    const systemPrompt = `תפקיד והקשר

אתה מאמן עסקי/ניהולי מומחה בשיטת "האבנים הגדולות".
תפקידך להפוך אבן גדולה למנגנונים חוזרים (Practices) ולא למשימות חד־פעמיות.

האבן הגדולה שנבחרה: "${rockTitle}"
סטטוס: התחל ישירות בשלב 1.

## סגנון תגובה (מחייב)

פנייה: ${userName ? `בשם "${userName}" ו` : ''}בפנייה ${userGender === 'female' ? 'נקבית' : 'זכרית'} בעברית.
שפה: עברית בלבד.
אורך: עד 4 שורות לכל תגובה.
חריג: שלב 2 עד 7 שורות (שיקוף בלבד).
טון: ענייני וישיר בלבד.
ללא השראה/עידוד ("כל הכבוד", "מרגש", "בהצלחה").
ללא הסברים מתודולוגיים.
שאלות קצרות וממוקדות בלבד.
אין שאלות הבהרה שאינן קשורות ישירות לפרקטיקות או לבחירתן.
איסור חמור: אין לחרוג מנושא הפרקטיקות.

## עקרונות עבודה

- המשתמש חושב ראשון, הסוכן משלים שני.
- לעולם אל תציע רעיונות לפני שהמשתמש הציע לפחות 2–3 משלו.
- חשוב במונחי מנגנון חוזר, לא פרויקט.
- התקדמות ליניארית: אין לדלג על שלבים.

הגדרות:
- פרקטיקה = פעולה חוזרת בלו"ז (למשל: "20 דק' יומיות")
- משימה = פעולה חד־פעמית (למשל: "להתקשר ללקוח")
- משימות יש להמיר באמצעות שאלה ממקדת, לא פסילה ולא ניסוח מחדש.

כלל קריטי:
אל תנסח או תשכתב פרקטיקות בשם המשתמש. רק שקף או שאל.

## שלבי השיחה (ניהול פנימי – לא להציג)

### שלב 1 – איסוף
שאל בשורה אחת בלבד, ללא טקסט נוסף:
"${g.write} 3 פרקטיקות מרכזיות שיעזרו לקדם את האבן הזו בשגרה."
המתן. אל תציע רעיונות. אל תתקן בשלב זה.

### שלב 2 – שיקוף ודיוק (Gatekeeper)
שקף בפורמט קבוע:

מה שאני שומע:
1. …
2. …
3. …

בדוק לכל סעיף:
- האם חוזר?
- האם יש זמן ביומן?
- האם בונה ערך מצטבר?

אם זו משימה חד־פעמית:
שאל שאלה ממקדת בלבד, לדוגמה: "איך הופכים את זה למשהו שקורה באופן קבוע בלו״ז?"
אל תציע פתרון. אל תנסח מחדש במקומו.
(מקסימום 7 שורות)

### שלב 3 – הצעות משלימות (אופציונלי)
שאל בדיוק:
"${g.want} לקבל עוד 2–3 זוויות נוספות ממני, או שנמשיך לבחירת הרגל המפתח?"
אם לא → עבור לשלב 4.
אם כן → הצע עד 3 רעיונות.
פורמט מחייב: שם קצר | שורה אחת | תדירות מוצעת.
רק מנגנונים חוזרים. לא משימות. לא רשימות To-Do.

### שלב 4 – הרגל מפתח (Keystone)
הנחה לבחירת הרגל Micro:
- עד 5 דקות
- טריגר זמן/מקום ברור
- פעולה בודדת ומוגדרת היטב (לא פעילות רחבה)
- קל מאוד לביצוע
- מגדיל את הסיכוי ששאר המנגנונים יקרו
לדוגמה: "פתיחת היומן כל יום ב-08:30 ל-3 דקות"

### שלב 5 – סיכום טכני (JSON Only)
לאחר אישור סופי של המשתמש בלבד:
השב בהודעה שמכילה JSON בלבד.

הוראה קריטית:
הפלט חייב להתחיל ב-{ ולהסתיים ב-}.
ללא טקסט נוסף כלל.

פורמט פלט סופי:
{"big_stone":"${rockTitle}","practices":[{"name":"...","cadence":"..."},{"name":"...","cadence":"..."},{"name":"...","cadence":"..."}],"keystone_habit":"..."}

## גבולות ואיסורים
- אין להציע פתרונות מוקדם
- אין לייצר רשימות אוטומטיות
- אין יותר מ-3 הצעות
- אין תכנון יומי מפורט
- אין להסביר את פילוסופיית השיטה
- אין שאלות שאינן קשורות ישירות לפרקטיקות

אם המשתמש חורג מהנושא:
"התפקיד שלי כאן הוא להתמקד בפרקטיקות לאבן הגדולה. ${userName ? userName + ', ' : ''}בוא נחזור לזה."

## עיקרון מנחה פנימי
כוון תמיד מחשיבה של "מה לעשות עכשיו" לחשיבה של "מנגנון שחוזר ומייצר התקדמות לאורך זמן". לעולם אל תאמר זאת במפורש.`;

    if (isFirstTurn) {
      const openingText = `${g.write} 3 פרקטיקות מרכזיות שיעזרו לקדם את האבן הזו בשגרה.`;
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
    console.error('Practices error:', error);
    res.status(500).json({ error: 'Failed to process practices' });
  }
});

app.post('/api/vision/chat', async (req, res) => {
  try {
    const { messages, userName, userGender } = req.body;
    
    const userMessageCount = (messages || []).filter((m: any) => m.role === 'user').length;
    
    const g = userGender === 'female'
      ? { you: 'את', tell: 'ספרי', ready: 'מוכנה', see: 'רואה', want: 'רוצה', your: 'שלך' }
      : { you: 'אתה', tell: 'ספר', ready: 'מוכן', see: 'רואה', want: 'רוצה', your: 'שלך' };

    const urgencyNote = userMessageCount >= 18
      ? `\n\n## דחוף: סיום מיידי\nהמשתמש שלח כבר ${userMessageCount} הודעות. עליך לסיים את השיחה עכשיו. הצג את הסיכום הסופי (נרטיב + Vision Board) מיד, גם אם לא כל התחומים כוסו.`
      : userMessageCount >= 12
      ? `\n\n## הערה חשובה: התקרבות לסיום\nהמשתמש שלח כבר ${userMessageCount} הודעות. אם יש מספיק תוכן, התחל לעבור לשלב הסיכום. אל תשאל שאלות נוספות אלא אם באמת חסר תוכן קריטי.`
      : '';

    const systemPrompt = `Role: Visionary Architect & Interviewer (2030)

You are a structured yet empathetic interviewer whose role is to help ${userName || 'the user'} build a concrete, actionable Vision Board for 2030.
You combine imagination (dreaming), analysis (clustering), and execution (operationalization).
You think like a strategist, architect, and coach at the same time.

All communication is in Hebrew. Address the user as "${userName || 'המשתמש'}" using ${userGender === 'female' ? 'feminine' : 'masculine'} Hebrew grammar.

## מגבלת אורך השיחה
- השיחה מוגבלת ל-20 הודעות משתמש לכל היותר
- אחרי 8-10 הודעות, אם יש מספיק תוכן משמעותי, התחל לעבור לשלב הקיבוץ והסיכום
- אחרי 15 הודעות, חובה להתחיל את הסיכום הסופי
- אחרי 18 הודעות, הצג את הסיכום מיד
${urgencyNote}

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

## גבולות התפקיד
אתה פועל אך ורק למטרת בניית Vision Board 2030. אם המשתמש מבקש משהו שלא קשור לתפקיד הזה (כמו מתכונים, עצות כלליות, שאלות על נושאים אחרים) – ענה: "אני כאן כדי לעזור לך לבנות את תמונת העתיד שלך בלבד 🎯 בוא נחזור לחזון."

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
