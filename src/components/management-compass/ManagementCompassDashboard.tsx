import React from 'react';
import { Button } from '@/components/ui/button';
import { Compass, ArrowRight, Target, TrendingUp } from 'lucide-react';
import { QuestionnaireData, bigStones, developmentLeaps } from '@/types/managementCompass';

interface ManagementCompassDashboardProps {
  data: QuestionnaireData;
  onRestart: () => void;
  onContinue?: () => void;
  onBack?: () => void;
}

const colorBar: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-emerald-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  red: 'bg-rose-500',
};

const colorText: Record<string, string> = {
  blue: 'text-blue-700',
  green: 'text-emerald-700',
  purple: 'text-purple-700',
  orange: 'text-orange-700',
  red: 'text-rose-700',
};

const colorBg: Record<string, string> = {
  blue: 'bg-blue-50 border-blue-200',
  green: 'bg-emerald-50 border-emerald-200',
  purple: 'bg-purple-50 border-purple-200',
  orange: 'bg-orange-50 border-orange-200',
  red: 'bg-rose-50 border-rose-200',
};

const ManagementCompassDashboard: React.FC<ManagementCompassDashboardProps> = ({
  data,
  onRestart,
  onContinue,
  onBack,
}) => {
  const axes = data.axes;
  const pd = data.personalDevelopment;
  const selectedLeap = developmentLeaps.find((l) => l.id === pd.developmentLeap);

  const stoneAverages = bigStones.map((stone) => {
    const vals = stone.axes.map((ax) => axes[ax.key] || 0);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { stone, avg };
  });

  const overallAvg =
    stoneAverages.reduce((a, b) => a + b.avg, 0) / stoneAverages.length;

  const weakestStones = [...stoneAverages]
    .filter((s) => s.avg > 0)
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shadow-glow">
              <Compass className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            תוצאות האבחון העצמי
          </h1>
          <p className="text-muted-foreground text-sm">
            כך נראית התמונה הניהולית שלך על פי הצירים שדירגת
          </p>
        </div>

        {/* Overall score */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 text-center">
          <p className="text-sm text-muted-foreground mb-1">ממוצע כללי</p>
          <p className="text-5xl font-bold text-primary mb-1">
            {overallAvg > 0 ? overallAvg.toFixed(1) : '–'}
          </p>
          <p className="text-xs text-muted-foreground">מתוך 5</p>
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: overallAvg > 0 ? `${(overallAvg / 5) * 100}%` : '0%' }}
            />
          </div>
        </div>

        {/* Per-stone results */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            ציוני האבנים הגדולות
          </h2>
          <div className="space-y-4">
            {stoneAverages.map(({ stone, avg }) => {
              const c = stone.color;
              return (
                <div
                  key={stone.id}
                  className={`rounded-xl border p-4 ${colorBg[c]}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-bold ${colorText[c]}`}>
                      {avg > 0 ? avg.toFixed(1) : '–'} / 5
                    </span>
                    <h3 className="font-semibold text-foreground text-sm">{stone.title}</h3>
                  </div>
                  <div className="h-2 bg-white/70 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full ${colorBar[c]} rounded-full transition-all duration-500`}
                      style={{ width: avg > 0 ? `${(avg / 5) * 100}%` : '0%' }}
                    />
                  </div>
                  <div className="space-y-2">
                    {stone.axes.map((ax) => {
                      const val = axes[ax.key];
                      return (
                        <div key={ax.key} className="flex items-start justify-between gap-3">
                          <span className={`text-xs font-semibold flex-shrink-0 ${colorText[c]}`}>
                            {val > 0 ? val : '–'}
                          </span>
                          <div className="flex-1 text-right">
                            <p className="text-xs font-medium text-foreground mb-0.5">{ax.title}</p>
                            {val > 0 && (
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {ax.levels[val - 1]}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Focus areas */}
        {weakestStones.length > 0 && (
          <div className="bg-card border border-primary/30 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">איפה כדאי להתמקד</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              על פי הציונים שלך, האזורים עם מרחב הגדול ביותר לצמיחה:
            </p>
            <div className="space-y-2">
              {weakestStones.map(({ stone, avg }) => (
                <div key={stone.id} className="flex items-center justify-between bg-accent/40 rounded-lg px-4 py-2">
                  <span className="text-sm font-semibold text-primary">{avg.toFixed(1)}</span>
                  <span className="text-sm text-foreground">{stone.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personal development summary */}
        {selectedLeap && (
          <div className="bg-card border border-border rounded-2xl p-5 mb-6">
            <h2 className="text-base font-bold text-foreground mb-2">קפיצת המדרגה שבחרת</h2>
            <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 mb-4">
              <p className="text-sm font-semibold text-primary">{selectedLeap.title}</p>
            </div>
            {(pd.sixMonthChange || pd.behaviorChange || pd.priceOfNoChange || pd.weeklyCommitment) && (
              <div className="space-y-3">
                {pd.sixMonthChange && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">שינוי תוך 6 חודשים:</p>
                    <p className="text-sm text-foreground">{pd.sixMonthChange}</p>
                  </div>
                )}
                {pd.behaviorChange && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">התנהגות שתשתנה:</p>
                    <p className="text-sm text-foreground">{pd.behaviorChange}</p>
                  </div>
                )}
                {pd.priceOfNoChange && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">מחיר אי-שינוי:</p>
                    <p className="text-sm text-foreground">{pd.priceOfNoChange}</p>
                  </div>
                )}
                {pd.weeklyCommitment && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">מחויבות לשבוע הקרוב:</p>
                    <p className="text-sm text-foreground">{pd.weeklyCommitment}</p>
                  </div>
                )}
              </div>
            )}
            {(pd.leapArea || pd.leapCurrentState || pd.leapPrice) && (
              <div className="mt-4 bg-muted/30 rounded-lg px-4 py-3 text-sm text-foreground leading-relaxed">
                {pd.leapArea && <span>השנה אני רוצה לייצר קפיצת מדרגה ב – <strong>{pd.leapArea}</strong>. </span>}
                {pd.leapCurrentState && <span>כי כרגע אני – <strong>{pd.leapCurrentState}</strong>. </span>}
                {pd.leapPrice && <span>והמחיר של זה הוא – <strong>{pd.leapPrice}</strong>.</span>}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center border-t border-border pt-6">
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            פיתוח ניהולי מתחיל בהבנה מדויקת של המציאות.
            <br />
            זה מה שעשית עכשיו.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {onBack && (
              <Button variant="outline" onClick={onBack} className="gap-2">
                <ArrowRight className="w-4 h-4" />
                חזרה לשאלון
              </Button>
            )}
            <Button variant="outline" onClick={onRestart}>
              מילוי שאלון מחדש
            </Button>
            {onContinue && (
              <Button onClick={onContinue}>
                המשך לתכנית עבודה
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementCompassDashboard;
