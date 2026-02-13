import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sidebar, SidebarHeader, SidebarContent, SidebarGroup,
  SidebarGroupLabel, SidebarGroupContent, SidebarMenu,
  SidebarMenuItem, SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Compass, Eye, Mountain, ClipboardList, LayoutDashboard } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/management-compass', label: 'שאלון', icon: Compass },
  { path: '/setup/vision', label: 'תמונת עתיד', icon: Eye },
  { path: '/setup/focus-area', label: 'אבנים גדולות', icon: Mountain },
  { path: '/setup/execution-stakeholders', label: 'תוכנית עבודה', icon: ClipboardList },
  { path: '/dashboard', label: 'לוח הבקרה', icon: LayoutDashboard },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
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

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1">
          <img 
            src="/milestone-logo.png" 
            alt="מיילסטון" 
            className="h-8 object-contain"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>ניווט</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={isActive(item.path)}
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
