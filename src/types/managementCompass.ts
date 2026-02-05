// Card Game data - 5 big stones, sort all cards into describes/doesn't describe
export interface CardGameSelection {
  describes: string[];      // קלפים שמאפיינים אותי
  doesNotDescribe: string[]; // קלפים שלא מאפיינים אותי
}

export interface CardGameData {
  focusPrioritization: CardGameSelection;
  timeRoutines: CardGameSelection;
  coachingDelegation: CardGameSelection;
  influenceLeadership: CardGameSelection;
  teamLearning: CardGameSelection;
}

export const initialCardGameSelection: CardGameSelection = {
  describes: [],
  doesNotDescribe: [],
};

export const initialCardGameData: CardGameData = {
  focusPrioritization: { ...initialCardGameSelection },
  timeRoutines: { ...initialCardGameSelection },
  coachingDelegation: { ...initialCardGameSelection },
  influenceLeadership: { ...initialCardGameSelection },
  teamLearning: { ...initialCardGameSelection },
};

// Interface journey data - 9 steps
export interface InterfaceJourneyData {
  // Step 0: General perception (anchor)
  generalInfluence: number;
  
  // Step 1: Choose specific case
  interfaceRole: string;
  
  // Step 2: Perception of influence in situation
  situationInfluence: number;
  
  // Step 3: Main reason for friction
  frictionReason: string;
  
  // Step 4: Initiative
  initiativeScore: number;
  
  // Step 5: Nature of action
  actionNature: string;
  
  // Step 6: Change in practice
  changeScore: number;
  
  // Step 7: Moment of influence
  influenceMoment: string;
  influenceMomentText: string;
  
  // Step 8: Future leverage
  futureLeverage: string;
  
  // Step 9: Managerial price
  priceScore: number;
  priceTypes: string[];
}

// Legacy interface entry (keeping for backwards compatibility)
export interface InterfaceEntry {
  id: string;
  name: string;
  status: 'green' | 'yellow' | 'red';
  criticality: number;
}

// Module prioritization ratings
export interface ModulePriority {
  value: number;
  feasibility: number;
  readiness: number;
}

// Team Health - Lencioni 5 Dysfunctions (indirect behavioral questions)
export interface TeamHealthData {
  // 5 layers - each with 'a', 'b', 'c', 'd', or 'e'
  trust: string;
  conflict: string;
  commitment: string;
  accountability: string;
  results: string;
  // Gold question - open text
  goldAction: string;
}

// Coaching data - 7 layers
export interface CoachingData {
  // Layer 1: Self-perception - managerial identity (1-5)
  identityScore: number;
  
  // Layer 2: Actual behavior - time investment
  timeInvestment: string;
  
  // Layer 3: Coaching quality - dominant style
  coachingStyle: string;
  
  // Layer 4: Effectiveness - behavioral outcome (1-5)
  effectivenessScore: number;
  
  // Layer 5: Duplication test - recurring issues (1-5)
  recurrenceScore: number;
  
  // Layer 6: Internal control - blocker
  internalBlocker: string;
  
  // Layer 7: Personal price - impact score and type
  personalPriceScore: number;
  personalPriceType: string;
  
  // Gold question - one small thing
  oneSmallThing: string;
}

// User info collected at intro
export interface UserInfo {
  name: string;
  gender: 'male' | 'female' | '';
}

export const initialUserInfo: UserInfo = {
  name: '',
  gender: '',
};

// All questionnaire data
export interface QuestionnaireData {
  // User info
  userInfo: UserInfo;
  
  // Screen 0: Card Game
  cardGameData: CardGameData;
  
  // Screen 1: Focus & Control
  anchorScore: number;
  timeDrain: string;
  timeDrainOther: string;
  
  // Screen 2: Time & Energy (4 Quadrants)
  quadrants: {
    urgentImportant: number;
    importantNotUrgent: number;
    urgentNotImportant: number;
    notUrgentNotImportant: number;
  };
  breathingSpace: number;
  
  // Screen 3: Decisions & Price
  immediatePrice: string;
  longTermPrice: string;
  retrospective: string;
  
  // Screen 4: Interfaces Journey
  interfaceJourney: InterfaceJourneyData;
  interfaces: InterfaceEntry[]; // Legacy
  
  // Screen 5: Coaching & Development (7 Layers)
  coaching: CoachingData;
  
  // Screen 6: Team Health (Lencioni)
  teamHealthData: TeamHealthData;
  teamHealth: string; // Legacy
  
  // Screen 7: Engagement & Energy
  energyLevel: number;
  meaningScore: number;
  pressurePattern: string;
  
  // Screen 8: Module Prioritization
  modulePriorities: {
    teamDevelopment: ModulePriority;
    interfaceManagement: ModulePriority;
    coachingDevelopment: ModulePriority;
    managerialFocus: ModulePriority;
  };
}

export const initialCoachingData: CoachingData = {
  identityScore: 3,
  timeInvestment: '',
  coachingStyle: '',
  effectivenessScore: 3,
  recurrenceScore: 3,
  internalBlocker: '',
  personalPriceScore: 3,
  personalPriceType: '',
  oneSmallThing: '',
};

export const initialInterfaceJourneyData: InterfaceJourneyData = {
  generalInfluence: 3,
  interfaceRole: '',
  situationInfluence: 3,
  frictionReason: '',
  initiativeScore: 3,
  actionNature: '',
  changeScore: 3,
  influenceMoment: '',
  influenceMomentText: '',
  futureLeverage: '',
  priceScore: 3,
  priceTypes: [],
};

export const initialTeamHealthData: TeamHealthData = {
  trust: '',
  conflict: '',
  commitment: '',
  accountability: '',
  results: '',
  goldAction: '',
};

export const initialQuestionnaireData: QuestionnaireData = {
  // User info
  userInfo: initialUserInfo,
  
  // Screen 0
  cardGameData: initialCardGameData,
  
  // Screen 1
  anchorScore: 3,
  timeDrain: '',
  timeDrainOther: '',
  
  // Screen 2
  quadrants: {
    urgentImportant: 25,
    importantNotUrgent: 25,
    urgentNotImportant: 25,
    notUrgentNotImportant: 25,
  },
  breathingSpace: 3,
  
  // Screen 3
  immediatePrice: '',
  longTermPrice: '',
  retrospective: '',
  
  // Screen 4
  interfaceJourney: initialInterfaceJourneyData,
  interfaces: [],
  
  // Screen 5
  coaching: initialCoachingData,
  
  // Screen 6
  teamHealthData: initialTeamHealthData,
  teamHealth: '',
  
  // Screen 7
  energyLevel: 3,
  meaningScore: 3,
  pressurePattern: '',
  
  // Screen 8
  modulePriorities: {
    teamDevelopment: { value: 3, feasibility: 3, readiness: 3 },
    interfaceManagement: { value: 3, feasibility: 3, readiness: 3 },
    coachingDevelopment: { value: 3, feasibility: 3, readiness: 3 },
    managerialFocus: { value: 3, feasibility: 3, readiness: 3 },
  },
};

// Calculate priority score for a module
export const calculateModuleScore = (priority: ModulePriority): number => {
  return (priority.value * 0.4) + (priority.feasibility * 0.35) + (priority.readiness * 0.25);
};

// Get the top priority module
export const getTopModule = (data: QuestionnaireData): string => {
  const scores = {
    teamDevelopment: calculateModuleScore(data.modulePriorities.teamDevelopment),
    interfaceManagement: calculateModuleScore(data.modulePriorities.interfaceManagement),
    coachingDevelopment: calculateModuleScore(data.modulePriorities.coachingDevelopment),
    managerialFocus: calculateModuleScore(data.modulePriorities.managerialFocus),
  };
  
  const moduleNames: Record<string, string> = {
    teamDevelopment: 'פיתוח צוות',
    interfaceManagement: 'ניהול ממשקים',
    coachingDevelopment: 'חניכה ופיתוח עובדים',
    managerialFocus: 'מיקוד ניהולי / זמן',
  };
  
  const topModule = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  return moduleNames[topModule];
};

// Generate coaching insight based on data
export const getCoachingInsight = (coaching: CoachingData): string => {
  const highIdentity = coaching.identityScore >= 4;
  const lowTime = ['less30', 'unknown'].includes(coaching.timeInvestment);
  const lowEffectiveness = coaching.effectivenessScore <= 2;
  const highRecurrence = coaching.recurrenceScore >= 4;
  
  if (highIdentity && lowTime) {
    return 'אתה רואה חניכה כחלק חשוב מהתפקיד, אך בפועל היא כמעט לא מקבלת זמן ביומן.';
  }
  
  if (!lowTime && lowEffectiveness) {
    return 'אתה משקיע מאמץ בחניכה, אך זה עדיין לא מתורגם לעצמאות גבוהה יותר של העובדים.';
  }
  
  if (highRecurrence) {
    return 'נראה שאתה מוצא את עצמך מטפל שוב ושוב באותם נושאים - ייתכן שצריך לשנות את אופן החניכה.';
  }
  
  return 'יש לך בסיס טוב בחניכה - המשך לחפש דרכים להעמיק את ההשפעה.';
};
