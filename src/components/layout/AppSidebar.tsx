import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Sidebar, SidebarHeader, SidebarContent, SidebarGroup,
  SidebarGroupLabel, SidebarGroupContent, SidebarMenu,
  SidebarMenuItem, SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Target, LayoutDashboard, CalendarCheck, MessageSquare, Settings } from 'lucide-react';

export function AppSidebar() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: t.dashboard.title, icon: LayoutDashboard },
    { path: '/weekly-check', label: t.dashboard.weeklyCheckin, icon: CalendarCheck },
    { path: '/feedback', label: t.feedback.requestTitle, icon: MessageSquare },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Target className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold">Focus Tracker</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{isRTL ? 'ניווט' : 'Navigation'}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
