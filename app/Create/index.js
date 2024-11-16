import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView ,ImageBackground} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@rneui/base';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize Supabase client
const supabase = createClient('https://yinihqkmqtemokvacipf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpbmlocWttcXRlbW9rdmFjaXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgwNjM4NTEsImV4cCI6MjAyMzYzOTg1MX0.SPb-xP8uhX94OTaAepQEX6o0c3gj-okkbEIdXT9Xxpw');

export default function Page() {
  const [instituteName, setInstituteName] = useState('');
  const [instituteAddress, setInstituteAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneErrorMessage, setPhoneErrorMessage] = useState('');
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [campusImageLink, setcampusImageLink] = useState('');
  
  const navigation = useNavigation();

  const handlePhoneNumberChange = (text) => {
    const formattedText = text.replace(/[^\d]/g, '');
    setPhoneNumber(formattedText);
    if (formattedText.length === 10) {
      setPhoneErrorMessage('');
    } else {
      setPhoneErrorMessage('Please enter a valid 10-digit phone number.');
    }
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(text)) {
      setEmailErrorMessage('');
    } else {
      setEmailErrorMessage('Please enter a valid email address.');
    }
  };

  const handleNext = async () => {
    if (phoneNumber.length !== 10) {
      setPhoneErrorMessage('Please enter a valid 10-digit phone number.');
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailErrorMessage('Please enter a valid email address.');
      return;
    }
  
    try {
      const idObject = await AsyncStorage.getItem('id');
    
      // Parse the ID value from the object
      const id = JSON.parse(idObject);
      console.log(id,instituteName,instituteAddress,phoneNumber,email,campusImageLink,confirmPassword)
  
      // Insert data into the "campus" table
      const { data, error } = await supabase.from('Campus').insert([
        {
          'Campusname': instituteName,
          'Address': instituteAddress,
          'Contact': phoneNumber,
          'Email': email,
          'password': confirmPassword,
          'Image': campusImageLink,
          'Userid': id,
        },
      ]);
      
  
      if (error) {
        console.error('Error inserting data into the campus table:', error.message);
        return;
      }
      try {
        // Select ID from the Campus table where all parameters match
        const { data, error } = await supabase
          .from('Campus')
          .select('id')
          .eq('Campusname', instituteName)
          .eq('Address', instituteAddress)
          .eq('Contact', phoneNumber)
          .eq('Email', email)
          .eq('password', confirmPassword)
          .eq('Image', campusImageLink)
          .eq('Userid', id);
      
        if (error) {
          console.error('Error selecting ID:', error.message);
          return;
        }
      
        const insertedCampusId = data;
  
        // Store the campus ID in AsyncStorage
        await AsyncStorage.setItem('campusId',  JSON.stringify(data));
        // If data is retrieved successfully
        console.log('Selected ID:', insertedCampusId);
  
      setInstituteName('');
      setInstituteAddress('');
      setPhoneNumber('');
      setEmail('');
      setConfirmPassword('');
      setcampusImageLink('')
  
      navigation.navigate('createProfileInstitution');
      
      } catch (error) {
        console.error('Error occurred while selecting ID:', error);
      }
      
    } catch (error) {
      console.error('Error occurred while submitting data:', error);
    }
  };
  
  
  return (
       <ImageBackground
      source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp1R_3LRWcgJVv_zo-z-NJdXq7XXsqZdz28Q&usqp=CAU' }}
      style={styles.backgroundImage}
     // Adding blur effect
    > 
    <ScrollView>
      <SafeAreaView style={{ flex: 1,marginTop:75 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.title}></Text>
            <View style={styles.inputContainer}>
              <Text style={styles.labels}>INSTITUTE NAME</Text>
              <TextInput
                style={styles.inputStyle}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={text => setInstituteName(text)}
                value={instituteName}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.labels}>ADDRESS OF INSTITUTE</Text>
              <TextInput
                style={styles.inputStyle}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={text => setInstituteAddress(text)}
                value={instituteAddress}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.labels}>PHONE NUMBER</Text>
              <TextInput
                style={styles.inputStyle}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="numeric"
                value={phoneNumber}
                onChangeText={handlePhoneNumberChange}
              />
              {phoneErrorMessage ? (
                <Text style={styles.errorText}>{phoneErrorMessage}</Text>
              ) : null}
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.labels}>EMAIL</Text>
              <TextInput
                style={styles.inputStyle}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                value={email}
                onChangeText={handleEmailChange}
              />
              {emailErrorMessage ? (
                <Text style={styles.errorText}>{emailErrorMessage}</Text>
              ) : null}
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.labels}>PASSWORD</Text>
              <TextInput
                style={styles.inputStyle}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={true}
                onChangeText={text => setConfirmPassword(text)}
                value={confirmPassword}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.labels}>CONFIRM PASSWORD</Text>
              <TextInput
                style={styles.inputStyle}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={true}
                onChangeText={text => setConfirmPassword(text)}
                value={confirmPassword}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.labels}>CAMPUS IMAGE LINK</Text>
              <TextInput
                style={styles.inputStyle}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={text => setcampusImageLink(text)}
                value={campusImageLink}
              />
            </View>
            <Button
              title="Next"
              onPress={handleNext}
              buttonStyle={{
                backgroundColor: 'blue',
                borderRadius: 20,
                position: 'relative',
                elevation: 80,
                shadowColor:'#163599',
                 
                
              }}
              containerStyle={{
                width: 100,
                marginHorizontal: 150,
                marginVertical: 10,
              }}
            />
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
  },
  inputContainer: {
    width: '80%',
    marginBottom: 20,
    
  },
  labels: {
    fontSize: 18,
    color: 'black',
    marginBottom: 5,

  },
  inputStyle: {
    height: 40,
    borderWidth: 1,
    padding: 10,
    backgroundColor:'white'
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
