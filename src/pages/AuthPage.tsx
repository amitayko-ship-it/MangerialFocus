import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

const AuthPage: React.FC = () => {
  const { user, signIn, signUp, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/management-compass');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn(email, password);
    
    if (result.error) {
      setError(result.error);
    } else {
      navigate('/management-compass');
    }
    
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signUp(email, password, fullName, gender);
    
    if (result.error) {
      setError(result.error);
    } else {
      navigate('/management-compass');
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await forgotPassword(email);
    
    if (result.error) {
      setError(result.error);
    } else if (result.emailSent) {
      setMode('reset');
      setSuccess('קוד איפוס נשלח לכתובת המייל שלך - בדוק את תיבת הדואר (כולל תיקיית ספאם)');
    } else if (result.resetToken) {
      setResetToken(result.resetToken);
      setMode('reset');
      setSuccess('קוד איפוס נוצר (מצב פיתוח) - הזן אותו עם הסיסמא החדשה');
    } else {
      setError('שגיאה בשליחת המייל. אנא נסה שוב מאוחר יותר');
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await resetPassword(resetToken, newPassword);
    
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('הסיסמא אופסה בהצלחה! כעת תוכל להתחבר');
      setMode('login');
      setResetToken('');
      setNewPassword('');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50/40 via-background to-green-50/20 flex flex-col" dir="rtl">
      <header className="w-full">
        <div className="p-4 flex justify-center">
          <div className="flex items-center gap-3">
            <img 
              src="/milestone-logo.png" 
              alt="מיילסטון - מובילים מטבעם" 
              className="h-10 object-contain"
            />
            <span className="text-sm text-muted-foreground font-medium hidden sm:inline">מערכת ניהול סדנאות ולוגיסטיקה</span>
          </div>
        </div>
        <div className="h-0.5 bg-gradient-to-l from-brand-yellow via-brand-yellow/60 to-transparent" />
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">מצפן הניהול</h1>
          <p className="text-muted-foreground mt-2">
            {mode === 'login' && 'התחבר לחשבון שלך'}
            {mode === 'register' && 'צור חשבון חדש'}
            {mode === 'forgot' && 'איפוס סיסמא'}
            {mode === 'reset' && 'הזן סיסמא חדשה'}
          </p>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-stone border border-border">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-500/10 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">
              {success}
            </div>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">מייל</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pr-10"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">סיסמא</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="pr-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'מתחבר...' : 'התחבר'}
              </Button>

              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-primary hover:underline"
                >
                  שכחתי סיסמא
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-primary hover:underline"
                >
                  צור חשבון חדש
                </button>
              </div>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">שם מלא</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="השם שלך"
                    className="pr-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">לשון פניה</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-2 px-4 rounded-lg border-2 transition-all ${
                      gender === 'male'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    👨 זכר
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-2 px-4 rounded-lg border-2 transition-all ${
                      gender === 'female'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    👩 נקבה
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">מייל</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pr-10"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">סיסמא (לפחות 6 תווים)</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="pr-10"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'נרשם...' : 'צור חשבון'}
              </Button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-sm text-primary hover:underline"
              >
                יש לי כבר חשבון
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">מייל</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pr-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'שולח...' : 'שלח קוד איפוס'}
              </Button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                חזרה להתחברות
              </button>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">קוד איפוס</label>
                <Input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="הקוד שקיבלת"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">סיסמא חדשה</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••"
                    className="pr-10"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'מאפס...' : 'אפס סיסמא'}
              </Button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                חזרה להתחברות
              </button>
            </form>
          )}
        </div>
      </div>
      </div>

      <footer className="py-5 px-4">
        <div className="border-t border-border/60 pt-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-semibold text-muted-foreground/70 tracking-wide">Milestone</span>
            <span className="text-xs text-muted-foreground/50 tracking-wider">Lead by nature</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
