import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ImageBackground } from 'react-native'
// import Autoshoot from './Autoshoot.js'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { Icon } from 'native-base'
import { Camera, Permissions } from 'expo';
import { createStackNavigator } from 'react-navigation'; 
import Home from './Home.js';



import Guest from './screens/Guest.js';
import LoginScreen from './screens/LoginScreen.js';
import SignIn from './screens/SignIn.js';
import SignUp from './screens/SignUp.js';
import StartCam from './screens/StartCam.js';



//insert SERVER URL
const SERVER_URL = '';


class Autoshoot extends React.Component {
  state = {
    photo: null
  }
  takePicture = ()=> {
    this.camera.takePictureAsync({
      quality: 0.1,
      base64: true,
      exif: false
    }).then(photo => {
      this.setState({photo});
    })
  }

  uploadPicture = () => {
    return fetch(SERVER_URL, {
      body: JSON.stringify({
        image: this.state.photo.base64
      }),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
      })
      .then(response => response.json())
  }
  render() {
     const {photo} = this.state;

    return (
      <View style={{ flex: 1, width: '100%'}}>
      {photo ? (
        <ImageBackground style={{flex:1}} source={{uri:photo.uri}}/>):
      (
        <Camera 
        style={{flex: 1 }}
          type={Camera.Constants.Type.back}
          ref={cam => this.camera = cam}>
          <View style={{flex: 1, alignItems: 'center',flexDirection: "row-reverse", paddingHorizontal: 10, marginBottom: 15}}>
            <View style={{flex: 1}}>
              <TouchableOpacity style={{flex:1}} onPress={this.takePicture}>
                <MaterialCommunityIcons name="circle-outline" style={{ color: 'white', fontSize : 100 }}></MaterialCommunityIcons>
              </TouchableOpacity>
              <Icon name="ios-images" style={{ color: 'white', fontSize: 36 }} />
            </View>
          </View>
        </Camera>  
      )} 
      </View>
    );
  }
}

export class StartCamera extends React.Component {
  //initialize state
  state = {
    cameraPermission: null
  };

  componentDidMount() {
    Permissions.askAsync(Permissions.CAMERA)
      .then(({ status }) =>
        this.setState({
          cameraPermission: status === 'granted'
          // photo: null
        })
      );
  }

  render() {
    const { cameraPermission } = this.state;

    //Render one of 3 things depending on permissions
    return (
      <View style={styles.container}>
        {cameraPermission === null ? (<Text>Waiting for permission...</Text>) : cameraPermission === false}
        {cameraPermission === false ? (<Text>Permission denied</Text>) : (<Autoshoot/>)}
      </View>
    );
  }
}

export default class App extends React.Component {
  render() {
    return (
      <AppStackNavigator />
    );
  }
}

const AppStackNavigator = createStackNavigator({
  Login: LoginScreen,
  // HomeScreen: HomeScreen,
  Guest: Guest,
  SignIn: SignIn,
  SignUp: SignUp,
  StartCam: StartCam
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

