import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
    ScrollView,
} from 'react-native';
import axios from "axios";
import config from "../../config.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { Camera, CameraView } from "expo-camera";
import { Audio } from 'expo-av';


const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;


export default function ScanCoupeScreen({ navigation }) {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [scannedDataList, setScannedDataList] = useState([]);
    const [sound, setSound] = useState();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [existingDataList, setExistingDataList] = useState([]);
    const [customAlert, setCustomAlert] = useState(null);



    useEffect(() => {
        let soundObject;


        const loadSound = async () => {
            try {
                const { sound } = await Audio.Sound.createAsync(require('../../assets/io.mp3'));
                setSound(sound);
                soundObject = sound;
            } catch (error) {
                console.error("Erreur de chargement du son :", error);
            }
        };


        loadSound();


        return () => {
            if (soundObject) {
                soundObject.unloadAsync();
            }
        };
    }, []);


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


        fetchUserData();
        getCameraPermissions();
    }, []);


    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await axios.get(`${config.API_HOST}/bouffe/liste`);
                console.log("Données récupérées:", response.data);
                setExistingDataList(response.data);
            } catch (error) {
                console.error("Erreur de récupération des données :", error);
                Toast.show({
                    type: 'error',
                    text1: 'Erreur',
                    text2: 'Impossible de récupérer les données.'
                });
            }
        };
   
        fetchInitialData();
    }, []);
   


    const playSound = async () => {
        if (sound) {
            try {
                await sound.replayAsync();
            } catch (error) {
                console.error("Erreur lors de la lecture du son :", error);
            }
        }
    };


    const handleBarCodeScanned = ({ data }) => {
        if (!scanned) {
            try {
                const parsedData = JSON.parse(data);
    
                const dataParsed = {
                    matricule: parsedData.matricule || '',
                    nom: parsedData.nom || '',
                    prenom: parsedData.prenoms || '',
                    telephone: parsedData.telephone || '',
                };
    
                
                const isDuplicate = existingDataList.includes(dataParsed.matricule);
    
                if (isDuplicate) {
                    setCustomAlert(`Le matricule ${dataParsed.matricule} est déjà doublant`);
                    playSound();
                    setScanned(true);
                    setTimeout(() => setCustomAlert(null), 3000);
                    setTimeout(() => setScanned(false), 1000);
                    return;
                  }
    
                const isAlreadyScanned = scannedDataList.some(item => item.matricule === dataParsed.matricule);
    
                if (!isAlreadyScanned) {
                    setScanned(true);
                    setScannedDataList(prev => [...prev, dataParsed]);
                    playSound(); 
                    setTimeout(() => setScanned(false), 1000);
                } else {
                    alert(`Le matricule ${dataParsed.matricule} a déjà été scanné dans cette session.`);
                    setScanned(true);
                    setTimeout(() => setScanned(false), 1000);
                }
            } catch (error) {
                console.error("Erreur lors du parsing JSON :", error);
                alert('Erreur de format : Les données scannées sont incorrectes.');
            }
        }
    };
    
   


    const sendScannedData = async () => {
        if (scannedDataList.length > 0) {
            if (!user || !user.pseudo) {
                alert("L'utilisateur n'est pas défini ou son pseudo est manquant.");
                return;
            }
            
            setIsLoading(true);
            
            const dataToSend = {
                nombresPersonnel: scannedDataList.length,
                utilisateur: user.pseudo,
                matricules: scannedDataList.map(item => `${item.matricule}..${item.prenom} ${item.telephone}`)
            };
    
            const batchSize = 10;
            const batchCount = Math.ceil(scannedDataList.length / batchSize);
            
            const batchPromises = [];
            
            for (let i = 0; i < batchCount; i++) {
                const batchData = scannedDataList.slice(i * batchSize, (i + 1) * batchSize);
                const batchToSend = {
                    ...dataToSend,
                    matricules: batchData.map(item => `${item.matricule}..${item.prenom} ${item.telephone}`)
                };
                
                const batchRequest = axios.post(`${config.API_HOST}/bouffe`, batchToSend)
                    .then(response => {
                        let doublonString = "";
                        if (response.data.doublons && Array.isArray(response.data.doublons)) {
                            doublonString = response.data.doublons.join("\n");
                        }
                        alert(response.data.message + (doublonString ? `\nDoublons:\n${doublonString}` : ""));
                        // Une fois l'envoi terminé, mettre à jour les données existantes
                        fetchInitialData();
                    })
                    .catch(error => {
                        console.error("Erreur API:", error.response?.data || error.message);
                        alert("Erreur réseau!");
                        Toast.show({
                            type: 'error',
                            text1: 'Erreur API',
                            text2: error.response?.data?.message || error.message
                        });
                    });
    
                batchPromises.push(batchRequest);
            }
    
            try {
            
                await Promise.all(batchPromises);
                setScannedDataList([]);
                Toast.show({
                    type: 'success',
                    text1: 'Envoi réussi',
                    text2: 'Données envoyées avec succès !'
                });
            } catch (error) {
                console.error("Erreur lors de l'envoi des lots:", error);
                Toast.show({
                    type: 'error',
                    text1: 'Erreur d\'envoi',
                    text2: 'Impossible d\'envoyer toutes les données.'
                });
            }
    
            setIsLoading(false);
        } else {
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: 'Veuillez scanner au moins un code.'
            });
        }
    };
    const fetchInitialData = async () => {
        try {
            const response = await axios.get(`${config.API_HOST}/bouffe/liste`);
            console.log("Données existantes récupérées:", response.data);
            setExistingDataList(response.data);
        } catch (error) {
            console.error("Erreur de récupération des données :", error);
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: 'Impossible de récupérer les données.'
            });
        }
    };
    


    const groupedData = scannedDataList.reduce((acc, current) => {
        const key = current.matricule; 
        if (!acc[key]) {
            acc[key] = {
                matricule: current.matricule,
                prenom: current.prenom,
                nom: new Set(),
                telephone: new Set()
            };
        }
        acc[key].nom.add(current.nom);
        acc[key].telephone.add(current.telephone);
        return acc;
    }, {});


    const groupedDataArray = Object.values(groupedData).map(group => {
        
        const isDuplicate = existingDataList.includes(group.matricule);


        return {
            ...group,
            nom: Array.from(group.nom),
            telephone: Array.from(group.telephone),
            isDuplicate: isDuplicate, 
        };
    });


    if (hasPermission === null) {
        return <Text>Demande de permission...</Text>;
    }
    if (hasPermission === false) {
        return <Text>Pas d'accès à la caméra</Text>;
    }


    return (
        <SafeAreaView style={styles.container}>
            
            <View style={styles.overlay}>
                <View style={styles.header}>
                    <CameraView
                        style={styles.cameraHeader}
                        barcodeScannerSettings={{ barCodeTypes: ['qr', 'ean13', 'code128'] }}
                        onBarcodeScanned={handleBarCodeScanned}
                    />
                </View>
                    <Modal
                    visible={customAlert !== null}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setCustomAlert(null)}
                    >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                        <Text style={styles.modalText}>{customAlert}</Text>
                        </View>
                    </View>
                    </Modal>

                <ScrollView style={styles.scannedDataContainer}>
                    <View style={styles.tableContainer}>
                        <Text style={[styles.scannedDataTitle, { textAlign: 'center' }]}>
                            Données scannées: {scannedDataList.length}
                        </Text>
                        <View style={styles.table}>
                            <View style={styles.tableRow}>
                                <Text style={styles.tableCell3}>Matricule</Text>
                                <Text style={styles.tableCell3}>Nom</Text>
                                <Text style={styles.tableCell3}>Prénom</Text>
                                <Text style={styles.tableCell1}>Téléphone</Text>
                            </View>


                            {groupedDataArray.map((group, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={styles.tableCell}>{group.matricule}</Text>
                                    <Text style={styles.tableCell}>{group.nom.join(', ')}</Text>
                                    <Text style={styles.tableCell}>{group.prenom}</Text>
                                    <Text style={styles.tableCell2}>{group.telephone.join(', ')}</Text>
                                </View>
                            ))}
                        </View>
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
            </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E5E4E2' },
    header: {
        height: screenHeight * 0.30,
        width: screenWidth,
        backgroundColor: '#gris',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    cameraHeader: {
        width: screenWidth * 0.85,
        height: '99%',
        borderRadius: 20,
        marginTop: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)', 
      },
      modalContent: {
        backgroundColor: 'red',
        padding: 20,
        borderRadius: 10,
      },
      modalText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
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
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
        width: '100%',
        height: '100%'
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center'
    },
    scannedDataTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 10
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
        justifyContent: 'space-around',
        backgroundColor: '#f9f9f9',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    tableCell: {
        width: '18%',
        textAlign: "center",
        fontSize: 12,
    },
    tableCell1: {
        width: '40%',
        textAlign: "center",
        fontSize: 12,
        fontWeight: 'bold',
    },
    tableCell3: {
        width: '18%',
        textAlign: "center",
        fontSize: 14,
        fontWeight: 'bold',
    },
    tableCell2: {
        width: '40%',
        textAlign: "center",
        fontSize: 12,
    },
});
