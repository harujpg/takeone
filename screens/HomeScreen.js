import React, { useEffect, useState } from 'react';
import { Text, FlatList, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPopularMovies } from '../services/tmdb';
import { colors } from '../constants/theme';

export default function HomeScreen({ navigation }) {
  const [popular, setPopular] = useState([]);

  useEffect(() => {
    async function loadMovies() {
      const pop = await getPopularMovies();
      setPopular(pop);
    }
    loadMovies();
  }, []);

  const renderMovie = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('MovieDetail', { movieId: item.id })}
      style={styles.movieContainer}
    >
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w300${item.poster_path}` }}
        style={styles.poster}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>🎬 Filmes Populares</Text>
        <FlatList
          data={popular}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMovie}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
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
    paddingTop: 20,
    paddingBottom: 100, // evita sobreposição com a TabBar
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 10,
  },
  list: {
    paddingLeft: 16,
  },
  movieContainer: {
    marginRight: 12,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#222',
  },
});
