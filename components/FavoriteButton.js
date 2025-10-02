// components/FavoriteButton.js
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { toggleFavorite, isFavorite } from '../services/favorites';

export default function FavoriteButton({ 
  movie, 
  size = 24, 
  style,
  onToggle // callback opcional quando favorito muda
}) {
  const { colors } = useTheme();
  const { triggerHaptic } = useSettings();
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verifica se é favorito ao montar o componente
  useEffect(() => {
    checkFavoriteStatus();
  }, [movie.id]);

  const checkFavoriteStatus = async () => {
    try {
      const favorite = await isFavorite(movie.id);
      setIsFav(favorite);
    } catch (error) {
      console.error('Erro ao verificar status de favorito:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (loading) return;

    try {
      setLoading(true);
      
      // Feedback háptico
      triggerHaptic('light');
      
      // Atualiza UI otimisticamente
      const newFavStatus = !isFav;
      setIsFav(newFavStatus);
      
      // Chama API
      const result = await toggleFavorite(movie);
      
      if (result.success) {
        // Feedback háptico de sucesso
        triggerHaptic('success');
        
        // Chama callback se fornecido
        if (onToggle) {
          onToggle(newFavStatus, movie);
        }
        
        // Mostra mensagem sutil
        console.log(
          newFavStatus 
            ? `"${movie.title}" adicionado aos favoritos` 
            : `"${movie.title}" removido dos favoritos`
        );
      } else {
        // Reverte mudança otimista em caso de erro
        setIsFav(!newFavStatus);
        
        Alert.alert(
          'Erro',
          result.error || 'Não foi possível atualizar favoritos',
          [{ text: 'OK' }]
        );
        
        // Feedback háptico de erro
        triggerHaptic('error');
      }
    } catch (error) {
      // Reverte mudança otimista
      setIsFav(!isFav);
      
      console.error('Erro ao toggle favorito:', error);
      Alert.alert('Erro', 'Não foi possível atualizar favoritos');
      
      triggerHaptic('error');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    button: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: loading ? 0.6 : 1,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handleToggleFavorite}
      disabled={loading}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isFav ? 'heart' : 'heart-outline'}
        size={size}
        color={isFav ? '#FF6B6B' : colors.text}
      />
    </TouchableOpacity>
  );
}
