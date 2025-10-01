import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import { supabase } from '../services/supabase';
import { useNavigation } from '@react-navigation/native';

import HomeStack from './HomeStack';
import ProfileStack from './ProfileStack';
import ListStack from './ListStack';
import SettingsScreen from '../screens/SettingsScreenSimple';

const Drawer = createDrawerNavigator();

// Componente personalizado para o drawer
function CustomDrawerContent({ navigation }) {
  const [user, setUser] = React.useState(null);
  const [avatarUrl, setAvatarUrl] = React.useState('');

  React.useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);
    };
    getUser();
  }, []);

  // Carrega avatar quando user muda
  React.useEffect(() => {
    const loadAvatar = async () => {
      if (!user?.user_metadata?.avatar_path) {
        setAvatarUrl('');
        return;
      }
      
      try {
        const { data: signed } = await supabase.storage
          .from('avatars')
          .createSignedUrl(user.user_metadata.avatar_path, 60 * 60);
        setAvatarUrl(signed?.signedUrl || '');
      } catch (error) {
        console.error('Erro ao carregar avatar:', error);
        setAvatarUrl('');
      }
    };
    
    loadAvatar();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const getDisplayName = () => {
    const name = user?.user_metadata?.full_name || user?.user_metadata?.name;
    if (name && typeof name === 'string') return name;
    const email = user?.email || '';
    return email.split('@')[0] || 'Usuário';
  };

  const getAvatarContent = () => {
    // Se tem avatar, mostra a imagem
    if (avatarUrl) {
      return <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />;
    }
    
    // Senão, mostra as iniciais
    const name = getDisplayName();
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || (user?.email ? user.email[0].toUpperCase() : 'U');
    return <Text style={styles.avatarInitials}>{initials}</Text>;
  };

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          {getAvatarContent()}
        </View>
        <Text style={styles.userName}>{getDisplayName()}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.menuItems}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate('Home');
            navigation.closeDrawer();
          }}
        >
          <Ionicons name="home" size={24} color={colors.primary} />
          <Text style={styles.menuItemText}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate('Perfil');
            navigation.closeDrawer();
          }}
        >
          <Ionicons name="person" size={24} color={colors.primary} />
          <Text style={styles.menuItemText}>Meu Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate('Listas');
            navigation.closeDrawer();
          }}
        >
          <Ionicons name="list" size={24} color={colors.primary} />
          <Text style={styles.menuItemText}>Minhas Listas</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={24} color="#ff5555" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        header: () => null,
        drawerStyle: {
          backgroundColor: colors.background,
          width: 280,
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerType: 'slide',
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        drawerActiveBackgroundColor: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={HomeStack}
        options={{
          headerShown: false,
          drawerLabel: '🏠 Início',
        }}
      />
      <Drawer.Screen 
        name="Perfil" 
        component={ProfileStack}
        options={{
          headerShown: false,
          drawerLabel: '👤 Meu Perfil',
        }}
      />
      <Drawer.Screen 
        name="Listas" 
        component={ListStack}
        options={{
          headerShown: false,
          drawerLabel: '📋 Minhas Listas',
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          headerShown: false,
          drawerLabel: '⚙️ Configurações',
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarInitials: {
    color: colors.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  userName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  menuItems: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  menuItemText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff5555',
  },
  logoutText: {
    color: '#ff5555',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});
