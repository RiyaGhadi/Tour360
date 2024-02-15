import React, { useState, useEffect } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Text, Card, Button, Icon } from '@rneui/themed';
import { Link, Stack, router } from 'expo-router';

export default function Page() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track user login status

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('https://tour360-ruddy.vercel.app/api/campus');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setColleges(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: "Tour 360",
          headerStyle: "",
          headerRight: () => (
            <Button
              title={<Icon name='person' />}
              onPress={() => {
                router.push(`/login`)
              }}
              buttonStyle={{
                backgroundColor: '#10101010',
                borderRadius: 100,
              }}
              containerStyle={{
                width: "auto",
                padding: 5,
              }}
            />
          ),
        }}
      />
      <Text>Home page</Text>

      {loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text>Error: {error}</Text>
      ) : (
        <ScrollView>
          <View>
            {colleges.map((college) => (
              <Card key={college.id}>
                <Card.Title>{college.name}</Card.Title>
                <Card.Divider />
                <Card.Image
                  style={{ padding: 0 }}
                  source={{ uri: college.image }}
                />
                <Text style={{ marginBottom: 10 }}>
                  <Link href={`/${college.id}`}>Visit {college.name}</Link>
                </Text>
              </Card>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Footer Button */}

      <Button
        title="Create"
        onPress={() => {
          router.push(`/Create`)
        }}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fonts: {
    marginBottom: 8,
  },
  user: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  image: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    marginTop: 5,
  },
});

