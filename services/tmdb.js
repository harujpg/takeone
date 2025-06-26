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
export const getPopularMovies = async (page = 1) => {
  try {
    const response = await tmdb.get('/movie/popular', {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar filmes populares:', error);
    return { results: [], total_pages: 0, total_results: 0 };
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

// Buscar filmes
export const searchMovies = async (query, page = 1) => {
  try {
    const response = await tmdb.get('/search/movie', {
      params: { 
        query,
        page
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar filmes:', error);
    return { results: [], total_pages: 0, total_results: 0 };
  }
};

// Filmes por gênero
export const getMoviesByGenre = async (genreId, page = 1) => {
  try {
    const response = await tmdb.get('/discover/movie', {
      params: {
        with_genres: genreId,
        page
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar filmes por gênero:', error);
    return { results: [], total_pages: 0, total_results: 0 };
  }
};

// Lista de gêneros
export const getGenres = async () => {
  try {
    const response = await tmdb.get('/genre/movie/list');
    return response.data.genres;
  } catch (error) {
    console.error('Erro ao buscar gêneros:', error);
    return [];
  }
};

// Filmes por ano
export const getMoviesByYear = async (year, page = 1) => {
  try {
    const response = await tmdb.get('/discover/movie', {
      params: {
        primary_release_year: year,
        page
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar filmes por ano:', error);
    return { results: [], total_pages: 0, total_results: 0 };
  }
};
