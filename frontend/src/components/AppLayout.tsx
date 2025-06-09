import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarProvider, SidebarInset, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Search, Settings, User, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import QuickSearch from '@/components/QuickSearch';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from '@/context/ThemeContext';
import Notifications from '@/components/Notifications';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { color: themeColor, dark, toggleDark } = useTheme();

  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut Ctrl+F / Cmd+F to open quick search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
      const modKey = isMac ? e.metaKey : e.ctrlKey;
      if (modKey && e.key === 'f') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Get user initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleLogout = () => {
    logout();
  };

  const userInitials = user ? getInitials(`${user.firstName} ${user.lastName}`) : "U";
  const userName = user ? `${user.firstName} ${user.lastName}` : "User";
  const storedSettings = user?.id ? localStorage.getItem(`userSettings_${user.id}`) : null;
  const parsedSettings = storedSettings ? JSON.parse(storedSettings) : {};
  const avatarUrl: string | undefined = parsedSettings.avatar;

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-[#F7F7F9] dark:bg-[#28243D]">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <header className="flex items-center justify-between p-4 bg-white dark:bg-[#312D4B] border-b shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-gray-500 hover:text-primary" />
              <div className="relative max-w-md hidden md:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Quick search (Ctrl+F)" 
                  className="pl-9 bg-background/60 border-muted w-[260px] cursor-pointer"
                  onFocus={() => setSearchOpen(true)}
                  readOnly
                />
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-3">
              <Notifications />
              <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => toggleDark()}>
                {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => navigate('/settings')}>
                <Settings className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" style={{backgroundColor: themeColor || 'rgba(16,185,129,0.1)'}}>
                    <Avatar className="h-8 w-8">
                      {avatarUrl ? (<img src={avatarUrl} alt="avatar" className="h-8 w-8 rounded-full object-cover" />) : (<AvatarFallback>{userInitials}</AvatarFallback>)}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{userName}</DropdownMenuLabel>
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal -mt-3">
                    {user?.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-5">
            {children}
          </main>
        </SidebarInset>
        <Toaster />
        <Sonner />
        <QuickSearch open={searchOpen} setOpen={setSearchOpen} />
      </div>
    </SidebarProvider>
  );
}
