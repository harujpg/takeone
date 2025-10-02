import React, { createContext, useContext } from 'react';
import { createDynamicTheme } from '../constants/dynamicTheme';
import { useSettings } from './SettingsContext';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { settings, loading } = useSettings();
  
  // Se ainda está carregando, usar configurações padrão
  const safeSettings = loading ? {
    darkMode: true,
    highContrast: false,
    largeText: false,
  } : settings;
  
  console.log('ThemeProvider - Loading:', loading);
  console.log('ThemeProvider - Settings:', safeSettings);
  
  const theme = createDynamicTheme(safeSettings);
  console.log('ThemeProvider - Background color:', theme.colors.background);
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
