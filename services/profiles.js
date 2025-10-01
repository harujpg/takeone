import { supabase } from './supabase';

// Função para sincronizar o perfil do usuário atual com a tabela profiles
export async function syncCurrentUserProfile() {
  try {
    console.log('syncCurrentUserProfile: Sincronizando perfil do usuário atual...');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('syncCurrentUserProfile: Erro ao obter usuário atual:', userError);
      return null;
    }
    
    console.log('syncCurrentUserProfile: Usuário atual:', user.id);
    
    // Verifica se já existe perfil na tabela
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_path')
      .eq('id', user.id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('syncCurrentUserProfile: Erro ao verificar perfil existente:', checkError);
      return null;
    }
    
    // Se não existe perfil, cria um baseado no user_metadata
    if (!existingProfile) {
      console.log('syncCurrentUserProfile: Criando perfil na tabela profiles...');
      
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário';
      const avatarPath = user.user_metadata?.avatar_path || null;
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          full_name: fullName,
          avatar_path: avatarPath
        }])
        .select()
        .single();
      
      if (createError) {
        console.error('syncCurrentUserProfile: Erro ao criar perfil:', createError);
        return null;
      }
      
      console.log('syncCurrentUserProfile: Perfil criado:', newProfile);
      return newProfile;
    }
    
    // Se existe perfil, verifica se precisa sincronizar
    const userFullName = user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário';
    const userAvatarPath = user.user_metadata?.avatar_path || null;
    
    if (existingProfile.full_name !== userFullName || existingProfile.avatar_path !== userAvatarPath) {
      console.log('syncCurrentUserProfile: Sincronizando dados do perfil...');
      
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: userFullName,
          avatar_path: userAvatarPath
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('syncCurrentUserProfile: Erro ao atualizar perfil:', updateError);
        return existingProfile;
      }
      
      console.log('syncCurrentUserProfile: Perfil sincronizado:', updatedProfile);
      return updatedProfile;
    }
    
    console.log('syncCurrentUserProfile: Perfil já está sincronizado:', existingProfile);
    return existingProfile;
    
  } catch (error) {
    console.error('syncCurrentUserProfile: Erro inesperado:', error);
    return null;
  }
}

// Função para migrar todos os usuários existentes para a tabela profiles
export async function migrateAllUsersToProfiles() {
  try {
    console.log('migrateAllUsersToProfiles: Iniciando migração de todos os usuários...');
    
    // Busca todos os usuários que fizeram comentários
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('user_id')
      .not('user_id', 'is', null);
    
    if (commentsError) {
      console.error('migrateAllUsersToProfiles: Erro ao buscar comentários:', commentsError);
      return false;
    }
    
    // Remove duplicatas
    const uniqueUserIds = [...new Set(comments.map(c => c.user_id))];
    console.log('migrateAllUsersToProfiles: Usuários únicos encontrados:', uniqueUserIds.length);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const userId of uniqueUserIds) {
      try {
        // Verifica se já existe perfil
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single();
        
        if (checkError && checkError.code === 'PGRST116') {
          // Não existe, cria um perfil básico
          const { error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: userId,
              full_name: 'Usuário',
              avatar_path: null
            }]);
          
          if (createError) {
            // Só loga se não for erro de política RLS (que é esperado)
            if (createError.code !== '42501') {
              console.error('migrateAllUsersToProfiles: Erro ao criar perfil para', userId, ':', createError);
            }
            errorCount++;
          } else {
            console.log('migrateAllUsersToProfiles: Perfil criado para', userId);
            migratedCount++;
          }
        } else if (!checkError) {
          console.log('migrateAllUsersToProfiles: Perfil já existe para', userId);
        } else {
          console.error('migrateAllUsersToProfiles: Erro ao verificar perfil para', userId, ':', checkError);
          errorCount++;
        }
      } catch (error) {
        console.error('migrateAllUsersToProfiles: Erro inesperado para', userId, ':', error);
        errorCount++;
      }
    }
    
    console.log('migrateAllUsersToProfiles: Migração concluída. Criados:', migratedCount, 'Erros:', errorCount);
    return { migratedCount, errorCount, totalUsers: uniqueUserIds.length };
    
  } catch (error) {
    console.error('migrateAllUsersToProfiles: Erro inesperado:', error);
    return false;
  }
}

// Função para testar se a tabela profiles existe
export async function testProfilesTable() {
  try {
    console.log('testProfilesTable: Testando conexão com tabela profiles...');
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('testProfilesTable: Erro ao acessar tabela profiles:', error);
      return false;
    }
    
    console.log('testProfilesTable: Tabela profiles acessível');
    return true;
  } catch (error) {
    console.error('testProfilesTable: Erro inesperado:', error);
    return false;
  }
}

// Função para verificar se o usuário existe no sistema de autenticação
// Vamos usar uma abordagem diferente que não requer permissões de admin
export async function checkUserExists(userId) {
  try {
    console.log('checkUserExists: Verificando se usuário existe:', userId);
    
    // Em vez de usar admin.getUserById, vamos tentar buscar o perfil diretamente
    // Se conseguir buscar, significa que o usuário existe
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('checkUserExists: Erro ao verificar usuário:', error);
      console.error('checkUserExists: Código do erro:', error.code);
      return false;
    }
    
    console.log('checkUserExists: Usuário encontrado:', data);
    return true;
  } catch (error) {
    console.error('checkUserExists: Erro inesperado:', error);
    return false;
  }
}

export async function getProfilesByIds(userIds) {
  if (!Array.isArray(userIds) || userIds.length === 0) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_path')
    .in('id', userIds);
  if (error) {
    console.error('Erro ao buscar perfis:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function getSignedAvatarUrl(path, expiresInSec = 3600) {
  if (!path) return '';
  const { data, error } = await supabase.storage
    .from('avatars')
    .createSignedUrl(path, expiresInSec);
  if (error) return '';
  return data?.signedUrl || '';
}

export async function getProfile(userId) {
  console.log('getProfile: Buscando perfil para userId:', userId);
  
  // Primeiro, vamos tentar buscar o perfil na tabela profiles
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_path')
    .eq('id', userId)
    .single();
  
  if (!profileError) {
    console.log('getProfile: Perfil encontrado na tabela profiles:', profileData);
    return profileData;
  }
  
  console.log('getProfile: Perfil não encontrado na tabela profiles, erro:', profileError.code);
  
  // Se não encontrou na tabela profiles, vamos tentar buscar no user_metadata
  if (profileError.code === 'PGRST116') {
    console.log('getProfile: Tentando buscar no user_metadata...');
    return await getProfileFromUserMetadata(userId);
  }
  
  console.error('getProfile: Erro ao buscar perfil:', profileError);
  return null;
}

// Função para buscar perfil no user_metadata (sistema antigo)
async function getProfileFromUserMetadata(userId) {
  try {
    console.log('getProfileFromUserMetadata: Buscando perfil no user_metadata para:', userId);
    
    // Como não podemos buscar user_metadata de outros usuários diretamente,
    // vamos tentar criar um perfil básico baseado no userId
    console.log('getProfileFromUserMetadata: Criando perfil básico...');
    
    const basicProfile = {
      id: userId,
      full_name: 'Usuário',
      avatar_path: null
    };
    
    console.log('getProfileFromUserMetadata: Perfil básico criado:', basicProfile);
    return basicProfile;
    
  } catch (error) {
    console.error('getProfileFromUserMetadata: Erro inesperado:', error);
    return null;
  }
}



