import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Conexão Supabase
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
// ✅ Salva ou atualiza avaliação do usuário
//
export async function saveRating(user_id, movie_id, rating) {
  try {
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
  } catch (error) {
    console.error('Erro ao salvar avaliação:', error);
    throw error;
  }
}

//
// ✅ Retorna a média de avaliação do filme
//
export async function getAverageRating(movie_id) {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('movie_id', movie_id);

    if (error) {
      console.error('Erro ao buscar avaliações:', error);
      return 0;
    }

    // Verificação de segurança para data
    if (!data || !Array.isArray(data) || data.length === 0) {
      return 0;
    }

    const sum = data.reduce((acc, item) => acc + (item.rating || 0), 0);
    const average = sum / data.length;
    
    return Number(average) || 0;
  } catch (error) {
    console.error('Erro ao calcular média:', error);
    return 0;
  }
}

//
// ✅ Retorna a avaliação do usuário logado
//
export async function getUserRating(user_id, movie_id) {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('user_id', user_id)
      .eq('movie_id', movie_id)
      .single();

    if (error) {
      // Se não encontrou avaliação, retorna null (não é erro)
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Erro ao buscar avaliação do usuário:', error);
      return null;
    }

    return data?.rating || null;
  } catch (error) {
    console.error('Erro ao buscar avaliação do usuário:', error);
    return null;
  }
}

//
// ✅ SISTEMA DE LISTAS
//

// Criar uma nova lista
export async function createList(user_id, list_name, description = '') {
  const { data, error } = await supabase
    .from('movie_lists')
    .insert([{ user_id, name: list_name, description }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar lista:', error);
    throw error;
  }

  return data;
}

// Buscar contagem de filmes de uma lista
export async function getListMovieCount(list_id) {
  try {
    const { data, error } = await supabase
      .from('list_movies')
      .select('id')
      .eq('list_id', list_id);

    if (error) {
      console.error('Erro ao contar filmes da lista:', error);
      return 0;
    }

    // Verificação de segurança para data
    return Array.isArray(data) ? data.length : 0;
  } catch (error) {
    console.error('Erro ao contar filmes da lista:', error);
    return 0;
  }
}

// Buscar listas do usuário
export async function getUserLists(user_id) {
  try {
    const { data, error } = await supabase
      .from('movie_lists')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar listas:', error);
      return [];
    }

    // Verificação de segurança para data
    if (!data || !Array.isArray(data)) {
      return [];
    }

    // Buscar contagem de filmes para cada lista
    const listsWithCount = await Promise.all(
      data.map(async (list) => {
        const movieCount = await getListMovieCount(list.id);
        return {
          ...list,
          movie_count: movieCount
        };
      })
    );

    return listsWithCount;
  } catch (error) {
    console.error('Erro ao buscar listas:', error);
    return [];
  }
}

// Adicionar filme à lista
export async function addMovieToList(list_id, movie_id, movie_title, movie_poster) {
  const { data, error } = await supabase
    .from('list_movies')
    .insert([{ 
      list_id, 
      movie_id, 
      movie_title, 
      movie_poster,
      added_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar filme à lista:', error);
    throw error;
  }

  return data;
}

// Remover filme da lista
export async function removeMovieFromList(list_id, movie_id) {
  const { error } = await supabase
    .from('list_movies')
    .delete()
    .eq('list_id', list_id)
    .eq('movie_id', movie_id);

  if (error) {
    console.error('Erro ao remover filme da lista:', error);
    throw error;
  }
}

// Buscar filmes de uma lista
export async function getListMovies(list_id) {
  const { data, error } = await supabase
    .from('list_movies')
    .select('*')
    .eq('list_id', list_id)
    .order('added_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar filmes da lista:', error);
    return [];
  }

  // Verificação de segurança para data
  return Array.isArray(data) ? data : [];
}

// Verificar se filme está em alguma lista do usuário
export async function checkMovieInUserLists(user_id, movie_id) {
  const { data, error } = await supabase
    .from('list_movies')
    .select('list_id, movie_lists(name)')
    .eq('movie_id', movie_id)
    .eq('movie_lists.user_id', user_id);

  if (error) {
    console.error('Erro ao verificar filme nas listas:', error);
    return [];
  }

  // Verificação de segurança para data
  return Array.isArray(data) ? data : [];
}

// Deletar lista
export async function deleteList(list_id) {
  // Primeiro remove todos os filmes da lista
  await supabase
    .from('list_movies')
    .delete()
    .eq('list_id', list_id);

  // Depois remove a lista
  const { error } = await supabase
    .from('movie_lists')
    .delete()
    .eq('id', list_id);

  if (error) {
    console.error('Erro ao deletar lista:', error);
    throw error;
  }
}
