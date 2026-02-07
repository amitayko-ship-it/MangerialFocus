import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Target, Compass, Eye, Mountain, ClipboardList, LayoutDashboard, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/management-compass', label: 'שאלון', icon: Compass },
  { path: '/setup/vision', label: 'תמונת עתיד', icon: Eye },
  { path: '/setup/focus-area', label: 'אבנים גדולות', icon: Mountain },
  { path: '/setup/execution-stakeholders', label: 'תוכנית עבודה', icon: ClipboardList },
  { path: '/dashboard', label: 'לוח הבקרה', icon: LayoutDashboard },
];

export function FloatingNav() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/management-compass') {
      return location.pathname === '/management-compass';
    }
    if (path === '/setup/execution-stakeholders') {
      return ['/setup/execution-stakeholders', '/setup/keystone-success', '/setup/thirty-day-plan'].includes(location.pathname);
    }
    if (path === '/setup/vision') {
      return ['/setup/vision', '/intro-video'].includes(location.pathname);
    }
    if (path === '/setup/focus-area') {
      return ['/setup/focus-area', '/setup/big-rocks-agent', '/intro-rocks-video'].includes(location.pathname);
    }
    return location.pathname === path;
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-24 left-6 z-50 w-56 bg-background rounded-2xl shadow-2xl border overflow-hidden"
            >
              <div className="p-3 border-b flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <Target className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="font-bold text-sm">Focus Tracker</span>
              </div>

              <div className="p-2 space-y-0.5">
                {NAV_ITEMS.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                        active
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-2 border-t">
                <button
                  onClick={() => { signOut(); setIsOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>התנתק</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
