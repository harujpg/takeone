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
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import LoadingSpinner from '../components/LoadingSpinner';
import GradientBackground from '../components/GradientBackground';
import AnimatedCard from '../components/AnimatedCard';

export default function HomeScreen({ navigation }) {
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

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

  const renderMovie = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('MovieDetail', { movieId: item.id })}
      style={styles.movieCard}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w300${item.poster_path}` }}
        style={styles.poster}
      />
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.movieMeta}>
          <Text style={styles.movieYear}>
            {new Date(item.release_date).getFullYear()}
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
    <GradientBackground>
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
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: 50, // Espaço para status bar
    paddingBottom: spacing.sm,
    backgroundColor: 'rgba(15, 15, 35, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.text,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  searchButton: {
    backgroundColor: colors.card,
    padding: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  movieCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
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
  poster: {
    width: '100%',
    height: 200,
    backgroundColor: colors.cardLight,
  },
  movieInfo: {
    padding: spacing.md,
  },
  movieTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  movieMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  movieYear: {
    ...typography.caption,
    color: colors.textSecondary,
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
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
});
