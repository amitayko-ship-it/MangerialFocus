import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Users, Mail, Copy, Check, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import Header from '@/components/management-compass/layout/Header';
import Footer from '@/components/management-compass/layout/Footer';
import ExecutionNavBar from '@/components/execution/ExecutionNavBar';
import { saveWithExpiry, loadWithExpiry } from '@/lib/storageUtils';
import { ExecutionStakeholder, StakeholderRole, BigRock } from '@/types/focus';
import { toast } from 'sonner';

const ROLE_OPTIONS: { value: StakeholderRole; label: string }[] = [
  { value: 'partner', label: 'שותף' },
  { value: 'approver', label: 'מאשר' },
  { value: 'fyi', label: 'לידיעה' },
];

const ROLE_LABELS: Record<StakeholderRole, string> = {
  partner: 'שותף',
  approver: 'מאשר',
  fyi: 'לידיעה',
};

export default function ExecutionStakeholders() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [stakeholders, setStakeholders] = useState<ExecutionStakeholder[]>([]);
  const [newName, setNewName] = useState('');
  const [messageSheet, setMessageSheet] = useState<{ open: boolean; stakeholder: ExecutionStakeholder | null }>({
    open: false,
    stakeholder: null,
  });
  const [editingMessage, setEditingMessage] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const rocks = loadWithExpiry<BigRock[]>('big-rocks-order');
  const selectedRock = rocks?.find(r => r.isBreakthrough) || rocks?.[0];

  useEffect(() => {
    const saved = loadWithExpiry<ExecutionStakeholder[]>('execution-stakeholders');
    if (saved && saved.length > 0) {
      setStakeholders(saved);
    }
  }, []);

  const saveStakeholders = (updated: ExecutionStakeholder[]) => {
    setStakeholders(updated);
    saveWithExpiry('execution-stakeholders', updated);
  };

  const handleAddPerson = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (stakeholders.some(s => s.name === trimmed)) {
      toast.error('השם כבר קיים');
      return;
    }
    const newStakeholder: ExecutionStakeholder = {
      id: `s-${Date.now()}`,
      name: trimmed,
      role: 'partner',
      ask: '',
      status: 'none',
    };
    saveStakeholders([...stakeholders, newStakeholder]);
    setNewName('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPerson();
    }
  };

  const handleRemove = (id: string) => {
    saveStakeholders(stakeholders.filter(s => s.id !== id));
  };

  const handleUpdate = (id: string, field: keyof ExecutionStakeholder, value: string) => {
    saveStakeholders(stakeholders.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleStatusToggle = (id: string, field: 'asked' | 'approved') => {
    saveStakeholders(stakeholders.map(s => {
      if (s.id !== id) return s;
      if (field === 'asked') {
        return { ...s, status: s.status === 'asked' || s.status === 'approved' ? 'none' : 'asked' };
      }
      return { ...s, status: s.status === 'approved' ? 'asked' : 'approved' };
    }));
  };

  const generateMessage = (s: ExecutionStakeholder): string => {
    const rockTitle = selectedRock?.title || 'המיקוד שלי';
    const askText = s.ask || 'תמיכה';
    return `היי ${s.name}, אני בפוקוס של 30 יום על ${rockTitle}. אשמח לבקש ממך ${askText} באופן קבוע. מתאים?`;
  };

  const openMessageSheet = (s: ExecutionStakeholder) => {
    const msg = generateMessage(s);
    setCustomMessage(msg);
    setEditingMessage(false);
    setCopied(false);
    setMessageSheet({ open: true, stakeholder: s });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(customMessage);
      setCopied(true);
      toast.success('ההודעה הועתקה');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('לא הצלחנו להעתיק');
    }
  };

  const handleContinue = () => {
    saveWithExpiry('execution-stakeholders', stakeholders);
    navigate('/setup/keystone-success');
  };

  const handleBack = () => {
    navigate('/setup/focus-area');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex flex-col" dir="rtl">
      <Header />
      <ExecutionNavBar />

      <main className="flex-1 p-4">
        <div className="w-full max-w-2xl mx-auto space-y-6 py-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">מי צריך להיות איתך ב־30 הימים הקרובים?</h1>
            <p className="text-muted-foreground text-sm">זהה מי צריך לזוז יחד איתך והוצא בקשה בפועל</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="הקלד שם + Enter"
                className="flex-1"
              />
              <Button onClick={handleAddPerson} size="icon" disabled={!newName.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          <AnimatePresence mode="popLayout">
            {stakeholders.map((s, index) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">{s.name}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleRemove(s.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      {ROLE_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => handleUpdate(s.id, 'role', opt.value)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            s.role === opt.value
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    <Input
                      value={s.ask}
                      onChange={e => {
                        if (e.target.value.length <= 50) {
                          handleUpdate(s.id, 'ask', e.target.value);
                        }
                      }}
                      placeholder="מה אתה מבקש? (עד 50 תווים)"
                      className="text-sm"
                    />
                    <div className="text-xs text-muted-foreground text-left">{s.ask.length}/50</div>

                    <div className="flex items-center justify-between pt-1">
                      <Button variant="outline" size="sm" onClick={() => openMessageSheet(s)} className="gap-1.5 text-xs">
                        <Mail className="w-3.5 h-3.5" />
                        צור הודעה
                      </Button>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox
                            checked={s.status === 'asked' || s.status === 'approved'}
                            onCheckedChange={() => handleStatusToggle(s.id, 'asked')}
                          />
                          ביקשתי
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox
                            checked={s.status === 'approved'}
                            onCheckedChange={() => handleStatusToggle(s.id, 'approved')}
                            disabled={s.status === 'none'}
                          />
                          קיבלתי אישור
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {stakeholders.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>עדיין לא הוספת אנשים</p>
              <p className="text-sm">הקלד שם למעלה ולחץ Enter</p>
            </motion.div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ChevronRight className="h-4 w-4 ml-2" />
              חזרה
            </Button>
            <Button onClick={handleContinue} className="flex-1">
              המשך
              <ChevronLeft className="h-4 w-4 mr-2" />
            </Button>
          </div>
        </div>
      </main>

      <Sheet open={messageSheet.open} onOpenChange={open => setMessageSheet(prev => ({ ...prev, open }))}>
        <SheetContent side="bottom" className="rounded-t-2xl" dir="rtl">
          <SheetHeader>
            <SheetTitle>הודעה ל{messageSheet.stakeholder?.name}</SheetTitle>
            <SheetDescription>העתק את ההודעה ושלח בעצמך</SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            {editingMessage ? (
              <textarea
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                className="w-full p-3 border rounded-lg text-sm min-h-[100px] resize-none bg-background"
                dir="rtl"
              />
            ) : (
              <div className="p-4 bg-muted rounded-lg text-sm leading-relaxed">
                {customMessage}
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleCopy} className="flex-1 gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'הועתק!' : 'העתק'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingMessage(!editingMessage)}
                className="gap-2"
              >
                <Pencil className="w-4 h-4" />
                {editingMessage ? 'סיום עריכה' : 'ערוך'}
              </Button>
              <Button variant="ghost" onClick={() => setMessageSheet({ open: false, stakeholder: null })}>
                סגור
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Footer />
    </div>
  );
}
