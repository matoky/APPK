// src/(components)/Common/CustomHeader.js
import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {MaterialCommunityIcons} from "@expo/vector-icons";
import config from "../config.json"

const CustomHeader = ({title, logOut, photoUrl}) => (
    <View style={styles.headerContainer}>
        <TouchableOpacity>
            {
                !photoUrl
                    ? <Image source={{uri: config.SERVER_IMAGE + 'inconnue.jpeg'}} style={styles.logoMenu}/>
                    : <Image source={{uri: config.SERVER_IMAGE + photoUrl}} style={styles.logoMenu}/>
            }
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <TouchableOpacity onPress={logOut}>
            <MaterialCommunityIcons name="logout" size={20} style={styles.headerIcon}/>
        </TouchableOpacity>
    </View>
);

export default CustomHeader;

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        height: 40,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#468acf',
        paddingHorizontal: 7,
        paddingVertical: 10,
    },
    logoMenu: {
        width: 37,
        height: 37,
        borderRadius: 50,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
    },
    headerIcon: {
        color: '#fff',
    }
});