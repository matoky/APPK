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
      const response = await axios.get(`${config.API_HOST}/qrChaine`);

      const qrList = Array.isArray(response.data) ? response.data : [response.data];

      const finalData = qrList.map(item => ({
        chaine: item.chaine,
        matricule: item.matricule,
        posteOperation: item.posteOperation,
      }));
      setData(finalData);
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
    }
    setLoading(false);
  };
  const filteredData = data.filter(item =>
    item.chaine.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button title="Actualiser les données" onPress={fetchData} disabled={loading} />
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
        placeholder="Rechercher par chaine"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <ScrollView horizontal>
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={{ flexDirection: "row", backgroundColor: "#FFEFD5", padding: 10, borderBottomWidth: 1, minWidth: 400 }}>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: "bold" }}>{item.chaine}</Text>
              <Text style={{ flex: 1, fontSize: 14 }}>{item.matricule}</Text>
              <Text style={{ flex: 1, fontSize: 14 }}>{item.posteOperation}</Text>  
            </View>
          )}
          ListHeaderComponent={() => (
            <View style={{ flexDirection: "row", padding: 10, backgroundColor: "#FDBCB4", minWidth: 400 }}>
              <Text style={{ flex: 1, fontWeight: "bold", fontSize: 14 }}>Chaine</Text>
              <Text style={{ flex: 1, fontWeight: "bold", fontSize: 14 }}>Matricule</Text>
              <Text style={{ flex: 1, fontWeight: "bold", fontSize: 14 }}>Poste</Text>
            </View>
          )}
        />
      </ScrollView>
    </View>
  );
};
export default ModelesTable;
