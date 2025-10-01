import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { colors } from '../constants/theme';
import { getProfile, getSignedAvatarUrl, testProfilesTable, checkUserExists } from '../services/profiles';
import { useNavigation } from '@react-navigation/native';

export default function PublicProfileScreen({ route }) {
  const navigation = useNavigation();
  const { userId } = route.params;
  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        console.log('PublicProfileScreen: Buscando perfil para userId:', userId);
        
        // Primeiro, vamos testar se a tabela profiles existe
        const tableExists = await testProfilesTable();
        if (!tableExists) {
          console.error('PublicProfileScreen: Tabela profiles não existe ou não é acessível');
          setProfile(null);
          return;
        }
        
        const p = await getProfile(userId);
        console.log('PublicProfileScreen: Perfil encontrado:', p);
        setProfile(p);
        if (p?.avatar_path) {
          const url = await getSignedAvatarUrl(p.avatar_path);
          setAvatarUrl(url);
        }
      } catch (error) {
        console.error('PublicProfileScreen: Erro ao buscar perfil:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.center}> 
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Perfil não encontrado</Text>
        <Text style={styles.errorText}>ID do usuário: {userId}</Text>
        <Text style={styles.errorText}>Este usuário não possui um perfil no sistema.</Text>
        <Text style={styles.errorText}>O usuário pode ter comentado antes de ter um perfil criado.</Text>
        <Text style={styles.errorText}>Verifique os logs para mais detalhes sobre o erro.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.navigationButtons}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Perfil', { screen: 'ProfileHome' })}
        >
          <Text style={styles.profileButtonText}>Meu Perfil</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarInitials}>
              {(profile.full_name || 'U').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}
            </Text>
          )}
        </View>
        <Text style={styles.name}>{profile.full_name || 'Usuário'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  profileButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  profileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 32,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  name: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  text: {
    color: colors.text,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});


