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


import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, FlatList, Text, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function App() {
  const [website, setWebsite] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [credentials, setCredentials] = useState([]);

  const saveCredentials = async () => {
    await SecureStore.setItemAsync('credentials', JSON.stringify(credentials));
  };
  const loadCredentials = async () => {
    const result = await SecureStore.getItemAsync('credentials');
    if (result) {
      setCredentials(JSON.parse(result));
    }
  };

  useEffect(() => {
    loadCredentials();
  }, []);

  useEffect(() => {
    saveCredentials();
  }, [credentials]);

  const addCredential = () => {
    const newCredentials = [...credentials, { website, username, password, id: credentials.length.toString() }];
    setCredentials(newCredentials);
    // saveCredentials();
    // Clear inputs after adding
    setWebsite('');
    setUsername('');
    setPassword('');
  };

  const deleteCredential = async (id) => {
    const newCredentials = credentials.filter(cred => cred.id !== id);
    setCredentials(newCredentials);
    // saveCredentials();
    //update the id values of the remaining credentials
    const updatedCredentials = newCredentials.map((cred, index) => ({ ...cred, id: index.toString() }));
    setCredentials(updatedCredentials);
  };

  const _clearData = async () => {
    await SecureStore.deleteItemAsync('credentials');
    setCredentials([]);
  };

  // const deleteCredential = async (id) => {
  //   const newCredentials = credentials.filter(cred => cred.id !== id);
  //   setCredentials(newCredentials);
  //   // Update the id values of the remaining credentials
  //   const updatedCredentials = newCredentials.map((cred, index) => ({ ...cred, id: index.toString() }));
  //   setCredentials(updatedCredentials);

  // const updateCredential = async (id, newCredential) => {
  //   const newCredentials = credentials.map(cred => cred.id === id ? newCredential : cred);
  //   setCredentials(newCredentials);
  //   // saveCredentials();
  // };

  // const editCredential = async (id) => {
  //   const updatedCredential = { website: 'updated', username: 'updated', password: 'updated', id: id };
  //   updateCredential(id, updatedCredential);
  // };
     


  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Website URL" value={website} onChangeText={setWebsite} />
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Add Credential" onPress={addCredential} />
      <Button title="Clear Data" onPress={_clearData} />
      <FlatList
        data={credentials}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>Website: {item.website}</Text>
            <Text>Username: {item.username}</Text>
            <Text>Password: {item.password}</Text>
            <Text>id: {item.id}</Text>
            {/* <Button title="Delete" onPress={() => deleteCredential(item.id)}/> */}
            <TouchableOpacity onPress={() => deleteCredential(item.id)}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
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
  deleteButton: {
    color: 'red',
    marginTop: 10,
  },
});
