import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListScreen from '../screens/ListScreen';

const Stack = createNativeStackNavigator();

export default function ListStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: '#0D0D0D' },
      headerTintColor: '#FFFFFF',
    }}>
      <Stack.Screen name="ListScreen" component={ListScreen} options={{ title: 'Minhas Listas' }} />
    </Stack.Navigator>
  );
}
