import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const useThemedStyles = (createStyles) => {
  const theme = useTheme();
  
  return useMemo(() => {
    return createStyles(theme);
  }, [theme, createStyles]);
};

// Hook para aplicar estilos de texto dinâmicos
export const useThemedTextStyle = (baseStyle = 'body') => {
  const { typography, colors } = useTheme();
  
  return useMemo(() => ({
    ...typography[baseStyle],
    color: colors.text,
  }), [typography, colors, baseStyle]);
};
