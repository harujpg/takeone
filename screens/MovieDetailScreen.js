import React, { useEffect, useState } from 'react';
import { Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMovieDetails, getMovieCredits, getWatchProviders } from '../services/tmdb';
import { colors } from '../constants/theme';
import { supabase, saveRating, getAverageRating, getUserRating } from '../services/supabase';

export default function MovieDetailScreen({ route }) {
  const { movieId } = route.params;
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState(null);

  useEffect(() => {
    async function loadDetails() {
      const details = await getMovieDetails(movieId);
      const elenco = await getMovieCredits(movieId);
      const provedores = await getWatchProviders(movieId);
      setMovie(details);
      setCast(elenco);
      setProviders(provedores);
      setLoading(false);

      const user = await supabase.auth.getUser();
      const userId = user.data?.user?.id;

      const avg = await getAverageRating(movieId);
      setAverageRating(avg?.toFixed(1));

      if (userId) {
        const userRated = await getUserRating(userId, movieId);
        setUserRating(userRated);
      }
    }
    loadDetails();
  }, [movieId]);

  const handleRateMovie = async (value) => {
    const user = await supabase.auth.getUser();
    const userId = user.data?.user?.id;

    if (!userId) {
      Alert.alert('Erro', 'Você precisa estar logado para avaliar.');
      return;
    }

    try {
      await saveRating(userId, movieId, value);
      setUserRating(value);
      const avg = await getAverageRating(movieId);
      setAverageRating(avg?.toFixed(1));
      Alert.alert('Sucesso', `Você avaliou com ${value} estrela${value > 1 ? 's' : ''}.`);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a avaliação.');
    }
  };

  if (loading || !movie) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
          style={styles.poster}
        />

        <Text style={styles.title}>{movie.title}</Text>

        <Text style={styles.subtitle}>Média dos usuários:</Text>
        <Text style={styles.text}>⭐ {averageRating || 'N/A'}</Text>

        {userRating && (
          <>
            <Text style={styles.subtitle}>Sua avaliação:</Text>
            <Text style={styles.text}>⭐ {userRating}</Text>
          </>
        )}

        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => handleRateMovie(star)}>
              <Text style={styles.star}>⭐</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.subtitle}>Gêneros:</Text>
        <Text style={styles.text}>{movie.genres.map(g => g.name).join(', ')}</Text>

        <Text style={styles.subtitle}>Sinopse:</Text>
        <Text style={styles.text}>{movie.overview}</Text>

        <Text style={styles.subtitle}>Elenco principal:</Text>
        <Text style={styles.text}>{cast.map(c => c.name).join(', ')}</Text>

        {providers.length > 0 && (
          <>
            <Text style={styles.subtitle}>Disponível em:</Text>
            <Text style={styles.text}>{providers.map(p => p.provider_name).join(', ')}</Text>
          </>
        )}

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>➕ Adicionar à Lista</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 50,
  },
  poster: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 12,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    marginTop: 4,
  },
  loader: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonGroup: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  star: {
    fontSize: 32,
    marginHorizontal: 4,
  },
});
