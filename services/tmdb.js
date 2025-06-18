// services/tmdb.js
import axios from 'axios';

const API_KEY = '4704e588cb6cd59c49e898b41d697a9e'; // sua chave TMDb
const BASE_URL = 'https://api.themoviedb.org/3';

const tmdb = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'pt-BR',
  },
});

// Filmes populares
export const getPopularMovies = async () => {
  try {
    const response = await tmdb.get('/movie/popular');
    return response.data.results;
  } catch (error) {
    console.error('Erro ao buscar filmes populares:', error);
    return [];
  }
};

// Detalhes do filme
export const getMovieDetails = async (movieId) => {
  try {
    const response = await tmdb.get(`/movie/${movieId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar detalhes do filme:', error);
    return null;
  }
};

// Elenco principal
export const getMovieCredits = async (movieId) => {
  try {
    const response = await tmdb.get(`/movie/${movieId}/credits`);
    return response.data.cast.slice(0, 5); // apenas os 5 principais
  } catch (error) {
    console.error('Erro ao buscar elenco:', error);
    return [];
  }
};

// Onde assistir (provedores)
export const getWatchProviders = async (movieId) => {
  try {
    const response = await tmdb.get(`/movie/${movieId}/watch/providers`);
    return response.data.results?.BR?.flatrate || []; // streaming no Brasil
  } catch (error) {
    console.error('Erro ao buscar provedores de exibição:', error);
    return [];
  }
};
