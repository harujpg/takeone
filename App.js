import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStack from './navigation/HomeStack';
import ProfileStack from './navigation/ProfileStack';
import ListStack from './navigation/ListStack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './constants/theme';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            const icons = {
              Home: 'home',
              Perfil: 'person',
              Listas: 'list',
            };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { backgroundColor: colors.background },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Perfil" component={ProfileStack} />
        <Tab.Screen name="Listas" component={ListStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
