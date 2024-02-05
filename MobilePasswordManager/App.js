// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import CredentialsScreen from './CredentialsScreen';

// const Stack = createStackNavigator();

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator>
//         <Stack.Screen name="Credentials" component={CredentialsScreen} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }


import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Button, FlatList, Text } from 'react-native';

export default function App() {
  const [website, setWebsite] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [credentials, setCredentials] = useState([]);

  const addCredential = () => {
    setCredentials([...credentials, { website, username, password, id: credentials.length.toString() }]);
    // Clear inputs after adding
    setWebsite('');
    setUsername('');
    setPassword('');
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Website URL" value={website} onChangeText={setWebsite} />
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Add Credential" onPress={addCredential} />
      <FlatList
        data={credentials}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>Website: {item.website}</Text>
            <Text>Username: {item.username}</Text>
            <Text>Password: {item.password}</Text>
          </View>
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  input: {
    height: 40,
    marginBottom: 20,
    borderWidth: 1,
    padding: 10,
  },
  item: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 10,
    marginVertical: 8,
    backgroundColor: '#f9c2ff',
  },
});
