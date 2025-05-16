import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    sweetalert2,
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
            console.log('kay ve', userData)
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


    const playSound = async () => {
        if (sound) {
            try {
                await sound.replayAsync();
            } catch (error) {
                console.error("Erreur lors de la lecture du son :", error);
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

            const apiUrl = `${config.API_HOST}/qrChaine`;

            const validData = scannedDataList.every(item =>
                item.modele && item.of && item.taille && item.identite
            );

            if (!validData) {
                alert("Données scannées incorrectes.");
                setIsLoading(false);
                return;
            }

            const pseudo = String(user.pseudo);
            const dataToSend = {
                user: pseudo,
                data: scannedDataList.map(item => `${item.modele}.${item.of}.${item.taille}.${item.identite}`)
            };

            try {
                const response = await axios.post(apiUrl, dataToSend);

                                let doublonString = "";
                if (response.data.doublons && Array.isArray(response.data.doublons)) {
                    doublonString = response.data.doublons.map((d, i) => `- ${d}`).join("\n");
                }

                alert(`${response.data.message}${doublonString ? "\n\n--- Doublons détectés ---\n" + doublonString : ""}`);


                // let doublonString = "";
                // if (response.data.doublons && Array.isArray(response.data.doublons)) {
                //     doublonString = response.data.doublons.join("\n"); 
                // }
                //  alert(<>
                //                                   <div>
                //                                       mitomany
                //                                   </div>
                //                                   <hr/>
                //                                   <div>
                //                                       alika
                //                                   </div>
                //                               </>
                //                               )
                
            // alert(response.data.message + (doublonString ? `\nDoublons:\n${doublonString}` : ""));
                

                setScannedDataList([]);
                Toast.show({
                    type: 'success',
                    text1: 'Envoi réussi',
                    text2: 'Données envoyées avec succès !'
                });

            } catch (error) {
                console.log("Erreur API:", error.response?.data);
                alert("Erreur reseau!");
                Toast.show({
                    type: 'error',
                    text1: 'Erreur API',
                    text2: error.response?.data?.message || error.message
                });
            }
            finally {
                setIsLoading(false);
            }
        } else {
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: 'Veuillez scanner au moins un code.'
            });
        }
    };

    const groupedData = scannedDataList.reduce((acc, current) => {
        const key = `${current.modele}-${current.taille}`;
        if (!acc[key]) {
            acc[key] = { modele: current.modele, taille: current.taille, of: new Set(), identites: new Set() };
        }
        acc[key].of.add(current.of);
        acc[key].identites.add(current.identite);

        return acc;
    }, {});
    const groupedDataArray = Object.values(groupedData).map(group => ({
        ...group,
        of: Array.from(group.of),
        identites: Array.from(group.identites),
    }));
    if (hasPermission === null) return <Text>Demande de permission...</Text>;
    if (hasPermission === false) return <Text>Pas d'accès à la caméra</Text>;
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.overlay}>
                <View style={styles.header}>
                    <CameraView
                        style={styles.cameraHeader}
                        barcodeScannerSettings={{ barCodeTypes: ['qr', 'ean13', 'code128'] }}
                        onBarcodeScanned={({ data }) => {
                            if (!scanned) {
                                const dataParsed = {
                                    modele: data.split(".")[0],
                                    of: data.split(".")[1],
                                    taille: data.split(".")[2],
                                    identite: data.split(".")[3],
                                };
                                if (!scannedDataList.some(item => JSON.stringify(item) === JSON.stringify(dataParsed))) {
                                    setScanned(true);
                                    setScannedDataList(prevState => [...prevState, dataParsed]);
                                    playSound();
                                    setTimeout(() => setScanned(false), 1000);
                                }
                            }
                        }}
                    />
                </View>

               <ScrollView style={styles.scannedDataContainer}>
                                       <View style={styles.tableContainer}>
                                           <Text style={[styles.scannedDataTitle, { textAlign: 'center' }]}>
                                               Données scannées: {scannedDataList.length}
                                           </Text>
                                           <View style={styles.table}>
                                               <View style={styles.tableRow}>
                                                   <Text style={styles.tableCell3}>Modèle</Text>
                                                   <Text style={styles.tableCell3}>OF</Text>
                                                   <Text style={styles.tableCell3}>Taille</Text>
                                                   <Text style={styles.tableCell1}>Identités</Text>
                                               </View>
                                               {groupedDataArray.map((group, index) => (
                                                 <View key={index} style={styles.tableRow}>
                                                     <Text style={styles.tableCell}>{group.modele}</Text>
                                                     <Text style={styles.tableCell}>{group.of.length > 0 ? group.of.join(', ') : ''}</Text>
                                                     <Text style={styles.tableCell}>{group.taille}</Text>
                                                    <Text style={styles.tableCell2}>{group.identites.length > 0 ? group.identites?.sort((a,b)=>a-b).join(', ') : ''}</Text>
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
        width:'18%',
        textAlign: "center",
        fontSize: 12,
    },
    tableCell1: {
        width:'40%',
        textAlign: "center",
        fontSize: 12,
        fontWeight: 'bold',
    },
    tableCell3: {
        width:'18%',
        textAlign: "center",
        fontSize: 14,
        fontWeight: 'bold',
    },
    tableCell2: {
        width:'40%',
        textAlign: "center",
        fontSize: 12,
    }
});
