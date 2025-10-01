import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { colors, spacing, typography } from '../constants/theme';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
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

  useEffect(() => {
    loadUser();
    loadSettings();
  }, []);

  const loadUser = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const loadSettings = async () => {
    // Aqui você pode carregar configurações salvas do AsyncStorage ou Supabase
    // Por enquanto, usando valores padrão
  };

  const saveSettings = async (newSettings) => {
    setSettings(newSettings);
    // Aqui você pode salvar no AsyncStorage ou Supabase
    console.log('Configurações salvas:', newSettings);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir Conta',
      'Esta ação é irreversível. Todos os seus dados serão perdidos permanentemente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            // Implementar exclusão de conta
            Alert.alert('Funcionalidade em desenvolvimento');
          },
        },
      ]
    );
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Confira este app incrível de filmes!',
        url: 'https://expo.dev', // Substitua pela URL real do app
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:suporte@takeone.com?subject=Suporte - TakeOne');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://takeone.com/privacy'); // Substitua pela URL real
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://takeone.com/terms'); // Substitua pela URL real
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightComponent, 
    isDestructive = false 
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, isDestructive && styles.destructiveIcon]}>
          <Ionicons 
            name={icon} 
            size={20} 
            color={isDestructive ? '#ff5555' : colors.primary} 
          />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, isDestructive && styles.destructiveText]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {rightComponent}
    </TouchableOpacity>
  );

  const ToggleSetting = ({ icon, title, subtitle, value, onValueChange }) => (
    <SettingItem
      icon={icon}
      title={title}
      subtitle={subtitle}
      rightComponent={
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#333', true: colors.primary }}
          thumbColor={value ? '#fff' : '#f4f3f4'}
        />
      }
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Configurações</Text>
          <View style={styles.statusIndicator} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Seção do Usuário */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user?.user_metadata?.full_name || 'Usuário'}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Configurações de Acessibilidade */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acessibilidade</Text>
          
          <ToggleSetting
            icon="contrast"
            title="Alto Contraste"
            subtitle="Melhora a legibilidade do texto"
            value={settings.highContrast}
            onValueChange={(value) => saveSettings({ ...settings, highContrast: value })}
          />
          
          <ToggleSetting
            icon="text"
            title="Texto Grande"
            subtitle="Aumenta o tamanho da fonte"
            value={settings.largeText}
            onValueChange={(value) => saveSettings({ ...settings, largeText: value })}
          />
          
          <ToggleSetting
            icon="volume-high"
            title="Efeitos Sonoros"
            subtitle="Ativa sons de interface"
            value={settings.soundEffects}
            onValueChange={(value) => saveSettings({ ...settings, soundEffects: value })}
          />
          
          <ToggleSetting
            icon="phone-portrait"
            title="Vibração"
            subtitle="Feedback tátil para interações"
            value={settings.hapticFeedback}
            onValueChange={(value) => saveSettings({ ...settings, hapticFeedback: value })}
          />
        </View>

        {/* Configurações de Aparência */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aparência</Text>
          
          <ToggleSetting
            icon="moon"
            title="Modo Escuro"
            subtitle="Tema escuro para melhor visualização"
            value={settings.darkMode}
            onValueChange={(value) => saveSettings({ ...settings, darkMode: value })}
          />
        </View>

        {/* Configurações de Notificações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificações</Text>
          
          <ToggleSetting
            icon="notifications"
            title="Notificações Push"
            subtitle="Receber notificações do app"
            value={settings.notifications}
            onValueChange={(value) => saveSettings({ ...settings, notifications: value })}
          />
        </View>

        {/* Configurações de Reprodução */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reprodução</Text>
          
          <ToggleSetting
            icon="play-circle"
            title="Reprodução Automática"
            subtitle="Reproduzir trailers automaticamente"
            value={settings.autoPlay}
            onValueChange={(value) => saveSettings({ ...settings, autoPlay: value })}
          />
        </View>

        {/* Configurações de Dados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados e Privacidade</Text>
          
          <ToggleSetting
            icon="save"
            title="Economia de Dados"
            subtitle="Reduz o uso de dados móveis"
            value={settings.dataSaver}
            onValueChange={(value) => saveSettings({ ...settings, dataSaver: value })}
          />
          
          <ToggleSetting
            icon="location"
            title="Serviços de Localização"
            subtitle="Usar localização para recomendações"
            value={settings.locationServices}
            onValueChange={(value) => saveSettings({ ...settings, locationServices: value })}
          />
          
          <ToggleSetting
            icon="analytics"
            title="Analytics"
            subtitle="Compartilhar dados de uso para melhorias"
            value={settings.analytics}
            onValueChange={(value) => saveSettings({ ...settings, analytics: value })}
          />
        </View>

        {/* Configurações de Segurança */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Segurança</Text>
          
          <SettingItem
            icon="lock-closed"
            title="Alterar Senha"
            subtitle="Atualizar sua senha de acesso"
            onPress={() => Alert.alert('Funcionalidade em desenvolvimento')}
            rightComponent={<Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
          />
          
          <SettingItem
            icon="shield-checkmark"
            title="Autenticação de Dois Fatores"
            subtitle="Adicionar camada extra de segurança"
            onPress={() => Alert.alert('Funcionalidade em desenvolvimento')}
            rightComponent={<Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
          />
          
          <SettingItem
            icon="trash"
            title="Excluir Conta"
            subtitle="Remover permanentemente sua conta"
            onPress={handleDeleteAccount}
            isDestructive={true}
            rightComponent={<Ionicons name="chevron-forward" size={20} color="#ff5555" />}
          />
        </View>

        {/* Configurações de Suporte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suporte</Text>
          
          <SettingItem
            icon="help-circle"
            title="Central de Ajuda"
            subtitle="Perguntas frequentes e tutoriais"
            onPress={() => Alert.alert('Funcionalidade em desenvolvimento')}
            rightComponent={<Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
          />
          
          <SettingItem
            icon="mail"
            title="Contatar Suporte"
            subtitle="Enviar feedback ou reportar problemas"
            onPress={handleContactSupport}
            rightComponent={<Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
          />
          
          <SettingItem
            icon="share"
            title="Compartilhar App"
            subtitle="Recomendar para amigos"
            onPress={handleShareApp}
            rightComponent={<Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
          />
        </View>

        {/* Configurações Legais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          
          <SettingItem
            icon="document-text"
            title="Política de Privacidade"
            subtitle="Como coletamos e usamos seus dados"
            onPress={handlePrivacyPolicy}
            rightComponent={<Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
          />
          
          <SettingItem
            icon="document"
            title="Termos de Serviço"
            subtitle="Termos e condições de uso"
            onPress={handleTermsOfService}
            rightComponent={<Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
          />
        </View>

        {/* Informações do App */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          
          <SettingItem
            icon="information-circle"
            title="Versão do App"
            subtitle="1.0.0"
            rightComponent={<Text style={styles.versionText}>1.0.0</Text>}
          />
        </View>

        {/* Botão de Logout */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
            <Text style={styles.logoutButtonText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: spacing.sm,
    backgroundColor: 'rgba(15, 15, 35, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 80,
  },
  menuButton: {
    padding: 8,
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    flexShrink: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    marginLeft: spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  destructiveIcon: {
    backgroundColor: 'rgba(255, 85, 85, 0.1)',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  destructiveText: {
    color: '#ff5555',
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  versionText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  logoutSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff5555',
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});
