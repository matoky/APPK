import React, { useState } from 'react';
import { View, TextInput, Button , Text} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Camera, CameraView } from "expo-camera";
import { Picker } from '@react-native-picker/picker';
import tw from 'tailwind-react-native-classnames';


const App = () => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [date1, setDate1] = useState(new Date());
  const [time1, setTime1] = useState(new Date());
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState('date');
  const [scanned, setScanned] = useState(false);
  const [selectedOption1, setSelectedOption1] = useState('Conge');
  const [selectedOption2, setSelectedOption2] = useState('Fanambadiana');

  const showPicker = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const onChange = (event, selectedValue) => {
    setShow(false);
    if (mode === 'date') {
      const currentDate = selectedValue || date;
      setDate(currentDate);
    } else {
      const selectedTime = selectedValue || time;
      setTime(selectedTime);
    }
  };
  const onChange1 = (event, selectedValue) => {
    setShow(false);
    if (mode === 'date') {
      const currentDate = selectedValue || date1;
      setDate1(currentDate);
    } else {
      const selectedTime = selectedValue || time1;
      setTime1(selectedTime);
    }
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  const handleSubmit = () => {
    // Implement submit logic
  };

  const handleSendData = () => {
    // Implement send data logic
  };

  return (
    <View style={tw`flex-1 justify-center items-center p-4`}>
      <View style={tw`flex-1 p-4 bg-gray-100 w-full`}>
        <View style={tw`bg-white`}>
          {/* Conteneur aligné en haut */}
          <View style={tw`flex-row justify-between`}>
      
          {/* Bloc Date début à gauche */}
          <View style={tw`w-1/2 pr-2`}>
            <Text style={tw`text-lg font-bold mb-2`}>Date début</Text>
            <TextInput
              value={date.toLocaleDateString()}
          onFocus={() => showPicker("date")}
          editable={false}
          style={tw`mb-2 h-10 border border-gray-300 px-2`}
        />
        <TextInput
          value={time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          onFocus={() => showPicker("time")}
          editable={false}
          style={tw`mb-2 h-10 bg-green-100 border-2 border-blue-500 px-2`}
        />
        <Button title="Date" onPress={() => showPicker("date")} />
        <View style={tw`mt-2`}>
          <Button title="Heure" onPress={() => showPicker("time")} />
        </View>
      </View>

      {/* Bloc Date fin à droite */}
      <View style={tw`w-1/2 pl-2`}>
        <Text style={tw`text-lg font-bold mb-2`}>Date fin</Text>
        <TextInput
          value={date1.toLocaleDateString()}
          onFocus={() => showPicker("date")}
          editable={false}
          style={tw`mb-2 h-10 border border-gray-300 px-2`}
        />
        <TextInput
          value={time1.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          onFocus={() => showPicker("time")}
          editable={false}
          style={tw`mb-2 h-10 bg-green-100 border-2 border-blue-500 px-2`}
        />
        <Button title="Date" onPress={() => showPicker("date")} />
        <View style={tw`mt-1`}>
          <Button title="Heure" onPress={() => showPicker("time")} />
        </View>
      </View>
    </View>
  </View>
</View>

{show && (
  <DateTimePicker
    value={mode === "date" ? date : time}
    mode={mode}
    display="default"
    onChange={mode === 'date' ? onChange : onChange1}
  />
)}
 <CameraView
  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
  barcodeScannerSettings={{
    barcodeTypes: ['qr', 'pdf417'],
  }}
  style={[tw`w-5/6 h-44 mx-auto rounded-lg`, { marginTop: 150 }]}
/>




      <View style={tw`w-full`}>
        <Picker
          selectedValue={selectedOption1}
          onValueChange={(itemValue) => setSelectedOption1(itemValue)}
          style={tw`mb-2`}
        >
          <Picker.Item label="Congés" value="Congés" />
          <Picker.Item label="Permission" value="Permission" />
          <Picker.Item label="Ostie" value="Ostie" />
        </Picker>

        <Picker
          selectedValue={selectedOption2}
          onValueChange={(itemValue) => setSelectedOption2(itemValue)}
          style={tw`mb-2`}
        >
          <Picker.Item label="Fanambadiana" value="Fanambadiana" />
          <Picker.Item label="Fahafatesan" value="Fahafatesan'ny havana akaiky" />
          <Picker.Item label="Faharariany" value="Fahararian'ny havana akaiky" />
          <Picker.Item label="Famorana" value="Famorana ny zanaky ny mpiasa" />
        </Picker>
      </View>

      <Button title="Envoyer" onPress={handleSendData} />
    </View>
  );
};

export default App;
