import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform,ScrollView } from 'react-native';

import { Link, router } from 'expo-router';
import { Button } from '@rneui/base';

import AsyncStorage from '@react-native-async-storage/async-storage';


export default function Page() {
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
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.labels}>ENTER THE ADDRESS OF INSTITUTE</Text>
            <TextInput
              style={styles.inputStyle}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={true}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.labels}>ENTER PHONE NUMBER </Text>
            <TextInput
              style={styles.inputStyle}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={true}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.labels}>CONFIRM PASSWORD</Text>
            <TextInput
              style={styles.inputStyle}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={true}
            />
          </View>
          <Button
            title="next"
            onPress={() => {
              router.navigate(`/Grid`)
            }}
            buttonStyle={{
              backgroundColor: 'blue',
              borderRadius: 3,
              position:'relative'
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
