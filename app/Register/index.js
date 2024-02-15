import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [faceDetected, setFaceDetected] = useState(false);

  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setImageUri(photo.uri);
        setShowCamera(false);
      } catch (error) {
        console.error('Error taking picture: ', error);
      }
    }
  };

  const handleCameraSwitch = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const handleFaceDetection = ({ faces }) => {
    if (faces.length > 0) {
      setFaceDetected(true);
    } else {
      setFaceDetected(false);
    }
  };

  const handleSubmit = async () => {
    // Your submission logic goes here
  };

  return (
    <ScrollView>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {!showCamera ? (
              <>
                <Text style={styles.title}>Sign UP</Text>
                <TouchableOpacity style={styles.cameraButton} onPress={() => setShowCamera(true)}>
                  <Text style={{ color: 'white' }}>Open Camera</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Camera
                  style={styles.camera}
                  type={cameraType}
                  ref={cameraRef}
                  onFacesDetected={handleFaceDetection}
                />
                {faceDetected && (
                  <TouchableOpacity style={styles.buttonStyle} onPress={handleTakePicture}>
                    <Text style={{ color: 'white' }}>Take Picture</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.buttonStyle} onPress={handleCameraSwitch}>
                  <Text style={{ color: 'white' }}>Switch Camera</Text>
                </TouchableOpacity>
              </>
            )}
            {imageUri && (
              <View style={{ width: '80%' }}>
                <View style={styles.inputContainer}>
                  <Text style={styles.labels}>ENTER YOUR EMAIL</Text>
                  <TextInput
                    style={styles.inputStyle}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.labels}>ENTER YOUR PASSWORD</Text>
                  <TextInput
                    style={styles.inputStyle}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={true}
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.labels}>CONFIRM PASSWORD</Text>
                  <TextInput
                    style={styles.inputStyle}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={true}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>
                <TouchableOpacity style={styles.buttonStyle} onPress={handleSubmit}>
                  <Text style={{ color: 'white' }}>REGISTER</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  labels: {
    fontSize: 18,
    color: '#7d7d7d',
    marginBottom: 5,
  },
  inputStyle: {
    height: 40,
    borderWidth: 1,
    padding: 10,
  },
  buttonStyle: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  cameraButton: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 50,
    marginBottom: 20,
  },
  camera: {
    width: '100%',
    height: 400,
  },
});
