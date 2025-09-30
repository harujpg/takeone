import { supabase } from './supabase';

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
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_path')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}

