import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isRTL } = useLanguage();
  const { signOut } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" dir={isRTL ? 'rtl' : 'ltr'}>
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b bg-background flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Button variant="ghost" size="icon" onClick={signOut} title={isRTL ? 'התנתק' : 'Sign out'}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-muted/30">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
