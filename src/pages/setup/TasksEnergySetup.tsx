import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { saveWithExpiry, loadWithExpiry } from '@/lib/storageUtils';

interface Task {
  text: string;
  recurring: boolean;
}

export default function TasksEnergySetup() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([{ text: '', recurring: false }]);
  const [energyBoosters, setEnergyBoosters] = useState<string[]>(['']);
  const [weeklyHours, setWeeklyHours] = useState<number>(50);

  useEffect(() => {
    // Load from localStorage on mount
    const saved = loadWithExpiry<any>('focus-tracker-onboarding');
    if (saved) {
      if (saved.tasks && saved.tasks.length > 0) {
        setTasks(saved.tasks);
      }
      if (saved.energyBoosters && saved.energyBoosters.length > 0) {
        setEnergyBoosters(saved.energyBoosters);
      }
      if (saved.weeklyHours) {
        setWeeklyHours(saved.weeklyHours);
      }
    }
  }, []);

  const handleAddTask = () => {
    setTasks([...tasks, { text: '', recurring: false }]);
  };

  const handleRemoveTask = (index: number) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  const handleTaskChange = (index: number, text: string) => {
    const newTasks = [...tasks];
    newTasks[index].text = text;
    setTasks(newTasks);
  };

  const handleTaskRecurringChange = (index: number, recurring: boolean) => {
    const newTasks = [...tasks];
    newTasks[index].recurring = recurring;
    setTasks(newTasks);
  };

  const handleAddBooster = () => {
    setEnergyBoosters([...energyBoosters, '']);
  };

  const handleRemoveBooster = (index: number) => {
    if (energyBoosters.length > 1) {
      setEnergyBoosters(energyBoosters.filter((_, i) => i !== index));
    }
  };

  const handleBoosterChange = (index: number, value: string) => {
    const newBoosters = [...energyBoosters];
    newBoosters[index] = value;
    setEnergyBoosters(newBoosters);
  };

  const handleContinue = () => {
    const saved = loadWithExpiry<any>('focus-tracker-onboarding') || {};
    const filteredTasks = tasks.filter(t => t.text.trim() !== '');
    const filteredBoosters = energyBoosters.filter(b => b.trim() !== '');

    saveWithExpiry('focus-tracker-onboarding', {
      ...saved,
      tasks: filteredTasks,
      energyBoosters: filteredBoosters,
      weeklyHours,
    });

    navigate('/setup/stakeholders');
  };

  const handleBack = () => {
    navigate('/setup/focus-area');
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
            <CardTitle className="text-3xl">{t.tasks.title}</CardTitle>
            <CardDescription className="text-lg mt-2">
              {t.tasks.subtitle}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Weekly Tasks Section */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">{t.tasks.weeklyTasks}</Label>
              <AnimatePresence>
                {tasks.map((task, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-3 items-start"
                  >
                    <div className="flex-1 space-y-2">
                      <Input
                        value={task.text}
                        onChange={(e) => handleTaskChange(index, e.target.value)}
                        placeholder={t.tasks.taskPlaceholder}
                      />
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`recurring-${index}`}
                          checked={task.recurring}
                          onCheckedChange={(checked) => handleTaskRecurringChange(index, checked as boolean)}
                        />
                        <label
                          htmlFor={`recurring-${index}`}
                          className="text-sm text-muted-foreground cursor-pointer"
                        >
                          {isRTL ? 'חוזר' : 'Recurring'}
                        </label>
                      </div>
                    </div>
                    {tasks.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTask(index)}
                        className="mt-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <Button
                variant="outline"
                onClick={handleAddTask}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t.tasks.addTask}
              </Button>
            </div>

            {/* Energy Boosters Section */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">{t.tasks.energyBoosters}</Label>
              <AnimatePresence>
                {energyBoosters.map((booster, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-3 items-center"
                  >
                    <Input
                      value={booster}
                      onChange={(e) => handleBoosterChange(index, e.target.value)}
                      placeholder={t.tasks.boosterPlaceholder}
                      className="flex-1"
                    />
                    {energyBoosters.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveBooster(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <Button
                variant="outline"
                onClick={handleAddBooster}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t.tasks.addBooster}
              </Button>
            </div>

            {/* Weekly Hours Input */}
            <div className="space-y-2">
              <Label htmlFor="weeklyHours" className="text-lg font-semibold">
                {t.tasks.weeklyHours}
              </Label>
              <Input
                id="weeklyHours"
                type="number"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                min={1}
                max={168}
              />
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
