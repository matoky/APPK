import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Si vous utilisez AsyncStorage pour stocker des informations de session

const ChefAtelierScreen = () => {
  const navigation = useNavigation();
  const handleLogout = async () => {
    try { 
      await AsyncStorage.removeItem('token'); 
      navigation.replace('Login'); 
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      Alert.alert('Erreur', 'Une erreur s\'est produite lors de la déconnexion.');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Logout" onPress={handleLogout} color="#ff0000" />
      <Text style={styles.text}>Bienvenue sur la page Chef d'Atelier !</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start', 
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    paddingTop: 20, 
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20, 
  },
});

export default ChefAtelierScreen;
