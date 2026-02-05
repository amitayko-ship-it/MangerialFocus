import React, { useState, DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, GripVertical } from 'lucide-react';
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
        description: 'היומן נסגר דרך בקשות, בעיות ופניות מהשטח. דברים "חשובים באמת" נדחקים לסוף היום או לשבוע הבא.'
      },
      {
        id: 'important_slow',
        emoji: '🃏',
        title: 'יש לי דברים חשובים – אבל הם זזים לאט',
        description: 'ברור לי מה צריך לקדם, אבל בפועל זה מתקדם בקצב איטי ממה שהייתי רוצה.'
      },
      {
        id: 'holding_a_lot',
        emoji: '🃏',
        title: 'אני מחזיק הרבה על הראש',
        description: 'מצליח לגעת גם בשוטף וגם בדברים חשובים, אבל מרגיש שאני תמיד על הקצה.'
      },
      {
        id: 'choose_focus',
        emoji: '🃏',
        title: 'אני בוחר במה להתעסק',
        description: 'לא כל בקשה נכנסת ליומן, ויש לי סדרי עדיפויות יחסית ברורים.'
      },
      {
        id: 'clear_direction',
        emoji: '🃏',
        title: 'הזמן שלי משרת כיוון ברור',
        description: 'רוב השבוע מושקע בנושאים שמקדמים את היחידה קדימה, ולא רק בתחזוקה.'
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
        description: 'יש פגישות ותהליכים שעוזרים לי לשלוט בתמונה, גם כשהעומס עולה.'
      },
      {
        id: 'routines_advance',
        emoji: '🃏',
        title: 'השגרות שלי מקדמות אנשים ותוצאות',
        description: 'הזמן חוזר על עצמו בצורה שמייצרת התקדמות, לא רק עדכון.'
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
        description: 'אני רואה אנשים שלוקחים יותר אחריות עם הזמן, ופונים אליי פחות על כל דבר.'
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
        description: 'יש אמון, רתימה והשפעה רוחבית, לא רק ניהול ישיר.'
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
        description: 'יש פתיחות, גם לנושאים לא נוחים, ולמידה אמיתית.'
      }
    ]
  }
];

type DropZone = 'most' | 'least';

const CardGameStep: React.FC<CardGameStepProps> = ({
  cardGameData,
  onCardGameDataChange,
  onNext,
  onBack
}) => {
  const [currentStone, setCurrentStone] = useState(0);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [activeDropZone, setActiveDropZone] = useState<DropZone | null>(null);
  
  const totalStones = bigStones.length;
  const stone = bigStones[currentStone];
  const selection = cardGameData[stone.id];

  const handleDragStart = (e: DragEvent<HTMLDivElement>, cardId: string) => {
    setDraggedCard(cardId);
    e.dataTransfer.setData('cardId', cardId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setActiveDropZone(null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, zone: DropZone) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setActiveDropZone(zone);
  };

  const handleDragLeave = () => {
    setActiveDropZone(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, zone: DropZone) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    
    if (!cardId) return;

    const newSelection = { ...selection };
    
    // Remove from other zone if exists
    if (zone === 'most' && newSelection.least === cardId) {
      newSelection.least = '';
    } else if (zone === 'least' && newSelection.most === cardId) {
      newSelection.most = '';
    }
    
    // Set to new zone
    newSelection[zone] = cardId;

    onCardGameDataChange({
      ...cardGameData,
      [stone.id]: newSelection
    });

    setDraggedCard(null);
    setActiveDropZone(null);
  };

  const removeFromZone = (zone: DropZone) => {
    onCardGameDataChange({
      ...cardGameData,
      [stone.id]: {
        ...selection,
        [zone]: ''
      }
    });
  };

  const getCardById = (cardId: string): CardOption | undefined => {
    return stone.cards.find(c => c.id === cardId);
  };

  const isCardInDropZone = (cardId: string): boolean => {
    return selection.most === cardId || selection.least === cardId;
  };

  const canProceed = selection.most !== '' && selection.least !== '';

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

  const renderDraggableCard = (card: CardOption, inDropZone: boolean = false, zone?: DropZone) => {
    const isBeingDragged = draggedCard === card.id;
    
    return (
      <div
        key={card.id}
        draggable
        onDragStart={(e) => handleDragStart(e, card.id)}
        onDragEnd={handleDragEnd}
        className={`
          p-4 rounded-xl transition-all duration-200 text-right
          border-2 cursor-grab active:cursor-grabbing select-none
          ${isBeingDragged ? 'opacity-50 scale-95' : 'opacity-100'}
          ${inDropZone 
            ? zone === 'most' 
              ? 'border-green-500 bg-green-50 dark:bg-green-950/30' 
              : 'border-red-500 bg-red-50 dark:bg-red-950/30'
            : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50 hover:shadow-md'
          }
        `}
      >
        <div className="flex items-start gap-3">
          <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
          <span className="text-2xl flex-shrink-0">{card.emoji}</span>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold mb-1 text-foreground">
              {card.title}
            </h4>
            {!inDropZone && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {card.description}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDropZone = (zone: DropZone) => {
    const isActive = activeDropZone === zone;
    const selectedCardId = selection[zone];
    const selectedCard = selectedCardId ? getCardById(selectedCardId) : null;
    const isMost = zone === 'most';
    
    return (
      <div
        onDragOver={(e) => handleDragOver(e, zone)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, zone)}
        className={`
          min-h-[120px] rounded-xl border-2 border-dashed p-4 transition-all duration-300
          ${isActive 
            ? isMost 
              ? 'border-green-500 bg-green-100/50 dark:bg-green-900/30 shadow-[0_0_20px_rgba(34,197,94,0.3)]' 
              : 'border-red-500 bg-red-100/50 dark:bg-red-900/30 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
            : selectedCard
              ? isMost
                ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                : 'border-red-500 bg-red-50 dark:bg-red-950/20'
              : 'border-muted-foreground/30 bg-muted/30'
          }
        `}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-bold ${isMost ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isMost ? '🟩 מתאר אותי הכי הרבה' : '🟥 מתאר אותי הכי פחות'}
          </span>
          {selectedCard && (
            <button
              onClick={() => removeFromZone(zone)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              הסר ↩
            </button>
          )}
        </div>
        
        {selectedCard ? (
          renderDraggableCard(selectedCard, true, zone)
        ) : (
          <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
            {isActive ? '🎯 שחרר כאן' : 'גרור קלף לכאן'}
          </div>
        )}
      </div>
    );
  };

  const availableCards = stone.cards.filter(card => !isCardInDropZone(card.id));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ProgressBar currentStep={currentStone + 1} totalSteps={totalStones} />
      
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          🎴 משחק הקלפים
        </h2>
        <p className="text-muted-foreground">תפיסת תפקיד ניהולית – Forced Choice</p>
      </div>

      <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border">
        <div className="text-center mb-6">
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            {stone.title}
          </h3>
          <p className="text-muted-foreground mb-4">{stone.subtitle}</p>
        </div>

        {/* Micro-copy instructions */}
        <div className="text-center mb-6 p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground">
            גרור קלף אחד לכל תיבה.<br />
            חשוב על דפוסים שחזרו על עצמם ברוב החודש האחרון – לא על מקרה חריג.
          </p>
        </div>

        {/* Available cards */}
        <div className="space-y-3 mb-6">
          {availableCards.map((card) => renderDraggableCard(card))}
        </div>

        {/* Drop zones */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {renderDropZone('most')}
          {renderDropZone('least')}
        </div>

        {/* Status indicator */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          בחרת {(selection.most ? 1 : 0) + (selection.least ? 1 : 0)}/2
        </div>
      </div>

      <div className="flex justify-between mt-8">
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
