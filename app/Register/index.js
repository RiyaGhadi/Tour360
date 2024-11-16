import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert,ImageBackground } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { useNavigation } from '@react-navigation/native';
import * as Crypto from 'expo-crypto';


const supabase = createClient('https://yinihqkmqtemokvacipf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpbmlocWttcXRlbW9rdmFjaXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgwNjM4NTEsImV4cCI6MjAyMzYzOTg1MX0.SPb-xP8uhX94OTaAepQEX6o0c3gj-okkbEIdXT9Xxpw');

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const navigation = useNavigation();
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      setEmailErrorMessage('Please enter a valid email address.');
      return;
    } else {
      setEmailErrorMessage('');
    }

    if (!validatePassword(password)) {
      setPasswordErrorMessage('Password must be at least 8 characters long and contain both numbers and alphabets.');
      return;
    } else {
      setPasswordErrorMessage('');
    }

    if (password !== confirmPassword) {
      Alert.alert('Password and confirm password do not match');
      return;
    }

    try {
      // Hash the password using Expo's Crypto module (SHA-256)
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
      );

      const userData = {
        'email': email,
        'password': hashedPassword,
        'name': name,
        'surname': surname,
      };

      const { data: userDataResponse, error: userInsertError } = await supabase
        .from('User')
        .insert([userData]);

      if (userInsertError) {
        throw new Error('Error inserting user data: ' + userInsertError.message);
      }

      console.log('User data inserted successfully:', userDataResponse);
      navigation.navigate('login'); // Navigate to login screen after successful registration

    } catch (error) {
      console.error('Error saving user data:', error.message);
    }
  };
  return (
    <ImageBackground
    source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp1R_3LRWcgJVv_zo-z-NJdXq7XXsqZdz28Q&usqp=CAU' }}
    style={styles.backgroundImage}
   // Adding blur effect
  > 
    <ScrollView >
      <SafeAreaView style={{ flex: 1 ,marginTop:150}}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.title}>Sign UP</Text>
            <View>
              <View style={styles.inputContainer}>
                <Text style={styles.labels}>NAME</Text>
                <TextInput
                  style={styles.inputStyle}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={name}
                  onChangeText={setName}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.labels}>SURNAME</Text>
                <TextInput
                  style={styles.inputStyle}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={surname}
                  onChangeText={setSurname}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.labels}>ENTER YOUR EMAIL</Text>
                <TextInput
                  style={styles.inputStyle}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
                {emailErrorMessage ? (
                  <Text style={styles.errorText}>{emailErrorMessage}</Text>
                ) : null}
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
                {passwordErrorMessage ? (
                  <Text style={styles.errorText}>{passwordErrorMessage}</Text>
                ) : null}
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
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScrollView>
    
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    marginBottom: 20,
    fontWeight:'bold'
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
    backgroundColor:'white'
  },
  buttonStyle: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
