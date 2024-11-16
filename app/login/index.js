import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, Image, Alert, TouchableOpacity,ImageBackground } from 'react-native';
import { Button } from '@rneui/base';
import { useNavigation } from '@react-navigation/native';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

// Initialize Supabase client
const supabase = createClient('https://yinihqkmqtemokvacipf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpbmlocWttcXRlbW9rdmFjaXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgwNjM4NTEsImV4cCI6MjAyMzYzOTg1MX0.SPb-xP8uhX94OTaAepQEX6o0c3gj-okkbEIdXT9Xxpw');

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      // Query user table for provided email
      const { data, error } = await supabase
        .from('User')
        .select('id, password')
        .eq('email', email)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        Alert.alert('Error', "User with provided email doesn't exist");
        return;
      }

      // Hash the login password to compare with stored hash
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
      );

      // Compare hashed passwords
      if (hashedPassword !== data.password) {
        Alert.alert('Error', 'Invalid password');
        return;
      }

      // Store user ID in AsyncStorage
      console.log(data.id)
      await AsyncStorage.setItem('id', JSON.stringify(data.id));
      navigation.navigate('UserProfile'); // Navigate to user profile page upon successful login

    } catch (error) {
      setError(error.message);
    } finally {
      // Clear input fields
      setEmail('');
      setPassword('');
    }
  };



  return (
    <ImageBackground
    source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp1R_3LRWcgJVv_zo-z-NJdXq7XXsqZdz28Q&usqp=CAU' }}
    style={styles.backgroundImage}
   // Adding blur effect
  > 
    <SafeAreaView style={{ flex: 1 ,marginTop:75}}>
      <KeyboardAvoidingView  behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardShouldPersistTaps='handled'>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Image source={require('@/assets/images/maplogo-Photoroom.png')} style={styles.bgImage} />
          <Text style={styles.title}>Login</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.labels}>EMAIL</Text>
            <TextInput
              style={styles.inputStyle}
              autoCapitalize="none"
              autoCorrect={true}
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.labels}>PASSWORD</Text>
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
            onPress={handleLogin} // Call handleLogin function on button press
            buttonStyle={{
              backgroundColor: 'rgba(78, 116, 289, 1)',
              borderRadius: 25,
              backgroundColor: '#0A21C0',
              marginHorizontal: 40,


            }}
            containerStyle={{
              width: 200,
              marginHorizontal: 40,
              marginVertical: 10,
            }}
          />
          <Text style={styles.orText}>OR</Text>
          <Button
            title="SignUp"
            onPress={() => {
              navigation.navigate('Register')
            }}
            buttonStyle={{
              backgroundColor: '#f79e02',
              borderRadius: 40,
              marginHorizontal: 40
            }}
            containerStyle={{
              width: 200,
              marginHorizontal: 50,
              marginVertical: 10,
            }}
          />
          <TouchableOpacity style={styles.forgetPasswordButton} onPress={() => navigation.navigate('ForgetPassword')}>
            <Text style={styles.forgetPasswordButtonText}>Forget password</Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: {
    width: '100%',
    height: '30%',
    marginBottom: 20,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgetPasswordButton: {
    alignSelf: 'center',
    marginVertical: 10,
  },
  forgetPasswordButtonText: {
    color: 'blue', // Change to desired text color
    textDecorationLine: 'underline', // Optional: add underline to make it look like a link
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 150,
  },
  title: {
    fontSize: 30,
    marginBottom: 20,
    fontWeight: 'bold'
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
    backgroundColor:'white'
  },
  orText: {
    fontSize: 20,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },

});
