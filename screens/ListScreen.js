// screens/ListScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

export default function ListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suas Listas</Text>
      <Text style={styles.text}>Nenhuma lista criada ainda.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: colors.text,
  },
});
