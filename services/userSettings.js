import { supabase } from './supabase';

export async function getUserSettings(userId) {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar configurações:', error);
      return getDefaultSettings();
    }

    return data || getDefaultSettings();
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return getDefaultSettings();
  }
}

export async function updateUserSettings(userId, settings) {
  try {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Erro ao salvar configurações:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    throw error;
  }
}

function getDefaultSettings() {
  return {
    dark_mode: true,
    notifications: true,
    auto_play: false,
    high_contrast: false,
    large_text: false,
    sound_effects: true,
    haptic_feedback: true,
    data_saver: false,
    location_services: false,
    analytics: true,
  };
}
