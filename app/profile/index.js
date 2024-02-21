import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { router } from 'expo-router'; // Import useRouter hook from expo-router

const ProfilePage = () => {
  const router = useRouter(); // Initialize router object
  const [instituteName, setInstituteName] = useState('');
  const [numberOfFloors, setNumberOfFloors] = useState('');

  const handleSubmit = () => {
    console.log("Institute Name:", instituteName);
    console.log("Number of Floors:", numberOfFloors);

    // Here you would send data to backend API to save
    // After saving, navigate to the grid page for the first floor
    router.navigate('/Grid', { currentFloor: 1, totalFloors: parseInt(numberOfFloors) });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Building Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Building name"
          value={instituteName}
          onChangeText={text => setInstituteName(text)}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Number of Floors:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter number of floors"
          value={numberOfFloors}
          onChangeText={text => setNumberOfFloors(text)}
          keyboardType="numeric"
        />
      </View>
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    width: '100%',
  },
});