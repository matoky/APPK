import React, { useState } from "react";
import { View } from "react-native";
import { TextInput, Button } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import tw from "tailwind-react-native-classnames"; 

export default function App() {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState("date");

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || (mode === "date" ? date : time);
    setShow(false);
    if (mode === "date") setDate(currentDate);
    if (mode === "time") setTime(currentDate);
  };

  const showPicker = (currentMode) => {
    setMode(currentMode);
    setShow(true);
  };

  const handleSubmit = () => {
    console.log("Date sélectionnée :", date.toLocaleDateString());
    console.log("Heure sélectionnée :", time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  };

  return (
    <View style={tw`flex-1 justify-center items-center p-4`}>
      <TextInput
        value={date.toLocaleDateString()}
        onFocus={() => showPicker("date")}
        editable={false}
        style={tw`w-2/5 mb-4,h-10`}
      />
      <TextInput
        value={time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        onFocus={() => showPicker("time")}
        editable={false}
        style={tw`w-1/3 mb-4,h-10 bg-green-100 border-2 border-blue-500`}
      />
      {show && (
        <DateTimePicker
          value={mode === "date" ? date : time}
          mode={mode}
          display="default"
          onChange={onChange}
        />
      )}
      <Button mode="contained" onPress={() => showPicker("date")} style={tw`mt-2 w-1/2`}>
        Sélectionner une date
      </Button>
      <Button mode="contained" onPress={() => showPicker("time")} style={tw`mt-2 w-1/2`}>
        Sélectionner une heure
      </Button>
      <Button mode="contained" onPress={handleSubmit} style={tw`mt-4 w-1/2`}>
        Envoyer
      </Button>
    </View>
  );
}
