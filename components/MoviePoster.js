import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors, spacing, borderRadius } from '../constants/theme';

export default function MoviePoster({ movie }) {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
        style={styles.poster}
      />
      <View style={styles.overlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  poster: {
    width: '100%',
    height: 400,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.cardLight,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});
