import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, FlatList, Text, TouchableOpacity, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'react-native-crypto-js';


export default function App() {
  const [website, setWebsite] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [credentials, setCredentials] = useState([]);
  const [masterPassword, setMasterPassword] = useState('');
  const [isMasterPasswordSet, setIsMasterPasswordSet] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // initialize, load credentials and master password
  useEffect(() => {
    loadCredentials();
    loadMasterPassword();
  }, []);

  // save credentials when credentials change
  useEffect(() => {
    saveCredentials();
  }, [credentials]);

  const encryptData = (password) => {
    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
    const key = CryptoJS.PBKDF2(masterPassword, salt, {
      keySize: 256 / 32,
      iterations: 1000
    });
    const encryptedPassword = CryptoJS.AES.encrypt(password, key).toString();
    return { encryptedPassword, salt };
  };

  const decryptData = (encryptedPassword, salt) => {
    const key = CryptoJS.PBKDF2(masterPassword, salt, {
      keySize: 256 / 32,
      iterations: 1000
    });
    const decryptedDataBytes = CryptoJS.AES.decrypt(encryptedPassword, key);
    const decryptedPassword = decryptedDataBytes.toString(CryptoJS.enc.Utf8);
    return decryptedPassword;
  };

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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => setSelectedId(selectedId === item.id ? null : item.id)} // Toggle selection
    >
      <Text style={styles.itemTextStyle}>Website: {item.website}</Text>
      {selectedId === item.id && (
        <>
          <Text style={styles.itemTextStyle}>Username: {item.username}</Text>
          <Text style={styles.itemTextStyle}>Password: {item.password}</Text>
          <Text style={styles.itemTextStyle}>id: {item.id}</Text>
          <TouchableOpacity onPress={() => deleteCredential(item.id)}>
            <Text style={[styles.deleteButton, styles.itemTextStyle]}>Delete</Text>
          </TouchableOpacity>
        </>
      )}
    </TouchableOpacity>
  );

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
      <FlatList // FlatList是一個高效的滾動列表元件，用於顯示一個滾動的數據列表
      data={credentials} // 設定這個列表顯示的數據源，credentials是一個包含多個項目的數組
      renderItem={renderItem} // 指定如何渲染每一項數據，這裡傳入了上面定義的renderItem函數
      keyExtractor={item => item.id} // 指定每一項數據的唯一鍵值，這裡使用每個項目的id作為唯一鍵
      extraData={selectedId} // 當selectedId變化時，會觸發列表重新渲染，確保選中狀態的更新能夠正確顯示
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
