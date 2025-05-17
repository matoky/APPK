import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './component/LoginScreen';
import SurveillantScreen from './screens/SurveillantScreen';
import ChefAtelierScreen from './screens/ChefAtelierScreen';
import MecanoScreen from './screens/MecanoScreen';
import ControleScreen from './screens/ControleScreen';
import PackingScreen from './screens/PackingScreen';
import SupervisieurScreen from'./screens/SupervisieurScreen';
import BoutScreen from'./screens/BoutScreen';
import BemScreen from'./screens/BemScreen';
import CuisineScreen from'./screens/CuisineScreen';
import MaintenanceScreen from'./screens/MaintenanceScreen';
import FormationScreen from './screens/FormationScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SURVEILLANT" component={SurveillantScreen} />
      <Stack.Screen name="SUPERVISIEUR" component={SupervisieurScreen} />
      <Stack.Screen name="MAINTENANCE" component={MaintenanceScreen} />
      <Stack.Screen name="BOUT" component={BoutScreen} />
      <Stack.Screen name="BEM" component={BemScreen} />
      <Stack.Screen name="PACKING" component={PackingScreen} />
      <Stack.Screen name="CHEFATELIER" component={ChefAtelierScreen} />
      <Stack.Screen name="MECANICIEN" component={MecanoScreen} />
      <Stack.Screen name="CUISINE" component={CuisineScreen} />
      <Stack.Screen name="CONTROLE" component={ControleScreen} />
      <Stack.Screen name="FORMATION" component={FormationScreen} />

    </Stack.Navigator>
  );
};

export default AppNavigator;
