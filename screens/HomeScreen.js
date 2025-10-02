import React, { useEffect, useState } from 'react';
import { 
  Text, 
  FlatList, 
  Image, 
  StyleSheet, 
  TouchableOpacity,
  RefreshControl,
  View,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPopularMovies } from '../services/tmdb';
import { spacing, borderRadius } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';
import AnimatedCard from '../components/AnimatedCard';
import FavoriteButton from '../components/FavoriteButton';

export default function HomeScreen({ navigation }) {
  const { colors, typography } = useTheme();
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Estilos dinâmicos baseados no tema
  const styles = StyleSheet.create({
    safe: {
      flex: 1,
    },
    header: {
      paddingHorizontal: spacing.md,
      paddingTop: 50,
      paddingBottom: spacing.sm,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.textMuted,
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 80,
    },
    menuButton: {
      padding: spacing.sm,
      marginRight: spacing.md,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flex: 1,
    },
    headerTitle: {
      ...typography.h2,
      color: colors.text,
      fontWeight: 'bold',
    },
    searchButton: {
      padding: spacing.sm,
    },
    content: {
      flex: 1,
    },
    sectionTitle: {
      ...typography.h3,
      color: colors.text,
      marginBottom: spacing.md,
      paddingHorizontal: spacing.md,
      fontWeight: 'bold',
    },
    movieCard: {
      width: '48%',
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    posterContainer: {
      position: 'relative',
      width: '100%',
      height: 200,
    },
    moviePoster: {
      width: '100%',
      height: 200,
    },
    posterPlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.cardLight,
    },
    favoriteButtonContainer: {
      position: 'absolute',
      top: 8,
      right: 8,
      zIndex: 1,
    },
    movieTitle: {
      ...typography.bodySmall,
      color: colors.text,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    movieYear: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    loadingFooter: {
      padding: spacing.md,
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.md,
    },
    listContainer: {
      padding: spacing.md,
      paddingBottom: 100,
    },
    row: {
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    movieInfo: {
      padding: spacing.sm,
    },
    movieMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    rating: {
      ...typography.caption,
      color: colors.warning,
      fontWeight: '600',
    },
  });

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const data = await getPopularMovies(page);
      console.log('Dados recebidos da API:', data);
      console.log('Primeiro filme:', data.results?.[0]);
      
      if (append) {
        setPopular(prev => [...prev, ...data.results]);
      } else {
        setPopular(data.results);
      }
      
      setCurrentPage(page);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error('Erro ao carregar filmes:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMovies(1, false);
    setRefreshing(false);
  };

  const loadMoreMovies = async () => {
    if (loadingMore || currentPage >= totalPages) return;
    
    const nextPage = currentPage + 1;
    await loadMovies(nextPage, true);
  };

  const renderMovie = ({ item, index }) => {
    const posterUrl = item.poster_path 
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : null;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('MovieDetail', { movieId: item.id })}
        style={styles.movieCard}
        activeOpacity={0.8}
      >
        <View style={styles.posterContainer}>
          {posterUrl ? (
            <Image
              source={{ uri: posterUrl }}
              style={styles.moviePoster}
              resizeMode="cover"
              onError={(error) => {
                console.log('Erro ao carregar imagem:', error);
              }}
            />
          ) : (
            <View style={[styles.moviePoster, styles.posterPlaceholder]}>
              <Ionicons name="image-outline" size={40} color={colors.textMuted} />
            </View>
          )}
          
          {/* Botão de favorito sobreposto */}
          <View style={styles.favoriteButtonContainer}>
            <FavoriteButton 
              movie={item} 
              size={20}
              onToggle={(isFavorite, movie) => {
                console.log(`${movie.title} ${isFavorite ? 'adicionado aos' : 'removido dos'} favoritos`);
              }}
            />
          </View>
        </View>
        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.movieMeta}>
            <Text style={styles.movieYear}>
              {item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'}
            </Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color={colors.warning} />
              <Text style={styles.rating}>
                {item.vote_average?.toFixed(1) || 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando mais filmes...</Text>
      </View>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Carregando filmes..." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.openDrawer()}
          >
            <Ionicons name="menu" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <Text style={styles.sectionTitle}>🎬 Filmes Populares</Text>
              <View style={styles.statusIndicator} />
            </View>
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={() => navigation.navigate('Search')}
            >
              <Ionicons name="search" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
      </View>
      
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <FlatList
          data={popular}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMovie}
          horizontal={false}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={loadMoreMovies}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
        />
      </SafeAreaView>
    </View>
  );
}
