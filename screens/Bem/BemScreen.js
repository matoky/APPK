import React, { useState } from "react";
import axios from "axios";
import { View, Text, Button, FlatList, ScrollView, ActivityIndicator, TextInput } from "react-native";
import config from "../../config.json";

const ModelesTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [response1, response2] = await Promise.all([
        axios.get(`${config.API_HOST}/of`),
        axios.get(`${config.API_HOST}/qrChaine`)
      ]);

      const ofList = Array.isArray(response1.data) ? response1.data : [response1.data];
      const qrList = Array.isArray(response2.data) ? response2.data : [response2.data];

      const modelesData = ofList.flatMap((of) =>
        Object.entries(of.qteParTaille || {}).map(([taille, quantite]) => ({
          modele: of.modeleOf,
          of: of.labelOf,
          taille,
          quantiteInitiale: parseInt(quantite, 10),
          quantiteRestante: parseInt(quantite, 10),
          chaine: "Inconnue",
        }))
      );

      const scanData = qrList.map(scan => ({
        modele: scan.modele,
        of: scan.of,
        taille: scan.taille,
        quantite: parseInt(scan.quantite, 10),
        chaine: scan.chaine || "", 
      }));

      const scanMap = new Map();
      scanData.forEach(scan => {
        const key = `${scan.modele}_${scan.of}_${scan.taille}`;
        scanMap.set(key, { 
          quantite: (scanMap.get(key)?.quantite || 0) + scan.quantite, 
          chaine: scan.chaine 
        });
      });

      const finalData = modelesData.map(item => {
        const key = `${item.modele}_${item.of}_${item.taille}`;
        const scanInfo = scanMap.get(key) || { quantite: 0, chaine: "Inconnue" };
        return {
          ...item,
          quantiteRestante: item.quantiteInitiale - scanInfo.quantite,
          chaine: scanInfo.chaine,
        };
      }).sort((a, b) => a.quantiteRestante - b.quantiteRestante);

      setData(finalData);
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
    }
    setLoading(false);
  };
  const filteredData = data
    .filter(item => item.of.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(item => item.chaine.trim() !== "" && item.chaine !== "Inconnue");

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button title="Charger les données" onPress={fetchData} disabled={loading} />
      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      <TextInput
        style={{
          height: 40,
          borderColor: "#ccc",
          borderWidth: 1,
          borderRadius: 5,
          backgroundColor: "#FDBCB4",
          fontWeight: "bold",
          marginVertical: 8,
          paddingHorizontal: 8
        }}
        placeholder="Rechercher par OF"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView horizontal>
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={{ flexDirection: "row", backgroundColor: "#FFEFD5", padding: 10, borderBottomWidth: 1, minWidth: 120 }}>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: "bold", textAlign: "left" }}>{item.modele}</Text>
              <Text style={{ flex: 2, fontSize: 14, fontWeight: "bold", textAlign: "left" }}>{item.of}</Text>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: "bold", textAlign: "left" }}>{item.chaine}</Text> 
              <Text style={{ flex: 1, fontSize: 14, fontWeight: "bold", textAlign: "left" }}>{item.taille}</Text>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: "bold", textAlign: "left" }}>{item.quantiteInitiale}</Text>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: "bold", textAlign: "center" }}>{item.quantiteRestante}</Text>
          
            </View>
          )}
          ListHeaderComponent={() => (
            <View style={{ flexDirection: "row", padding: 10, backgroundColor: "#FDBCB4", minWidth: 330 }}>
              <Text style={{ flex: 2, fontWeight: "bold", fontSize: 14 }}>Modèle</Text>
              <Text style={{ flex: 2, fontWeight: "bold", fontSize: 14 }}>OF</Text>
              <Text style={{ flex: 1, fontWeight: "bold", fontSize: 14, textAlign: "center" }}>Chaine</Text> 
              <Text style={{ flex: 1, fontWeight: "bold", fontSize: 14, textAlign: "left" }}>Taille</Text>
              <Text style={{ flex: 1, fontWeight: "bold", fontSize: 14, textAlign: "center" }}>Initiale</Text>
              <Text style={{ flex: 1, fontWeight: "bold", fontSize: 14, textAlign: "right" }}>Restante</Text>
            </View>
          )}
        />
      </ScrollView>
    </View>
  );
};

export default ModelesTable;
