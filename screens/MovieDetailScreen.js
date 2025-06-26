import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Imports locais
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { getAverageRating, getUserRating, saveRating } from '../services/supabase';
import { getMovieDetails } from '../services/tmdb';
import { supabase } from '../services/supabase';

import GradientBackground from '../components/GradientBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import MoviePoster from '../components/MoviePoster';
import MovieInfo from '../components/MovieInfo';
import RatingSection from '../components/RatingSection';
import CommentsSection from '../components/CommentsSection';
import ActionButtons from '../components/ActionButtons';

const { width } = Dimensions.get('window');

export default function MovieDetailScreen({ route, navigation }) {
  const { movieId } = route.params;
  const [movie, setMovie] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
    loadMovieDetails();
  }, []);

  useEffect(() => {
    if (user !== null) {
      loadUserRating();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadMovieDetails = async () => {
    try {
      setLoading(true);
      
      // Buscar detalhes do filme
      const movieData = await getMovieDetails(movieId);
      setMovie(movieData);

      // Buscar média de avaliações
      const avgRating = await getAverageRating(movieId);
      setAverageRating(avgRating);
    } catch (error) {
      console.error('Erro ao carregar detalhes do filme:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserRating = async () => {
    try {
      if (user) {
        const userRatingData = await getUserRating(user.id, movieId);
        setUserRating(userRatingData);
      }
    } catch (error) {
      console.error('Erro ao carregar avaliação do usuário:', error);
    }
  };

  const handleRatingChange = async (rating) => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para avaliar filmes.');
      return;
    }

    try {
      await saveRating(user.id, movieId, rating);
      setUserRating(rating);
      
      // Recalcular média
      const newAvgRating = await getAverageRating(movieId);
      setAverageRating(newAvgRating);
      
      // Feedback de sucesso
      Alert.alert('Sucesso', `Avaliação de ${rating} estrelas salva com sucesso!`);
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      Alert.alert('Erro', 'Não foi possível salvar sua avaliação. Tente novamente.');
    }
  };

  const handleAddToList = () => {
    // Recarregar dados se necessário
    loadMovieDetails();
  };

  if (loading) {
    return <LoadingSpinner message="Carregando filme..." />;
  }

  if (!movie) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Filme não encontrado</Text>
          <Text style={styles.errorSubtitle}>
            Não foi possível carregar os detalhes deste filme.
          </Text>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header com botão voltar */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Poster e informações principais */}
          <View style={styles.mainContent}>
            <MoviePoster movie={movie} />
            <MovieInfo movie={movie} averageRating={averageRating} />
          </View>

          {/* Seção de avaliação */}
          <View style={styles.section}>
            <RatingSection
              userRating={userRating}
              averageRating={averageRating}
              onRatingChange={handleRatingChange}
              user={user}
            />
          </View>

          {/* Botões de ação */}
          <View style={styles.section}>
            <ActionButtons movie={movie} onAddToList={handleAddToList} />
          </View>

          {/* Seção de comentários */}
          <View style={styles.section}>
            <CommentsSection movieId={movieId} user={user} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(15, 15, 35, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    backgroundColor: colors.card,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  mainContent: {
    padding: spacing.lg,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  errorSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});