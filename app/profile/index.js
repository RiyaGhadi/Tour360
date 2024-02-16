import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const ProfilePage = () => {
  const [instituteName, setInstituteName] = useState('');
  const [numberOfFloors, setNumberOfFloors] = useState('');

  const handleSubmit = () => {
    // Handle submission of user input, such as sending to a backend server or storing in local storage
    console.log("Institute Name:", instituteName);
    console.log("Number of Floors:", numberOfFloors);
    // You can perform further actions here, such as navigation or data validation
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Profile Page</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Building Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter institute name"
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
          keyboardType="numeric" // Set keyboardType to allow only numeric input
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
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
});

export default ProfilePage;
