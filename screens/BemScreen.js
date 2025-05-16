import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import config from '../config.json';
import { decode as base64Decode } from 'base-64';
import ScannerScreen from './Bem/BemScreen';
import ChatScreen from './Bem/ChatScreen';
import { Audio } from 'expo-av';
import { io } from 'socket.io-client';

const ScannerSheet = () => (
  <View style={styles.sheet}>
    <ScannerScreen />
  </View>
);

const ChatSheet = ({ socket }) => (
  <View style={styles.sheet}>
    <ChatScreen socket={socket} />
  </View>
);

const ControleScreen = () => {
  const navigation = useNavigation();
  const [userImage, setUserImage] = useState(null);
  const [activeSheet, setActiveSheet] = useState(null);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [user, setUser] = useState(null);
  const socketRef = useRef(null);
  const isChatActiveRef = useRef(false);

  const decodeJWT = (token) => {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(base64Decode(payload));
    } catch (error) {
      console.error('Erreur lors du décodage du token JWT:', error);
      return null;
    }
  };

  
const socket = io('http://192.168.0.117:2026', {
  transports: ['websocket'], 
  autoConnect: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,

});


  const playNotificationSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/io.mp3')
      );
      await sound.playAsync();
    } catch (error) {
      console.error('Erreur lors de la lecture du son:', error);
    }
  };

  // Initialisation Socket.IO
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const newSocket = io(config.SOCKET_SERVER_URL, {
          transports: ['websocket'],
          query: { token },
        });

        socketRef.current = newSocket;

        newSocket.on('connect', () => {
          console.log('Connecté au serveur Socket.IO');
        });

        newSocket.on('newUnreadMessage', (message) => {
          if (!isChatActiveRef.current) {
            setNewMessageCount(prev => prev + 1);
            playNotificationSound();
          }
        });

        newSocket.on('connect_error', (err) => {
          console.error('Erreur de connexion Socket.IO:', err);
        });

        return () => {
          newSocket.disconnect();
        };
      } catch (error) {
        console.error('Erreur initialisation Socket.IO:', error);
      }
    };

    initializeSocket();
  }, []);
  useEffect(() => {
    isChatActiveRef.current = activeSheet === 'Chat';
  }, [activeSheet]);

  const handleChatPress = () => {
    if (activeSheet !== 'Chat') {
      setActiveSheet('Chat');
      setNewMessageCount(0);
      
      // Optionnel: Notifier le serveur que les messages ont été lus
      if (socketRef.current) {
        socketRef.current.emit('markMessagesAsRead', {
          userId: user?.id,
          timestamp: new Date().toISOString()
        });
      }
    }
  };

  // Gestion de l'utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          navigation.replace('Login');
          return;
        }

        const decodedToken = decodeJWT(token);
        if (!decodedToken?.id) {
          throw new Error('Token invalide');
        }

        const userId = decodedToken.id;
        const response = await axios.get(`${config.API_HOST}/user/${userId}`);
        const userData = response.data;

        setUser(userData);
        setUserImage(userData.photo ? `${config.API_Image}/${userData.photo}` : null);
      } catch (error) {
        console.error('Erreur:', error);
        navigation.replace('Login');
      }
    };

    fetchUserData();
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      if (socketRef.current) socketRef.current.disconnect();
      navigation.replace('Login');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerContainer}>
          {userImage ? (
            <Image source={{ uri: userImage }} style={styles.userImage} />
          ) : null}
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
    });
  }, [navigation, userImage]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Surveillant</Text>

      {activeSheet === 'Bem' && <ScannerSheet />}
      {activeSheet === 'Chat' && <ChatSheet socket={socketRef.current} />}

      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={() => setActiveSheet('Bem')}
          style={[styles.barButton, activeSheet === 'Bem' && styles.activeButton]}
        >
          <FontAwesome5 name="bars" size={24} color={activeSheet === 'Bem' ? '#80FF00' : '#fff'} />
          <Text style={[styles.barText, activeSheet === 'Bem' && styles.activeText]}>Bem</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleChatPress}
          style={[styles.barButton, activeSheet === 'Chat' && styles.activeButton]}
        >
          <View style={{ position: 'relative' }}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={24}
              color={activeSheet === 'Chat' ? '#80FF00' : '#fff'}
            />
            {newMessageCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {newMessageCount > 9 ? '9+' : newMessageCount}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.barText, activeSheet === 'Chat' && styles.activeText]}>Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end', 
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  logo: {
    width: 100,
    height: 70,
    marginHorizontal: 10, 
    marginLeft: 50,
  },
  bottomBar: {
    position:'absolute',
    bottom: 0,
    width: '100%',
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#013220',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  barButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#015a20',
  },
  activeText: {
    color: '#80FF00',
  },
  logoutButton: {
    marginRight: 20,
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
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  barText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  sheet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 70, 
    backgroundColor: 'white',
    zIndex: 1,
  },
});

export default ControleScreen;
