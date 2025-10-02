import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/theme';

export default function SettingsScreenSimple() {
  const navigation = useNavigation();
  
  // Usando cores estáticas para esta tela simples
  const staticColors = {
    background: '#0F0F23',
    text: '#F8FAFC',
    primary: '#6366F1',
    card: '#16213E',
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={24} color="#6366F1" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Configurações</Text>
          <View style={styles.statusIndicator} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.text}>Tela de Configurações</Text>
        <Text style={styles.subtext}>Esta é uma versão simplificada para teste</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(15, 15, 35, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 80,
  },
  menuButton: {
    padding: 8,
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    flexShrink: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
