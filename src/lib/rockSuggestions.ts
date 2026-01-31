import { BigRock } from '@/types/focus';
import { loadWithExpiry } from './storageUtils';

export function getQuestionnaireData(): Record<string, string> | null {
  return loadWithExpiry<Record<string, string>>('questionnaire-data');
}

export function getDefaultRocks(isRTL: boolean): BigRock[] {
  if (isRTL) {
    return [
      { id: 'rock-1', title: 'חיזוק צוות ההנהלה', order: 0, practices: ['', '', ''] },
      { id: 'rock-2', title: 'ייצוב תהליכי עבודה', order: 1, practices: ['', '', ''] },
      { id: 'rock-3', title: 'פיתוח אסטרטגיה', order: 2, practices: ['', '', ''] },
    ];
  }
  return [
    { id: 'rock-1', title: 'Strengthen leadership team', order: 0, practices: ['', '', ''] },
    { id: 'rock-2', title: 'Stabilize workflows', order: 1, practices: ['', '', ''] },
    { id: 'rock-3', title: 'Develop strategy', order: 2, practices: ['', '', ''] },
  ];
}

export function generateRockSuggestions(data: Record<string, string>, isRTL: boolean): BigRock[] {
  // Simple heuristic: if questionnaire data has specific keywords, suggest relevant rocks
  const values = Object.values(data).join(' ').toLowerCase();
  const rocks: BigRock[] = [];
  let order = 0;

  const addRock = (heTitle: string, enTitle: string) => {
    rocks.push({
      id: `rock-${Date.now()}-${order}`,
      title: isRTL ? heTitle : enTitle,
      order: order++,
      practices: ['', '', ''],
    });
  };

  if (values.includes('צוות') || values.includes('team')) {
    addRock('חיזוק הצוות', 'Strengthen team');
  }
  if (values.includes('אסטרטגי') || values.includes('strateg')) {
    addRock('בניית אסטרטגיה', 'Build strategy');
  }
  if (values.includes('תהליך') || values.includes('process')) {
    addRock('שיפור תהליכים', 'Improve processes');
  }
  if (values.includes('לקוח') || values.includes('customer') || values.includes('client')) {
    addRock('שיפור חוויית לקוח', 'Improve customer experience');
  }
  if (values.includes('מנהל') || values.includes('leader') || values.includes('manag')) {
    addRock('פיתוח מנהיגות', 'Develop leadership');
  }

  return rocks.length > 0 ? rocks : getDefaultRocks(isRTL);
}
