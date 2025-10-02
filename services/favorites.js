// services/favorites.js
import { supabase } from './supabase';

/**
 * Adiciona um filme aos favoritos
 */
export const addToFavorites = async (movie) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const favoriteData = {
      user_id: user.id,
      movie_id: movie.id,
      movie_title: movie.title,
      movie_poster: movie.poster_path,
      movie_year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      movie_rating: movie.vote_average,
    };

    const { data, error } = await supabase
      .from('favorites')
      .insert([favoriteData])
      .select();

    if (error) {
      // Se for erro de duplicata, não é realmente um erro
      if (error.code === '23505') {
        console.log('Filme já está nos favoritos');
        return { success: true, message: 'Filme já está nos favoritos' };
      }
      throw error;
    }

    console.log('Filme adicionado aos favoritos:', data);
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Erro ao adicionar aos favoritos:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Remove um filme dos favoritos
 */
export const removeFromFavorites = async (movieId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('movie_id', movieId);

    if (error) throw error;

    console.log('Filme removido dos favoritos');
    return { success: true };
  } catch (error) {
    console.error('Erro ao remover dos favoritos:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verifica se um filme está nos favoritos
 */
export const isFavorite = async (movieId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('movie_id', movieId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return !!data;
  } catch (error) {
    console.error('Erro ao verificar favorito:', error);
    return false;
  }
};

/**
 * Lista todos os favoritos do usuário
 */
export const getFavorites = async (page = 1, limit = 20) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('favorites')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      total: 0,
      page: 1,
      totalPages: 0
    };
  }
};

/**
 * Conta o total de favoritos do usuário
 */
export const getFavoritesCount = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error('Erro ao contar favoritos:', error);
    return 0;
  }
};

/**
 * Toggle favorito (adiciona se não existe, remove se existe)
 */
export const toggleFavorite = async (movie) => {
  try {
    const isAlreadyFavorite = await isFavorite(movie.id);
    
    if (isAlreadyFavorite) {
      return await removeFromFavorites(movie.id);
    } else {
      return await addToFavorites(movie);
    }
  } catch (error) {
    console.error('Erro ao toggle favorito:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Escuta mudanças nos favoritos em tempo real
 */
export const subscribeFavoritesChanges = (userId, callback) => {
  const channel = supabase
    .channel('favorites-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'favorites',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();

  return channel;
};
