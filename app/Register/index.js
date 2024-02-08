import React from 'react';
import { Text, Image, View, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';

export default function Page() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.title}>Sign UP</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.labels}>ENTER YOUR EMAIL</Text>
            <TextInput style={styles.inputStyle} autoCapitalize="none" autoCorrect={false} />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.labels}>ENTER YOUR USERNAME</Text>
            <TextInput style={styles.inputStyle} autoCapitalize="none" autoCorrect={false} secureTextEntry={true} />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.labels}>ENTER YOUR PASSWORD</Text>
            <TextInput style={styles.inputStyle} autoCapitalize="none" autoCorrect={false} secureTextEntry={true} />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.labels}>CONFIRM PASSWORD</Text>
            <TextInput style={styles.inputStyle} autoCapitalize="none" autoCorrect={false} secureTextEntry={true} />
          </View>
          <TouchableOpacity style={styles.buttonStyle}>
            <Text style={{ color: 'white' }}>REGISTER</Text>
          </TouchableOpacity>
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
