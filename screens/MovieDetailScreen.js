import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { getMovieDetails } from '../services/tmdb';

export default function MovieDetailScreen({ route }) {
  const { movieId } = route.params;
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    async function fetchMovie() {
      const data = await getMovieDetails(movieId);
      setMovie(data);
    }
    fetchMovie();
  }, [movieId]);

  if (!movie) {
    return <Text>Carregando...</Text>;
  }

  return (
    <ScrollView style={{ padding: 20 }}>
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
        style={{ width: '100%', height: 400, borderRadius: 10, marginBottom: 20 }}
        resizeMode="cover"
      />
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{movie.title}</Text>
      <Text style={{ marginTop: 10 }}>Lançamento: {movie.release_date}</Text>
      <Text style={{ marginTop: 10 }}>Nota: {movie.vote_average}</Text>
      <Text style={{ marginTop: 10 }}>{movie.overview}</Text>
    </ScrollView>
  );
}
