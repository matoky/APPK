import React, { useEffect, useState, useRef } from 'react';
import {
    Dimensions,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
    Image,
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { Camera, CameraView } from "expo-camera";
import { Audio } from 'expo-av';
import io from 'socket.io-client';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default function ScanCoupeScreen({ navigation }) {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [scannedDataList, setScannedDataList] = useState([]);
    const [sound, setSound] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const cameraRef = useRef(null);
    const socket = io('http://192.168.0.117:2026');
    const [photoUri, setPhotoUri] = useState(null);
    const [photoUris, setPhotoUris] = useState([]);
    const [lastPhotoBase64, setLastPhotoBase64] = useState(null);


     
    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        };

        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        const loadSound = async () => {
            try {
                const { sound } = await Audio.Sound.createAsync(require('../../assets/io.mp3'));
                setSound(sound);
            } catch (error) {
                console.error("Erreur de chargement du son :", error);
            }
        };

        fetchUserData();
        getCameraPermissions();
        loadSound();

        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);
    useEffect(() => {
      socket.on('dataAcknowledged', (response) => {
        console.log(response.message);
        setIsLoading(false);
        Toast.show({
          type: 'success',
          text1: 'Envoi réussi',
          text2: 'Données envoyées avec succès !'
        });
      });
    
      return () => {
        socket.off('dataReceived');
      };
    }, []);
    

    const playSound = async () => {
        if (sound) {
            try {
                await sound.replayAsync();
            } catch (error) {
                console.error("Erreur lecture son :", error);
            }
        }
    };
    const takePhoto = async () => {
      if (cameraRef.current) {
        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.2,     
            base64: true,
          });
          setPhotoUris(prev => [...prev, photo.uri]);
          setLastPhotoBase64(photo.base64);
        } catch (error) {
          console.error('Erreur photo :', error);
        }
      }
    };
    
    

    const sendScannedData = async () => {
      if (scannedDataList.length === 0) {
        return Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: 'Veuillez scanner au moins un code.'
        });
      }
    
      const isValid = scannedDataList.every(item =>
        item.matricule && item.nom && item.prenom 
      );
    
      if (!isValid) {
        alert("Données incorrectes.");
        return;
      }
    
      if (!lastPhotoBase64 || lastPhotoBase64.length < 1000) {
        alert("Photo non valide ou pas encore chargée.");
        return;
      }
      
    
      const 
      
      dataToSend = {
        user: user?.pseudo,
        data: scannedDataList.map(item => ({
          matricule: item.matricule,
          nom: item.nom,
          prenom: item.prenom,
        })),
        base64Image: `data:image/jpg;base64,${lastPhotoBase64}`
      };
    
      setIsLoading(true);
      socket.emit('dataReceived', dataToSend);
      console.log("Données envoyées :", JSON.stringify(dataToSend, null, 2));

    };
    
  

    const groupedData = scannedDataList.reduce((acc, current) => {
        const key = `${current.matricule}-${current.prenom}`;
        if (!acc[key]) {
            acc[key] = { matricule: current.matricule, prenom: current.prenom, nom: new Set(), telephone: new Set() };
        }
        acc[key].nom.add(current.nom);
        acc[key].telephone.add(current.telephone);
        return acc;
    }, {});

    const groupedDataArray = Object.values(groupedData).map(group => ({
        ...group,
        nom: Array.from(group.nom),
        telephone: Array.from(group.telephone),
    }));

    if (hasPermission === null) return <Text>Demande de permission...</Text>;
    if (hasPermission === false) return <Text>Pas d'accès à la caméra</Text>;
    const onBarcodeScannedHandler = async ({ data }) => {
      if (!scanned) {
        try {
          const parsedData = JSON.parse(data);
          const item = {
            matricule: parsedData.matricule || "",
            nom: parsedData.nom || "",
            prenom: parsedData.prenoms || "",
          };
    
          const alreadyScanned = scannedDataList.some(i => JSON.stringify(i) === JSON.stringify(item));
          if (!alreadyScanned) {
            setScanned(true);
            setScannedDataList(prev => [...prev, item]);
    
            await playSound();
            setTimeout(() => setScanned(false), 1000);
          }
        } catch (error) {
          console.error("Erreur JSON : ", error);
          Toast.show({
            type: 'error',
            text1: 'Erreur JSON',
            text2: 'Données scannées non valides.'
          });
        }
      }
    };
    
    return (
    <SafeAreaView style={styles.container}>
    <View style={styles.header}>
    {hasPermission && (
      <CameraView
        ref={cameraRef}
        style={styles.cameraHeader}
        barcodeScannerSettings={{ barCodeTypes: ['qr', 'ean13', 'code128'] }}
        onBarcodeScanned={onBarcodeScannedHandler}
      />
    )}


    </View>

    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.tableContainer}>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell3}>Matricule</Text>
            <Text style={styles.tableCell3}>Nom</Text>
            <Text style={styles.tableCell3}>Prénoms</Text>
          </View>
          {groupedDataArray.map((group, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{group.matricule}</Text>
              <Text style={styles.tableCell}>{group.nom.join(', ')}</Text>
              <Text style={styles.tableCell}>{group.prenom}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.photoContainer}>
      {photoUris.length > 0 && (
        <>
          <Text style={{ textAlign: 'center', marginBottom: 5 }}>Photos prises :</Text>
          <ScrollView horizontal>
            {photoUris.map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles.photoPreview} />
            ))}
          </ScrollView>
        </>
      )}
      <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
        <Text style={styles.photoButtonText}>Capture photo</Text>
      </TouchableOpacity>
    </View>

    </ScrollView>

    <TouchableOpacity
      style={styles.sendButton}
      onPress={sendScannedData}
      disabled={isLoading}
    >
      <Text style={styles.sendButtonText}>
        {isLoading ? 'Envoi en cours...' : 'Envoyer'}
      </Text>
    </TouchableOpacity>
    </SafeAreaView>

      );
      
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E5E4E2' },
    header: {
      height: screenHeight * 0.30,
      width: screenWidth,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    photoButton: {
        marginHorizontal: 60,
        backgroundColor: '#28a745',
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 20,
      },
      scrollContent: {
        paddingBottom: 100, 
      },
  
      photoContainer: {
        alignItems: 'center',
        marginBottom: 15,
      },
    photoContainer: {
      alignItems: 'center',
      marginBottom: 15,
    },
    photoPreview: {
      width: 150,
      height: 150,
      marginHorizontal: 5,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    
    cameraHeader: {
      width: screenWidth * 0.85,
      height: '99%',
      borderRadius: 20,
      marginTop: 10,
    },
    sendButton: {
      position: 'absolute',
      bottom: 10,
      left: 60,
      right: 60,
      backgroundColor: '#007bff',
      borderRadius: 5,
      paddingVertical: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: 'bold'
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'center'
    },
    scannedDataContainer: {
      marginTop: 5
    },
    tableContainer: { padding: 10 },
    table: {
      marginBottom: 15,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      overflow: 'hidden',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
    },
    tableCell3: {
      flex: 1,
      padding: 10,
      fontWeight: 'bold',
      textAlign: 'center',
      backgroundColor: '#f1f1f1',
      borderRightWidth: 1,
      borderRightColor: '#ccc',
    },
    tableCell: {
      flex: 1,
      padding: 10,
      textAlign: 'center',
      borderRightWidth: 1,
      borderRightColor: '#ccc',
    },
  });
  
