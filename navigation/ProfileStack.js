import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: '#0D0D0D' },
      headerTintColor: '#FFFFFF',
    }}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ title: 'Seu Perfil' }} />
    </Stack.Navigator>
  );
}
