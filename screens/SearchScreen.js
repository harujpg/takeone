import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import GradientBackground from '../components/GradientBackground';
import AnimatedCard from '../components/AnimatedCard';
import { getMoviesByGenre, getMoviesByYear, searchMovies } from '../services/tmdb';

export default function SearchScreen({ navigation }) {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentFilters, setCurrentFilters] = useState({ genre: null, year: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchType, setSearchType] = useState(''); // 'search', 'genre', 'year'

  const handleSearch = async (results, query) => {
    setSearchResults(results);
    setCurrentQuery(query);
    setCurrentPage(1);
    setSearchType('search');
  };

  const handleFilterChange = async (filters) => {
    setCurrentFilters(filters);
    setLoading(true);
    setCurrentPage(1);
    
    try {
      let results = [];
      let totalPages = 0;
      
      if (filters.genre && filters.year) {
        // Buscar por gênero e ano
        const genreResults = await getMoviesByGenre(filters.genre.id, 1);
        const yearResults = await getMoviesByYear(filters.year, 1);
        
        // Filtrar filmes que estão em ambos os resultados
        const genreIds = new Set(genreResults.results.map(m => m.id));
        results = yearResults.results.filter(m => genreIds.has(m.id));
        totalPages = Math.min(genreResults.total_pages, yearResults.total_pages);
        setSearchType('combined');
      } else if (filters.genre) {
        // Buscar apenas por gênero
        const genreResults = await getMoviesByGenre(filters.genre.id, 1);
        results = genreResults.results;
        totalPages = genreResults.total_pages;
        setSearchType('genre');
      } else if (filters.year) {
        // Buscar apenas por ano
        const yearResults = await getMoviesByYear(filters.year, 1);
        results = yearResults.results;
        totalPages = yearResults.total_pages;
        setSearchType('year');
      }
      
      setSearchResults(results);
      setTotalPages(totalPages);
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreResults = async () => {
    if (loadingMore || currentPage >= totalPages) return;
    
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    
    try {
      let newResults = [];
      
      if (searchType === 'search' && currentQuery) {
        const searchData = await searchMovies(currentQuery, nextPage);
        newResults = searchData.results;
      } else if (searchType === 'genre' && currentFilters.genre) {
        const genreResults = await getMoviesByGenre(currentFilters.genre.id, nextPage);
        newResults = genreResults.results;
      } else if (searchType === 'year' && currentFilters.year) {
        const yearResults = await getMoviesByYear(currentFilters.year, nextPage);
        newResults = yearResults.results;
      }
      
      setSearchResults(prev => [...prev, ...newResults]);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Erro ao carregar mais resultados:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    
    if (searchType === 'search' && currentQuery) {
      const searchData = await searchMovies(currentQuery, 1);
      setSearchResults(searchData.results);
      setTotalPages(searchData.total_pages);
    } else if (currentFilters.genre || currentFilters.year) {
      await handleFilterChange(currentFilters);
    }
    
    setRefreshing(false);
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
            <Text style={styles.rating}>
              ⭐ {item.vote_average?.toFixed(1) || 'N/A'}
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
        <Text style={styles.loadingText}>Carregando mais resultados...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyEmoji}>🔍</Text>
      </View>
      <Text style={styles.emptyTitle}>
        {currentQuery ? 'Nenhum filme encontrado' : 'Busque por filmes'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {currentQuery 
          ? `Não encontramos filmes para "${currentQuery}"`
          : 'Use a barra de busca ou filtros para encontrar filmes'
        }
      </Text>
    </View>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔍 Buscar Filmes</Text>
        </View>
        
        <SearchBar onSearch={handleSearch} onFilterChange={handleFilterChange} />
        
        {loading ? (
          <LoadingSpinner message="Carregando resultados..." />
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMovie}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmptyState}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            onEndReached={loadMoreResults}
            onEndReachedThreshold={0.1}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(15, 15, 35, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
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
  },
  rating: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyEmoji: {
    fontSize: 32,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
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