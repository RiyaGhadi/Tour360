import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize Supabase client
const supabase = createClient('https://yinihqkmqtemokvacipf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpbmlocWttcXRlbW9rdmFjaXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgwNjM4NTEsImV4cCI6MjAyMzYzOTg1MX0.SPb-xP8uhX94OTaAepQEX6o0c3gj-okkbEIdXT9Xxpw');

export default function CollegeDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCollege() {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase.from('Campus').select('*').eq('id', id).single();
        if (error) {
          throw error;
        }
        setCollege(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCollege();
  }, [id]);

  useEffect(() => {
    if (college) {
      navigation.setOptions({ title: college.Campusname });
    }
  }, [college, navigation]);

  const handleViewGrid = async () => {
    try {
      await AsyncStorage.setItem('CampusId', id.toString());
      navigation.navigate('DisplayGridPage', { collegeId: id });
    } catch (error) {
      console.error('Error saving Campus id to AsyncStorage:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#9fedd7' }}>
      <View style={styles.container}>
        {loading ? (
          <Text>Loading...</Text>
        ) : error ? (
          <Text>Error: {error}</Text>
        ) : (
          <ScrollView>
            <View style={styles.collegeDetails}>
              <Text style={styles.collegeName}>{college.Campusname}</Text>
              <Image source={{ uri: college.Image }} style={styles.collegeImage} />
              <Text style={styles.description}>Name: {college.Campusname}</Text>
              <Text style={styles.description}>Contact: {college.Contact}</Text>
              <Text style={styles.description}>Address: {college.Address}</Text>
              <TouchableOpacity style={styles.viewButton} onPress={handleViewGrid}>
                <Text style={styles.viewButtonText}>Visit</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#9fedd7',
    marginTop: 100,
  },
  collegeDetails: {
    alignItems: 'center',
  },
  collegeName: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  collegeImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  viewButton: {
    backgroundColor: '#1c05b3',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  viewButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
