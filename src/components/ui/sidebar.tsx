import React, { createContext, useContext, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SidebarContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const toggle = () => setOpen(prev => !prev);
  return (
    <SidebarContext.Provider value={{ open, setOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}

export function SidebarTrigger({ className }: { className?: string }) {
  const { toggle } = useSidebar();
  return (
    <button onClick={toggle} className={cn('p-2 hover:bg-muted rounded-md', className)}>
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}

export function Sidebar({ children, className }: { children: ReactNode; className?: string }) {
  const { open } = useSidebar();
  return (
    <aside className={cn(
      'h-screen border-r bg-card transition-all duration-300 overflow-hidden flex-shrink-0',
      open ? 'w-64' : 'w-0',
      className
    )}>
      <div className="w-64 h-full flex flex-col">{children}</div>
    </aside>
  );
}

export function SidebarHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-4 border-b', className)}>{children}</div>;
}

export function SidebarContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex-1 overflow-y-auto p-3', className)}>{children}</div>;
}

export function SidebarGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function SidebarGroupLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-xs font-medium text-muted-foreground px-2 mb-2', className)}>{children}</p>;
}

export function SidebarGroupContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('space-y-1', className)}>{children}</div>;
}

export function SidebarMenu({ children, className }: { children: ReactNode; className?: string }) {
  return <nav className={cn('space-y-1', className)}>{children}</nav>;
}

export function SidebarMenuItem({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('', className)}>{children}</div>;
}

export function SidebarMenuButton({
  children,
  className,
  isActive,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { isActive?: boolean }) {
  return (
    <button
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
        isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
