import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import Globals from './Globals';

export default function Login({ navigation }) {
  const [state, setState] = useState({
    email: '',
    password: '',
  })


  const [userFound, setUserFound] = useState(false);

  const [userArray, setUserArray] = useState([]);

  // const [user, setUser] = useState({});
  let user = {
    username: "",
    uuid: ""
  }



  const checkUsername = () => {
    for (let i = 0; i < userArray.length; ++i) {
      if (userArray[i].username == state.email) {
        user.username = userArray[i].username;
        user.uuid = userArray[i].uuid;
        return true;
      }
    }
    return false;
  }


  useEffect(() => {
    let fetchurl = Globals.baseURL + '/state/users';

    fetch(fetchurl)
      .then((response) => response.json())
      .then((json) => {
        setUserArray(json);
      }
      )
      .catch((error) => console.log(error));
  });


  return (
    // <ScrollView>
    <View style={styles.container}>

      <Text style={styles.title}> Login</Text>
      <View style={styles.inputView}>
        <TextInput
          style={styles.inputText}
          placeholder="Username"
          placeholderTextColor="#003f5c"
          onChangeText={text => setState({ email: text })} />
      </View>
      <View style={styles.inputView}>
        <TextInput
          style={styles.inputText}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor="#003f5c"
          onChangeText={text => setState({ password: text })} />
      </View>

      <Button title='Submit' onPress={() => {
        if (checkUsername() === true) {
          navigation.navigate('Main', { user: user });

        } else {
          console.log("Incorrect username or password");
        }
      }} />
    </View>
    // </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: "bold",
    fontSize: 50,
    color: "blue",
    marginBottom: 40,
  },

  inputView: {
    width: 300,
    //backgroundColor:"#3AB4BA",
    //borderRadius:25,
    borderColor: "black",
    borderWidth: 1,
    height: 50,
    marginBottom: 20,
    justifyContent: "center",
    padding: 20
  },
  inputText: {
    height: 50,
    color: "black"
  },
  button: {

  }
});