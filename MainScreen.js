import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, Button, NativeModules, AppState, SafeAreaView } from 'react-native';
import { BleManager, Characteristic } from 'react-native-ble-plx';
import React, { useState, useEffect, useCallback } from "react";
import { logger } from 'react-native-logs';
import Globals from './Globals';
import base64 from 'react-native-base64';
import { useRoute } from '@react-navigation/native';
import {
  addLogListener,
  removeLogListener,
  clearAllLogs,
  collectLogs,
  log,
} from './Utils';
import { startScan, setTimeout1, startMonitor } from './BackgroundBLE';


// const manager = new BleManager();
const DEVICE_NAME = "Smart Handle";
//const {PLXBackground} = NativeModules;

var value = '1';

export default function Main({ navigation }) {


  const [lockStateLocked, setLockStateLocked] = useState(true);


  const sendLockCommand = () => {

    fetch(Globals.baseURL + "/state/lock", {
      method: "PUT",
      body: JSON.stringify({
        lock: "LOCKED",
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        console.log(JSON.stringify(responseData));
      })
      .catch((error) => console.log(error));
  }

  const sendUnlockCommand = () => {

    fetch(Globals.baseURL + "/state/lock", {
      method: "PUT",
      body: JSON.stringify({
        lock: "UNLOCKED",
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        console.log(JSON.stringify(responseData));
      })
      .catch((error) => console.log(error));
  }

  const startScan1 = () => {
    startScan(uuid);
  }

  const setTimeout11 = () => {
    setTimeout1();
  }

  const sendAway = () => {
    fetch(Globals.baseURL + "/state/users/" + uuid, {
      method: "PUT",
      body: JSON.stringify({
        state: "UNLOCK",
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        console.log(JSON.stringify(responseData));
      })
      .catch((error) => console.log(error));
  }


  const getLockState = async() => {
    let fetchurl = Globals.baseURL + '/state/lock';
    console.log("in getLockState");
    // fetch(fetchurl, {timeout: 2500})
    //   .then((response) => response.json())
    //   .then((json) => {
    //     if (json.lock === "LOCKED") {
    //       setLockStateLocked(true);
    //     }
    //     else {
    //       setLockStateLocked(false);
    //     }

    //     console.log("GET LOCK STATE");
    //     // console.log(JSON.stringify(json));

    //     // console.log(lockStateLocked);


    //   }

    //   )
    //   .catch((error) => console.log(error));
    try {
      const res = await fetch(fetchurl);
      const json = await res.json();
      if (json.lock === "LOCKED") {
        setLockStateLocked(true);
      }
      else {
        setLockStateLocked(false);
      }
    
      console.log("GET LOCK STATE");
    } catch (error) {
      console.log(error);
    }
  
  }

  const route = useRoute();

  const username = route.params.user.username;
  const uuid = route.params.user.uuid;

  useEffect(() => {
    getLockState();
    const intervalId = setInterval(() => {
      getLockState();
      console.log("in interval");
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);
  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.topRow}>  
        {/* <View styles={styles.topRow}> */}
        <TouchableOpacity style={styles.button} onPress={sendAway}>
          <Text style={styles.textStyle}>I'm away</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} /*style={{ position: 'absolute', left: 320, top: 10 }}*/>
          <Text style={styles.textStyle}>{username}</Text>
        </TouchableOpacity>
        {/* </View> */}
    </View>


      <View>
          <Button title="connect" onPress={startScan1} />
         {lockStateLocked ? (
          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity style={styles.lockBorder} onPress={sendUnlockCommand}>
              <Image source={require('./assets/lock-icon.png')} style={styles.locks} />
            </TouchableOpacity>
            <Text style={styles.textStyle}>Tap icon to unlock</Text>
          </View>
  
        ) : (
          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity style={styles.lockBorder} onPress={sendLockCommand}>
              <Image source={require('./assets/unlock-icon.png')} style={styles.locks} />
            </TouchableOpacity>
            <Text style={styles.textStyle}>Tap icon to lock</Text>
          </View>
        )
        }
        </View>
  
       
        <View style={styles.bottomRow}>
        <TouchableOpacity onPress={() => navigation.navigate('Settings', {uuid: uuid})} >
          <Image source={require('./assets/settings2.png')} style={{ height: 40, width: 40 }} />
        </TouchableOpacity>
        </View>
        
  
       
    </SafeAreaView>
        
    //   <View >
      
    //     <Button title="connect" onPress={startScan1} />
    //   {lockStateLocked ? (
    //     <View style={{ alignItems: 'center' }}>
    //       <TouchableOpacity style={styles.lockBorder} onPress={sendUnlockCommand}>
    //         <Image source={require('./assets/lock-icon.png')} style={styles.locks} />
    //       </TouchableOpacity>
    //       <Text style={styles.textStyle}>Tap icon to unlock</Text>
    //     </View>

    //   ) : (
    //     <View style={{ alignItems: 'center' }}>
    //       <TouchableOpacity style={styles.lockBorder} onPress={sendLockCommand}>
    //         <Image source={require('./assets/unlock-icon.png')} style={styles.locks} />
    //       </TouchableOpacity>
    //       <Text style={styles.textStyle}>Tap icon to lock</Text>
    //     </View>
    //   )
    //   }
    //   </View>

     
    //   <View >
    //   <TouchableOpacity onPress={() => navigation.navigate('Settings')} >
    //     <Image source={require('./assets/settings2.png')} style={{ height: 40, width: 40 }} />
    //   </TouchableOpacity>
    //   </View>
      

    // </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    flexDirection: 'column',
    flex: 1
  },
  topRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    borderColor: 'red',
    margin: 20
  },
  bottomRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    borderColor: 'red',
    margin: 20
  },
  button: {
    padding: 10,
    borderWidth: 2,
    width: 'fit-content',
    
  },
  textStyle: {
    margin: 40
  },
  verticalAlign: {
    flex: 2,
    flexDirection: 'column',
    justifyContent: 'space-around'
  },
  locks: {
    borderRadius: 200,
    borderColor: 'blue',
    // backgroundColor: 'blue',
    borderWidth: 2,
    height: 100,
    width: 100,
  },
  lockBorder: {
    // borderRadius: 200,
    // borderColor: 'black',
    // borderWidth: 2,
    // height: 100,
    // width: 100,
    margin: 40

  },
  textStyle: {
    fontSize: 20
  }
});