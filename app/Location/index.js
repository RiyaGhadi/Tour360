import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, Image, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';

const LocationDisplay = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const cameraRef = useRef(null);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    fetchLocation(); // Fetch location when component mounts
  }, []);

  const fetchLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    try {
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setErrorMsg(null);
    } catch (error) {
      setErrorMsg('Failed to fetch location');
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      let photo = await cameraRef.current.takePictureAsync();
      setPhotos([...photos, photo.uri]);
    }
  };

  const submitData = async () => {
    // Here you would send the data to your backend server
    // For example, you can use fetch or axios to send an HTTP POST request
    try {
      const formData = new FormData();
      formData.append('image', { uri: photos[photos.length - 1], name: 'photo.jpg', type: 'image/jpg' });
      formData.append('latitude', location.coords.latitude);
      formData.append('longitude', location.coords.longitude);

      // Replace 'YOUR_API_ENDPOINT' with your actual API endpoint
      const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        body: formData,
      });

      // Handle response from the server
      if (response.ok) {
        Alert.alert('Success', 'Data submitted successfully');
      } else {
        Alert.alert('Error', 'Failed to submit data');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit data');
      console.error('Error submitting data:', error);
    }
  };

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `Current Location: Latitude: ${location.coords.latitude}, Longitude: ${location.coords.longitude}`;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Camera style={{ flex: 1 }} type={Camera.Constants.Type.back} ref={cameraRef} />
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{text}</Text>
        <Button title="Refresh Location" onPress={fetchLocation} />
        <Button title="Take Picture" onPress={takePicture} />
        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          {photos.map((photoUri, index) => (
            <Image key={index} source={{ uri: photoUri }} style={{ width: 100, height: 100, marginHorizontal: 5 }} />
          ))}
        </View>
        <Button title="Submit Data" onPress={submitData} disabled={!photos.length || !location} />
      </View>
    </View>
  );
};

const LocationScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <LocationDisplay />
    </View>
  );
};

export default LocationScreen;
