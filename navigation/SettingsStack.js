import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function SettingsStack() {
  return (
    <Stack.Navigator 
      initialRouteName="SettingsHome"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="SettingsHome" 
        component={SettingsScreen}
        options={{
          title: 'Configurações',
        }}
      />
    </Stack.Navigator>
  );
}
