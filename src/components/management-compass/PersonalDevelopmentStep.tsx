import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { PersonalDevelopmentData, developmentLeaps } from '@/types/managementCompass';

type Gender = 'male' | 'female';

const g = (gender: Gender, male: string, female: string) =>
  gender === 'female' ? female : male;

interface PersonalDevelopmentStepProps {
  data: PersonalDevelopmentData;
  onChange: (data: PersonalDevelopmentData) => void;
  onNext: () => void;
  onBack: () => void;
  gender: Gender;
}

const PersonalDevelopmentStep: React.FC<PersonalDevelopmentStepProps> = ({
  data,
  onChange,
  onNext,
  onBack,
  gender,
}) => {
  const update = (updates: Partial<PersonalDevelopmentData>) => {
    onChange({ ...data, ...updates });
  };

  const partBComplete = data.developmentLeap !== null;
  const canProceed = partBComplete;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">תוכנית התפתחות אישית</h2>
          <p className="text-muted-foreground text-sm">
            {g(gender,
              'זהו השלב האחרון. נקה ממך את השאלון ובחר את כיוון קפיצת המדרגה שלך.',
              'זהו השלב האחרון. נקי ממך את השאלון ובחרי את כיוון קפיצת המדרגה שלך.'
            )}
          </p>
        </div>

        {/* Part B */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">ב</span>
            <h3 className="text-lg font-semibold text-foreground">
              זיהוי קפיצת המדרגה המשמעותית ביותר
            </h3>
          </div>
          <p className="text-muted-foreground text-sm mb-4 pr-9">
            {g(gender,
              'סמן היכן אתה מזהה את קפיצת המדרגה המשמעותית ביותר עבורך כרגע:',
              'סמני היכן את מזהה את קפיצת המדרגה המשמעותית ביותר עבורך כרגע:'
            )}
          </p>
          <div className="space-y-3">
            {developmentLeaps.map((leap) => {
              const isSelected = data.developmentLeap === leap.id;
              return (
                <button
                  key={leap.id}
                  onClick={() => update({ developmentLeap: leap.id as 1 | 2 | 3 })}
                  className={`w-full text-right p-4 rounded-xl border transition-all duration-150 ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                      : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 transition-colors ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {leap.id}
                    </span>
                    <div className="flex-1">
                      <p className={`font-semibold mb-2 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {leap.title}
                      </p>
                      <ul className="space-y-1">
                        {leap.bullets.map((b, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-1.5">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground flex-shrink-0" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Part C */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">ג</span>
            <h3 className="text-lg font-semibold text-foreground">דיוק קפיצת המדרגה</h3>
          </div>
          <p className="text-muted-foreground text-sm mb-5 pr-9">
            {g(gender,
              'ענה על השאלות הבאות בכנות. אין תשובות נכונות – זה לשימושך בלבד.',
              'עני על השאלות הבאות בכנות. אין תשובות נכונות – זה לשימושך בלבד.'
            )}
          </p>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {g(gender,
                  'אם בעוד 6 חודשים יגידו עליי: "קרה כאן שינוי משמעותי בניהול שלו" – מה בדיוק יגידו?',
                  'אם בעוד 6 חודשים יגידו עליי: "קרה כאן שינוי משמעותי בניהול שלה" – מה בדיוק יגידו?'
                )}
              </label>
              <textarea
                value={data.sixMonthChange}
                onChange={(e) => update({ sixMonthChange: e.target.value })}
                placeholder={g(gender, 'כתוב כאן...', 'כתבי כאן...')}
                rows={3}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                איזה התנהגות אחת תשתנה?
              </label>
              <textarea
                value={data.behaviorChange}
                onChange={(e) => update({ behaviorChange: e.target.value })}
                placeholder={g(gender, 'כתוב כאן...', 'כתבי כאן...')}
                rows={2}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {g(gender,
                  'איזה מחיר אני משלם היום אם לא אעשה את השינוי הזה?',
                  'איזה מחיר אני משלמת היום אם לא אעשה את השינוי הזה?'
                )}
              </label>
              <textarea
                value={data.priceOfNoChange}
                onChange={(e) => update({ priceOfNoChange: e.target.value })}
                placeholder={g(gender, 'כתוב כאן...', 'כתבי כאן...')}
                rows={2}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {g(gender,
                  'מה אני מוכן לעשות אחרת כבר בשבוע הקרוב?',
                  'מה אני מוכנה לעשות אחרת כבר בשבוע הקרוב?'
                )}
              </label>
              <textarea
                value={data.weeklyCommitment}
                onChange={(e) => update({ weeklyCommitment: e.target.value })}
                placeholder={g(gender, 'כתוב כאן...', 'כתבי כאן...')}
                rows={2}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>
          </div>
        </section>

        {/* Part D */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">ד</span>
            <h3 className="text-lg font-semibold text-foreground">ניסוח אזור קפיצה</h3>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm text-muted-foreground mb-4">
              {g(gender, 'השלם את המשפט:', 'השלימי את המשפט:')}
            </p>
            <div className="space-y-4 text-sm text-foreground leading-relaxed">
              <div className="flex flex-wrap items-center gap-2">
                <span>השנה אני רוצה לייצר קפיצת מדרגה ב –</span>
                <input
                  value={data.leapArea}
                  onChange={(e) => update({ leapArea: e.target.value })}
                  placeholder="תחום / נושא"
                  className="border-b border-primary/60 bg-transparent px-1 py-0.5 text-sm focus:outline-none focus:border-primary min-w-[150px] flex-1"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span>כי כרגע אני –</span>
                <input
                  value={data.leapCurrentState}
                  onChange={(e) => update({ leapCurrentState: e.target.value })}
                  placeholder="מצב נוכחי"
                  className="border-b border-primary/60 bg-transparent px-1 py-0.5 text-sm focus:outline-none focus:border-primary min-w-[150px] flex-1"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span>והמחיר של זה הוא –</span>
                <input
                  value={data.leapPrice}
                  onChange={(e) => update({ leapPrice: e.target.value })}
                  placeholder="מחיר"
                  className="border-b border-primary/60 bg-transparent px-1 py-0.5 text-sm focus:outline-none focus:border-primary min-w-[150px] flex-1"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה
          </Button>
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="flex-1 flex items-center justify-center gap-2"
          >
            לתוצאות
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
        {!canProceed && (
          <p className="text-center text-sm text-muted-foreground mt-3">
            {g(gender,
              'יש לבחור קפיצת מדרגה (חלק ב\') לפני המעבר לתוצאות',
              'יש לבחור קפיצת מדרגה (חלק ב\') לפני המעבר לתוצאות'
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default PersonalDevelopmentStep;
