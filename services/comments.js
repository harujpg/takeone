import { supabase } from './supabase';

export async function fetchComments(movieId) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('id, content, created_at, user_id')
      .eq('movie_id', movieId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar comentários:', error);
      // Se a tabela não existe, retorna array vazio
      if (error.code === 'PGRST200' || error.message.includes('relation "comments" does not exist')) {
        console.log('Tabela comments não existe. Execute o script SQL para criá-la.');
        return [];
      }
      return [];
    }

    // Verificação de segurança para data
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    return [];
  }
}

export async function addComment(movieId, userId, content) {
  try {
    const { error } = await supabase.from('comments').insert([
      {
        movie_id: movieId,
        user_id: userId,
        content: content.trim(),
      },
    ]);

    if (error) {
      console.error('Erro ao inserir comentário:', error);
      // Se a tabela não existe, informa o usuário
      if (error.code === 'PGRST200' || error.message.includes('relation "comments" does not exist')) {
        throw new Error('Tabela de comentários não está configurada. Entre em contato com o administrador.');
      }
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    throw error;
  }
}

export async function deleteComment(commentId, userId) {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao deletar comentário:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erro ao deletar comentário:', error);
    throw error;
  }
}
