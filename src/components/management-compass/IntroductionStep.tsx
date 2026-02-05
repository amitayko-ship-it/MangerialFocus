import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, User } from 'lucide-react';
import { UserInfo } from '@/types/managementCompass';

interface IntroductionStepProps {
  userInfo: UserInfo;
  onUserInfoChange: (userInfo: UserInfo) => void;
  onNext: () => void;
}

const IntroductionStep: React.FC<IntroductionStepProps> = ({
  userInfo,
  onUserInfoChange,
  onNext
}) => {
  const safeUserInfo = userInfo || { name: '', gender: '' as 'male' | 'female' | '' };
  const canProceed = safeUserInfo.name.trim() !== '' && safeUserInfo.gender !== '';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full animate-scale-in">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center shadow-glow">
            <User className="w-10 h-10 text-primary" />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground text-center">
          רגע לפני שמתחילים
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          בואו נכיר קצת
        </p>

        <div className="bg-card rounded-2xl p-6 shadow-soft border border-border space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 text-right">
              מה השם שלך?
            </label>
            <Input
              type="text"
              value={safeUserInfo.name}
              onChange={(e) => onUserInfoChange({ ...safeUserInfo, name: e.target.value })}
              placeholder="הכנס את שמך"
              className="text-right"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3 text-right">
              איך תרצה שאפנה אליך?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onUserInfoChange({ ...safeUserInfo, gender: 'male' })}
                className={`
                  py-4 px-6 rounded-xl border-2 transition-all text-center
                  ${safeUserInfo.gender === 'male'
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                  }
                `}
              >
                <span className="text-2xl mb-1 block">👨</span>
                <span className="text-sm">לשון זכר</span>
              </button>
              
              <button
                onClick={() => onUserInfoChange({ ...safeUserInfo, gender: 'female' })}
                className={`
                  py-4 px-6 rounded-xl border-2 transition-all text-center
                  ${safeUserInfo.gender === 'female'
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                  }
                `}
              >
                <span className="text-2xl mb-1 block">👩</span>
                <span className="text-sm">לשון נקבה</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button
            onClick={onNext}
            disabled={!canProceed}
            size="lg"
            className="gap-2"
          >
            בואו נתחיל
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IntroductionStep;
