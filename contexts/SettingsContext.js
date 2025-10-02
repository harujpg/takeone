import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserSettings, updateUserSettings } from '../services/userSettings';
import settingsManager from '../services/settingsManager';
import { supabase } from '../services/supabase';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings deve ser usado dentro de SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    autoPlay: false,
    highContrast: false,
    largeText: false,
    soundEffects: true,
    hapticFeedback: true,
    dataSaver: false,
    locationServices: false,
    analytics: true,
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeSettings();
  }, []);

  const initializeSettings = async () => {
    try {
      // Carregar usuário
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);

      // Carregar configurações
      if (data?.user?.id) {
        const userSettings = await getUserSettings(data.user.id);
        const newSettings = {
          darkMode: userSettings.dark_mode,
          notifications: userSettings.notifications,
          autoPlay: userSettings.auto_play,
          highContrast: userSettings.high_contrast,
          largeText: userSettings.large_text,
          soundEffects: userSettings.sound_effects,
          hapticFeedback: userSettings.haptic_feedback,
          dataSaver: userSettings.data_saver,
          locationServices: userSettings.location_services,
          analytics: userSettings.analytics,
        };
        
        setSettings(newSettings);
        await settingsManager.applySettings(newSettings);
      } else {
        // Carregar configurações locais se não estiver logado
        const localSettings = await settingsManager.loadLocalSettings();
        if (localSettings) {
          setSettings(localSettings);
          await settingsManager.applySettings(localSettings);
        }
      }
    } catch (error) {
      console.error('Erro ao inicializar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    console.log(`Atualizando configuração: ${key} = ${value}`);
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    console.log('Novas configurações:', newSettings);

    // Aplicar configuração imediatamente
    await settingsManager.applySettings(newSettings);

    // Salvar no Supabase se estiver logado
    if (user?.id) {
      try {
        const dbSettings = {
          dark_mode: newSettings.darkMode,
          notifications: newSettings.notifications,
          auto_play: newSettings.autoPlay,
          high_contrast: newSettings.highContrast,
          large_text: newSettings.largeText,
          sound_effects: newSettings.soundEffects,
          haptic_feedback: newSettings.hapticFeedback,
          data_saver: newSettings.dataSaver,
          location_services: newSettings.locationServices,
          analytics: newSettings.analytics,
        };
        
        await updateUserSettings(user.id, dbSettings);
      } catch (error) {
        console.error('Erro ao salvar configuração:', error);
        // Reverter se falhar
        setSettings(settings);
      }
    }
  };

  const value = {
    settings,
    updateSetting,
    loading,
    user,
    // Métodos de conveniência
    triggerHaptic: settingsManager.triggerHaptic.bind(settingsManager),
    playSound: settingsManager.playSound.bind(settingsManager),
    isDataSaverEnabled: () => settings.dataSaver,
    areNotificationsEnabled: () => settings.notifications,
    isAutoPlayEnabled: () => settings.autoPlay,
    areLocationServicesEnabled: () => settings.locationServices,
    areAnalyticsEnabled: () => settings.analytics,
    getAccessibilitySettings: () => ({
      highContrast: settings.highContrast,
      largeText: settings.largeText,
      hapticFeedback: settings.hapticFeedback,
      soundEffects: settings.soundEffects,
    }),
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
