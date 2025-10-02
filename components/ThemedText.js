import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemedText({ 
  style, 
  variant = 'body', 
  color = 'text',
  children, 
  ...props 
}) {
  const { colors, typography } = useTheme();
  
  const themedStyle = [
    typography[variant],
    { color: colors[color] },
    style,
  ];
  
  return (
    <Text style={themedStyle} {...props}>
      {children}
    </Text>
  );
}
