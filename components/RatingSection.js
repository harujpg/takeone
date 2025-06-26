import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors } from '../constants/theme';

export default function RatingSection({ averageRating, userRating, onRatingChange, user }) {
  const handleRate = (rating) => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para avaliar filmes.');
      return;
    }
    
    if (onRatingChange) {
      onRatingChange(rating);
    }
  };

  const formatAverage = (average) => {
    if (average === null || average === undefined || average === 0) {
      return 'N/A';
    }
    return average.toFixed(1);
  };

  return (
    <>
      <Text style={styles.subtitle}>📊 Média dos usuários:</Text>
      <Text style={styles.averageText}>
        ⭐ {formatAverage(averageRating)}
      </Text>

      {userRating && (
        <>
          <Text style={styles.subtitle}>👤 Sua avaliação:</Text>
          <Text style={styles.userRatingText}>⭐ {userRating}</Text>
        </>
      )}

      <Text style={styles.subtitle}>⭐ Avalie este filme:</Text>
      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity 
            key={star} 
            onPress={() => handleRate(star)}
            style={styles.starButton}
          >
            <Text style={[
              styles.star,
              userRating && userRating >= star && styles.starSelected
            ]}>
              ⭐
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  subtitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: colors.text, 
    marginTop: 16,
    marginBottom: 8,
  },
  averageText: { 
    fontSize: 20, 
    color: colors.primary, 
    marginTop: 4, 
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userRatingText: { 
    fontSize: 20, 
    color: '#FFD700', 
    marginTop: 4, 
    fontWeight: 'bold',
    textAlign: 'center',
  },
  ratingRow: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginVertical: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  starButton: { 
    marginHorizontal: 8,
    padding: 8,
  },
  star: { 
    fontSize: 36,
    color: colors.textSecondary,
  },
  starSelected: { 
    color: '#FFD700',
    transform: [{ scale: 1.1 }],
  },
});
