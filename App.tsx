import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreenv2';
import MessagingScreen from './src/screens/MessagingScreen';
import SplashScreen from './src/screens/SplashScreen';
import CreateScreen from './src/screens/CreateScreen';
import HomeScreen from './src/screens/HomeScreen' ;

const Stack = createStackNavigator();

const TestScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Test Screen</Text>
  </View>
);

export default function App() {
  console.log('App is rendering');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: '#fff' },
              presentation: 'card',
              contentStyle: {
                flex: 1,
              },
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
            />
            <Stack.Screen 
              name="Create" 
              component={CreateScreen} 
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen} 
            />
            <Stack.Screen 
              name="Splash" 
              component={SplashScreen} 
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
            />
            <Stack.Screen 
              name="Messaging" 
              component={MessagingScreen} 
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}