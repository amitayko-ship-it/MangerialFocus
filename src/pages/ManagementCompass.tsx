import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/management-compass/layout/Header';
import Footer from '@/components/management-compass/layout/Footer';
import WelcomeScreen from '@/components/management-compass/WelcomeScreen';
import QuestionnaireIntroStep from '@/components/management-compass/QuestionnaireIntroStep';
import SelfAssessmentStep from '@/components/management-compass/SelfAssessmentStep';
import PersonalDevelopmentStep from '@/components/management-compass/PersonalDevelopmentStep';
import ManagementCompassDashboard from '@/components/management-compass/ManagementCompassDashboard';
import { QuestionnaireData, initialQuestionnaireData, AxesData, PersonalDevelopmentData, bigStones } from '@/types/managementCompass';
import { saveWithExpiry, loadWithExpiry } from '@/lib/storageUtils';

async function reportProgress(currentStep: string, data: QuestionnaireData) {
  try {
    const axesCompleted = bigStones.every((s) => s.axes.every((ax) => data.axes[ax.key] > 0));
    const personalDevelopmentCompleted = data.personalDevelopment.developmentLeap !== null;
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        currentStep,
        axesCompleted,
        personalDevelopmentCompleted,
        questionnaireData: data,
      }),
    });
  } catch {
    // fail silently – progress tracking is non-critical
  }
}

const STORAGE_KEY = 'management-compass-data';
const STEP_STORAGE_KEY = 'management-compass-step';

type Step = 'welcome' | 'questionnaireIntro' | 'selfAssessment' | 'personalDevelopment' | 'dashboard';

const STEP_ORDER: Step[] = [
  'welcome',
  'questionnaireIntro',
  'selfAssessment',
  'personalDevelopment',
  'dashboard',
];

const isAssessmentComplete = (data: QuestionnaireData) =>
  bigStones.every((stone) => stone.axes.every((ax) => data.axes[ax.key] > 0));

const isPersonalDevelopmentComplete = (data: QuestionnaireData) =>
  data.personalDevelopment.developmentLeap !== null;

const ManagementCompass: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<Step>(() => {
    const saved = loadWithExpiry<string>(STEP_STORAGE_KEY);
    if (!saved || !STEP_ORDER.includes(saved as Step)) return 'welcome';
    return saved as Step;
  });

  const [data, setData] = useState<QuestionnaireData>(() => {
    const saved = loadWithExpiry<QuestionnaireData>(STORAGE_KEY);
    return saved || initialQuestionnaireData;
  });

  useEffect(() => {
    saveWithExpiry(STORAGE_KEY, data);
  }, [data]);

  useEffect(() => {
    saveWithExpiry(STEP_STORAGE_KEY, currentStep);
    if (['selfAssessment', 'personalDevelopment', 'dashboard'].includes(currentStep)) {
      reportProgress(currentStep, data);
    }
  }, [currentStep]);

  const updateAxes = (axes: AxesData) => {
    setData((prev) => ({ ...prev, axes }));
  };

  const updatePersonalDevelopment = (personalDevelopment: PersonalDevelopmentData) => {
    setData((prev) => ({ ...prev, personalDevelopment }));
  };

  const handleComplete = () => {
    navigate('/intro-video');
  };

  const handleRestart = () => {
    setData(initialQuestionnaireData);
    setCurrentStep('welcome');
  };

  const showOnWelcome = currentStep === 'welcome' || currentStep === 'questionnaireIntro';
  const assessmentDone = isAssessmentComplete(data);
  const personalDone = isPersonalDevelopmentComplete(data);

  const navTabs: { key: Step; label: string; enabled: boolean }[] = [
    {
      key: 'selfAssessment',
      label: 'שאלון אבחון',
      enabled: true,
    },
    {
      key: 'personalDevelopment',
      label: 'תוכנית התפתחות אישית',
      enabled: assessmentDone,
    },
    {
      key: 'dashboard',
      label: 'תוצאות',
      enabled: personalDone,
    },
  ];

  const activeNavKey: Step | null = (() => {
    if (currentStep === 'selfAssessment' || currentStep === 'questionnaireIntro') return 'selfAssessment';
    if (currentStep === 'personalDevelopment') return 'personalDevelopment';
    if (currentStep === 'dashboard') return 'dashboard';
    return null;
  })();

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeScreen onStart={() => setCurrentStep('questionnaireIntro')} />;

      case 'questionnaireIntro':
        return (
          <QuestionnaireIntroStep
            userName={user?.full_name || ''}
            onNext={() => setCurrentStep('selfAssessment')}
            onBack={() => setCurrentStep('welcome')}
          />
        );

      case 'selfAssessment':
        return (
          <SelfAssessmentStep
            axes={data.axes}
            onAxesChange={updateAxes}
            onNext={() => setCurrentStep('personalDevelopment')}
            onBack={() => setCurrentStep('questionnaireIntro')}
            gender={(user?.gender as 'male' | 'female') || 'male'}
          />
        );

      case 'personalDevelopment':
        return (
          <PersonalDevelopmentStep
            data={data.personalDevelopment}
            onChange={updatePersonalDevelopment}
            onNext={() => setCurrentStep('dashboard')}
            onBack={() => setCurrentStep('selfAssessment')}
            gender={(user?.gender as 'male' | 'female') || 'male'}
          />
        );

      case 'dashboard':
        return (
          <ManagementCompassDashboard
            data={data}
            onRestart={handleRestart}
            onContinue={handleComplete}
            onBack={() => setCurrentStep('personalDevelopment')}
          />
        );

      default:
        return <WelcomeScreen onStart={() => setCurrentStep('questionnaireIntro')} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Header />

      {!showOnWelcome && (
        <nav className="bg-card border-b border-border px-4">
          <div className="max-w-2xl mx-auto flex">
            {navTabs.map((tab) => {
              const isActive = activeNavKey === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => tab.enabled && setCurrentStep(tab.key)}
                  disabled={!tab.enabled}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-primary text-primary'
                      : tab.enabled
                      ? 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                      : 'border-transparent text-muted-foreground/40 cursor-not-allowed'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      <main className="flex-1">{renderStep()}</main>
      <Footer />
    </div>
  );
};

export default ManagementCompass;
