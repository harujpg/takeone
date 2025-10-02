import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import * as Haptics from 'expo-haptics';

class SettingsManager {
  constructor() {
    this.settings = {};
    this.listeners = [];
  }

  // Aplicar configurações quando carregadas
  async applySettings(settings) {
    this.settings = settings;
    
    // Aplicar tema
    if (settings.darkMode !== undefined) {
      this.applyTheme(settings.darkMode);
    }

    // Salvar localmente para acesso rápido
    await AsyncStorage.setItem('app_settings', JSON.stringify(settings));
    
    // Notificar listeners
    this.notifyListeners();
  }

  // Aplicar tema escuro/claro
  applyTheme(isDark) {
    try {
      // No React Native, você pode usar uma biblioteca como react-native-appearance
      // ou gerenciar o tema via Context/Redux
      Appearance.setColorScheme(isDark ? 'dark' : 'light');
    } catch (error) {
      console.log('Tema será aplicado via Context');
    }
  }

  // Feedback háptico
  triggerHaptic(type = 'light') {
    if (this.settings.hapticFeedback) {
      try {
        switch (type) {
          case 'light':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'medium':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'heavy':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
          case 'success':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case 'error':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
        }
      } catch (error) {
        console.log('Haptic feedback não disponível');
      }
    }
  }

  // Som de efeito
  playSound(soundType = 'click') {
    if (this.settings.soundEffects) {
      // Implementar sons usando expo-av ou react-native-sound
      console.log(`Playing sound: ${soundType}`);
    }
  }

  // Verificar se notificações estão habilitadas
  areNotificationsEnabled() {
    return this.settings.notifications || false;
  }

  // Verificar se deve usar economia de dados
  isDataSaverEnabled() {
    return this.settings.dataSaver || false;
  }

  // Verificar se auto-play está habilitado
  isAutoPlayEnabled() {
    return this.settings.autoPlay || false;
  }

  // Verificar se serviços de localização estão habilitados
  areLocationServicesEnabled() {
    return this.settings.locationServices || false;
  }

  // Verificar se analytics estão habilitados
  areAnalyticsEnabled() {
    return this.settings.analytics !== false; // Default true
  }

  // Obter configurações de acessibilidade
  getAccessibilitySettings() {
    return {
      highContrast: this.settings.highContrast || false,
      largeText: this.settings.largeText || false,
      hapticFeedback: this.settings.hapticFeedback !== false, // Default true
      soundEffects: this.settings.soundEffects !== false, // Default true
    };
  }

  // Adicionar listener para mudanças
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Remover listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // Notificar todos os listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.settings));
  }

  // Carregar configurações do AsyncStorage (fallback)
  async loadLocalSettings() {
    try {
      const stored = await AsyncStorage.getItem('app_settings');
      if (stored) {
        this.settings = JSON.parse(stored);
        return this.settings;
      }
    } catch (error) {
      console.error('Erro ao carregar configurações locais:', error);
    }
    return null;
  }
}

export default new SettingsManager();
