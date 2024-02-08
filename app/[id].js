import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Text, Card, Button, Icon } from '@rneui/themed';

import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from 'expo-router';
import React from 'react';
const colleges = [
  {
    id: "1",
    name: "RIT",
    image: "https://ritgoa.ac.in/wp-content/uploads/2019/05/LRM.jpg"
  },
  {
    id: "2",
    name: "GEC Goa",
    image: "https://qph.cf2.quoracdn.net/main-qimg-4a277c835bc243bc04a03633d1040e5d.webp"
  },
  {
    id: "3",
    name: "PCCE",
    image: "https://images.shiksha.com/mediadata/images/1491281944phpLzN266_g.jpg"
  },

];
export default function Page() {
  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams();

  const getCollegeById = (colleges, id) => {
    return colleges.find(college => college.id === id);
  };

  const college = getCollegeById(colleges, params.id);
 

  return (
    <View>
        <Stack.Screen options={{
            title: `${college.name}`
        }}/>
      <Text>Id page</Text>
      
      <Link href="/login">Login</Link>
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

function LogoTitle() {
  return (
    <Image
      style={{ width: 50, height: 50 }}
      source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
    />
  );
}
