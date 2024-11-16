import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Modal,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@rneui/themed';

// Initialize Supabase client
const supabase = createClient(
  'https://yinihqkmqtemokvacipf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpbmlocWttcXRlbW9rdmFjaXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgwNjM4NTEsImV4cCI6MjAyMzYzOTg1MX0.SPb-xP8uhX94OTaAepQEX6o0c3gj-okkbEIdXT9Xxpw'
);

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [campusModalVisible, setCampusModalVisible] = useState(false); // State for modal visibility
  const [campuses, setCampuses] = useState([]); // State for storing campuses
  const [selectedCampus, setSelectedCampus] = useState(null); // State for selected campus
  const navigation = useNavigation(); // Get the navigation object

  useEffect(() => {
    getUserData();
    fetchCampuses(); // Fetch campuses when component mounts
  }, []);

  const getUserData = async () => {
    try {
      // Retrieve user ID from AsyncStorage
      const userIdString = await AsyncStorage.getItem('id');
      const userIdObject = JSON.parse(userIdString);
      console.log(userIdObject)
      const userId = userIdObject;

      // Query user table using the retrieved user ID
      const { data: userData, error } = await supabase
        .from('User')
        .select('name, email, surname')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error retrieving user data:', error.message);
      } else if (userData) {
        setUser(userData);
      } else {
        console.warn('User not found.');
      }
    } catch (error) {
      console.error('Error retrieving user data:', error);
    }
  };

  const fetchCampuses = async () => {
    try {
      const userIdString = await AsyncStorage.getItem('id');
      const userIdObject = JSON.parse(userIdString);
      const userId = userIdObject;

      // Query all campuses
      const { data: campusesData, error } = await supabase
        .from('Campus')
        .select('id, Campusname')
        .eq('Userid', userId)
        .order('Campusname', { ascending: true });

      if (error) {
        console.error('Error fetching campuses:', error.message);
      } else if (campusesData) {
        setCampuses(campusesData);
      }
    } catch (error) {
      console.error('Error fetching campuses:', error);
    }
  };

  const handleCampusSelection = async (campusId) => {
    try {
      // Store selected campus ID in AsyncStorage
      await AsyncStorage.setItem('campusId', JSON.stringify(campusId));
      // Close the modal
      setCampusModalVisible(false);
      // Navigate to edit screen
      navigation.navigate('edit');
    } catch (error) {
      console.error('Error selecting campus:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // Remove user ID from AsyncStorage
      await AsyncStorage.removeItem('id');
      // Navigate to login page
      navigation.navigate('login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <ImageBackground
      source={{
        uri:
          'https://ritgoa.ac.in/wp-content/uploads/2019/05/LRM.jpg',
      }}
      style={styles.backgroundImage}
      blurRadius={2}
    >
      <View style={styles.container}>
        <Text style={styles.title}>User Profile</Text>
        {user && (
          <View style={styles.profileContainer}>
            {user.name && (
              <Text style={styles.userName}>Name: {user.name}</Text>
            )}
            {user.email && (
              <Text style={styles.email}>Email: {user.email}</Text>
            )}
            {user.surname && (
              <Text style={styles.surname}>Surname: {user.surname}</Text>
            )}
          </View>
        )}
        <View style={styles.topButtonsContainer}>
          <Button
            title="Edit"
            onPress={() => setCampusModalVisible(true)}
            buttonStyle={{
              backgroundColor: '#f79e02',
              borderRadius: 25,
            }}
            containerStyle={{
              width: 150,
              marginEnd: 25,
            }}
          />
          <Button
            title="Logout"
            onPress={handleLogout}
            buttonStyle={{
              backgroundColor: '#cd0d32',
              borderRadius: 25,
            }}
            containerStyle={{
              width: 150,
            }}
            titleStyle={{
              fontSize: 18,
            }}
          />


        </View>
      </View>
      <Button
        title="Create"
        onPress={() => {
          navigation.navigate('Create')
        }}
        buttonStyle={{
          backgroundColor: '#f79e02',
          borderRadius: 20,
        }}
        containerStyle={{
          width: 200, // Add top margin to position it above the other buttons
          marginBottom: 150,
          // Add top margin
        }}
      />
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={campusModalVisible}
        onRequestClose={() => setCampusModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Campus</Text>
            <FlatList
              data={campuses}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleCampusSelection(item.id)}
                >
                  <Text style={styles.modalItemText}>
                    {item.Campusname}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 150,
    color: 'white',
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  userName: {
    fontSize: 18,
    marginBottom: 10,
    color: 'white',
  },
  email: {
    fontSize: 16,
    marginBottom: 10,
    color: 'white',
  },
  surname: {
    fontSize: 16,
    marginBottom: 10,
    color: 'white',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalItemText: {
    fontSize: 16,
  },
});
