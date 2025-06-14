import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ThemeContextType {
  /** Hex string like #RRGGBB */
  color: string;
  /** Update theme color (hex) */
  setColor: (hex: string) => void;
  /** true if dark mode enabled */
  dark: boolean;
  /** toggle or explicitly set dark mode */
  toggleDark: (value?: boolean) => void;
}

const DEFAULT_COLOR = '#10B981'; // same default used in settings

const ThemeContext = createContext<ThemeContextType>({
  color: DEFAULT_COLOR,
  setColor: () => {},
  dark: false,
  toggleDark: () => {},
});

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  // Remove leading # if present
  const sanitized = hex.replace(/^#/, '');
  if (sanitized.length !== 6) return null;
  const r = parseInt(sanitized.slice(0, 2), 16) / 255;
  const g = parseInt(sanitized.slice(2, 4), 16) / 255;
  const b = parseInt(sanitized.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Apply a given hex color to the CSS variables used by Tailwind.
 * We keep the logic simple: primary === chosen color, ring === primary, accent === lighter version,
 * sidebar colors are darker versions of the chosen color.
 */
function applyColorVariables(hex: string) {
  const hsl = hexToHsl(hex);
  if (!hsl) return;
  const { h, s, l } = hsl;

  const root = document.documentElement;

  const set = (v: string, value: string) => root.style.setProperty(v, value);

  // Primary and ring
  set('--primary', `${h} ${s}% ${l}%`);
  set('--ring', `${h} ${s}% ${l}%`);

  // Accent – lighten by ~20%
  const lAccent = Math.min(l + 60, 94);
  set('--accent', `${h} ${s}% ${lAccent}%`);
  // Use foreground white if accent is dark (<55) else black
  set('--accent-foreground', lAccent < 40 ? '0 0% 100%' : '0 0% 0%');

  // Sidebar colors – darken by ~25%
  const lSidebar = Math.max(l - 25, 0);
  set('--sidebar-background', `${h} ${s}% ${lSidebar}%`);
  // Primary sidebar item (active)
  set('--sidebar-primary', `${h} ${s}% ${l}%`);
  set('--sidebar-primary-foreground', l < 60 ? '0 0% 100%' : '0 0% 0%');
  // Accent hover
  const lSidebarAccent = Math.max(lSidebar + 10, 0);
  set('--sidebar-accent', `${h} ${s}% ${lSidebarAccent}%`);
  set('--sidebar-accent-foreground', lSidebarAccent < 55 ? '0 0% 100%' : '0 0% 0%');
  // Border & ring for sidebar
  const lBorder = Math.max(lSidebar - 10, 0);
  set('--sidebar-border', `${h} ${s}% ${lBorder}%`);
  set('--sidebar-ring', `${h} ${s}% ${l}%`);
}

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [color, setColor] = useState<string>(DEFAULT_COLOR);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [dark, setDark] = useState<boolean>(prefersDark);

  // Load color from localStorage when user changes
  useEffect(() => {
    if (!user?.id) return;
    const stored = localStorage.getItem(`userSettings_${user.id}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { color?: string; dark?: boolean };
        if (parsed.color) {
          setColor(parsed.color);
        }
        if (typeof parsed.dark === 'boolean') {
          setDark(parsed.dark);
        }
      } catch (e) {
        // ignore parse error
      }
    }
  }, [user?.id]);

  // Apply variables whenever color changes
  useEffect(() => {
    applyColorVariables(color);
  }, [color]);

  // Apply or remove dark class
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [dark]);

  const value: ThemeContextType = {
    color,
    setColor: (hex: string) => {
      setColor(hex);
      applyColorVariables(hex);
    },
    dark,
    toggleDark: (value?: boolean) => {
      const newVal = typeof value === 'boolean' ? value : !dark;
      setDark(newVal);
      // persist if user present
      if (user?.id) {
        const existing = localStorage.getItem(`userSettings_${user.id}`);
        let parsed: any = {};
        try { if (existing) parsed = JSON.parse(existing); } catch {}
        parsed.dark = newVal;
        localStorage.setItem(`userSettings_${user.id}`, JSON.stringify(parsed));
      }
    }
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext); 