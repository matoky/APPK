import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Linking,
  StyleSheet
} from 'react-native';
import config from '../../config.json';

export default function PdfListScreen() {
  const [loading, setLoading] = useState(true);
  const [pdfList, setPdfList] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null); // 👉 pour suivre quel PDF est sélectionné

  const handlePress = (fileName) => {
    const url = `${config.URL_PDF}${fileName}`;
    setSelectedPdf(fileName); // 👉 enregistrer le fichier sélectionné
    Linking.openURL(url);
  };

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await fetch(`${config.API_HOST}/listePdf`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setPdfList(data);
        } else if (data && Array.isArray(data.pdfs)) {
          setPdfList(data.pdfs);
        } else {
          console.error('Format inattendu de la réponse :', data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des PDFs :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPdf();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <FlatList
          data={pdfList}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handlePress(item)}
              style={[
                styles.item,
                selectedPdf === item && styles.selectedItem, 
              ]}
            >
              <Text style={styles.buttonText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  item: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 6,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedItem: {
    backgroundColor: '#007AFF', 
    borderColor: '#0051a8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
