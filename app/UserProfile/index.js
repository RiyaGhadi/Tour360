import React from 'react';
import { View, Text, StyleSheet, Button, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = ({ navigation }) => {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error retrieving user data:', error);
      }
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
      navigation.navigate('Login'); // Navigate back to the login screen
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Function to display profile picture
  const renderProfilePicture = () => {
    if (user && user.profilePicture) {
      return <Image source={{ uri: user.profilePicture }} style={styles.profilePicture} />;
    } else {
      return <Text>No profile picture available</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {user ? (
        <View style={styles.profileContainer}>
          {renderProfilePicture()}
          <Text>Name: {user.name}</Text>
          <Text>Surname: {user.surname}</Text>
          <Text>Email: {user.email}</Text>
          <Button title="Logout" onPress={handleLogout} />
        </View>
      ) : (
        <Text>Loading user data...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    marginBottom: 20,
  },
  profileContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
});

export default Profile;
