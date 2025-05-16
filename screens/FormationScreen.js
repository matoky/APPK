import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from '../config.json';
import { decode as base64Decode } from 'base-64';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const FormationScreen = () => {
  const navigation = useNavigation();
  const [userImage, setUserImage] = useState(null);

  const images = [
    // require('../assets/mach.jpg'),
    require('../assets/machine.jpg'),
  ];

  const decodeJWT = (token) => {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(base64Decode(payload));
    } catch (error) {
      console.error('Erreur lors du décodage du token JWT:', error);
      return null;
    }
  };

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
        const imageBaseUrl = config.IMAGE_URL || '';
        setUserImage(user.photo ? `${imageBaseUrl}${user.photo}` : null);
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
          {userImage ? (
            <Image source={{ uri: userImage }} style={styles.userImage} />
          ) : (
            <Text style={styles.headerText}>Aucune</Text>
          )}
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: '#F0F8FF',
      },
      headerTintColor: '#fff',
    });
  }, [navigation, userImage]);

  const renderImage = ({ item }) => (
    <View style={styles.imageContainer}>
      <Image source={item} style={styles.image} resizeMode="contain" />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Page Mécano</Text>
      <FlatList
        data={images}
        renderItem={renderImage}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Menu')}
          style={styles.barButton}
        >
          <Icon name="menu" size={24} color="#fff" />
          <Text style={styles.barText}>Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Fait')}
          style={styles.barButton}
        >
          <Icon name="check-circle" size={24} color="#fff" />
          <Text style={styles.barText}>Fait</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Type')}
          style={styles.barButton}
        >
          <Icon name="puzzle" size={24} color="#fff" />
          <Text style={styles.barText}>Type</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Message')}
          style={styles.barButton}
        >
          <Icon name="message" size={24} color="#fff" />
          <Text style={styles.barText}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#013220',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerText: {
    fontSize: 16,
    color: '#fff',
  },
  logo: {
    width: 100,
    height: 40,
    marginHorizontal: 10,
    marginLeft: 50,
  },
  logoutButton: {
    marginRight: 10,
    backgroundColor: '#ff0000',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  imageContainer: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '200%',
    height: 800,
    
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#B9D9EB',
    height: 50,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  barButton: {
    alignItems: 'center',
  },
  barText: {
    color: '#fff',
    fontSize: 10,
    marginTop: 10,
  },
});

export default FormationScreen;
