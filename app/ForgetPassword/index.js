import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,ImageBackground } from 'react-native';
import * as Crypto from 'expo-crypto';
import { useNavigation } from '@react-navigation/native';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient('https://yinihqkmqtemokvacipf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpbmlocWttcXRlbW9rdmFjaXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgwNjM4NTEsImV4cCI6MjAyMzYzOTg1MX0.SPb-xP8uhX94OTaAepQEX6o0c3gj-okkbEIdXT9Xxpw');

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigation = useNavigation();

  const generateRandomCode = async () => {
    const randomBytes = await Crypto.getRandomBytesAsync(3);
    const code = Array.from(randomBytes).map(byte => byte.toString(10).padStart(2, '0')).join('');
    return code;
  };

  const sendVerificationCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    // Check if the email exists in Supabase
    const { data, error } = await supabase
      .from('User')
      .select('email')
      .eq('email', email)
      .single();

    if (error || !data) {
      Alert.alert('Error', 'User with provided email does not exist');
      return;
    }

    const code = await generateRandomCode();
    setGeneratedCode(code);

    // EmailJS API request
    const serviceId = 'service_ayyq44b';
    const templateId = 'template_6s0jdxi';
    const publicKey = 'RIMRx2fqGX6SCEWjX';

    const emailData = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        to_email: email,
        verification_code: code,
      }
    };

    try {
      const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', emailData);
      if (response.status === 200) {
        Alert.alert('Success', 'Verification code sent to your email');
      } else {
        Alert.alert('Error', 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      Alert.alert('Error', 'Failed to send verification code');
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode === generatedCode) {
      if (newPassword === confirmPassword) {
        try {
          // Hash the new password before updating in Supabase
          const hashedPassword = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            newPassword
          );

          // Update password in Supabase
          const { error } = await supabase
            .from('User')
            .update({ password: hashedPassword })
            .eq('email', email);

          if (error) {
            Alert.alert('Error', 'Failed to update password');
            console.error('Error updating password:', error);
          } else {
            Alert.alert('Success', 'Password reset successfully');
            navigation.navigate('login'); // Navigate to login screen upon successful password reset
          }
        } catch (error) {
          console.error('Error hashing password:', error);
          Alert.alert('Error', 'Failed to hash password');
        }
      } else {
        Alert.alert('Error', 'Passwords do not match');
      }
    } else {
      Alert.alert('Error', 'Invalid verification code');
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp1R_3LRWcgJVv_zo-z-NJdXq7XXsqZdz28Q&usqp=CAU' }}
      style={styles.backgroundImage}
     // Adding blur effect
    > 
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity style={styles.button} onPress={sendVerificationCode}>
        <Text style={styles.buttonText}>Send Verification Code</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Enter verification code"
        value={verificationCode}
        onChangeText={setVerificationCode}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter new password"
        value={newPassword}
        secureTextEntry
        onChangeText={setNewPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm new password"
        value={confirmPassword}
        secureTextEntry
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleVerifyCode}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
    </View>
    </ImageBackground>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    width:350,
    borderColor: 'black',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ForgotPassword;
