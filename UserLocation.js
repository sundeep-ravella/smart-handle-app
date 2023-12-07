import { StatusBar } from 'expo-status-bar';
import { FlatList, StyleSheet, Text, View, TouchableOpacity, Switch, Button, Alert, Image, Modal, TextInput } from 'react-native';
import ModalSelector from 'react-native-modal-selector';
import React, { useState, useEffect } from 'react';
import Globals from './Globals';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
//import Boundary from 'react-native-boundary';
import { useRoute } from '@react-navigation/native';



const data = [
    { key: 1, label: 'UNLOCK' },
    { key: 2, label: 'DO_NOT_UNLOCK' },
    { key: 3, label: 'LOCKOUT' },
];


const Item = ({ item, onPress, onModalClose, backgroundColor, textColor }) => (
    <TouchableOpacity onPress={onPress} style={[styles.item, { backgroundColor, flexDirection: 'horizontal' }]}>
        <Text style={[styles.title, { color: textColor, flex: 2 }]}>{item.name}</Text>
        {item.state == 'DO_NOT_UNLOCK' &&
        <Image style={{flex: 1, height: 20, width: 20}} source={require('./assets/lock-icon.png')}/>}
        {item.state == 'UNLOCK' &&
        <Image style={{flex: 1, height: 20, width: 20}} source={require('./assets/unlock-icon.png')}/>}
        {item.state == 'LOCKOUT' &&
        <Image style={{flex: 1, height: 20, width: 20}} source={require('./assets/lockout1.png')}/>}

        {item.state == 'DO_NOT_UNLOCK' && 
        <ModalSelector 
                //visible={modalVis}
                data={data}
                onModalClose={(data) => {
                    updateUserState(item, data.label);
                }}
                selectedKey={2}
        
            />}
        {item.state == 'UNLOCK' && 
        <ModalSelector 
                //visible={modalVis}
                data={data}
                onModalClose={(data) => {
                    updateUserState(item, data.label);
                }}
                selectedKey={1}
            />}
        {item.state == 'LOCKOUT' && 
        <ModalSelector 
                //visible={modalVis}
                data={data}
                onModalClose={(data) => {
                    updateUserState(item, data.label);
                }}
                selectedKey={3}
            />}
        

    </TouchableOpacity>
);

const updateUserState = (item, data) => {
    fetch(Globals.baseURL + "/state/users/" + item.uuid, {
        method: "PUT",
        body: JSON.stringify({
        state: data,
        }),
    })
        .then((response) => response.json())
        .then((responseData) => {
        console.log(JSON.stringify(responseData));
        })
        
}


export default function Settings({ navigation }) {
    const [selectedId, setSelectedId] = useState(0);
    const [isEnabled, setIsEnabled] = useState(false);
    const [isEnabledSecure, setIsEnabledSecure] = useState(false);
    const [users, setUsers] = useState([]);
    const [fetched, setFetched] = useState(false);
    const [modalVis, setModalVis] = useState(false);
    let userInGeofence = false;
    // const [geofence, setGeofence] = useState({
    //     lat: "0.0",
    //     long: "0.0",
    //     rad: "0"
    // })
    const [geofenceLat, setGeofenceLat] = useState("");
    const [geofenceLong, setGeofenceLong] = useState("");
    const [geofenceRad, setGeofenceRad] = useState("");
    const route = useRoute();

    function measure(lat1, lon1, lat2, lon2) {  // generally used geo measurement function
        var R = 6378.137; // Radius of earth in KM
        var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
        var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;
        return d * 1000; // meters
    }

    const [state, setState] = useState({
        region: null,
        latitude: null,
        longitude: null,
        isEnter: false,
      });
      const longitudeDelta = 0.01;
      const latitudeDelta = 0.01;

    let geofence = {
        lat: "0.0",
        long: "0.0",
        rad: "0"
    }

    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    const toggleSwitchSecure = () => {
        updateMode();
        setIsEnabledSecure(previousState => !previousState);
    }
    const updateMode = () => {
        let mode1;
        console.log(`isEnabledSecure: ${isEnabledSecure}`);
        if (isEnabledSecure == true) {
            mode1 = "PROXIMITY"
        }
        else {
            mode1 = "SECURE";
        }
        fetch(Globals.baseURL + "/state/mode", {
            method: "PUT",
            body: JSON.stringify({
            mode: mode1,
            }),
        })
            .then((response) => response.json())
            .then((responseData) => {
            console.log(JSON.stringify(responseData));
            })
            .catch((error) => console.log(error)); 
    }

    const sendAway = () => {
        const uuid = route.params.uuid;
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

    const getMode = () => {
        let fetchurl = Globals.baseURL + '/state/mode';
    
        fetch(fetchurl)
            .then((response) => response.json())
            .then((json) => {
                console.log("getting mode");
                if (json.mode == "PROXIMITY") {
                    setIsEnabledSecure(false);
                }
                else {
                    setIsEnabledSecure(true);
                }
            }
    
            )
            .catch((error) => console.log(error));
    }

    const getUsers = () => {
        let fetchurl = Globals.baseURL + '/state/users';
    
        fetch(fetchurl)
            .then((response) => response.json())
            .then((json) => {
                console.log("getting users");
                setUsers(json);
                setFetched(true);
            }
    
            )
            .catch((error) => console.log(error));
    }

    useEffect(() => {
        getUsers();
        getMode();
        BackgroundGeolocation.configure({
            desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
            stationaryRadius: 50,
            distanceFilter: 50,
            notificationTitle: 'Background tracking',
            notificationText: 'enabled',
            debug: false,
            startOnBoot: false,
            stopOnTerminate: false,
            activityType: 'Fitness',
            locationProvider:
              Platform.OS === 'android'
                ? BackgroundGeolocation.ACTIVITY_PROVIDER
                : BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
            interval: 10000,
            fastestInterval: 10000,
            activitiesInterval: 10000,
            stopOnStillActivity: false,
            url: 'http://192.168.0.97:3000/locations',
            syncUrl: 'http://192.168.0.97:3000/sync',
            httpHeaders: {
              'X-FOO': 'bar',
            },
            // customize post properties
            postTemplate: {
              lat: '@latitude',
              lon: '@longitude',
            },
          });
           // Onchange 
    BackgroundGeolocation.on('location', (location) => {
        console.log('[DEBUG] BackgroundGeolocation location', location);
        
        let dist = measure(42.292670344746035, -83.71604579775962, location.latitude, location.longitude);
        console.log(dist);

        if (dist < 30) {
            console.log("IN GEOFENCE");
            

        }
        else {
            console.log("OUTSIDE OF GEOFENCE");
            sendAway();
           
        }
  
        BackgroundGeolocation.startTask((taskKey) => {
          const region = Object.assign({}, location, {
            latitudeDelta,
            longitudeDelta,
          });
  
          setState((state) => ({
            ...state,
            latitude: location.latitude,
            longitude: location.longitude,
            region: region,
          }));

          
  
          BackgroundGeolocation.endTask(taskKey);
        });
      });
  
      // On Start
      BackgroundGeolocation.on('start', () => {
        console.log('[INFO] BackgroundGeolocation service has been started');
  
        BackgroundGeolocation.getCurrentLocation(
          (location) => {
            const region = Object.assign({}, location, {
              latitudeDelta,
              longitudeDelta,
            });
            setState((state) => ({
              ...state,
              latitude: location.latitude,
              longitude: location.longitude,
              region: region,
            }));
          },
          (error) => {
            setTimeout(() => {
              Alert.alert(
                'Error obtaining current location',
                JSON.stringify(error),
              );
            }, 100);
          },
        );
      });

      // "accuracy": 35.34263054960244,
//   "altitude": 264.04674911499023,
//   "altitudeAccuracy": 2.331606388092041,
//   "bearing": -1,
//   "heading": -1,
//   "latitude": 42.292309060420465,
//   "longitude": -83.71397022958172,
//   "speed": -1,
//   "time": 1701282567621.49,
  
      BackgroundGeolocation.checkStatus((status) => {
        console.log(
          '[INFO] BackgroundGeolocation service is running',
          status.isRunning,
        );
        console.log(
          '[INFO] BackgroundGeolocation services enabled',
          status.locationServicesEnabled,
        );
        console.log(
          '[INFO] BackgroundGeolocation auth status: ' + status.authorization,
        );
  
        // you don't need to check status before start (this is just the example)
        // if (!status.isRunning) {
        BackgroundGeolocation.start(); //triggers start on start event
        // }
      });
  
      BackgroundGeolocation.on('background', () => {
        console.log('[INFO] App is in background');
      });
  
      BackgroundGeolocation.on('foreground', () => {
        console.log('[INFO] App is in foreground');
      });
  
      BackgroundGeolocation.on('stationary', (location) => {
        console.log('[DEBUG] BackgroundGeolocation stationary', location);
      });
        const intervalId = setInterval(() => {
            getUsers();
            getMode();
          }, 3000);
      
          return () => clearInterval(intervalId);

       
        
    }, []);

    const renderItem = ({ item }) => {
        const backgroundColor =  '#f9c2ff';
        const color = 'black';

        return (
            <Item
                item={item}
                // onPress={() => setSelectedId(item.user_id)}
                backgroundColor={backgroundColor}
                textColor={color}
            />
        );
    };

 
    return (
        
        <View style={styles.container}>
            
            <View style={{flex: 2}}>
                <View style={{flexDirection: 'row', marginTop: 15}}>
                    <Text style={{fontSize: 20, marginRight: 20}}>Secure mode</Text>
                    <Switch
                        trackColor={{false: '#767577', true: '#81b0ff'}}
                        thumbColor={isEnabledSecure ? '#f5dd4b' : '#f4f3f4'}
                        onValueChange={toggleSwitchSecure}
                        value={isEnabledSecure}
                        style={{marginTop: 0}}
                    />
                 
                 </View>
                <View style={{flexDirection: 'row', marginTop: 20}}>
                <Text style={{fontSize: 20, marginRight: 20}}>Geo-mode</Text>
                <Switch
                    trackColor={{false: '#767577', true: '#81b0ff'}}
                    thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                    onValueChange={toggleSwitch}
                    value={isEnabled}
                    style={{marginTop: 0}}
                 />
                 
                 </View>
                 <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View style={{borderWidth: 1, width: 80, height: 25, marginTop: 10}}>
                    <TextInput 
                        placeholder="Lat"
                        placeholderTextColor="#003f5c"
                        onChangeText={text => setGeofenceLat(text)}
                    />
                    </View>
                    <View style={{borderWidth: 1, width: 80, height: 25, marginTop: 10}}>
                    <TextInput 
                        placeholder="Long"
                        placeholderTextColor="#003f5c"
                        onChangeText={text => setGeofenceLong(text)}
                    />
                    </View>
                    <View style={{borderWidth: 1, width: 80, height: 25, marginTop: 10}}>
                    <TextInput 
                        placeholder="Rad(m)"
                        placeholderTextColor="#003f5c"
                        onChangeText={text => setGeofenceRad(text)}
                    />
                    
                    </View>
                    <Button title='create'/>
                 </View>
                 <Button  title='Map'    onPress={() => {
                    geofence.lat = geofenceLat;
                    geofence.long = geofenceLong;
                    geofence.rad = geofenceRad;
                    navigation.navigate('SetLocation', {geofenceData: geofence})
                }}   />
            </View>
            <View style={{flex: 5}}>
                <Text style={{fontSize: 30}}>User Management:</Text>
                <FlatList data={users} renderItem={renderItem}
                    keyExtractor={item => item.uuid}
                    extraData={selectedId}
                    onPress={() => {
                        setSelectedId(item.user_id);
                        setModalVis(true);
                    }}

                    />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    item: {
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    title: {
        fontSize: 32,
    },
});
