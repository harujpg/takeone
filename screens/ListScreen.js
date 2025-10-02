// screens/ListScreen.js
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { supabase, getListMovieCount } from '../services/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import ListCard from '../components/ListCard';

export default function ListScreen({ navigation }) {
  const { colors, typography } = useTheme();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [user, setUser] = useState(null);

  // Estilos dinâmicos baseados no tema
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      paddingTop: 50,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.textMuted,
    },
    title: {
      ...typography.h2,
      color: colors.text,
      fontWeight: 'bold',
    },
    addButton: {
      backgroundColor: colors.primary,
      padding: 8,
      borderRadius: 8,
    },
    listContainer: {
      padding: 16,
    },
    loadingFooter: {
      padding: 16,
      alignItems: 'center',
    },
    loadingText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginTop: 8,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyText: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
    },
    createButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    createButtonText: {
      ...typography.body,
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
  });

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadLists();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadLists = async (page = 0, append = false) => {
    if (!user) return;

    try {
      if (page === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const pageSize = 10;
      const from = page * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from('movie_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Verificação de segurança para data
      if (!data || !Array.isArray(data)) {
        if (append) {
          setLists(prev => [...prev]);
        } else {
          setLists([]);
        }
        setCurrentPage(page);
        setHasMore(false);
        return;
      }

      // Buscar contagem de filmes para cada lista
      const listsWithCount = await Promise.all(
        data.map(async (list) => {
          const movieCount = await getListMovieCount(list.id);
          console.log(`Lista ${list.name} (ID: ${list.id}): ${movieCount} filmes`);
          return {
            ...list,
            movie_count: movieCount
          };
        })
      );

      if (append) {
        setLists(prev => [...prev, ...listsWithCount]);
      } else {
        setLists(listsWithCount);
      }

      setCurrentPage(page);
      setHasMore(Array.isArray(data) && data.length === pageSize);
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLists(0, false);
    setRefreshing(false);
  };

  const loadMoreLists = async () => {
    if (loadingMore || !hasMore) return;
    
    const nextPage = currentPage + 1;
    await loadLists(nextPage, true);
  };

  const renderList = ({ item }) => (
    <ListCard 
      list={item} 
      onPress={() => navigation.navigate('ListDetail', { listId: item.id })}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando mais listas...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="list-outline" size={64} color={colors.text} />
      <Text style={styles.emptyTitle}>Nenhuma lista criada</Text>
      <Text style={styles.emptySubtitle}>
        Crie sua primeira lista de filmes favoritos!
      </Text>
      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateList')}
      >
        <Ionicons name="add" size={20} color={colors.background} />
        <Text style={styles.createButtonText}>Criar Lista</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <LoadingSpinner message="Carregando suas listas..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Minhas Listas</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateList')}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={lists}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderList}
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
        onEndReached={loadMoreLists}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
