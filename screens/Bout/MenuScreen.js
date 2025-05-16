import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import config from "../../config.json";

const ChaineSelector = () => {
  const [chaines, setChaines] = useState([]);
  const [selectedChaine, setSelectedChaine] = useState('');
  const [donneesFiltrees, setDonneesFiltrees] = useState([]);
  const [totalQuantite, setTotalQuantite] = useState(0); 
  useEffect(() => {
    axios.get(`${config.API_HOST}/qrChaine`)
      .then(response => {
        const data = response.data;
        const uniqueChaines = [...new Set(data.map(item => item.chaine))].sort((a, b) =>
          a.localeCompare(b, 'fr', { sensitivity: 'base' })
        );
        setChaines(uniqueChaines);
      })
      .catch(error => {
        console.error('Erreur lors du chargement des chaînes:', error);
      });
  }, []);

  useEffect(() => {
    if (selectedChaine) {
      axios.get(`${config.API_HOST}/qrBout`)
        .then(response => {
          const data = response.data;
          const filtres = data.filter(item => item.chaine.trim() === selectedChaine.trim());
          const regroupes = {};
          filtres.forEach(item => {
            const key = `${item.modele}_${item.of}_${item.taille}`;
            if (!regroupes[key]) {
              regroupes[key] = { ...item };
            } else {
              regroupes[key].quantite += item.quantite;
            }
          });

          const donneesRegroupees = Object.values(regroupes);
          setDonneesFiltrees(donneesRegroupees);
          const total = donneesRegroupees.reduce((sum, item) => sum + Number(item.quantite), 0);
          setTotalQuantite(total);          
        })
        .catch(error => {
          console.error('Erreur lors du chargement des données qrBout:', error);
        });
    }
  }, [selectedChaine]);

  return (
    <View>
      <Picker
        selectedValue={selectedChaine}
        onValueChange={(itemValue) => setSelectedChaine(itemValue)}
        style={{ color: 'blue' }}
      >
        <Picker.Item label="-- Sélectionnez une chaîne --" value="" />
        {chaines.map((chaine, index) => (
          <Picker.Item key={index} label={chaine} value={chaine} />
        ))}
      </Picker>

      <View style={{
        flexDirection: 'row',
        backgroundColor: '#ddd',
        paddingVertical: 8,
        paddingHorizontal: 5,
        borderTopWidth: 1,
        borderBottomWidth: 1
      }}>
        <Text style={{ flex: 1, fontWeight: 'bold', color: 'blue', backgroundColor: '#e0f0ff' }}>Modèle</Text>
        <Text style={{ flex: 1, fontWeight: 'bold', color: 'blue', backgroundColor: '#e0f0ff' }}>OF</Text>
        <Text style={{ flex: 1, fontWeight: 'bold', color: 'blue', backgroundColor: '#e0f0ff' }}>Taille</Text>
        <Text style={{ 
  flex: 1, 
  fontWeight: 'bold', 
  backgroundColor: '#e0f0ff', 
  color: 'blue', 
  textAlign: 'right' 
}}>
  Qr Bout: <Text style={{ color: 'red' }}>{totalQuantite}</Text>
</Text>
      </View>
      <FlatList
        data={donneesFiltrees}
        keyExtractor={(item) => `${item.modele}_${item.of}_${item.taille}`}
        renderItem={({ item }) => (
          <View style={{
            flexDirection: 'row',
            paddingVertical: 8,
            paddingHorizontal: 5,
            backgroundColor: '#f2f2f2',
            borderBottomWidth: 0.5,
            borderColor: '#ccc'
          }}>
            <Text style={{ flex: 1 }}>{item.modele}</Text>
            <Text style={{ flex: 1 }}>{item.of}</Text>
            <Text style={{ flex: 1 }}>{item.taille}</Text>
            <Text style={{ flex: 1, textAlign: 'left' }}>{item.quantite}</Text>
          </View>
        )}
      />
    </View>
  );
};
export default ChaineSelector;
