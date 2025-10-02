import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemedView({ 
  style, 
  backgroundColor = 'background',
  children, 
  ...props 
}) {
  const { colors } = useTheme();
  
  const themedStyle = [
    { backgroundColor: colors[backgroundColor] },
    style,
  ];
  
  return (
    <View style={themedStyle} {...props}>
      {children}
    </View>
  );
}
