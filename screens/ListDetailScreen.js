import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';
import { getListMovies, removeMovieFromList, supabase } from '../services/supabase';

export default function ListDetailScreen({ route, navigation }) {
  const { listId } = route.params;
  const [list, setList] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListAndMovies();
  }, []);

  const loadListAndMovies = async () => {
    try {
      // Buscar dados da lista
      const { data: listData, error: listError } = await supabase
        .from('movie_lists')
        .select('*')
        .eq('id', listId)
        .single();

      if (listError) throw listError;
      setList(listData);

      // Buscar filmes da lista
      const listMovies = await getListMovies(listId);
      setMovies(listMovies);
    } catch (error) {
      console.error('Erro ao carregar filmes da lista:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMovie = async (movieId) => {
    Alert.alert(
      'Remover filme',
      'Tem certeza que deseja remover este filme da lista?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMovieFromList(listId, movieId);
              await loadListAndMovies();
              Alert.alert('Sucesso', 'Filme removido da lista!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível remover o filme.');
            }
          },
        },
      ]
    );
  };

  const handleMoviePress = (movie) => {
    navigation.navigate('Home', { 
      screen: 'MovieDetail', 
      params: { movieId: movie.movie_id } 
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!list) {
    return (
      <SafeAreaView style={styles.loader}>
        <Text style={styles.errorText}>Lista não encontrada</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{list.name}</Text>
          {list.description && (
            <Text style={styles.description}>{list.description}</Text>
          )}
          <Text style={styles.movieCount}>
            {Array.isArray(movies) ? movies.length : 0} filme{Array.isArray(movies) && movies.length !== 1 ? 's' : ''} na lista
          </Text>
        </View>

        {Array.isArray(movies) && movies.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhum filme nesta lista.</Text>
            <Text style={styles.emptySubtext}>
              Adicione filmes à lista para vê-los aqui!
            </Text>
          </View>
        ) : (
          movies.map((movie) => (
            <View key={`${movie.list_id}-${movie.movie_id}`} style={styles.movieCard}>
              <TouchableOpacity 
                style={styles.movieInfo}
                onPress={() => handleMoviePress(movie)}
              >
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w92${movie.movie_poster}` }}
                  style={styles.moviePoster}
                />
                <View style={styles.movieDetails}>
                  <Text style={styles.movieTitle}>{movie.movie_title}</Text>
                  <Text style={styles.addedDate}>
                    Adicionado em {new Date(movie.added_at).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => handleRemoveMovie(movie.movie_id)}
              >
                <Text style={styles.removeButtonText}>❌</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 50,
  },
  loader: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  movieCount: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  movieCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  movieInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  moviePoster: {
    width: 60,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
  },
  movieDetails: {
    flex: 1,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  addedDate: {
    fontSize: 12,
    color: '#888',
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
  },
}); 