import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Text, Card, Button, Icon } from '@rneui/themed';

import { Link, Stack, router } from 'expo-router';
const colleges = [
  {
    id: "1",
    name: "RIT",
    image: "https://ritgoa.ac.in/wp-content/uploads/2019/05/LRM.jpg"
  },
  {
    id: "2",
    name: "GEC",
    image: "https://qph.cf2.quoracdn.net/main-qimg-4a277c835bc243bc04a03633d1040e5d.webp"
  },
  {
    id: "3",
    name: "PCCE",
    image: "https://images.shiksha.com/mediadata/images/1491281944phpLzN266_g.jpg"
  },

];
export default function Page() {

  return (
    <View>
      <Stack.Screen
        options={{
          headerTitle: "Tour 360",
          headerStyle: "",
          headerRight: () => (
            <Button
              title={<Icon
                name='person' />}
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

      <ScrollView>
        <View>
          {colleges.map((person) => {
            return (
              <Card key={person.id}>

                <Card.Title>{person.name}</Card.Title>
                <Card.Divider />
                <Card.Image
                  style={{ padding: 0 }}
                  source={{
                    uri:
                      person.image,
                  }}
                />
                <Text style={{ marginBottom: 10 }}>
                  <Link href={`/${person.id}`}>Visit {person.name}</Link>
                </Text>

              </Card>
            );
          })}
        </View>
      </ScrollView>
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
    <>
    </>
  );
}