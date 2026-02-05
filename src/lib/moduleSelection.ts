import { CardGameData, TeamHealthData } from '@/types/managementCompass';

export type ModuleDepth = 'full' | 'light';

export interface ModuleSelection {
  coaching: ModuleDepth;
  interfaces: ModuleDepth;
  focus: ModuleDepth;
  team: ModuleDepth;
}

export interface ModuleResult {
  key: keyof ModuleSelection;
  name: string;
  depth: ModuleDepth;
  reason: string;
}

// Card IDs that trigger Full Module for Coaching/Delegation
const COACHING_FULL_TRIGGERS = ['do_alone', 'delegate_close'];
const COACHING_LIGHT_TRIGGERS = ['people_grow'];

// Card IDs that trigger Full Module for Interfaces
const INTERFACES_FULL_TRIGGERS = ['need_presence', 'close_circle'];
const INTERFACES_LIGHT_TRIGGERS = ['things_move'];

// Card IDs that trigger Full Module for Focus/Time
const FOCUS_FULL_TRIGGERS = ['day_fills_itself', 'holding_a_lot', 'no_routine', 'meetings_unclear'];
const FOCUS_LIGHT_TRIGGERS = ['clear_direction', 'routines_advance'];

/**
 * Determines module depth based on card game selections
 * Uses the "describes" selections to identify patterns that describe the manager
 */
export function calculateModuleSelection(
  cardGameData: CardGameData,
  teamHealthData?: TeamHealthData
): ModuleSelection {
  // Get the "describes" selections from relevant categories
  const coachingDescribes = cardGameData.coachingDelegation.describes || [];
  const interfacesDescribes = cardGameData.influenceLeadership.describes || [];
  const focusDescribes = cardGameData.focusPrioritization.describes || [];
  const timeDescribes = cardGameData.timeRoutines.describes || [];
  
  // Helper to check if any selection matches triggers
  const hasMatch = (selections: string[], triggers: string[]) => 
    selections.some(s => triggers.includes(s));
  
  // Coaching/Delegation Module - if selected "full triggers" as describing them, needs work
  let coaching: ModuleDepth = 'light';
  if (hasMatch(coachingDescribes, COACHING_FULL_TRIGGERS)) {
    coaching = 'full';
  } else if (hasMatch(coachingDescribes, COACHING_LIGHT_TRIGGERS)) {
    coaching = 'light';
  }
  
  // Interfaces Module
  let interfaces: ModuleDepth = 'light';
  if (hasMatch(interfacesDescribes, INTERFACES_FULL_TRIGGERS)) {
    interfaces = 'full';
  } else if (hasMatch(interfacesDescribes, INTERFACES_LIGHT_TRIGGERS)) {
    interfaces = 'light';
  }
  
  // Focus/Time Module (checks both focus and time categories)
  let focus: ModuleDepth = 'light';
  if (hasMatch(focusDescribes, FOCUS_FULL_TRIGGERS) || hasMatch(timeDescribes, FOCUS_FULL_TRIGGERS)) {
    focus = 'full';
  } else if (hasMatch(focusDescribes, FOCUS_LIGHT_TRIGGERS) || hasMatch(timeDescribes, FOCUS_LIGHT_TRIGGERS)) {
    focus = 'light';
  }
  
  // Team Module - based on team health assessment
  let team: ModuleDepth = 'light';
  if (teamHealthData) {
    const hasDominantDysfunction = checkDominantDysfunction(teamHealthData);
    if (hasDominantDysfunction) {
      team = 'full';
    }
  }
  
  // Apply constraints: max 2 full, min 1 full
  return applyConstraints({ coaching, interfaces, focus, team }, cardGameData);
}

/**
 * Check if there's a dominant dysfunction in team health
 * Returns true if any dysfunction shows clear problematic pattern
 */
function checkDominantDysfunction(teamHealthData: TeamHealthData): boolean {
  // 'a' or 'b' answers typically indicate dysfunction
  const dysfunctionIndicators = ['a', 'b'];
  
  const layers = [
    teamHealthData.trust,
    teamHealthData.conflict,
    teamHealthData.commitment,
    teamHealthData.accountability,
    teamHealthData.results
  ];
  
  // Count how many layers show dysfunction
  const dysfunctionCount = layers.filter(layer => 
    dysfunctionIndicators.includes(layer)
  ).length;
  
  // If 2+ layers show dysfunction, it's a dominant pattern
  return dysfunctionCount >= 2;
}

/**
 * Apply constraints to ensure max 2 and min 1 full modules
 */
function applyConstraints(
  selection: ModuleSelection,
  cardGameData: CardGameData
): ModuleSelection {
  const modules = Object.entries(selection) as [keyof ModuleSelection, ModuleDepth][];
  const fullModules = modules.filter(([_, depth]) => depth === 'full');
  const lightModules = modules.filter(([_, depth]) => depth === 'light');
  
  // If more than 2 full, keep only the most critical 2
  if (fullModules.length > 2) {
    const ranked = rankModulesByImportance(fullModules.map(([key]) => key), cardGameData);
    const result = { ...selection };
    ranked.slice(2).forEach(key => {
      result[key] = 'light';
    });
    return result;
  }
  
  // If no full modules, promote the most important one
  if (fullModules.length === 0) {
    const ranked = rankModulesByImportance(lightModules.map(([key]) => key), cardGameData);
    return {
      ...selection,
      [ranked[0]]: 'full'
    };
  }
  
  return selection;
}

/**
 * Rank modules by importance based on card selections
 */
function rankModulesByImportance(
  moduleKeys: (keyof ModuleSelection)[],
  cardGameData: CardGameData
): (keyof ModuleSelection)[] {
  // Priority order based on typical impact
  const priorityOrder: (keyof ModuleSelection)[] = ['focus', 'coaching', 'interfaces', 'team'];
  
  return moduleKeys.sort((a, b) => 
    priorityOrder.indexOf(a) - priorityOrder.indexOf(b)
  );
}

/**
 * Get module results with names and reasons
 */
export function getModuleResults(
  cardGameData: CardGameData,
  teamHealthData?: TeamHealthData
): ModuleResult[] {
  const selection = calculateModuleSelection(cardGameData, teamHealthData);
  
  const moduleInfo: Record<keyof ModuleSelection, { name: string; fullReason: string; lightReason: string }> = {
    coaching: {
      name: 'חניכה והאצלה',
      fullReason: 'זוהה דפוס של קושי בשחרור שליטה או מעורבות יתר',
      lightReason: 'נראה שיש יכולת טובה להעצים ולשחרר'
    },
    interfaces: {
      name: 'ממשקים והשפעה רוחבית',
      fullReason: 'זוהה דפוס של תלות בנוכחות שלך או השפעה מוגבלת',
      lightReason: 'נראה שיש השפעה רחבה גם ללא נוכחות ישירה'
    },
    focus: {
      name: 'מיקוד ותיעדוף',
      fullReason: 'זוהה דפוס של חוסר מיקוד או עומס שוחק',
      lightReason: 'נראה שיש כיוון ברור וסדרי עדיפויות מוגדרים'
    },
    team: {
      name: 'פיתוח צוות (לנציוני)',
      fullReason: 'זוהתה דיספונקציה דומיננטית בדינמיקת הצוות',
      lightReason: 'הצוות מתפקד ברמה טובה'
    }
  };
  
  return (Object.entries(selection) as [keyof ModuleSelection, ModuleDepth][]).map(([key, depth]) => ({
    key,
    name: moduleInfo[key].name,
    depth,
    reason: depth === 'full' ? moduleInfo[key].fullReason : moduleInfo[key].lightReason
  }));
}

/**
 * Get full modules only
 */
export function getFullModules(
  cardGameData: CardGameData,
  teamHealthData?: TeamHealthData
): ModuleResult[] {
  return getModuleResults(cardGameData, teamHealthData).filter(m => m.depth === 'full');
}

/**
 * Get light modules only
 */
export function getLightModules(
  cardGameData: CardGameData,
  teamHealthData?: TeamHealthData
): ModuleResult[] {
  return getModuleResults(cardGameData, teamHealthData).filter(m => m.depth === 'light');
}
