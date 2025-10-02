import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '../services/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { syncCurrentUserProfile, migrateAllUsersToProfiles } from '../services/profiles';
import { getFavoritesCount } from '../services/favorites';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { colors, typography } = useTheme();
  
  // Estilos dinâmicos baseados no tema
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
      justifyContent: 'center',
    },
    title: {
      ...typography.h2,
      color: colors.primary,
      marginBottom: 30,
      textAlign: 'center',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 24,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarInitials: {
      ...typography.h4,
      color: colors.text,
      fontWeight: 'bold',
    },
    userInfo: {
      flex: 1,
    },
    name: {
      ...typography.h4,
      color: colors.text,
      marginBottom: 4,
    },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.primary,
      color: colors.text,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 8,
      ...typography.body,
    },
    email: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    loadingRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    loadingText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginLeft: 8,
    },
    statsCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary,
      padding: 16,
      marginBottom: 24,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly',
    },
    statBox: {
      alignItems: 'center',
      flex: 1,
    },
    statNumber: {
      ...typography.h3,
      color: colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    divider: {
      width: 1,
      height: 32,
      backgroundColor: colors.textMuted,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 4,
    },
    editButton: {
      flex: 1,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
    },
    editText: {
      ...typography.body,
      color: colors.text,
      fontWeight: 'bold',
    },
    logoutButton: {
      backgroundColor: colors.error,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      flex: 1,
    },
    logoutText: {
      ...typography.body,
      color: '#fff',
      fontWeight: 'bold',
    },
    editRow: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 4,
    },
    saveButton: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
    },
    disabledButton: {
      opacity: 0.6,
    },
    saveText: {
      ...typography.body,
      color: '#fff',
      fontWeight: 'bold',
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.textMuted,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.textSecondary,
    },
    cancelText: {
      ...typography.body,
      color: colors.text,
      fontWeight: 'bold',
    },
    removeButton: {
      backgroundColor: colors.error,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      flex: 1,
    },
    removeText: {
      ...typography.bodySmall,
      color: '#fff',
      fontWeight: 'bold',
    },
    avatarActionsRow: {
      flexDirection: 'row',
      marginBottom: 8,
      gap: 8,
    },
    smallButton: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    smallButtonText: {
      ...typography.caption,
      color: colors.text,
      fontWeight: 'bold',
    },
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [listCount, setListCount] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempAvatarPath, setTempAvatarPath] = useState('');
  const [tempAvatarPreviewUrl, setTempAvatarPreviewUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [signedAvatarUrl, setSignedAvatarUrl] = useState('');
  const [migrationExecuted, setMigrationExecuted] = useState(false);


  // Função para carregar estatísticas do usuário
  const loadUserStats = async () => {
    try {
      setStatsLoading(true);
      
      // Carrega contagem de favoritos
      const favCount = await getFavoritesCount();
      setFavoritesCount(favCount);
      
      // Aqui você pode adicionar outras estatísticas quando implementar
      // const listCount = await getListsCount();
      // const ratingCount = await getRatingsCount();
      
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (isMounted) {
          setUser(data?.user ?? null);
          setLoading(false);
          
          // Carrega estatísticas se usuário estiver logado
          if (data?.user) {
            loadUserStats();
          }
          
          // Executa sincronização e migração em background (não bloqueia a UI)
          if (data?.user) {
            setTimeout(async () => {
              try {
                console.log('ProfileScreen: Sincronizando perfil do usuário...');
                await syncCurrentUserProfile();
                
                // Executa migração de todos os usuários (apenas uma vez por sessão)
                if (!migrationExecuted) {
                  console.log('ProfileScreen: Executando migração de usuários...');
                  const migrationResult = await migrateAllUsersToProfiles();
                  if (migrationResult) {
                    console.log('ProfileScreen: Migração concluída:', migrationResult);
                  }
                  setMigrationExecuted(true);
                }
              } catch (error) {
                console.error('ProfileScreen: Erro na sincronização/migração:', error);
                // Não quebra a navegação se a sincronização falhar
              }
            }, 1000); // Executa após 1 segundo
          }
        }
      } catch (error) {
        console.error('ProfileScreen: Erro ao carregar usuário:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Recarrega estatísticas quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadUserStats();
      }
    }, [user])
  );

  // Gera URL assinada quando houver avatar_path
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const path = user?.user_metadata?.avatar_path;
        if (!path) {
          setSignedAvatarUrl('');
          return;
        }
        const { data: signed } = await supabase.storage
          .from('avatars')
          .createSignedUrl(path, 60 * 60);
        if (isMounted) setSignedAvatarUrl(signed?.signedUrl || '');
      } catch (_) {
        if (isMounted) setSignedAvatarUrl('');
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Revalida a URL assinada quando a tela ganha foco (se houver path)
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const path = user?.user_metadata?.avatar_path;
          if (!path) return;
          const { data: signed } = await supabase.storage
            .from('avatars')
            .createSignedUrl(path, 60 * 60);
          if (!cancelled) setSignedAvatarUrl(signed?.signedUrl || '');
        } catch (_) {}
      })();
      return () => {
        cancelled = true;
      };
    }, [user?.user_metadata?.avatar_path])
  );

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert('Erro ao sair', error.message);
    } else {
      // Logout realizado com sucesso - navegação automática acontece no App.js
    }
  };

  useEffect(() => {
    if (!user) {
      setStatsLoading(false);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        setStatsLoading(true);
        // Contador de listas do usuário
        const { count: listsCnt, error: listsErr } = await supabase
          .from('movie_lists')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        if (!listsErr && isMounted) setListCount(listsCnt ?? 0);

        // Contador de avaliações do usuário
        const { count: ratingsCnt, error: ratingsErr } = await supabase
          .from('ratings')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        if (!ratingsErr && isMounted) setRatingCount(ratingsCnt ?? 0);
      } catch (_) {
        // ignora
      } finally {
        if (isMounted) setStatsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const getDisplayName = () => {
    const name = user?.user_metadata?.full_name || user?.user_metadata?.name;
    if (name && typeof name === 'string') return name;
    const email = user?.email || '';
    return email.split('@')[0] || 'Usuário';
  };

  const getAvatarContent = () => {
    // Preview durante edição (URL assinada gerada ao enviar a imagem)
    if (editing && tempAvatarPreviewUrl) {
      return <Image source={{ uri: tempAvatarPreviewUrl }} style={styles.avatarImage} />;
    }
    // Legado: se houver avatar_url público salvo anteriormente
    const legacyPublicUrl = user?.user_metadata?.avatar_url;
    if (legacyPublicUrl) {
      return <Image source={{ uri: legacyPublicUrl }} style={styles.avatarImage} />;
    }
    // URL assinada para avatar_path
    if (signedAvatarUrl) {
      return <Image source={{ uri: signedAvatarUrl }} style={styles.avatarImage} />;
    }
    const name = getDisplayName();
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || (user?.email ? user.email[0].toUpperCase() : 'U');
    return <Text style={styles.avatarInitials}>{initials}</Text>;
  };

  const deleteStoragePath = async (path) => {
    try {
      if (!path) return;
      const { error } = await supabase.storage.from('avatars').remove([path]);
      if (error) {
        console.warn('[Avatar] Falha ao remover arquivo temporário:', error.message || error);
      } else {
        console.log('[Avatar] Arquivo removido:', path);
      }
    } catch (e) {
      console.warn('[Avatar] Erro ao remover arquivo temporário:', e?.message || e);
    }
  };

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
          <Text style={styles.title}>Perfil</Text>
          <View style={styles.statusIndicator} />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Carregando usuário...</Text>
        </View>
      ) : (
        <>
          <View style={styles.headerRow}>
            <View style={styles.avatar}>{getAvatarContent()}</View>
            <View style={styles.userInfo}>
              {editing ? (
                <>
                  <View style={styles.avatarActionsRow}>
                    <TouchableOpacity
                      style={[styles.smallButton, uploadingAvatar && styles.disabledButton]}
                      onPress={async () => {
                        try {
                          setUploadingAvatar(true);
                          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                          if (status !== 'granted') {
                            Alert.alert('Permissão negada', 'Habilite o acesso às fotos para escolher um avatar.');
                            return;
                          }
                          const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 0.8,
                          });
                          if (result.canceled) return;
                          let uri = result.assets?.[0]?.uri;
                          if (!uri) return;

                          // Limite de tamanho 5MB
                          try {
                            const info = await (await import('expo-file-system')).default.getInfoAsync(uri);
                            if (info?.size && info.size > 5 * 1024 * 1024) {
                              // Tenta compactar e redimensionar para caber
                              const manipulated = await ImageManipulator.manipulateAsync(
                                uri,
                                [{ resize: { width: 512 } }],
                                { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
                              );
                              uri = manipulated.uri;
                            }
                          } catch (_) {}

                          // Envia arquivo usando objeto de arquivo do React Native (uri, name, type)
                          const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
                          const path = `avatars/${user.id}/${Date.now()}.${ext}`;
                          const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
                          const file = { uri, name: path.split('/').pop(), type: contentType };

                          console.log('[Avatar] Upload start');
                          console.log('[Avatar] Path/contentType will be', { path, contentType });

                          // Se já existe um arquivo temporário desta sessão (não salvo), apaga antes
                          if (tempAvatarPath && tempAvatarPath !== user?.user_metadata?.avatar_path) {
                            await deleteStoragePath(tempAvatarPath);
                          }

                          const { error: uploadError } = await supabase.storage
                            .from('avatars')
                            .upload(path, file, { contentType, upsert: true });
                          if (uploadError) {
                            console.error('[Avatar] Upload error:', uploadError);
                            throw uploadError;
                          }
                          console.log('[Avatar] Upload success', { path });

                          // Gera URL assinada para preview
                          const { data: signed, error: signErr } = await supabase.storage
                            .from('avatars')
                            .createSignedUrl(path, 60 * 60);
                          if (signErr) {
                            console.error('[Avatar] Signed URL error:', signErr);
                            throw signErr;
                          }
                          const signedUrl = signed?.signedUrl;
                          if (!signedUrl) {
                            console.error('[Avatar] Signed URL missing in response', signed);
                            throw new Error('Falha ao gerar URL assinada');
                          }

                          setTempAvatarPath(path);
                          setTempAvatarPreviewUrl(signedUrl);
                        } catch (e) {
                          console.error('[Avatar] Upload flow error:', e);
                          const message = e?.message || e?.error_description || 'Não foi possível enviar o avatar.';
                          Alert.alert('Erro', message);
                        } finally {
                          setUploadingAvatar(false);
                        }
                      }}
                      disabled={uploadingAvatar}
                    >
                      <Text style={styles.smallButtonText}>{uploadingAvatar ? 'Enviando...' : 'Escolher foto'}</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Seu nome"
                    placeholderTextColor="#777"
                    value={tempName}
                    onChangeText={setTempName}
                    autoCapitalize="words"
                  />
                  {/* Campo de URL removido em favor de upload para Storage */}
                </>
              ) : (
                <>
                  <Text style={styles.name}>{getDisplayName()}</Text>
                  <Text style={styles.email}>{user?.email || 'não identificado'}</Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.statsCard}>
            {statsLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.loadingText}>Carregando estatísticas...</Text>
              </View>
            ) : (
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{listCount}</Text>
                  <Text style={styles.statLabel}>Listas</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{favoritesCount}</Text>
                  <Text style={styles.statLabel}>Favoritos</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{ratingCount}</Text>
                  <Text style={styles.statLabel}>Avaliações</Text>
                </View>
              </View>
            )}
          </View>

          {editing ? (
            <View style={styles.editRow}>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.disabledButton]}
                onPress={async () => {
                  try {
                    setSaving(true);
                    // Salva apenas o caminho interno do Storage
                    const updates = { data: { full_name: tempName?.trim() || null, avatar_path: tempAvatarPath || user?.user_metadata?.avatar_path || null } };
                    const { error } = await supabase.auth.updateUser(updates);
                    if (error) throw error;
                    
                    // Sincroniza com a tabela profiles
                    console.log('ProfileScreen: Sincronizando perfil após atualização...');
                    await syncCurrentUserProfile();

                    // Se o usuário está substituindo o avatar e existia um antigo salvo, remove o antigo
                    if (tempAvatarPath && user?.user_metadata?.avatar_path && tempAvatarPath !== user.user_metadata.avatar_path) {
                      await deleteStoragePath(user.user_metadata.avatar_path);
                    }

                    const { data } = await supabase.auth.getUser();
                    setUser(data?.user ?? null);
                    setEditing(false);
                    Alert.alert('Sucesso', 'Perfil atualizado!');
                  } catch (e) {
                    Alert.alert('Erro', 'Não foi possível salvar seu perfil.');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
              >
                <Text style={styles.saveText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  // Se o arquivo enviado nesta sessão não foi salvo, removê-lo para evitar órfãos
                  if (tempAvatarPath && tempAvatarPath !== user?.user_metadata?.avatar_path) {
                    deleteStoragePath(tempAvatarPath);
                  }
                  setTempAvatarPath('');
                  setTempAvatarPreviewUrl('');
                  setEditing(false);
                }}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              {user?.user_metadata?.avatar_path ? (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={async () => {
                    try {
                      const current = user?.user_metadata?.avatar_path;
                      if (!current) return;
                      await deleteStoragePath(current);
                      const { error } = await supabase.auth.updateUser({ data: { avatar_path: null } });
                      if (error) throw error;
                      const { data } = await supabase.auth.getUser();
                      setUser(data?.user ?? null);
                      setTempAvatarPath('');
                      setTempAvatarPreviewUrl('');
                      setSignedAvatarUrl('');
                      Alert.alert('Sucesso', 'Avatar removido.');
                    } catch (_) {
                      Alert.alert('Erro', 'Não foi possível remover o avatar.');
                    }
                  }}
                >
                  <Text style={styles.removeText}>Remover avatar</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setTempName(getDisplayName());
                  // Inicializa preview/path com base no que já existe
                  const path = user?.user_metadata?.avatar_path || '';
                  const legacyUrl = user?.user_metadata?.avatar_url || '';
                  if (path) {
                    setTempAvatarPath(path);
                    // Usa a URL assinada atual como preview inicial, se existir
                    if (signedAvatarUrl) setTempAvatarPreviewUrl(signedAvatarUrl);
                  } else if (legacyUrl) {
                    // Suporte legado: preview com URL pública antiga
                    setTempAvatarPath('');
                    setTempAvatarPreviewUrl(legacyUrl);
                  } else {
                    setTempAvatarPath('');
                    setTempAvatarPreviewUrl('');
                  }
                  setEditing(true);
                }}
              >
                <Text style={styles.editText}>Editar perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  try {
                    // Navega para a Tab "Listas"
                    navigation.navigate('Listas');
                  } catch (_) {}
                }}
              >
                <Text style={styles.editText}>Minhas listas</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Sair da conta</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}
