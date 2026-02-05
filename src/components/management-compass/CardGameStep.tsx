import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Check, X } from 'lucide-react';
import ProgressBar from './ProgressBar';
import { CardGameData } from '@/types/managementCompass';

interface CardGameStepProps {
  cardGameData: CardGameData;
  onCardGameDataChange: (data: CardGameData) => void;
  onNext: () => void;
  onBack: () => void;
}

interface CardOption {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

interface BigStone {
  id: keyof CardGameData;
  title: string;
  subtitle: string;
  cards: CardOption[];
}

const bigStones: BigStone[] = [
  {
    id: 'focusPrioritization',
    title: '🪨 אבן גדולה 1: מיקוד ותיעדוף ניהולי',
    subtitle: 'איך נראה יום עבודה טיפוסי שלי',
    cards: [
      {
        id: 'day_fills_itself',
        emoji: '🃏',
        title: 'היום שלי מתמלא מעצמו',
        description: 'היומן נסגר דרך בקשות, בעיות ופניות מהשטח.'
      },
      {
        id: 'important_slow',
        emoji: '🃏',
        title: 'יש לי דברים חשובים – אבל הם זזים לאט',
        description: 'ברור לי מה צריך לקדם, אבל בפועל זה מתקדם בקצב איטי.'
      },
      {
        id: 'holding_a_lot',
        emoji: '🃏',
        title: 'אני מחזיק הרבה על הראש',
        description: 'מצליח לגעת גם בשוטף וגם בדברים חשובים, אבל תמיד על הקצה.'
      },
      {
        id: 'choose_focus',
        emoji: '🃏',
        title: 'אני בוחר במה להתעסק',
        description: 'לא כל בקשה נכנסת ליומן, ויש לי סדרי עדיפויות ברורים.'
      },
      {
        id: 'clear_direction',
        emoji: '🃏',
        title: 'הזמן שלי משרת כיוון ברור',
        description: 'רוב השבוע מושקע בנושאים שמקדמים את היחידה קדימה.'
      }
    ]
  },
  {
    id: 'timeRoutines',
    title: '🪨 אבן גדולה 2: ניהול זמן ושגרות',
    subtitle: 'איך נראית ההתנהלות השוטפת שלי',
    cards: [
      {
        id: 'no_routine',
        emoji: '🃏',
        title: 'אין אצלי שגרה קבועה',
        description: 'כל שבוע נראה אחרת, ומה שקורה נקבע לפי המציאות.'
      },
      {
        id: 'meetings_unclear',
        emoji: '🃏',
        title: 'יש פגישות קבועות – לא תמיד ברור למה',
        description: 'יש שגרות, אבל לא תמיד ברור מה הערך שלהן.'
      },
      {
        id: 'trying_order',
        emoji: '🃏',
        title: 'אני מנסה לייצר סדר, אבל זה לא תמיד מחזיק',
        description: 'חלק מהשגרות עובדות, אחרות מתמסמסות.'
      },
      {
        id: 'routines_help',
        emoji: '🃏',
        title: 'השגרות עוזרות לי לנהל',
        description: 'יש פגישות ותהליכים שעוזרים לי לשלוט בתמונה.'
      },
      {
        id: 'routines_advance',
        emoji: '🃏',
        title: 'השגרות שלי מקדמות אנשים ותוצאות',
        description: 'הזמן חוזר על עצמו בצורה שמייצרת התקדמות.'
      }
    ]
  },
  {
    id: 'coachingDelegation',
    title: '🪨 אבן גדולה 3: חניכה ושחרור שליטה',
    subtitle: 'איך אני עובד עם אנשים ביום־יום',
    cards: [
      {
        id: 'do_alone',
        emoji: '🃏',
        title: 'קל לי יותר לעשות לבד',
        description: 'כשצריך שזה יקרה מהר או טוב, אני מעדיף לקחת את זה אליי.'
      },
      {
        id: 'delegate_close',
        emoji: '🃏',
        title: 'אני מעביר משימות, אבל נשאר קרוב',
        description: 'האחריות אצלם, אבל אני בודק מקרוב.'
      },
      {
        id: 'selective_release',
        emoji: '🃏',
        title: 'יש אנשים שאני משחרר להם, ויש כאלה שלא',
        description: 'מידת העצמאות תלויה באדם, לא בתפקיד.'
      },
      {
        id: 'define_goal',
        emoji: '🃏',
        title: 'אני מגדיר יעד ונותן חופש פעולה',
        description: 'חשוב לי שיבינו לאן הולכים, ופחות איך בדיוק.'
      },
      {
        id: 'people_grow',
        emoji: '🃏',
        title: 'אנשים גדלים סביבי',
        description: 'אני רואה אנשים שלוקחים יותר אחריות עם הזמן.'
      }
    ]
  },
  {
    id: 'influenceLeadership',
    title: '🪨 אבן גדולה 4: השפעה והובלה',
    subtitle: 'איך דברים זזים סביבי בארגון',
    cards: [
      {
        id: 'need_presence',
        emoji: '🃏',
        title: 'כדי שמשהו יקרה – אני צריך להיות בתמונה',
        description: 'בלי נוכחות שלי, דברים נתקעים.'
      },
      {
        id: 'close_circle',
        emoji: '🃏',
        title: 'אני משפיע בעיקר במעגל הקרוב',
        description: 'עם הצוות שלי זה עובד טוב, מעבר לזה פחות.'
      },
      {
        id: 'pressure_driven',
        emoji: '🃏',
        title: 'אני מגייס דרך משימות ולחץ',
        description: 'כשצריך – אני יודע לדרוש, אבל זה שוחק.'
      },
      {
        id: 'clear_direction_leadership',
        emoji: '🃏',
        title: 'אנשים מבינים לאן אני מכוון',
        description: 'גם בלי שאגיד כל פעם, יש כיוון ברור.'
      },
      {
        id: 'things_move',
        emoji: '🃏',
        title: 'דברים זזים גם כשאני לא בחדר',
        description: 'יש אמון, רתימה והשפעה רוחבית.'
      }
    ]
  },
  {
    id: 'teamLearning',
    title: '🪨 אבן גדולה 5: צוות ולמידה',
    subtitle: 'איך נראית הדינמיקה שאני מייצר',
    cards: [
      {
        id: 'task_driven',
        emoji: '🃏',
        title: 'אנחנו מתקדמים דרך משימות',
        description: 'פחות עוצרים לדבר על תהליך, יותר על מה צריך לקרות.'
      },
      {
        id: 'problem_talk',
        emoji: '🃏',
        title: 'מדברים על דברים רק כשיש בעיה',
        description: 'רפלקציה קורית בעיקר אחרי כשל.'
      },
      {
        id: 'inconsistent_dialogue',
        emoji: '🃏',
        title: 'יש שיח, אבל לא תמיד עקבי',
        description: 'לפעמים פותחים דברים, לא תמיד סוגרים.'
      },
      {
        id: 'space_to_talk',
        emoji: '🃏',
        title: 'יש מקום לדבר וללמוד',
        description: 'שיחות על איך עובדים ביחד הן חלק מהשגרה.'
      },
      {
        id: 'team_safe',
        emoji: '🃏',
        title: 'הצוות מרגיש בטוח להעלות דברים',
        description: 'יש פתיחות, גם לנושאים לא נוחים.'
      }
    ]
  }
];

type CardStatus = 'describes' | 'doesNotDescribe' | 'unselected';

const CardGameStep: React.FC<CardGameStepProps> = ({
  cardGameData,
  onCardGameDataChange,
  onNext,
  onBack
}) => {
  const [currentStone, setCurrentStone] = useState(0);
  
  const totalStones = bigStones.length;
  const stone = bigStones[currentStone];
  const selection = cardGameData[stone.id];

  const getCardStatus = (cardId: string): CardStatus => {
    if (selection.describes.includes(cardId)) return 'describes';
    if (selection.doesNotDescribe.includes(cardId)) return 'doesNotDescribe';
    return 'unselected';
  };

  const handleCardClick = (cardId: string, newStatus: CardStatus) => {
    const newSelection = { 
      describes: [...selection.describes],
      doesNotDescribe: [...selection.doesNotDescribe]
    };
    
    // Remove from both arrays first
    newSelection.describes = newSelection.describes.filter(id => id !== cardId);
    newSelection.doesNotDescribe = newSelection.doesNotDescribe.filter(id => id !== cardId);
    
    // Add to the appropriate array if not unselecting
    if (newStatus === 'describes') {
      newSelection.describes.push(cardId);
    } else if (newStatus === 'doesNotDescribe') {
      newSelection.doesNotDescribe.push(cardId);
    }

    onCardGameDataChange({
      ...cardGameData,
      [stone.id]: newSelection
    });
  };

  const totalCards = stone.cards.length;
  const sortedCards = selection.describes.length + selection.doesNotDescribe.length;
  const canProceed = sortedCards === totalCards;

  const handleNext = () => {
    if (currentStone < totalStones - 1) {
      setCurrentStone(prev => prev + 1);
    } else {
      onNext();
    }
  };

  const handleBack = () => {
    if (currentStone > 0) {
      setCurrentStone(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const renderCard = (card: CardOption) => {
    const status = getCardStatus(card.id);
    
    return (
      <div
        key={card.id}
        className={`
          rounded-xl transition-all duration-200 text-right
          border-2 select-none overflow-hidden
          ${status === 'describes' 
            ? 'border-green-500 bg-green-50 dark:bg-green-950/30' 
            : status === 'doesNotDescribe'
              ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
              : 'border-border bg-card'
          }
        `}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">{card.emoji}</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold mb-1 text-foreground text-sm md:text-base">
                {card.title}
              </h4>
              <p className="text-xs md:text-sm leading-relaxed text-muted-foreground">
                {card.description}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex border-t border-border">
          <button
            onClick={() => handleCardClick(card.id, status === 'describes' ? 'unselected' : 'describes')}
            className={`
              flex-1 py-3 flex items-center justify-center gap-2 transition-all
              ${status === 'describes'
                ? 'bg-green-500 text-white'
                : 'bg-muted/30 text-muted-foreground hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-950/50'
              }
            `}
          >
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">מאפיין</span>
          </button>
          
          <div className="w-px bg-border" />
          
          <button
            onClick={() => handleCardClick(card.id, status === 'doesNotDescribe' ? 'unselected' : 'doesNotDescribe')}
            className={`
              flex-1 py-3 flex items-center justify-center gap-2 transition-all
              ${status === 'doesNotDescribe'
                ? 'bg-red-500 text-white'
                : 'bg-muted/30 text-muted-foreground hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950/50'
              }
            `}
          >
            <X className="w-5 h-5" />
            <span className="text-sm font-medium">לא מאפיין</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      <ProgressBar currentStep={currentStone + 1} totalSteps={totalStones} />
      
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
          🎴 משחק הקלפים
        </h2>
        <p className="text-sm text-muted-foreground">סמן מה מאפיין אותך ומה לא</p>
      </div>

      <div className="bg-card rounded-2xl p-4 md:p-6 shadow-soft border border-border mb-6">
        <div className="text-center mb-4">
          <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">
            {stone.title}
          </h3>
          <p className="text-sm text-muted-foreground">{stone.subtitle}</p>
        </div>

        <div className="text-center mb-4 p-2 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground">
            חשוב על דפוסים שחזרו על עצמם ברוב החודש האחרון
          </p>
        </div>

        <div className="space-y-4">
          {stone.cards.map((card) => renderCard(card))}
        </div>

        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-muted-foreground">{selection.describes.length} מאפיין</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-muted-foreground">{selection.doesNotDescribe.length} לא מאפיין</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {sortedCards}/{totalCards} קלפים סומנו
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          חזרה
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="flex items-center gap-2"
        >
          {currentStone < totalStones - 1 ? 'לאבן הבאה' : 'סיום'}
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CardGameStep;
