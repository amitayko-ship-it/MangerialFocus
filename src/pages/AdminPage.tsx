import React, { useState, useCallback } from 'react';
import { Users, RefreshCw, LogOut, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserRow {
  id: number;
  full_name: string | null;
  email: string;
  gender: string | null;
  created_at: string;
  last_login_at: string | null;
  current_step: string;
  axes_completed: boolean;
  personal_development_completed: boolean;
  progress_updated_at: string | null;
}

const STEP_LABELS: Record<string, string> = {
  not_started: 'לא התחיל',
  selfAssessment: 'שאלון אבחון',
  personalDevelopment: 'תוכנית התפתחות',
  dashboard: 'הושלם',
};

const STEP_COLOR: Record<string, string> = {
  not_started: 'text-muted-foreground',
  selfAssessment: 'text-blue-600',
  personalDevelopment: 'text-orange-600',
  dashboard: 'text-emerald-600',
};

function fmt(dateStr: string | null): string {
  if (!dateStr) return '–';
  return new Date(dateStr).toLocaleString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StepBadge({ step }: { step: string }) {
  const label = STEP_LABELS[step] ?? step;
  const color = STEP_COLOR[step] ?? 'text-foreground';
  return (
    <span className={`font-medium text-sm ${color}`}>{label}</span>
  );
}

function LoginScreen({ onLogin }: { onLogin: (pw: string) => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'x-admin-password': pw },
      });
      if (res.ok) {
        sessionStorage.setItem('admin_pw', pw);
        onLogin(pw);
      } else {
        setError('סיסמה שגויה');
      }
    } catch {
      setError('שגיאת חיבור');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-medium">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center">
            <Users className="w-7 h-7 text-primary" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-center text-foreground mb-6">ממשק ניהול</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">סיסמת מנהל</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="הכנס סיסמה..."
              required
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'מתחבר...' : 'כניסה'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState<string | null>(() =>
    sessionStorage.getItem('admin_pw')
  );
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchUsers = useCallback(async (pw: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'x-admin-password': pw },
      });
      if (!res.ok) {
        if (res.status === 403) {
          setPassword(null);
          sessionStorage.removeItem('admin_pw');
          return;
        }
        throw new Error('שגיאה בשליפת נתונים');
      }
      const data = await res.json();
      setUsers(data);
      setLastFetched(new Date());
    } catch (e: any) {
      setError(e.message ?? 'שגיאה');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (pw: string) => {
    setPassword(pw);
    fetchUsers(pw);
  };

  // Auto-fetch on first load if password is already stored
  React.useEffect(() => {
    if (password) fetchUsers(password);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const logout = () => {
    sessionStorage.removeItem('admin_pw');
    setPassword(null);
    setUsers([]);
  };

  if (!password) return <LoginScreen onLogin={handleLogin} />;

  const total = users.length;
  const started = users.filter((u) => u.current_step !== 'not_started').length;
  const completed = users.filter((u) => u.current_step === 'dashboard').length;
  const inProgress = started - completed;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">ממשק ניהול משתמשים</h1>
        </div>
        <div className="flex items-center gap-2">
          {lastFetched && (
            <span className="text-xs text-muted-foreground">
              עודכן: {lastFetched.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => password && fetchUsers(password)}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            רענן
          </Button>
          <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-muted-foreground">
            <LogOut className="w-4 h-4" />
            יציאה
          </Button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'סה"כ משתמשים', value: total, icon: Users, color: 'text-foreground' },
            { label: 'התחילו שאלון', value: started, icon: Clock, color: 'text-blue-600' },
            { label: 'בתהליך', value: inProgress, icon: Circle, color: 'text-orange-600' },
            { label: 'השלימו', value: completed, icon: CheckCircle2, color: 'text-emerald-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-right">
                  <th className="px-4 py-3 font-semibold text-foreground">שם</th>
                  <th className="px-4 py-3 font-semibold text-foreground">מייל</th>
                  <th className="px-4 py-3 font-semibold text-foreground">מגדר</th>
                  <th className="px-4 py-3 font-semibold text-foreground">נרשם</th>
                  <th className="px-4 py-3 font-semibold text-foreground">כניסה אחרונה</th>
                  <th className="px-4 py-3 font-semibold text-foreground">שלב נוכחי</th>
                  <th className="px-4 py-3 font-semibold text-foreground">שאלון</th>
                  <th className="px-4 py-3 font-semibold text-foreground">תוכנית</th>
                  <th className="px-4 py-3 font-semibold text-foreground">עדכון אחרון</th>
                </tr>
              </thead>
              <tbody>
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                      טוען נתונים...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                      אין משתמשים עדיין
                    </td>
                  </tr>
                ) : (
                  users.map((u, idx) => (
                    <tr
                      key={u.id}
                      className={`border-b border-border last:border-0 ${idx % 2 === 0 ? '' : 'bg-muted/20'}`}
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {u.full_name || <span className="text-muted-foreground italic">ללא שם</span>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {u.gender === 'female' ? 'נקבה' : u.gender === 'male' ? 'זכר' : '–'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{fmt(u.created_at)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{fmt(u.last_login_at)}</td>
                      <td className="px-4 py-3">
                        <StepBadge step={u.current_step} />
                      </td>
                      <td className="px-4 py-3">
                        {u.axes_completed
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          : <Circle className="w-4 h-4 text-muted-foreground/40" />}
                      </td>
                      <td className="px-4 py-3">
                        {u.personal_development_completed
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          : <Circle className="w-4 h-4 text-muted-foreground/40" />}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{fmt(u.progress_updated_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
