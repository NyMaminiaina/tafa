import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
type Color = 'rose' | 'blue';
type Mode = 'clair' | 'sombre';

interface ThemeConfig {
  color: Color;
  mode: Mode;
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryGradientStart: string;
  primaryGradientEnd: string;
  bgPrimary: string;
  bgSecondary: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  iconColor: string;
}

interface ThemeContextType {
  theme: ThemeConfig;
  themeKey: string;
  setTheme: (color: Color, mode: Mode) => void;
}

// Configurations des thèmes
const themeConfigs: Record<string, ThemeConfig> = {
  'blue-clair': {
    color: 'blue',
    mode: 'clair',
    primary: '#1daeed',
    primaryHover: '#0ea5e9',
    primaryLight: '#e0f2fe',
    primaryGradientStart: '#0c4a6e',
    primaryGradientEnd: '#38bdf8',
    bgPrimary: '#ffffff',
    bgSecondary: '#f8fafc',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    iconColor: '#6b8fad',  // Gris-bleu
  },
  'blue-sombre': {
    color: 'blue',
    mode: 'sombre',
    primary: '#1daeed',
    primaryHover: '#38bdf8',
    primaryLight: '#1e3a5f',
    primaryGradientStart: '#0c4a6e',
    primaryGradientEnd: '#7dd3fc',
    bgPrimary: '#0f172a',
    bgSecondary: '#1e293b',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    iconColor: '#7ba8c7',  // Gris-bleu clair
  },
  'rose-clair': {
    color: 'rose',
    mode: 'clair',
    primary: '#ec4899',
    primaryHover: '#db2777',
    primaryLight: '#fce7f3',
    primaryGradientStart: '#831843',
    primaryGradientEnd: '#f472b6',
    bgPrimary: '#ffffff',
    bgSecondary: '#f8fafc',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    iconColor: '#a87d8f',  // Gris-rose
  },
  'rose-sombre': {
    color: 'rose',
    mode: 'sombre',
    primary: '#ec4899',
    primaryHover: '#f472b6',
    primaryLight: '#4a1d3d',
    primaryGradientStart: '#831843',
    primaryGradientEnd: '#f9a8d4',
    bgPrimary: '#0f172a',
    bgSecondary: '#1e293b',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    iconColor: '#c49aad',  // Gris-rose clair
  },
};

// Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeKey, setThemeKey] = useState<string>(() => {
    return localStorage.getItem('app-theme') || 'blue-clair';
  });

  const theme = themeConfigs[themeKey] || themeConfigs['blue-clair'];

  const setTheme = (color: Color, mode: Mode) => {
    const newKey = `${color}-${mode}`;
    setThemeKey(newKey);
    localStorage.setItem('app-theme', newKey);
  };

  // Appliquer les CSS variables au document
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-primary-hover', theme.primaryHover);
    root.style.setProperty('--color-primary-light', theme.primaryLight);
    root.style.setProperty('--color-primary-gradient-start', theme.primaryGradientStart);
    root.style.setProperty('--color-primary-gradient-end', theme.primaryGradientEnd);
    root.style.setProperty('--bg-primary', theme.bgPrimary);
    root.style.setProperty('--bg-secondary', theme.bgSecondary);
    root.style.setProperty('--text-primary', theme.textPrimary);
    root.style.setProperty('--text-secondary', theme.textSecondary);
    root.style.setProperty('--border-color', theme.border);
    root.style.setProperty('--icon-color', theme.iconColor);

    // Appliquer la classe dark mode
    if (theme.mode === 'sombre') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeKey, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
