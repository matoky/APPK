import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from '../config.json';
import { decode as base64Decode } from 'base-64';

const decodeJWT = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    base64Decode(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
};


const InstructeurScreen = () => {
  const navigation = useNavigation();
  const [userImage, setUserImage] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');

        if (!token) {
          Alert.alert('Erreur', 'Token non trouvé. Veuillez vous reconnecter.');
          navigation.replace('Login');
          return;
        }

        const decodedToken = decodeJWT(token);
        if (!decodedToken || !decodedToken.userId) {
          Alert.alert('Erreur', 'Token invalide. Veuillez vous reconnecter.');
          navigation.replace('Login');
          return;
        }

        const userId = decodedToken.userId;
        const response = await axios.get(`${config.API_HOST}users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = response.data.user;
        if (!user || !user.photo) {
          console.warn('Photo utilisateur non trouvée.');
        }

        const imageBaseUrl = config.IMAGE_URL || ''; // URL de base pour les images
        setUserImage(user.photo ? `${imageBaseUrl}${user.photo}` : null); // Construire l'URL complète de l'image
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
        Alert.alert('Erreur', 'Impossible de récupérer les données utilisateur.');
      }
    };

    fetchUserData();
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token'); 
      navigation.replace('Login'); 
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la déconnexion.');
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerContainer}>
          {/* Image utilisateur */}
          {userImage ? (
            <Image
              source={{ uri: userImage }}
              style={styles.userImage}
            />
          ) : (
            <Text style={styles.headerText}></Text>
          )}
          {/* Logo */}
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
          />
          {/* Bouton Logout */}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ),
      headerStyle: {
        backgroundColor: '#ACE1AF', 
      },
      headerTintColor: '#fff', 
    });
  }, [navigation, userImage]);
  

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bienvenue sur la page Instructeur</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'space-between', 
    width: '100%', 
    paddingHorizontal: 10, 
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20, 
  },
  headerText: {
    fontSize: 16,
    color: '#333',
  },
  logo: {
    width: 100,
    height: 50,
    marginHorizontal: 20, 
    resizeMode: 'contain',
  },
  logoutButton: {
    backgroundColor: '#ff0000',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});


export default InstructeurScreen;
