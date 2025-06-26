import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListScreen from '../screens/ListScreen';
import ListDetailScreen from '../screens/ListDetailScreen';
import CreateListScreen from '../screens/CreateListScreen';

const Stack = createNativeStackNavigator();

export default function ListStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: '#0D0D0D' },
      headerTintColor: '#FFFFFF',
    }}>
      <Stack.Screen name="ListScreen" component={ListScreen} options={{ title: 'Minhas Listas' }} />
      <Stack.Screen name="ListDetail" component={ListDetailScreen} options={{ title: 'Detalhes da Lista' }} />
      <Stack.Screen name="CreateList" component={CreateListScreen} options={{ title: 'Criar Lista' }} />
    </Stack.Navigator>
  );
}
