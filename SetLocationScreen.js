import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, Button, Dimensions } from 'react-native';
import React, { useState, useEffect, useCallback } from "react";
import MapView, { Circle, MapCircle, Marker } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';
// import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

//import Geolocation from '@react-native-community/geolocation';

export default function SetLocation() {
    const [userLoc, setUserLoc] = useState({});

    const route = useRoute();

    const lat = parseFloat(route.params.geofenceData.lat);
    const long = parseFloat(route.params.geofenceData.long);
    const rad = parseInt(route.params.geofenceData.rad);

    useEffect(() => {
        console.log(route.params.geofenceData.lat);
        console.log(route.params.geofenceData.long);
        console.log(route.params.geofenceData.rad);
        console.log(lat);
        console.log(long);
        console.log(rad);

        const intervalId = setInterval(() => {
            console.log(userLoc);
          }, 5000);
      
        return () => clearInterval(intervalId);

       
        
    }, []);
    return (
        <View>
            <MapView 
                initialRegion = {{
                    latitude: lat,
                    longitude: long,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.0075,
                }}

                style={styles.map}

                showsUserLocation={true}
                onUserLocationChange={loc => {
                    console.log("being called");
                    setUserLoc(loc.nativeEvent.coordinate);
                }}

            >
                <Marker coordinate={{latitude: lat, longitude: long}} />
                <Circle  center={{latitude: lat, longitude: long}} radius={rad} fillColor='blue'  />
            </MapView>
        </View>
            

    );
}


const styles = StyleSheet.create({
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    }

});