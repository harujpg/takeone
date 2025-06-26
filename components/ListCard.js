import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

export default function ListCard({ list, onPress, onDelete }) {
  if (!list) return null;

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress && onPress(list)}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="list" size={24} color={colors.primary} />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{list.name || 'Lista sem nome'}</Text>
            <View style={styles.movieCountContainer}>
              <Ionicons name="film" size={14} color={colors.accent} />
              <Text style={styles.movieCount}>
                {list.movie_count || 0} filme{list.movie_count !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>
        
        {list.description && (
          <Text style={styles.description}>{list.description}</Text>
        )}
        
        <View style={styles.footer}>
          <Text style={styles.date}>
            Criada em {list.created_at ? new Date(list.created_at).toLocaleDateString('pt-BR') : 'Data desconhecida'}
          </Text>
          
          {onDelete && (
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => onDelete(list.id)}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  title: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  movieCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  movieCount: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
  },
  deleteButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
}); 