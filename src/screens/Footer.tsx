import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  Home: undefined;
  Create: undefined;
  Profile: undefined;
  Splash: undefined;
  Login: undefined;
  Messaging: undefined;
};

const Footer = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={styles.footer}>
      <TouchableOpacity 
        style={styles.footerButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Feather name="home" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.footerButton}
        onPress={() => navigation.navigate('Create')}
      >
        <Feather name="plus-circle" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.footerButton}
        onPress={() => navigation.navigate('Profile')}
      >
        <Feather name="user" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#ffffff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  footerButton: {
    padding: 8,
  },
});

export default Footer;
