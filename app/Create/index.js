import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { Button } from '@rneui/base';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Page() {
  const [instituteName, setInstituteName] = useState('');
  const [instituteAddress, setInstituteAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleNext = async () => {
    try {
      const formData = new FormData();
      formData.append('instituteName', instituteName);
      formData.append('instituteAddress', instituteAddress);
      formData.append('phoneNumber', phoneNumber);
      formData.append('confirmPassword', confirmPassword);

      const response = await fetch('YOUR_BACKEND_URL', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        // Data successfully submitted to the backend
        router.navigate(`/createProfileInstitution`);
      } else {
        // Handle error responses from the backend
        console.error('Failed to submit data to the backend');
      }
    } catch (error) {
      console.error('Error occurred while submitting data:', error);
    }
  };

  return (
    <ScrollView>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.title}></Text>
            <View style={styles.inputContainer}>
              <Text style={styles.labels}>ENTER INSTITUTE NAME </Text>
              <TextInput
                style={styles.inputStyle}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={text => setInstituteName(text)}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.labels}>ENTER THE ADDRESS OF INSTITUTE</Text>
              <TextInput
                style={styles.inputStyle}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={text => setInstituteAddress(text)}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.labels}>ENTER PHONE NUMBER </Text>
              <TextInput
                style={styles.inputStyle}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={text => setPhoneNumber(text)}
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
              />
            </View>
            <Button
              title="next"
              onPress={handleNext}
              buttonStyle={{
                backgroundColor: 'blue',
                borderRadius: 3,
                position: 'relative'
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
    width: '80%',
    alignItems: 'center',
    marginBottom: 10,
  },
});
