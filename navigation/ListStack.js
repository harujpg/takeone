import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListScreen from '../screens/ListScreen';
import ListDetailScreen from '../screens/ListDetailScreen';
import CreateListScreen from '../screens/CreateListScreen';

const Stack = createNativeStackNavigator();

export default function ListStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
    }}>
      <Stack.Screen name="ListScreen" component={ListScreen} />
      <Stack.Screen name="ListDetail" component={ListDetailScreen} />
      <Stack.Screen name="CreateList" component={CreateListScreen} />
    </Stack.Navigator>
  );
}
