import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  SafeAreaView,
  FlatList
} from 'react-native';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket] = useState(() => io('http://192.168.0.113:2026', {
    transports: ['websocket'],
    reconnectionAttempts: 5
  }));
  const [user, setUser] = useState({});
  const [sound, setSound] = useState();

  const generateColor = (username) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/io.mp3') // Assurez-vous que ce fichier existe
      );
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.error('Erreur lors de la lecture du son:', error);
    }
  };

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Client connecté au serveur');
      socket.emit('requestHistory');
    });

    socket.on('messageHistory', (history) => {
      setMessages(history);
    });

    socket.on('newMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
      playSound(); // Jouer le son à chaque nouveau message
    });

    socket.on('connect_error', (err) => {
      console.error('Erreur de connexion:', err.message);
    });

    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const { pseudo } = JSON.parse(userData);
          setUser({ pseudo });
        }
      } catch (err) {
        console.error('Erreur de récupération des données utilisateur:', err);
      }
    };

    fetchUserData();

    return () => {
      socket.off('connect');
      socket.off('messageHistory');
      socket.off('newMessage');
      socket.disconnect();
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const handleSend = () => {
    if (input.trim() && input.length <= 200) {
      const userColor = generateColor(user.pseudo || 'Utilisateur');
  
      socket.emit('newMessage', {
        text: input.trim(),
        timestamp: Date.now(),
        user: user.pseudo || 'Utilisateur',
        color: userColor
      }, (ack) => {
        if (ack && ack.status === 'ok') {
          console.log('Message confirmé par le serveur');
          playSound(); 
        }
      });
  
      setInput('');
    }
  };
  
  

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.timestamp.toString()}
        renderItem={({ item }) => {
          const textColor = item.color && parseInt(item.color.replace('#', ''), 16) > 0xffffff / 2 ? '#000' : '#fff';
          return (
            <View style={[styles.messageContainer, { backgroundColor: item.color || '#f0f0f0' }]}>
              <Text style={[styles.messageText, { color: textColor }]}>{item.user}: {item.text}</Text>
            </View>
          );
        }}
        
        contentContainerStyle={styles.messagesContainer}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Écrivez un message..."
          onSubmitEditing={handleSend}
        />
        <Button
          title="Envoyer"
          onPress={handleSend}
          disabled={!input.trim()}
          color="#007aff"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  messagesContainer: {
    padding: 20,
    paddingBottom: 80
  },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  messageText: {
    color: '#fff',
    fontSize: 16
  },
  inputContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5
  },
  input: {
    flex: 1,
    height: 40,
    marginRight: 10,
    padding: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 15
  }
});

export default ChatScreen;
