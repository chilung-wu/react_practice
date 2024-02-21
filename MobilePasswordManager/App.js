import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, FlatList, Text, TouchableOpacity, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function App() {
  const [website, setWebsite] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [credentials, setCredentials] = useState([]);
  const [masterPassword, setMasterPassword] = useState('');
  const [isMasterPasswordSet, setIsMasterPasswordSet] = useState(false);

  const saveCredentials = async () => {
    await SecureStore.setItemAsync('credentials', JSON.stringify(credentials));
    console.log('save: credentials', credentials);
    console.log('save: json.stringify(credentials)', JSON.stringify(credentials));
  };

  const loadCredentials = async () => {
    const result = await SecureStore.getItemAsync('credentials');
    if (result) {
      setCredentials(JSON.parse(result));
    }
    console.log('load: result', result);
    console.log('load: json.parse(result)', JSON.parse(result));
  };

  const saveMasterPassword = async () => {
    if (masterPassword.trim() === '') {
      Alert.alert('Error', 'Master password cannot be empty.');
      return;
    }
    try {
      await SecureStore.setItemAsync('masterPassword', masterPassword);
      console.log('save: masterPassword', masterPassword);
      setIsMasterPasswordSet(true);
      // Alert.alert('Success', 'Master password is set successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save the master password.');
    }
  };

  const loadMasterPassword = async () => {
    try {
      const savedMasterPassword = await SecureStore.getItemAsync('masterPassword');
      console.log('load: savedMasterPassword', savedMasterPassword);
      if (savedMasterPassword) {
        setMasterPassword(savedMasterPassword);
        setIsMasterPasswordSet(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load the master password.');
    }
  };

  // initialize, load credentials and master password
  useEffect(() => {
    loadCredentials();
    loadMasterPassword();
  }, []);

  // save credentials when credentials change
  useEffect(() => {
    saveCredentials();
  }, [credentials]);

  // save current credential to SecureStore
  // TODO: 如果id僅用於keyExtractor，可以考慮使用其他唯一標識符（如生成的UUID），這樣就不需要在每次刪除操作後更新它們。
  const addCredential = () => {
    const newCredentials = [...credentials, { website, username, password, id: credentials.length.toString() }];
    setCredentials(newCredentials);
    // Clear inputs after adding
    setWebsite('');
    setUsername('');
    setPassword('');
  };

  const deleteCredential = async (id) => {
    const newCredentials = credentials.filter(cred => cred.id !== id);
    setCredentials(newCredentials);
    //update the id values of the remaining credentials
    const updatedCredentials = newCredentials.map((cred, index) => ({ ...cred, id: index.toString() }));
    setCredentials(updatedCredentials);
  };

  // clear all data from SecureStore
  const _clearData = async () => {
    await SecureStore.deleteItemAsync('credentials');
    await SecureStore.deleteItemAsync('masterPassword');
    setCredentials([]);
    setWebsite('');
    setUsername('');
    setPassword('');
    setCredentials([]);
    setMasterPassword('');
    setIsMasterPasswordSet(false);
  };

  return (
    <View style={styles.container}>
      {!isMasterPasswordSet ? (
        <View>
          <TextInput
            style={[styles.input, styles.itemTextStyle]}
            value={masterPassword}
            onChangeText={setMasterPassword}
            placeholder="Set Master Password"
            secureTextEntry
          />
          <View style={{ marginBottom: 20 }}>
          <Button title="Save Master Password" onPress={saveMasterPassword} />
          </View>
        </View>
      ) : (
        <Text style={[styles.text]}>masterPassword is {masterPassword}</Text>
      )}
      <TextInput style={[styles.input, styles.itemTextStyle]} placeholder="Website URL" value={website} onChangeText={setWebsite} />
      <TextInput style={[styles.input, styles.itemTextStyle]} placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput style={[styles.input, styles.itemTextStyle]} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Add Credential" onPress={addCredential} />
      <Text>{"\n"}</Text>
      <Button title="Clear Data" onPress={_clearData}/>
      <FlatList
        data={credentials}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTextStyle}>Website: {item.website}</Text>
            <Text style={styles.itemTextStyle}>Username: {item.username}</Text>
            <Text style={styles.itemTextStyle}>Password: {item.password}</Text>
            <Text style={styles.itemTextStyle}>id: {item.id}</Text>
            {/* <Button title="Delete" onPress={() => deleteCredential(item.id)}/> */}
            <TouchableOpacity onPress={() => deleteCredential(item.id)}>
              <Text style={[styles.deleteButton, styles.itemTextStyle]}>Delete</Text>
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
  text: {
    fontSize: 30,
  },
  itemTextStyle : {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
