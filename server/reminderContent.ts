// Weekly reminder content. Rotates by week index.
// REPLACE the placeholder questions and YouTube links below with your final content.
// The list can be any length — it cycles back to the start when exhausted.

export const KEYSTONE_QUESTIONS: string[] = [
  'באיזה רגעים השבוע הצלחת לבצע את הרגל המפתח שלך, ומה עזר לך?',
  'מה הקושי המרכזי שעצר אותך השבוע מלקיים את ההרגל?',
  'אם היית מקטין את ההרגל לגרסה הקטנה ביותר האפשרית, איך הוא היה נראה?',
  'מה השתנה בהרגשה שלך בימים שבהם כן ביצעת את ההרגל?',
  'איזה טריגר עבד לך הכי טוב השבוע כדי להתחיל את ההרגל?',
  'מי או מה יכול לתמוך בך בשבוע הקרוב כדי להחזיק את ההרגל?',
  'דרג מ-1 עד 10: כמה ההרגל הזה קרוב להפוך לאוטומטי עבורך?',
  'מה הצעד הקטן שתתחייב אליו השבוע כדי לחזק את ההרגל?',
];

export const INSPIRATION_VIDEOS: { title: string; url: string }[] = [
  { title: 'כוחם של הרגלים קטנים', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'איך לבנות הרגל שנשאר', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'מיקוד וניהול עצמי', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
];

export function questionForWeek(weekIndex: number): string {
  if (KEYSTONE_QUESTIONS.length === 0) return '';
  const i = ((weekIndex % KEYSTONE_QUESTIONS.length) + KEYSTONE_QUESTIONS.length) % KEYSTONE_QUESTIONS.length;
  return KEYSTONE_QUESTIONS[i];
}

export function videoForWeek(weekIndex: number): { title: string; url: string } | null {
  if (INSPIRATION_VIDEOS.length === 0) return null;
  const i = ((weekIndex % INSPIRATION_VIDEOS.length) + INSPIRATION_VIDEOS.length) % INSPIRATION_VIDEOS.length;
  return INSPIRATION_VIDEOS[i];
}
