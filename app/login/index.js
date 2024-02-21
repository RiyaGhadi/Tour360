import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Button } from '@rneui/base';
import { Link, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'; // Import the navigation hook

export default function Page() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [user, setUser] = useState({});
  const navigation = useNavigation(); // Initialize navigation object

  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Error retrieving token:', error);
      }
    };

    getToken();
  }, []);

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('email', name);
      formData.append('password', password);

      const response = await fetch('https://tour360-ruddy.vercel.app/api/login', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();

      // Save token and user data in AsyncStorage
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.data));

      // Update token and user state
      setToken(data.token);
      setUser(data.data);

      // Navigate to Profile page
      navigation.navigate('UserProfile');

      // Clear error state
      setError('');
    } catch (error) {
      console.error('Error logging in:', error);
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      // Remove token and user data from AsyncStorage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');

      // Clear token and user state
      setToken('');
      setUser({});
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Image source={require('@/assets/images/maplogo.png')} style={styles.bgImage} />
          <Text style={styles.title}>Login</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.labels}>ENTER YOUR EMAIL</Text>
            <TextInput
              style={styles.inputStyle}
              autoCapitalize="none"
              autoCorrect={true}
              value={name}
              onChangeText={setName}
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
          <Button
            title="Login"
            onPress={handleSubmit}
            buttonStyle={{
              backgroundColor: 'rgba(78, 116, 289, 1)',
              borderRadius: 3,
            }}
            containerStyle={{
              width: 200,
              marginHorizontal: 50,
              marginVertical: 10,
            }}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Text style={styles.orText}>OR</Text>
          <Button
            title="SignUp"
            onPress={() => {
              router.navigate(`/Register`)
            }}
            buttonStyle={{
              backgroundColor: 'rgba(214, 61, 57, 1)',
              borderRadius: 3,
            }}
            containerStyle={{
              width: 200,
              marginHorizontal: 50,
              marginVertical: 10,
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bgImage: {
    width: '100%',
    height: '35%',
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    marginBottom: 20,
  },
  inputContainer: {
    width: '80%',
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
  orText: {
    fontSize: 20,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  tokenText: {
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: 'red',
    marginTop: 10,
  },
});
