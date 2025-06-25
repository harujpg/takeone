import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Substitua pelos seus dados reais do Supabase
const supabaseUrl = 'https://cgghzzysfkpjxugbimxq.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZ2h6enlzZmtwanh1Z2JpbXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTk2MzgsImV4cCI6MjA2NjQzNTYzOH0.HQnB6HhiDtA3ZACII7co9UL5oyfXZSyXoPIqPPv3wj4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

//
// ✅ Função: salvar avaliação (upsert para evitar duplicação)
//
export async function saveRating(user_id, movie_id, rating) {
  const { data, error } = await supabase
    .from('ratings')
    .upsert([{ user_id, movie_id, rating }], {
      onConflict: ['user_id', 'movie_id'],
    });

  if (error) {
    console.error('Erro ao salvar avaliação:', error);
    throw error;
  }

  return data;
}

//
// ✅ Função: pegar a média de avaliações de um filme
//
export async function getAverageRating(movie_id) {
  const { data, error } = await supabase
    .from('ratings')
    .select('rating')
    .eq('movie_id', movie_id);

  if (error) {
    console.error('Erro ao buscar avaliações:', error);
    return null;
  }

  if (data.length === 0) return 0;

  const total = data.reduce((acc, cur) => acc + cur.rating, 0);
  return total / data.length;
}

//
// ✅ Função: pegar a avaliação do usuário logado para um filme
//
export async function getUserRating(user_id, movie_id) {
  const { data, error } = await supabase
    .from('ratings')
    .select('rating')
    .eq('user_id', user_id)
    .eq('movie_id', movie_id)
    .single();

  if (error) return null;
  return data.rating;
}
