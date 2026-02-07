import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Calendar, Target } from 'lucide-react';

const STEPS = [
  {
    path: '/setup/execution-stakeholders',
    label: 'בעלי עניין',
    icon: Users,
  },
  {
    path: '/setup/thirty-day-plan',
    label: 'תוכנית 30 יום',
    icon: Calendar,
  },
  {
    path: '/setup/keystone-success',
    label: 'הרגל מפתח',
    icon: Target,
  },
];

export default function ExecutionNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentIndex = STEPS.findIndex(s => s.path === location.pathname);

  return (
    <nav className="w-full max-w-2xl mx-auto px-4 pt-4">
      <div className="flex items-center justify-between bg-card rounded-xl border border-border p-1 shadow-sm">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === currentIndex;
          const isCompleted = i < currentIndex;

          return (
            <button
              key={step.path}
              onClick={() => navigate(step.path)}
              className={`
                flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-medium transition-all
                ${isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : isCompleted
                    ? 'text-primary hover:bg-primary/10'
                    : 'text-muted-foreground hover:bg-muted'
                }
              `}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{step.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
