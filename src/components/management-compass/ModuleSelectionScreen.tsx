import React from 'react';
import { Button } from '@/components/ui/button';
import { QuestionnaireData } from '@/types/managementCompass';
import { getFullModules, getLightModules } from '@/lib/moduleSelection';
import { Target, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ModuleSelectionScreenProps {
  data: QuestionnaireData;
  onNext: () => void;
  onBack: () => void;
}

const ModuleSelectionScreen: React.FC<ModuleSelectionScreenProps> = ({ 
  data, 
  onNext, 
  onBack 
}) => {
  const fullModules = getFullModules(data.cardGameData, data.teamHealthData);
  const lightModules = getLightModules(data.cardGameData, data.teamHealthData);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-2xl w-full animate-scale-in">
        {/* Header Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center shadow-glow">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-3 text-foreground">
          המיפוי האישי שלך
        </h1>
        
        {/* Main explanation */}
        <div className="text-center mb-8 p-4 rounded-xl bg-muted/50 border border-border">
          <p className="text-muted-foreground leading-relaxed">
            על בסיס דפוסי הניהול שאפיינו אותך בחודש האחרון,
            <br />
            <span className="font-semibold text-foreground">
              יש שני נושאים שבהם העיסוק המעמיק צפוי לייצר עבורך את הערך הגבוה ביותר.
            </span>
            <br />
            בנושאים אחרים ניגע דרך שיקוף ושאלות ממוקדות.
          </p>
        </div>

        {/* Full Modules - Deep Dive */}
        <div className="bg-card rounded-2xl p-6 shadow-soft border border-primary/30 mb-4">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
            <Target className="w-5 h-5 text-primary" />
            נושאים להעמקה מלאה
          </h2>
          
          <div className="space-y-3">
            {fullModules.map((module, index) => (
              <div 
                key={module.key}
                className="p-4 rounded-xl bg-primary/10 border border-primary/20"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground font-bold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{module.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{module.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Light Modules - Touch Points */}
        <div className="bg-card rounded-2xl p-6 shadow-soft border border-border mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="w-5 h-5" />
            נושאים לשיקוף וליווי קל
          </h2>
          
          <div className="space-y-2">
            {lightModules.map((module) => (
              <div 
                key={module.key}
                className="p-3 rounded-lg bg-muted/30 border border-border"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{module.name}</span>
                  <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-muted">
                    Light Touch
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onBack}
          >
            חזרה
          </Button>

          <Button
            onClick={onNext}
            className="flex items-center gap-2"
          >
            המשך לסיום
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModuleSelectionScreen;
