import { Link, Stack, useNavigation } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Alert, Platform, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, Card, Icon, Text } from '@rneui/themed';
import { createClient } from '@supabase/supabase-js';
// Initialize Supabase client
const supabase = createClient('https://yinihqkmqtemokvacipf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpbmlocWttcXRlbW9rdmFjaXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgwNjM4NTEsImV4cCI6MjAyMzYzOTg1MX0.SPb-xP8uhX94OTaAepQEX6o0c3gj-okkbEIdXT9Xxpw');


export default function Page() {
  const navigation = useNavigation();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    fetchData();
    checkUserId();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.from('Campus').select('*');
      if (error) {
        throw error;
      }
      setColleges(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function checkUserId() {
    try {
      const storedUserId = await AsyncStorage.getItem('id');
      if (storedUserId) {
        setUserId(JSON.parse(storedUserId));
      }
    } catch (error) {
      console.error('Error retrieving user ID:', error);
    }
  }

  const handleCreateButtonPress = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('id');
      if (storedUserId) {
        setUserId(JSON.parse(storedUserId));
        navigation.push('Create');
      } else {
        Alert.alert('Login Required', 'Please log in to create.', [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error retrieving user ID:', error);
    }
  };

  const handleProfileIconPress = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('id');
      if (storedUserId) {
        setUserId(JSON.parse(storedUserId));
        navigation.navigate('UserProfile');
      } else {
        navigation.navigate('login');
      }
    } catch (error) {
      console.error('Error retrieving user ID:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>VirtualTour</Text>
        <Button
          title={<Icon name='person' />}
          onPress={handleProfileIconPress}
          buttonStyle={{
            backgroundColor: '#10101010',
            borderRadius: 100,
            backgroundColor: 'white',
          }}
          containerStyle={{
            width: "auto",
            padding: 5,
          }}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.homeTitle}>Home</Text>

        {loading ? (
          <Text>Loading...</Text>
        ) : error ? (
          <Text>Error: {error}</Text>
        ) : (
          <ScrollView>
            <View>
              {colleges.map((college) => (
                <Card containerStyle={{ backgroundColor: 'white' }} key={college.id}>
                  <Card.Title>{college.Campusname}</Card.Title>
                  <Card.Divider />
                  <Card.Image
                    style={{ padding: 0 }}
                    source={{ uri: college.Image }}
                  />
                  <Text style={{ marginBottom: 10 }}>
                    <Link href={`/${college.id}`}>Visit {college.Campusname}</Link>
                  </Text>
                </Card>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Create button */}
        <Button
          title="Create"
          onPress={handleCreateButtonPress}
          buttonStyle={{
            backgroundColor: 'blue',
            borderRadius: 100,
            marginHorizontal: 20,
            marginBottom: 20,
          }}
          containerStyle={{
            width: "auto",
            padding: 5,
          }}
          titleStyle={{
            fontSize: 18,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fce181', // Background color for header
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fce181', // Background color for header
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#7d7d7d',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#9fedd7', // Background color for content
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  homeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});