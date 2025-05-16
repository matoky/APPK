import React, { useState, useEffect } from 'react';  
import AsyncStorage from '@react-native-async-storage/async-storage';  
import {  
  View,  
  TextInput,  
  Alert,  
  StyleSheet,  
  TouchableOpacity,  
  Text,  
  ImageBackground,  
  Dimensions,  
  Image  
} from 'react-native';  
import axios from 'axios';  
import config from '../config.json';  
import { decode as base64Decode } from 'base-64';  
import { useNavigation } from '@react-navigation/native';  

const { width } = Dimensions.get('window');  

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

const LoginScreen = () => {  
  const navigation = useNavigation();  
  const [username, setUsername] = useState('');  
  const [password, setPassword] = useState('');  
  const [rememberMe, setRememberMe] = useState(false);  
  const [isLoading, setIsLoading] = useState(false);  
  const [loadingText, setLoadingText] = useState('Se connecter');  

  useEffect(() => {  
    navigation.setOptions({ headerShown: false });  
    const loadCredentials = async () => {  
      try {  
        const savedUsername = await AsyncStorage.getItem('savedUsername');  
        const savedPassword = await AsyncStorage.getItem('savedPassword');  
        const savedRememberMe = await AsyncStorage.getItem('rememberMe');  
        if (savedRememberMe === 'true') {  
          setUsername(savedUsername || '');  
          setPassword(savedPassword || '');  
          setRememberMe(true);  
        }  
      } catch (error) {  
        console.error('Erreur lors du chargement des identifiants', error);  
      }  
    };  
    loadCredentials();  
  }, [navigation]);  

  const handleLogin = async () => {  
    setIsLoading(true);  
    setLoadingText('Se connecter');  
    if (!username || !password) {  
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');  
      setIsLoading(false);  
      return;  
    }  

    const loadingInterval = setInterval(() => {  
      setLoadingText(prev => prev === 'Connexion...' ? 'Se connecter' : prev + '.');  
    }, 500);  

    try {  
      const response = await axios.post(`${config.API_HOST}/login`, {  
        pseudo: username,  
        motDePasse: password  
      }, { timeout: 10000 });  

      const { message, token } = response.data;  

      if (message === 'User logged in successfully') {  
        await AsyncStorage.setItem('token', token);  
        const decodedToken = decodeJWT(token);  
        const role = decodedToken.role.toLowerCase();  

        if (rememberMe) {  
          await AsyncStorage.setItem('savedUsername', username);  
          await AsyncStorage.setItem('savedPassword', password);  
          await AsyncStorage.setItem('rememberMe', 'true');  
        } else {  
          await AsyncStorage.removeItem('savedUsername');  
          await AsyncStorage.removeItem('savedPassword');  
          await AsyncStorage.setItem('rememberMe', 'false');  
        }  

        const roleRoutes = {  
          surveillant: 'SURVEILLANT',  
          controle: 'CONTROLE',  
          packing: 'PACKING',  
          bem: 'BEM',  
          maintenance:'MAINTENANCE',  
          supervisieur:'SUPERVISIEUR',  
          bout:'BOUT',  
          chefatelier:'CHEFATELIER',  
          cuisine:'CUISINE',  
          formation: 'FORMATION',
          mecanicien: 'MECANICIEN'  
        };  

        if (roleRoutes[role]) {  
          clearInterval(loadingInterval);  
          navigation.replace(roleRoutes[role]);  
        } else {  
          Alert.alert('Erreur', 'Rôle inconnu.');  
        }  
      } else {  
        Alert.alert('Erreur', message || 'Identifiants incorrects.');  
      }  
    } catch (error) {  
      const errorMessage = error.response?.data?.message || error.message || 'Erreur de connexion';  
      Alert.alert('Erreur', errorMessage);  
    } finally {  
      setIsLoading(false);  
      clearInterval(loadingInterval);  
    }  
  };  

  return (  
    <ImageBackground  
      source={require('../assets/Image.png')}  
      style={styles.backgroundImage}  
      resizeMode="cover"  
    >  
      <View style={styles.overlay}>  
        <View style={styles.formContainer}>  
          <Image  
            source={require('../assets/logo.png')}  
            style={styles.logo}  
            resizeMode="contain"  
          />  
          <Text style={styles.loginTitle}>Login</Text>  
          <TextInput  
            style={styles.input}  
            placeholder="👤 Nom d'utilisateur"  
            placeholderTextColor="#999"  
            value={username}  
            onChangeText={setUsername}  
            autoCapitalize="none"  
          />  
          <TextInput  
            style={styles.input}  
            placeholder="🔒 Mot de passe"  
            placeholderTextColor="#999"  
            secureTextEntry  
            value={password}  
            onChangeText={setPassword}  
          />  

          <TouchableOpacity  
            onPress={() => setRememberMe(!rememberMe)}  
            style={styles.checkboxContainer}  
          >  
            <View style={[styles.checkbox, rememberMe && styles.checkedCheckbox]}>  
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}  
            </View>  
            <Text style={styles.checkboxLabel}>Se souvenir de moi</Text>  
          </TouchableOpacity>  

          <TouchableOpacity  
            style={[styles.button, isLoading && styles.disabledButton]}  
            onPress={handleLogin}  
            disabled={isLoading}  
          >  
            <Text style={styles.buttonText}>  
              {isLoading ? '🔄 ' + loadingText : 'Se connecter'}  
            </Text>  
          </TouchableOpacity>  
        </View>  
      </View>  
    </ImageBackground>  
  );  
};  

const styles = StyleSheet.create({  
  backgroundImage: {  
    flex: 1,  
    width: '100%',  
    height: '100%',  
  },  
  overlay: {  
    flex: 1,  
    justifyContent: 'center',  
    alignItems: 'center',  
  },  
  loginTitle: {  
    fontSize: 30,  
    fontWeight: 'bold',  
    color: '#01796F',  
    textAlign: 'center',  
    marginBottom: 20,  
  },  
  logo: {  
    width: width * 0.4,  
    height: width * 0.3,  
    aspectRatio: 3 / 2,  
    marginBottom: 20,  
  },  
  formContainer: {  
    width: '70%',  
    alignItems: 'center',  
    shadowColor: '#000',  
    borderRadius: 15,  
  },  
  checkboxContainer: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    marginBottom: 20,  
  },  
  checkbox: {  
    width: 20,  
    height: 20,  
    borderWidth: 1,  
    borderColor: '#4CAF50',  
    justifyContent: 'center',  
    alignItems: 'center',  
    marginRight: 8,  
  },  
  checkedCheckbox: {  
    backgroundColor: '#4CAF50',  
  },  
  checkmark: {  
    color: '#fff',  
    fontSize: 14,  
    fontWeight: 'bold',  
  },  
  checkboxLabel: {  
    fontSize: 14,  
  },  
  input: {  
    width: '100%',  
    height: 50,  
    borderColor: '#D0F0C0',  
    borderWidth: 2,  
    marginBottom: 20,  
    paddingHorizontal: 15,  
    backgroundColor: '#fff',  
    borderRadius: 18,  
    fontSize: 16,  
    elevation: 5,  
  },  
  button: {  
    width: '100%',  
    height: 50,  
    backgroundColor: '#50C878',  
    borderRadius: 25,  
    justifyContent: 'center',  
    alignItems: 'center',  
    marginTop: 10,  
    borderWidth: 2,  
    borderColor: '#D0F0C0',  
    elevation: 5,  
    shadowColor: '#000',  
    shadowOffset: { width: 0, height: 2 },  
    shadowOpacity: 0.2,  
    shadowRadius: 2,  
  },  
  disabledButton: {  
    opacity: 0.6,  
  },  
  buttonText: {  
    color: '#fff',  
    fontSize: 18,  
    fontWeight: 'bold',  
  },  
});  

export default LoginScreen;
