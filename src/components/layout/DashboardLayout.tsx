import React from 'react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full" dir="rtl">
      <main className="flex-1 overflow-y-auto bg-muted/30">{children}</main>
    </div>
  );
}
