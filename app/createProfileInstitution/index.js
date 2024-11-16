import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet ,ImageBackground} from 'react-native';
import { useRouter } from 'expo-router'; // Import useRouter hook from expo-router
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize Supabase client
const supabase = createClient('https://yinihqkmqtemokvacipf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpbmlocWttcXRlbW9rdmFjaXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgwNjM4NTEsImV4cCI6MjAyMzYzOTg1MX0.SPb-xP8uhX94OTaAepQEX6o0c3gj-okkbEIdXT9Xxpw');

const ProfilePage = () => {
  const router = useRouter(); // Initialize router object
  const [numberOfFloors, setNumberOfFloors] = useState('');
  const [floorNames, setFloorNames] = useState(Array.from({ length: parseInt(numberOfFloors) }, (_, index) => `Floor ${index + 1}`));

  useEffect(() => {
    // Check if campusId is stored in AsyncStorage
    AsyncStorage.getItem('campusId').then(campusId => {
      console.log('Campus ID from AsyncStorage:', campusId);
    }).catch(error => {
      console.error('Error retrieving campus ID from AsyncStorage:', error);
    });
  }, []); // Run only once when the component mounts

  const handleSubmit = async () => {
    console.log("Number of Floors:", numberOfFloors);
    console.log("Floor Names:", floorNames);

    try {
      const idObject = await AsyncStorage.getItem('campusId');
    
      // Parse the ID value from the object
      const campusid = JSON.parse(idObject)[0].id;
      console.log(campusid)
      // Insert floor data into the "floor" table in Supabase
      for (let i = 1; i <= parseInt(numberOfFloors); i++) {
        const { data, error } = await supabase.from('Floor').insert([
          {
            Floorname: floorNames[i - 1], // Adjust index to start from 0
            No: i - 1,
            Campusid: campusid
          },
        ]);

        if (error) {
          throw new Error('Failed to save floor data');
        }

        console.log(`Data for floor ${i} saved successfully.`);
      }

      console.log('All floor data saved successfully.');

      // After saving, navigate to the grid page for each floor
      router.navigate('/Grid');

    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  return (
    <ImageBackground
    source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp1R_3LRWcgJVv_zo-z-NJdXq7XXsqZdz28Q&usqp=CAU' }}
    style={styles.backgroundImage}
    // Adding blur effect
  >
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Number of Floors:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter number of floors"
          value={numberOfFloors}
          onChangeText={text => {
            setNumberOfFloors(text);
            setFloorNames(Array.from({ length: parseInt(text) }, (_, index) => `Floor ${index + 1}`));
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
    </ImageBackground>
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

  },  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor:'white'
  },
});

export default ProfilePage;
