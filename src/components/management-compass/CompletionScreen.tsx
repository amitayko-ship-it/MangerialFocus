import React from 'react';
import { Button } from '@/components/ui/button';
import { QuestionnaireData, getTopModule, getCoachingInsight } from '@/types/managementCompass';
import { CheckCircle2, Target, Sparkles, Lightbulb } from 'lucide-react';

interface CompletionScreenProps {
  data: QuestionnaireData;
  onRestart: () => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({ data, onRestart }) => {
  const topModule = getTopModule(data);
  const coachingInsight = getCoachingInsight(data.coaching);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-2xl w-full animate-scale-in">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center shadow-glow">
            <CheckCircle2 className="w-14 h-14 text-primary" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 text-foreground">
          תודה על השיתוף!
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          הנתונים שלך נשמרו בהצלחה
        </p>

        {/* Main Insight Card */}
        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-medium border border-border mb-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
            <Sparkles className="w-6 h-6 text-secondary" />
            התובנה שלך
          </h2>

          {/* Top Module Insight */}
          <div className="p-5 rounded-xl bg-accent/30 border border-primary/20 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-foreground">הנושא שהכי בוער אצלך</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  נראה שהנושא שהכי בוער אצלך הוא{' '}
                  <span className="font-bold text-primary">{topModule}</span>.
                </p>
                <p className="text-sm text-foreground mt-2">
                  הוא מייצר מחיר יומיומי, יש לו השפעה גבוהה על הביצועים,
                  ואתה מאמין שניתן לשפר אותו בפועל.
                </p>
                <p className="text-sm text-foreground mt-2 font-medium">
                  כאן מהלך ממוקד יכול לעשות את ההבדל.
                </p>
              </div>
            </div>
          </div>

          {/* Coaching Insight */}
          <div className="p-5 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl gradient-warm flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-foreground">תובנה על החניכה</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {coachingInsight}
                </p>
                {data.coaching.oneSmallThing && (
                  <div className="mt-3 p-3 bg-background rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">הדבר הקטן שבחרת לשנות:</p>
                    <p className="text-sm text-foreground font-medium">{data.coaching.oneSmallThing}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            צוות ה-HR יקבל את התוצאות ויתאם איתך תהליך פיתוח מותאם אישית
          </p>
          <Button variant="soft" onClick={onRestart}>
            מילוי שאלון חדש
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompletionScreen;
