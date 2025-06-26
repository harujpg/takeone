import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

export default function MovieInfo({ movie, averageRating }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{movie.title}</Text>
      
      <View style={styles.metaInfo}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar" size={16} color={colors.textSecondary} />
          <Text style={styles.metaText}>
            {new Date(movie.release_date).getFullYear()}
          </Text>
        </View>
        
        <View style={styles.metaItem}>
          <Ionicons name="time" size={16} color={colors.textSecondary} />
          <Text style={styles.metaText}>{movie.runtime} min</Text>
        </View>
        
        <View style={styles.metaItem}>
          <Ionicons name="star" size={16} color={colors.warning} />
          <Text style={styles.metaText}>
            {averageRating?.toFixed(1) || 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.genresContainer}>
        {movie.genres?.map((genre, index) => (
          <View key={genre.id} style={styles.genreTag}>
            <Text style={styles.genreText}>{genre.name}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sinopse</Text>
        <Text style={styles.overview}>{movie.overview}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={styles.infoValue}>{movie.status}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Idioma</Text>
            <Text style={styles.infoValue}>{movie.original_language?.toUpperCase()}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Orçamento</Text>
            <Text style={styles.infoValue}>
              ${movie.budget?.toLocaleString() || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Receita</Text>
            <Text style={styles.infoValue}>
              ${movie.revenue?.toLocaleString() || 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.md,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  genreTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  genreText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  overview: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  infoValue: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
});
