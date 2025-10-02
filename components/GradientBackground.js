import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

export default function GradientBackground({ 
  children, 
  colors: customColors,
  style,
  ...props 
}) {
  const { colors } = useTheme();
  
  // Se cores customizadas foram passadas, use elas, senão use as do tema
  const gradientColors = customColors || [colors.background, colors.surface];
  
  return (
    <LinearGradient
      colors={gradientColors}
      style={[styles.container, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      {...props}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 