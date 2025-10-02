import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';

export default function ThemeTestComponent() {
  const { colors, typography, settings } = useTheme();
  const { updateSetting } = useSettings();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      padding: 16,
      margin: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    title: {
      ...typography.h3,
      color: colors.primary,
      marginBottom: 8,
    },
    text: {
      ...typography.body,
      color: colors.text,
      marginBottom: 4,
    },
    card: {
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teste do Tema Dinâmico</Text>
      <Text style={styles.text}>Modo Escuro: {settings.darkMode ? 'Ativo' : 'Inativo'}</Text>
      <Text style={styles.text}>Alto Contraste: {settings.highContrast ? 'Ativo' : 'Inativo'}</Text>
      <Text style={styles.text}>Texto Grande: {settings.largeText ? 'Ativo' : 'Inativo'}</Text>
      
      <View style={styles.card}>
        <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
          Este card deve mudar de cor conforme o tema
        </Text>
      </View>
    </View>
  );
}
