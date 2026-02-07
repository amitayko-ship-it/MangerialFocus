import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Clock, Zap, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/management-compass/layout/Header';
import Footer from '@/components/management-compass/layout/Footer';
import ExecutionNavBar from '@/components/execution/ExecutionNavBar';
import { saveWithExpiry, loadWithExpiry } from '@/lib/storageUtils';
import { BigRock, PracticeSchedule, ScheduledEvent, TimeWindow } from '@/types/focus';
import { toast } from 'sonner';

const FREQUENCY_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
const TIME_WINDOW_OPTIONS: { value: TimeWindow; label: string }[] = [
  { value: 'morning', label: 'בוקר' },
  { value: 'afternoon', label: 'צהריים' },
  { value: 'evening', label: 'ערב' },
];
const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

const timeWindowStartHour: Record<TimeWindow, number> = {
  morning: 8,
  afternoon: 13,
  evening: 18,
};

function generateICS(events: ScheduledEvent[]): string {
  const now = new Date();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - now.getDay());
  sunday.setHours(0, 0, 0, 0);

  const batchId = Date.now().toString(36);

  const fmtUtc = (d: Date) => {
    const utc = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return utc.getFullYear().toString() +
      String(utc.getMonth() + 1).padStart(2, '0') +
      String(utc.getDate()).padStart(2, '0') +
      'T' +
      String(utc.getHours()).padStart(2, '0') +
      String(utc.getMinutes()).padStart(2, '0') +
      '00Z';
  };

  const dtstamp = fmtUtc(now);

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FocusTracker//30DayPlan//HE',
    'CALSCALE:GREGORIAN',
  ];

  for (let week = 0; week < 4; week++) {
    events.forEach((event, idx) => {
      const eventDate = new Date(sunday);
      eventDate.setDate(sunday.getDate() + (week * 7) + event.day);
      const startHour = timeWindowStartHour[event.timeWindow];
      eventDate.setHours(startHour, 0, 0, 0);

      const endDate = new Date(eventDate);
      endDate.setMinutes(endDate.getMinutes() + event.duration);

      const uid = `focus-w${week}-e${idx}-${batchId}@focustracker`;

      ics.push(
        'BEGIN:VEVENT',
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${fmtUtc(eventDate)}`,
        `DTEND:${fmtUtc(endDate)}`,
        `SUMMARY:${event.practice}`,
        `DESCRIPTION:פרקטיקה מתוכנית 30 יום - ${event.duration} דקות`,
        `UID:${uid}`,
        'END:VEVENT'
      );
    });
  }

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}

function downloadICS(events: ScheduledEvent[]) {
  const content = generateICS(events);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'focus-30-day-plan.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ThirtyDayPlan() {
  const navigate = useNavigate();
  const rocks = loadWithExpiry<BigRock[]>('big-rocks-order');
  const selectedRock = rocks?.find(r => r.isBreakthrough) || rocks?.[0];
  const practices = selectedRock?.practices?.filter(p => p.trim()) || [];

  const [schedules, setSchedules] = useState<PracticeSchedule[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [scheduledEvents, setScheduledEvents] = useState<ScheduledEvent[]>([]);

  useEffect(() => {
    const saved = loadWithExpiry<{ schedules: PracticeSchedule[]; events: ScheduledEvent[] }>('execution-plan');
    if (saved) {
      setSchedules(saved.schedules);
      setScheduledEvents(saved.events);
      if (saved.events.length > 0) setShowCalendar(true);
    } else {
      setSchedules(practices.map(p => ({
        practice: p,
        weeklyFrequency: 2,
        duration: 30,
        timeWindow: 'morning' as TimeWindow,
      })));
    }
  }, []);

  const totalWeeklyMinutes = useMemo(() =>
    schedules.reduce((sum, s) => sum + s.weeklyFrequency * s.duration, 0),
    [schedules]
  );

  const totalWeeklyHours = (totalWeeklyMinutes / 60).toFixed(1);

  const energyLevel = useMemo(() => {
    const weeklyAvailableMinutes = 40 * 60;
    const pct = (totalWeeklyMinutes / weeklyAvailableMinutes) * 100;
    if (pct <= 20) return 'green';
    if (pct <= 35) return 'orange';
    return 'red';
  }, [totalWeeklyMinutes]);

  const energyColors = {
    green: 'bg-green-100 text-green-800 border-green-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    red: 'bg-red-100 text-red-800 border-red-200',
  };

  const updateSchedule = (index: number, field: keyof PracticeSchedule, value: number | string) => {
    setSchedules(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleDurationChange = (index: number, val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0 && num <= 480) {
      updateSchedule(index, 'duration', num);
    } else if (val === '') {
      updateSchedule(index, 'duration', 0);
    }
  };

  const autoSchedule = () => {
    const events: ScheduledEvent[] = [];
    schedules.forEach(schedule => {
      if (schedule.duration <= 0) return;
      const spacing = Math.floor(7 / schedule.weeklyFrequency);
      for (let i = 0; i < schedule.weeklyFrequency; i++) {
        const day = (i * spacing) % 7;
        events.push({
          practice: schedule.practice,
          day,
          timeWindow: schedule.timeWindow,
          duration: schedule.duration,
        });
      }
    });
    setScheduledEvents(events);
    setShowCalendar(true);
  };

  const handleDownloadCalendar = () => {
    if (scheduledEvents.length === 0) {
      toast.error('אין אירועים לייצא');
      return;
    }
    downloadICS(scheduledEvents);
    toast.success('קובץ יומן הורד! ניתן לייבא אותו ליומן שלך');
  };

  const handleContinue = () => {
    saveWithExpiry('execution-plan', {
      rockTitle: selectedRock?.title || '',
      schedules,
      events: scheduledEvents,
      totalWeeklyMinutes,
    });
    toast.success('התוכנית נשמרה!');
    navigate('/dashboard');
  };

  const handleBack = () => {
    saveWithExpiry('execution-plan', {
      rockTitle: selectedRock?.title || '',
      schedules,
      events: scheduledEvents,
      totalWeeklyMinutes,
    });
    navigate('/setup/keystone-success');
  };

  const getEventsForDay = (day: number) =>
    scheduledEvents.filter(e => e.day === day);

  const timeWindowOrder: TimeWindow[] = ['morning', 'afternoon', 'evening'];
  const timeWindowLabel: Record<TimeWindow, string> = {
    morning: 'בוקר',
    afternoon: 'צהריים',
    evening: 'ערב',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex flex-col" dir="rtl">
      <Header />
      <ExecutionNavBar />

      <main className="flex-1 p-4">
        <div className="w-full max-w-2xl mx-auto space-y-6 py-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">תוכנית 30 יום</h1>
            <p className="text-muted-foreground text-sm">פרקטיקות → זמן ביומן</p>
          </motion.div>

          <Card>
            <CardContent className="p-4 space-y-1">
              <p className="text-sm text-muted-foreground">האבן הגדולה:</p>
              <p className="font-semibold text-lg">{selectedRock?.title || '—'}</p>
              {practices.length > 0 && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-1">הפרקטיקות:</p>
                  <ul className="space-y-1">
                    {practices.map((p, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              תדירות ומשך
            </h2>

            {schedules.map((schedule, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <p className="font-medium text-sm">{schedule.practice}</p>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">פעמים בשבוע</label>
                        <div className="flex flex-wrap gap-1">
                          {FREQUENCY_OPTIONS.map(f => (
                            <button
                              key={f}
                              onClick={() => updateSchedule(index, 'weeklyFrequency', f)}
                              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                schedule.weeklyFrequency === f
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted hover:bg-muted/80'
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">כמה דקות לפעילות?</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="5"
                            max="480"
                            value={schedule.duration || ''}
                            onChange={(e) => handleDurationChange(index, e.target.value)}
                            placeholder="30"
                            className={`w-20 h-10 rounded-lg border bg-background text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                              schedule.duration <= 0 ? 'border-red-300' : 'border-border'
                            }`}
                          />
                          <span className="text-xs text-muted-foreground">דקות</span>
                        </div>
                        {schedule.duration <= 0 && (
                          <p className="text-[11px] text-red-500">נא להזין משך זמן</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">חלון זמן</label>
                        <div className="flex flex-col gap-1">
                          {TIME_WINDOW_OPTIONS.map(tw => (
                            <button
                              key={tw.value}
                              onClick={() => updateSchedule(index, 'timeWindow', tw.value)}
                              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                schedule.timeWindow === tw.value
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted hover:bg-muted/80'
                              }`}
                            >
                              {tw.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className={`p-4 rounded-xl border flex items-center justify-between ${energyColors[energyLevel]}`}>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <span className="font-medium text-sm">עומס שבועי: {totalWeeklyHours} שעות</span>
              </div>
              <span className="text-xs opacity-70">{totalWeeklyMinutes} דקות</span>
            </div>
          </motion.div>

          {!showCalendar && (
            <Button onClick={autoSchedule} className="w-full gap-2" size="lg" disabled={schedules.length === 0 || schedules.every(s => s.duration <= 0)}>
              <Calendar className="w-4 h-4" />
              שבץ לי ביומן
            </Button>
          )}

          {showCalendar && scheduledEvents.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">תצוגת שבוע</h3>
                    <Button variant="ghost" size="sm" onClick={autoSchedule} className="text-xs">
                      שבץ מחדש
                    </Button>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {DAY_NAMES.map((day, i) => (
                      <div key={i} className="text-center">
                        <div className="text-xs font-medium text-muted-foreground mb-1 pb-1 border-b">{day}</div>
                        <div className="space-y-1 min-h-[60px]">
                          {timeWindowOrder.map(tw => {
                            const dayEvents = getEventsForDay(i).filter(e => e.timeWindow === tw);
                            return dayEvents.map((event, ei) => (
                              <div
                                key={`${tw}-${ei}`}
                                className="text-[10px] leading-tight p-1 rounded bg-primary/10 text-primary border border-primary/20"
                                title={`${event.practice} - ${event.duration} דקות - ${timeWindowLabel[tw]}`}
                              >
                                <div className="truncate font-medium">{event.practice.substring(0, 8)}</div>
                                <div className="opacity-70">{event.duration}ד׳</div>
                              </div>
                            ));
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t">
                    <Button onClick={handleDownloadCalendar} variant="outline" className="w-full gap-2">
                      <Download className="w-4 h-4" />
                      הורד קובץ יומן (.ics)
                    </Button>
                    <p className="text-[11px] text-muted-foreground text-center mt-2">
                      ניתן לייבא את הקובץ ליומן Google, Outlook או Apple Calendar
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ChevronRight className="h-4 w-4 ml-2" />
              חזרה
            </Button>
            <Button onClick={handleContinue} className="flex-1">
              סיום ומעבר לדשבורד
              <ChevronLeft className="h-4 w-4 mr-2" />
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
