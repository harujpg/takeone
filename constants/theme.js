// constants/theme.js
export const colors = {
  // Cores principais
  primary: '#6366F1', // Indigo moderno
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  
  // Cores secundárias
  secondary: '#EC4899', // Pink moderno
  accent: '#10B981', // Emerald
  
  // Cores de fundo
  background: '#0F0F23', // Azul escuro moderno
  surface: '#1A1A2E', // Superfície escura
  card: '#16213E', // Card azul escuro
  cardLight: '#1E293B', // Card mais claro
  
  // Cores de texto
  text: '#F8FAFC', // Branco suave
  textSecondary: '#94A3B8', // Cinza claro
  textMuted: '#64748B', // Cinza médio
  
  // Cores de status
  success: '#10B981', // Verde
  warning: '#F59E0B', // Amarelo
  error: '#EF4444', // Vermelho
  info: '#3B82F6', // Azul
  
  // Gradientes
  gradientPrimary: ['#6366F1', '#8B5CF6'], // Indigo para Purple
  gradientSecondary: ['#EC4899', '#F97316'], // Pink para Orange
  gradientBackground: ['#0F0F23', '#1A1A2E'], // Background gradiente
  
  // Sombras
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowLight: 'rgba(0, 0, 0, 0.1)',
  
  // Transparências
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal',
    lineHeight: 16,
  },
};
