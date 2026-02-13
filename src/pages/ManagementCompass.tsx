import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/management-compass/layout/Header';
import Footer from '@/components/management-compass/layout/Footer';
import WelcomeScreen from '@/components/management-compass/WelcomeScreen';
import QuestionnaireIntroStep from '@/components/management-compass/QuestionnaireIntroStep';
import CardGameStep from '@/components/management-compass/CardGameStep';
import CardGameSummaryScreen from '@/components/management-compass/CardGameSummaryScreen';
import FocusControlStep from '@/components/management-compass/FocusControlStep';
import DecisionsPriceStep from '@/components/management-compass/DecisionsPriceStep';
import InterfacesMapStep from '@/components/management-compass/InterfacesMapStep';
import CoachingStep from '@/components/management-compass/CoachingStep';
import TeamHealthStep from '@/components/management-compass/TeamHealthStep';
import ManagementCompassDashboard from '@/components/management-compass/ManagementCompassDashboard';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, ArrowRight } from 'lucide-react';
import { QuestionnaireData, initialQuestionnaireData, InterfaceJourneyData, CoachingData, TeamHealthData, CardGameData } from '@/types/managementCompass';
import { saveWithExpiry, loadWithExpiry } from '@/lib/storageUtils';

const STORAGE_KEY = 'management-compass-data';
const STEP_STORAGE_KEY = 'management-compass-step';

type Step = 
  | 'welcome'
  | 'questionnaireIntro'
  | 'cardGame'
  | 'cardGameSummary'
  | 'focusControl' 
  | 'decisionsPrice' 
  | 'interfacesMap' 
  | 'coaching' 
  | 'teamHealth' 
  | 'dashboard';

const STEP_ORDER: Step[] = [
  'welcome', 'questionnaireIntro', 'cardGame', 'cardGameSummary',
  'focusControl', 'decisionsPrice', 'interfacesMap', 'coaching', 'teamHealth',
  'dashboard'
];

const ManagementCompass: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(() => {
    const saved = loadWithExpiry<string>(STEP_STORAGE_KEY);
    if (saved === 'moduleSelection') return 'dashboard';
    if (saved === 'introduction') return 'questionnaireIntro';
    return (saved as Step) || 'welcome';
  });
  const [data, setData] = useState<QuestionnaireData>(() => {
    const saved = loadWithExpiry<QuestionnaireData>(STORAGE_KEY);
    return saved || initialQuestionnaireData;
  });

  useEffect(() => {
    if (user) {
      setData(prev => ({
        ...prev,
        userInfo: {
          name: user.full_name || '',
          gender: (user.gender as 'male' | 'female') || 'male'
        }
      }));
    }
  }, [user]);
  const [previousStep, setPreviousStep] = useState<Step | null>(null);

  useEffect(() => {
    saveWithExpiry(STORAGE_KEY, data);
  }, [data]);

  useEffect(() => {
    saveWithExpiry(STEP_STORAGE_KEY, currentStep);
  }, [currentStep]);

  const updateData = (updates: Partial<QuestionnaireData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleComplete = () => {
    navigate('/intro-video');
  };

  const handleRestart = () => {
    setData(initialQuestionnaireData);
    setCurrentStep('welcome');
  };

  const goToDashboard = () => {
    setPreviousStep(currentStep);
    setCurrentStep('dashboard');
  };

  const goBackFromDashboard = () => {
    if (previousStep && previousStep !== 'dashboard') {
      setCurrentStep(previousStep);
      setPreviousStep(null);
    }
  };

  const showDashboardButton = !['welcome', 'dashboard'].includes(currentStep);

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeScreen onStart={() => setCurrentStep('questionnaireIntro')} />;
      
      case 'questionnaireIntro':
        return (
          <QuestionnaireIntroStep
            userName={user?.full_name || ''}
            onNext={() => setCurrentStep('cardGame')}
            onBack={() => setCurrentStep('welcome')}
          />
        );
      
      case 'cardGame':
        return (
          <CardGameStep
            cardGameData={data.cardGameData}
            onCardGameDataChange={(cardGameData: CardGameData) => updateData({ cardGameData })}
            onNext={() => setCurrentStep('cardGameSummary')}
            onBack={() => setCurrentStep('questionnaireIntro')}
          />
        );
      
      case 'cardGameSummary':
        return (
          <CardGameSummaryScreen
            cardGameData={data.cardGameData}
            onNext={() => setCurrentStep('focusControl')}
            onBack={() => setCurrentStep('cardGame')}
          />
        );
      
      case 'focusControl':
        return (
          <FocusControlStep
            anchorScore={data.anchorScore}
            timeDrain={data.timeDrain}
            timeDrainOther={data.timeDrainOther}
            onAnchorChange={(score) => updateData({ anchorScore: score })}
            onTimeDrainChange={(drain) => updateData({ timeDrain: drain })}
            onTimeDrainOtherChange={(text) => updateData({ timeDrainOther: text })}
            onNext={() => setCurrentStep('decisionsPrice')}
            onBack={() => setCurrentStep('cardGameSummary')}
          />
        );
      
      case 'decisionsPrice':
        return (
          <DecisionsPriceStep
            immediatePrice={data.immediatePrice}
            longTermPrice={data.longTermPrice}
            retrospective={data.retrospective}
            onImmediatePriceChange={(val) => updateData({ immediatePrice: val })}
            onLongTermPriceChange={(val) => updateData({ longTermPrice: val })}
            onRetrospectiveChange={(val) => updateData({ retrospective: val })}
            onNext={() => setCurrentStep('interfacesMap')}
            onBack={() => setCurrentStep('focusControl')}
          />
        );
      
      case 'interfacesMap':
        return (
          <InterfacesMapStep
            interfaceJourney={data.interfaceJourney}
            onInterfaceJourneyChange={(interfaceJourney: InterfaceJourneyData) => updateData({ interfaceJourney })}
            onNext={() => setCurrentStep('coaching')}
            onBack={() => setCurrentStep('decisionsPrice')}
          />
        );
      
      case 'coaching':
        return (
          <CoachingStep
            coaching={data.coaching}
            onCoachingChange={(coaching: CoachingData) => updateData({ coaching })}
            onNext={() => setCurrentStep('teamHealth')}
            onBack={() => setCurrentStep('interfacesMap')}
          />
        );
      
      case 'teamHealth':
        return (
          <TeamHealthStep
            teamHealthData={data.teamHealthData}
            onTeamHealthDataChange={(teamHealthData: TeamHealthData) => updateData({ teamHealthData })}
            onNext={() => setCurrentStep('dashboard')}
            onBack={() => setCurrentStep('coaching')}
          />
        );
      
      case 'dashboard':
        return (
          <ManagementCompassDashboard 
            data={data} 
            onRestart={handleRestart} 
            onContinue={handleComplete}
            onBack={previousStep ? goBackFromDashboard : undefined}
          />
        );
      
      default:
        return <WelcomeScreen onStart={() => setCurrentStep('cardGame')} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Header />
      {showDashboardButton && (
        <div className="bg-card/80 backdrop-blur-sm border-b border-border px-4 py-2 flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToDashboard}
            className="gap-2 text-primary hover:text-primary/80"
          >
            <LayoutDashboard className="w-4 h-4" />
            צפייה בדשבורד
          </Button>
          <span className="text-xs text-muted-foreground">
            שלב {STEP_ORDER.indexOf(currentStep) + 1} מתוך {STEP_ORDER.length}
          </span>
        </div>
      )}
      <main className="flex-1">
        {renderStep()}
      </main>
      <Footer />
    </div>
  );
};

export default ManagementCompass;
