import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import MovieDetailScreen from '../screens/MovieDetailScreen';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: '#0D0D0D' },
      headerTintColor: '#FFFFFF',
    }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Início' }} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} options={{ title: 'Detalhes do Filme' }} />
    </Stack.Navigator>
  );
}
