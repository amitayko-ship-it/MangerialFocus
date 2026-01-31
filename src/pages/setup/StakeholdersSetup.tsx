import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Plus, X, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { saveWithExpiry, loadWithExpiry } from '@/lib/storageUtils';
import { Stakeholder } from '@/types/focus';

export default function StakeholdersSetup() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [dependencyLevel, setDependencyLevel] = useState<number>(50);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([{ name: '', role: '' }]);

  useEffect(() => {
    // Load from localStorage on mount
    const saved = loadWithExpiry<any>('focus-tracker-onboarding');
    if (saved) {
      if (saved.dependencyLevel !== undefined) {
        setDependencyLevel(saved.dependencyLevel);
      }
      if (saved.stakeholders && saved.stakeholders.length > 0) {
        setStakeholders(saved.stakeholders);
      }
    }
  }, []);

  const handleAddStakeholder = () => {
    setStakeholders([...stakeholders, { name: '', role: '' }]);
  };

  const handleRemoveStakeholder = (index: number) => {
    if (stakeholders.length > 1) {
      setStakeholders(stakeholders.filter((_, i) => i !== index));
    }
  };

  const handleStakeholderChange = (index: number, field: 'name' | 'role', value: string) => {
    const newStakeholders = [...stakeholders];
    newStakeholders[index][field] = value;
    setStakeholders(newStakeholders);
  };

  const handleContinue = () => {
    const saved = loadWithExpiry<any>('focus-tracker-onboarding') || {};
    const filteredStakeholders = stakeholders.filter(s => s.name.trim() !== '' || s.role.trim() !== '');

    saveWithExpiry('focus-tracker-onboarding', {
      ...saved,
      stakeholders: filteredStakeholders,
      dependencyLevel,
    });

    navigate('/setup/summary');
  };

  const handleBack = () => {
    navigate('/setup/tasks-energy');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container max-w-4xl mx-auto px-4 py-12"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <CardTitle className="text-3xl">{t.stakeholders.title}</CardTitle>
                <CardDescription className="text-lg mt-2">
                  {t.stakeholders.subtitle}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Dependency Level Slider */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">
                {t.stakeholders.dependencyLabel}
              </Label>
              <div className="space-y-4">
                <Slider
                  value={[dependencyLevel]}
                  onValueChange={(values) => setDependencyLevel(values[0])}
                  min={0}
                  max={100}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>0% - {t.stakeholders.independent}</span>
                  <span className="font-semibold text-primary">{dependencyLevel}%</span>
                  <span>100% - {t.stakeholders.dependent}</span>
                </div>
              </div>
            </div>

            {/* Stakeholder List */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">{t.stakeholders.list}</Label>
              <AnimatePresence>
                {stakeholders.map((stakeholder, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-3 items-start"
                  >
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`name-${index}`} className="text-sm">
                          {t.stakeholders.name}
                        </Label>
                        <Input
                          id={`name-${index}`}
                          value={stakeholder.name}
                          onChange={(e) => handleStakeholderChange(index, 'name', e.target.value)}
                          placeholder={t.stakeholders.name}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`role-${index}`} className="text-sm">
                          {t.stakeholders.role}
                        </Label>
                        <Input
                          id={`role-${index}`}
                          value={stakeholder.role}
                          onChange={(e) => handleStakeholderChange(index, 'role', e.target.value)}
                          placeholder={t.stakeholders.role}
                        />
                      </div>
                    </div>
                    {stakeholders.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveStakeholder(index)}
                        className="mt-7"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <Button
                variant="outline"
                onClick={handleAddStakeholder}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t.stakeholders.addStakeholder}
              </Button>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                {isRTL ? <ArrowRight className="h-4 w-4 ml-2" /> : <ArrowLeft className="h-4 w-4 mr-2" />}
                {t.common.back}
              </Button>
              <Button
                onClick={handleContinue}
                className="flex-1"
              >
                {t.common.continue}
                {isRTL ? <ArrowLeft className="h-4 w-4 mr-2" /> : <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
