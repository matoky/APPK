// SplashScreen.js  

import React, { useEffect } from 'react';  
import { View, StyleSheet, Image, Animated } from 'react-native';  

const SplashScreen = ({ navigation }) => {  
  const opacity = new Animated.Value(0);  

  useEffect(() => {  
    // Animation d'apparition  
    Animated.timing(opacity, {  
      toValue: 1,  
      duration: 2000, // Durée de l'animation d'apparition  
      useNativeDriver: true,  
    }).start();  

    // Naviguer vers la page d'accueil après 3 secondes  
    const timer = setTimeout(() => {  
      navigation.replace('Home'); // Remplacez 'Home' par le nom de votre écran principal  
    }, 5000);  // Durée d'affichage du SplashScreen  

    return () => clearTimeout(timer);  // Nettoyer le timer  
  }, [navigation]);  

  return (  
    <View style={styles.container}>  
      <Animated.Image  
        source={require('./assets/logo.png')}  
        style={[styles.logo, { opacity }]} // Appliquer le style d'opacité  
        resizeMode="contain"  
      />  
    </View>  
  );  
};  

const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    justifyContent: 'center',  
    alignItems: 'center',  
    backgroundColor: '#FFFFFF',  
  },  
  logo: {  
    width: 150, 
    height: 150, 
  },  
});  

export default SplashScreen;