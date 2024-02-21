import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router'; // Import useRouter hook from expo-router

const ProfilePage = () => {
  const router = useRouter(); // Initialize router object
  const [instituteName, setInstituteName] = useState('');
  const [numberOfFloors, setNumberOfFloors] = useState('');
  const [floorNames, setFloorNames] = useState(Array.from({ length: parseInt(numberOfFloors) }, () => ""));

  const handleSubmit = async () => {
    console.log("Institute Name:", instituteName);
    console.log("Number of Floors:", numberOfFloors);
    console.log("Floor Names:", floorNames);

    // Send data to backend API to save
    try {
      // Assuming you have an API endpoint to save building and floor data
      const response = await fetch('YOUR_BACKEND_API_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instituteName: instituteName,
          numberOfFloors: parseInt(numberOfFloors),
          floorNames: floorNames,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save data');
      }

      console.log('Data saved successfully.');

      // After saving, navigate to the grid page for each floor
      for (let i = 1; i <= parseInt(numberOfFloors); i++) {
        router.navigate('/Grid', { currentFloor: i, totalFloors: parseInt(numberOfFloors) });
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
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
          onChangeText={text => {
            setNumberOfFloors(text);
            setFloorNames(Array.from({ length: parseInt(text) }, () => ""));
          }}
          keyboardType="numeric"
        />
      </View>
      {floorNames.map((floorName, index) => (
        <View key={index} style={styles.inputContainer}>
          <Text style={styles.label}>Floor {index + 1} Name:</Text>
          <TextInput
            style={styles.input}
            placeholder={`Enter name for Floor ${index + 1}`}
            value={floorName}
            onChangeText={text => {
              const updatedFloorNames = [...floorNames];
              updatedFloorNames[index] = text;
              setFloorNames(updatedFloorNames);
            }}
          />
        </View>
      ))}
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

export default ProfilePage;
