import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, Modal } from 'react-native';
import { colors } from '../constants/theme';
import { supabase, getUserLists, addMovieToList, checkMovieInUserLists } from '../services/supabase';

export default function ActionButtons({ movie, onAddToList }) {
  const [showListModal, setShowListModal] = useState(false);
  const [userLists, setUserLists] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showListModal) {
      loadUserLists();
    }
  }, [showListModal]);

  const loadUserLists = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        Alert.alert('Erro', 'Você precisa estar logado para usar listas.');
        setShowListModal(false);
        return;
      }

      const lists = await getUserLists(user.id);
      setUserLists(Array.isArray(lists) ? lists : []);
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
      Alert.alert('Erro', 'Não foi possível carregar suas listas.');
      setUserLists([]);
    }
  };

  const handleAddToSelectedList = async (listId, listName) => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();

      if (!user?.id) {
        Alert.alert('Erro', 'Você precisa estar logado para adicionar filmes à lista.');
        return;
      }

      if (!movie?.id || !movie?.title) {
        Alert.alert('Erro', 'Dados do filme inválidos.');
        return;
      }

      await addMovieToList(
        listId, 
        movie.id, 
        movie.title, 
        movie.poster_path || ''
      );

      setShowListModal(false);
      Alert.alert('Sucesso', `Filme adicionado à lista "${listName}"!`);
      
      if (onAddToList) {
        onAddToList();
      }
    } catch (error) {
      console.error('Erro ao adicionar filme à lista:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o filme à lista.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToList = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        Alert.alert('Erro', 'Você precisa estar logado para adicionar filmes à lista.');
        return;
      }
      setShowListModal(true);
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      Alert.alert('Erro', 'Erro ao verificar autenticação.');
    }
  };

  return (
    <>
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.button} onPress={handleAddToList}>
          <Text style={styles.buttonText}>➕ Adicionar à Lista</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showListModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowListModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escolha uma lista</Text>
            
            {Array.isArray(userLists) && userLists.length === 0 ? (
              <View style={styles.emptyLists}>
                <Text style={styles.emptyText}>Você ainda não tem listas.</Text>
                <Text style={styles.emptySubtext}>
                  Crie uma lista primeiro na aba "Listas".
                </Text>
              </View>
            ) : (
              Array.isArray(userLists) && userLists.map((list) => (
                <TouchableOpacity
                  key={list.id}
                  style={styles.listOption}
                  onPress={() => handleAddToSelectedList(list.id, list.name)}
                  disabled={loading}
                >
                  <Text style={styles.listName}>{list.name}</Text>
                  {list.description && (
                    <Text style={styles.listDescription}>{list.description}</Text>
                  )}
                </TouchableOpacity>
              ))
            )}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowListModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  buttonGroup: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyLists: {
    alignItems: 'center',
    marginVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  listOption: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  listName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  listDescription: {
    fontSize: 14,
    color: '#888',
  },
  cancelButton: {
    backgroundColor: '#666',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 