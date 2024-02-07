import { Text, View } from 'react-native';

import { Link, Stack } from 'expo-router';

export default function Page() {
  return (
    <View>
        <Text>Home page</Text>
        <Link href="/login">Login</Link>
    </View>
  );
}
