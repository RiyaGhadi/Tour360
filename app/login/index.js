import { Button } from '@rneui/base';
import { Link, router } from 'expo-router';
import React from 'react';
import { Text, Image, View, StyleSheet, TextInput, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';

export default function Page() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Image source={require('@/assets/images/maplogo.png')} style={styles.bgImage} />
          <Text style={styles.title}>Login</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.labels}>ENTER YOUR NAME</Text>
            <TextInput style={styles.inputStyle} autoCapitalize="none" autoCorrect={false} />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.labels}>ENTER YOUR PASSWORD</Text>
            <TextInput style={styles.inputStyle} autoCapitalize="none" autoCorrect={false} secureTextEntry={true} />
          </View>
          <Button
              title="Login"
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
          <Text style={styles.orText}>OR</Text>
          <Button
              title="SignUp"
              onPress={()=>{
                router.push(`/Register`)
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
  buttonStyle: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
    marginBottom: 10,
  },
  orText: {
    fontSize: 20,
    marginBottom: 10,
  },
  signupButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
});
