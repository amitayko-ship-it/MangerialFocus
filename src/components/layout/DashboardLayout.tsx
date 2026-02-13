import React from 'react';
import Header from '@/components/management-compass/layout/Header';
import Footer from '@/components/management-compass/layout/Footer';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Header />
      <main className="flex-1 overflow-y-auto bg-muted/30 stone-pattern">{children}</main>
      <Footer />
    </div>
  );
}
