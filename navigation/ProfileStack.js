import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/ProfileScreen';
import PublicProfileScreen from '../screens/PublicProfileScreen';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: '#0D0D0D' },
      headerTintColor: '#FFFFFF',
    }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} options={{ title: 'Perfil' }} />
      <Stack.Screen name="PublicProfile" component={PublicProfileScreen} options={{ title: 'Perfil público' }} />
    </Stack.Navigator>
  );
}


