import React, { useEffect, useState } from 'react';
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
import config from '../config.json';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { decode as base64Decode } from 'base-64';
import CoupeScreen from './Surveillant/CoupeScreen';
import ScannerScreen from './Surveillant/ScannerScreen';
import PersonnelsScreen from'./Surveillant/PersonnelsScreen';
import PieceScreen from'./Surveillant/PieceScreen';
import ChatScreen from './Surveillant/ChatScreen';
import BoutScreen from './Surveillant/BoutScreen';
import MenuScreen from'./Surveillant/MenuScreen';

const MenuSheet = () => (
  <View style={styles.sheet}>
    <MenuScreen/>
  </View>
);
const PersonnelsSheet = () => (
  <View style={styles.sheet}>
    <PersonnelsScreen/>
  </View>
);

const ScannerSheet = () => (
  <View style={styles.sheet}>
    <ScannerScreen />
  </View>
);

const PieceSheet = () => (
  <View style={styles.sheet}>
    <PieceScreen/>
  </View>
);

const CoupeSheet = () => (
  <View style={styles.sheet}>
    <CoupeScreen />
  </View>
);

const BoutSheet = () => (
  <View style={styles.sheet}>
    <BoutScreen />
  </View>
);

const ChatSheet = () => (
  <View style={styles.sheet}>
    <ChatScreen />
  </View>
);


const SurveillantScreen = () => {
  const navigation = useNavigation();
  const [userImage, setUserImage] = useState(null);
  const [activeSheet, setActiveSheet] = useState(null);

  const decodeJWT = (token) => {
    try {
      const payload = token.split('.')[1]; 
      return JSON.parse(base64Decode(payload));
    } catch (error) {
      console.error('Erreur lors du décodage du token JWT:', error);
      return null;
    }
  };

  const [user, setUser] = useState(null); 

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
        if (!decodedToken || !decodedToken.id) {
          Alert.alert('Erreur', 'Token invalide. Veuillez vous reconnecter.');
          navigation.replace('Login');
          return;
        }
    
        // 🔹 Stocker les données décodées dans AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(decodedToken));
    
        const userId = decodedToken.id;
        const response = await axios.get(`${config.API_HOST}/user/${userId}`);
        const userData = response.data;
    
        setUser(userData);
        // const imageBaseUrl = config.URL_IMAGE;
        setUserImage(userData.photo ? `${config.URL_IMAGE}/${userData.photo}` : null);
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
            <Image
              source={{ uri: userImage }}
              style={styles.userImage}
            />
          ) : (
            <Text style={styles.headerText}></Text>
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
        backgroundColor: 'transparent', 
      },
      headerTintColor: '#fff', 
    });
  }, [navigation, userImage]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Surveillant</Text>

      {activeSheet === 'Menu' && <MenuSheet />}
      {activeSheet === 'Personnels' && <PersonnelsSheet />}
      {activeSheet === 'Scanner' && <ScannerSheet/>}
      {activeSheet === 'Piece' && <PieceSheet/>}
      {activeSheet === 'Coupe' && <CoupeSheet/>}
      {activeSheet === 'Bout' && <BoutSheet/>}
      {activeSheet === 'Chat' && <ChatSheet/>}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={() => setActiveSheet('Menu')}
          style={[styles.barButton, activeSheet === 'Menu' && styles.activeButton]}
        >
          <Icon name="menu" size={24} color={activeSheet === 'Menu' ? '#80FF00' : '#fff'} />
          <Text style={[styles.barText, activeSheet === 'Menu' && styles.activeText]}>Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveSheet('Personnels')}
          style={[styles.barButton, activeSheet === 'Personnels' && styles.activeButton]}
        >
          <Icon name="account-group" size={24} color={activeSheet === 'Personnels' ? '#80FF00' : '#fff'} />
          <Text style={[styles.barText, activeSheet === 'Personnels' && styles.activeText]}>Permission</Text>
        </TouchableOpacity> 
        
        <TouchableOpacity
          onPress={() => setActiveSheet('Piece')}
          style={[styles.barButton, activeSheet === 'Piece' && styles.activeButton]}
        >
          <FontAwesome name="medkit" size={24} color={activeSheet === 'Piece' ? '#80FF00' : '#fff'} />
          <Text style={[styles.barText, activeSheet === 'Piece' && styles.activeText]}>Ostie</Text>
        </TouchableOpacity>


        <TouchableOpacity
          onPress={() => setActiveSheet('Scanner')}
          style={[styles.barButton, activeSheet === 'Scanner' && styles.activeButton]}
        >
          <Icon name="barcode-scan" size={24} color={activeSheet === 'Scanner' ? '#80FF00' : '#fff'} />
          <Text style={[styles.barText, activeSheet === 'Scanner' && styles.activeText]}>Scanner</Text>
        </TouchableOpacity>


        <TouchableOpacity
          onPress={() => setActiveSheet('Bout')}
          style={[styles.barButton, activeSheet === 'Bout' && styles.activeButton]}
        >
          <FontAwesome5 name="tshirt" size={24} color={activeSheet === 'Bout' ? '#80FF00' : '#fff'} />
          <Text style={[styles.barText, activeSheet === 'Bout' && styles.activeText]}>Bout</Text>
        </TouchableOpacity>


        <TouchableOpacity
          onPress={() => setActiveSheet('Coupe')}
          style={[styles.barButton, activeSheet === 'Coupe' && styles.activeButton]}
        >
          <Icon name="scissors-cutting" size={24} color={activeSheet === 'Coupe' ? '#80FF00' : '#fff'} />
          <Text style={[styles.barText, activeSheet === 'Coupe' && styles.activeText]}>Coupe</Text>

        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveSheet('Chat')}
          style={[styles.barButton, activeSheet === 'Chat' && styles.activeButton]}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={24} color={activeSheet === 'Chat' ? '#80FF00' : '#fff'} />
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
  userAndLogoContainer: {
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center',
    flex: 1,
  },
  header: {
    width: '100%',
    height: 60,
    backgroundColor: '#00FF40',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row', 
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 20,
    textAlign: 'center',
  },
  logo: {
    width: 100,
    height: 70,
    marginHorizontal: 10, 
    marginLeft: 50,
  },
  bottomBar: {
   position:'absolute',
   bottom :0,
   width :'100%',
   height :70,
   flexDirection:'row',
   justifyContent:'space-around',
   alignItems:'center',
   backgroundColor:'#013220',
   borderTopWidth :1,
   borderColor :'#ddd',
   },
   barButton:{
     justifyContent:'center',
     alignItems:'center',
   },
   headerStyle:{
     backgroundColor:'#80FF00',
     shadowColor:'#013220',
     shadowOffset:{width :0,height :2},
     shadowOpacity:.2,
     shadowRadius :4,
   },
   logoutButton:{
     marginRight :20,
     backgroundColor:'#ff0000',
     paddingHorizontal :10,
     paddingVertical :5,
     borderRadius :5,
   },
   userImage:{
     width :40,
     height :40,
     borderRadius :20,
     marginRight :10,
   },
   logoutText:{
     color:'#fff',
     fontSize :12,
     fontWeight :'bold',
   },
   barText:{
     color:'#fff',
     fontSize :12,
     marginTop :4,
   },
   activeButton:{
     backgroundColor:'#015a20',
   },
   activeText:{
     color:'#80FF00',
   },
   sheet:{
     position:'absolute',
     top :0,
     left :0,
     right :0,
     bottom :70, 
     backgroundColor:'white',
     zIndex :1,
   },
   sheetHeader:{
     flexDirection:'row',
     alignItems:'center',
     paddingVertical :15,
     paddingHorizontal :10,
     borderBottomWidth :1,
     borderBottomColor :'#e0e0e0'
   },
   closeButtonText:{
     fontSize:16,
     color:'#013220'
   }
});

export default SurveillantScreen;
