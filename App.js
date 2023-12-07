import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, AppState, NativeModules} from 'react-native';
import Login from './LoginScreen';
import Main from './MainScreen';
import Settings from './SettingsScreen';
import SetLocation from './SetLocationScreen';
//import UserLocation from './UserLocation';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BleManager } from 'react-native-ble-plx';
import { logger } from 'react-native-logs';
import React, { useState, useEffect, useCallback, useRef } from "react";
//import useBackgroundGeolocationTracker from './TestLocationScreen';



const RootStack = createNativeStackNavigator();
const DEVICE_NAME = "handle";
//const log = logger.createLogger();
const {PLXBackground} = NativeModules;

export default function App() {

  


  return (
    <NavigationContainer>
      <RootStack.Navigator headerMode='none'>
        <RootStack.Screen name="Login" component={Login} options={{headerShown: false}}/>
        <RootStack.Screen name="Main"  component={Main} options={{headerShown: false}}/>
        <RootStack.Screen name="Settings"  component={Settings}/>
        <RootStack.Screen name="SetLocation"  component={SetLocation}/>
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
