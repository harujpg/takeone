// screens/FavoritesScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { getFavorites, removeFromFavorites } from '../services/favorites';
import LoadingSpinner from '../components/LoadingSpinner';
import FavoriteButton from '../components/FavoriteButton';
import { Image } from 'react-native';
import { spacing, borderRadius } from '../constants/theme';

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const { colors, typography } = useTheme();
  const { triggerHaptic } = useSettings();
  
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Estilos dinâmicos
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: spacing.sm,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.textMuted,
      minHeight: 80,
    },
    menuButton: {
      padding: 8,
      marginRight: 16,
    },
    titleContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      ...typography.h2,
      color: colors.text,
      fontWeight: 'bold',
      flexShrink: 1,
    },
    countBadge: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginLeft: 8,
    },
    countText: {
      ...typography.caption,
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    listContainer: {
      padding: spacing.md,
    },
    movieCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    posterContainer: {
      position: 'relative',
      marginRight: spacing.md,
    },
    poster: {
      width: 80,
      height: 120,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.cardLight,
    },
    posterPlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    favoriteButtonContainer: {
      position: 'absolute',
      top: -5,
      right: -5,
      zIndex: 1,
    },
    movieInfo: {
      flex: 1,
      justifyContent: 'space-between',
    },
    movieTitle: {
      ...typography.body,
      color: colors.text,
      fontWeight: 'bold',
      marginBottom: spacing.xs,
    },
    movieMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    movieYear: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginRight: spacing.md,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rating: {
      ...typography.bodySmall,
      color: colors.warning,
      fontWeight: '600',
      marginLeft: spacing.xs,
    },
    addedDate: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyIcon: {
      marginBottom: spacing.lg,
    },
    emptyTitle: {
      ...typography.h3,
      color: colors.text,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    emptySubtitle: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    exploreButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
    },
    exploreButtonText: {
      ...typography.body,
      color: '#FFFFFF',
      fontWeight: 'bold',
      marginLeft: spacing.sm,
    },
    loadingFooter: {
      padding: spacing.md,
      alignItems: 'center',
    },
  });

  // Carrega favoritos quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const result = await getFavorites(page, 20);
      
      if (result.success) {
        if (append) {
          setFavorites(prev => [...prev, ...result.data]);
        } else {
          setFavorites(result.data);
        }
        
        setCurrentPage(page);
        setTotalPages(result.totalPages);
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus favoritos');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites(1, false);
    setRefreshing(false);
  };

  const loadMoreFavorites = async () => {
    if (loadingMore || currentPage >= totalPages) return;
    await loadFavorites(currentPage + 1, true);
  };

  const handleFavoriteToggle = (isFavorite, movie) => {
    if (!isFavorite) {
      // Remove da lista local quando desfavorita
      setFavorites(prev => prev.filter(fav => fav.movie_id !== movie.id));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderMovie = ({ item }) => {
    const posterUrl = item.movie_poster 
      ? `https://image.tmdb.org/t/p/w300${item.movie_poster}`
      : null;

    // Converte o item de favorito para formato de filme para o FavoriteButton
    const movieData = {
      id: item.movie_id,
      title: item.movie_title,
      poster_path: item.movie_poster,
      release_date: item.movie_year ? `${item.movie_year}-01-01` : null,
      vote_average: item.movie_rating,
    };

    return (
      <TouchableOpacity
        style={styles.movieCard}
        onPress={() => navigation.navigate('MovieDetail', { movieId: item.movie_id })}
        activeOpacity={0.8}
      >
        <View style={styles.posterContainer}>
          {posterUrl ? (
            <Image
              source={{ uri: posterUrl }}
              style={styles.poster}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.poster, styles.posterPlaceholder]}>
              <Ionicons name="image-outline" size={24} color={colors.textMuted} />
            </View>
          )}
          
          <View style={styles.favoriteButtonContainer}>
            <FavoriteButton 
              movie={movieData}
              size={18}
              onToggle={handleFavoriteToggle}
            />
          </View>
        </View>

        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle} numberOfLines={2}>
            {item.movie_title}
          </Text>
          
          <View style={styles.movieMeta}>
            {item.movie_year && (
              <Text style={styles.movieYear}>{item.movie_year}</Text>
            )}
            
            {item.movie_rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color={colors.warning} />
                <Text style={styles.rating}>
                  {item.movie_rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
          
          <Text style={styles.addedDate}>
            Adicionado em {formatDate(item.created_at)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="heart-outline" size={64} color={colors.textMuted} />
      </View>
      
      <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
      
      <Text style={styles.emptySubtitle}>
        Explore filmes e adicione seus favoritos tocando no ❤️
      </Text>
      
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => {
          triggerHaptic('light');
          navigation.navigate('Home');
        }}
      >
        <Ionicons name="search" size={20} color="#FFFFFF" />
        <Text style={styles.exploreButtonText}>Explorar Filmes</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <LoadingSpinner message="Carregando seus favoritos..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Meus Favoritos</Text>
          {favorites.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{favorites.length}</Text>
            </View>
          )}
        </View>
      </View>

      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <FlatList
          data={favorites}
          keyExtractor={(item) => `${item.user_id}-${item.movie_id}`}
          renderItem={renderMovie}
          contentContainerStyle={favorites.length === 0 ? { flex: 1 } : styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={loadMoreFavorites}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
      </SafeAreaView>
    </View>
  );
}
