import { colors as baseColors, typography as baseTypography } from './theme';

export const createDynamicTheme = (settings) => {
  const isDark = settings.darkMode;
  const isHighContrast = settings.highContrast;
  const isLargeText = settings.largeText;

  // Cores dinâmicas baseadas no tema e alto contraste
  const dynamicColors = {
    ...baseColors,
    
    // Cores principais
    primary: isHighContrast ? '#00BFFF' : baseColors.primary,
    
    // Cores de fundo
    background: isDark 
      ? (isHighContrast ? '#000000' : baseColors.background)
      : (isHighContrast ? '#FFFFFF' : '#F5F5F5'),
    
    surface: isDark 
      ? (isHighContrast ? '#1A1A1A' : baseColors.surface)
      : (isHighContrast ? '#F0F0F0' : '#FFFFFF'),
    
    card: isDark 
      ? (isHighContrast ? '#2A2A2A' : baseColors.card)
      : (isHighContrast ? '#E8E8E8' : '#FFFFFF'),
    
    cardLight: isDark 
      ? (isHighContrast ? '#3A3A3A' : baseColors.cardLight)
      : (isHighContrast ? '#D8D8D8' : '#F8F8F8'),
    
    // Cores de texto
    text: isDark 
      ? (isHighContrast ? '#FFFFFF' : baseColors.text)
      : (isHighContrast ? '#000000' : '#1A1A1A'),
    
    textSecondary: isDark 
      ? (isHighContrast ? '#E0E0E0' : baseColors.textSecondary)
      : (isHighContrast ? '#333333' : '#666666'),
    
    textMuted: isDark 
      ? (isHighContrast ? '#C0C0C0' : baseColors.textMuted)
      : (isHighContrast ? '#555555' : '#888888'),
    
    // Cores de status com mais contraste se necessário
    success: isHighContrast ? '#00FF00' : baseColors.success,
    warning: isHighContrast ? '#FFFF00' : baseColors.warning,
    error: isHighContrast ? '#FF0000' : baseColors.error,
    info: isHighContrast ? '#00FFFF' : baseColors.info,
  };

  // Tipografia dinâmica baseada no texto grande
  const fontSizeMultiplier = isLargeText ? 1.2 : 1;
  
  const dynamicTypography = {
    h1: {
      ...baseTypography.h1,
      fontSize: Math.round(baseTypography.h1.fontSize * fontSizeMultiplier),
    },
    h2: {
      ...baseTypography.h2,
      fontSize: Math.round(baseTypography.h2.fontSize * fontSizeMultiplier),
    },
    h3: {
      ...baseTypography.h3,
      fontSize: Math.round(baseTypography.h3.fontSize * fontSizeMultiplier),
    },
    h4: {
      ...baseTypography.h4,
      fontSize: Math.round(baseTypography.h4.fontSize * fontSizeMultiplier),
    },
    body: {
      ...baseTypography.body,
      fontSize: Math.round(baseTypography.body.fontSize * fontSizeMultiplier),
    },
    bodySmall: {
      ...baseTypography.bodySmall,
      fontSize: Math.round(baseTypography.bodySmall.fontSize * fontSizeMultiplier),
    },
    caption: {
      ...baseTypography.caption,
      fontSize: Math.round(baseTypography.caption.fontSize * fontSizeMultiplier),
    },
  };

  return {
    colors: dynamicColors,
    typography: dynamicTypography,
    settings,
  };
};
