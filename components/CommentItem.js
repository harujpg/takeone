import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../constants/theme';
import { getProfile, getSignedAvatarUrl } from '../services/profiles';
import { useNavigation } from '@react-navigation/native';

export default function CommentItem({ comment }) {
  const navigation = useNavigation();
  const [author, setAuthor] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const p = await getProfile(comment.user_id);
        setAuthor(p);
        if (p?.avatar_path) {
          const url = await getSignedAvatarUrl(p.avatar_path);
          setAvatarUrl(url);
        } else {
          setAvatarUrl('');
        }
      } catch (_) {}
    })();
  }, [comment.user_id]);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.commentBox}>
      <View style={styles.commentHeader}>
        <TouchableOpacity style={styles.authorRow} onPress={() => {
          console.log('CommentItem: Navegando para perfil do usuário:', comment.user_id);
          navigation.navigate('Perfil', { screen: 'PublicProfile', params: { userId: comment.user_id } });
        }}>
          <View style={styles.avatarCircle}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarInitials}>
                {(author?.full_name || 'U').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}
              </Text>
            )}
          </View>
          <Text style={styles.authorName} numberOfLines={1}>
            {author?.full_name || 'Usuário'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.commentDate}>{formatDate(comment.created_at)}</Text>
      </View>
      <Text style={styles.commentText}>{comment.content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  commentBox: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    color: colors.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  authorName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
  commentDate: {
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  commentText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
});
