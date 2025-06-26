import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors } from '../constants/theme';
import CommentItem from './CommentItem';
import { fetchComments, addComment } from '../services/comments';
import { supabase } from '../services/supabase';

export default function CommentsSection({ movieId, user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [tableError, setTableError] = useState(false);

  useEffect(() => {
    loadComments();
  }, [movieId]);

  const loadComments = async () => {
    try {
      const commentsData = await fetchComments(movieId);
      setComments(commentsData || []);
      setTableError(false);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      if (error.message.includes('não está configurada')) {
        setTableError(true);
      }
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para comentar.');
      return;
    }

    try {
      setLoading(true);
      await addComment(movieId, user.id, newComment.trim());
      setNewComment('');
      // Recarregar comentários
      await loadComments();
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      if (error.message.includes('não está configurada')) {
        Alert.alert('Erro', 'Sistema de comentários não está disponível no momento.');
      } else {
        Alert.alert('Erro', 'Não foi possível adicionar o comentário.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Verificação de segurança para comments
  const safeComments = Array.isArray(comments) ? comments : [];

  // Se a tabela não existe, mostrar mensagem
  if (tableError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.subtitle}>Comentários:</Text>
        <Text style={styles.errorText}>
          Sistema de comentários não está disponível no momento.
        </Text>
      </View>
    );
  }

  return (
    <>
      <Text style={styles.subtitle}>Comentários:</Text>
      
      {safeComments.length === 0 ? (
        <Text style={styles.text}>Nenhum comentário ainda.</Text>
      ) : (
        safeComments.map((comment, i) => (
          <CommentItem key={i} comment={comment} />
        ))
      )}

      <TextInput
        style={styles.input}
        placeholder="Escreva um comentário..."
        placeholderTextColor="#aaa"
        value={newComment}
        onChangeText={setNewComment}
        multiline
        maxLength={500}
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? '💬 Enviando...' : '💬 Comentar'}
        </Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: colors.card,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
  buttonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontStyle: 'italic',
  },
});
