import { StatusBar } from 'expo-status-bar'
import { Modal, Pressable, StyleSheet, View, TextInput, Button, FlatList, Text, TouchableOpacity, Alert } from 'react-native'
import '@walletconnect/react-native-compat'
import { WagmiConfig, useAccount, useContractRead, useContractWrite, usePrepareContractWrite,} from 'wagmi'
import { sepolia} from 'viem/chains'
import { createWeb3Modal, defaultWagmiConfig, Web3Modal, W3mButton} from '@web3modal/wagmi-react-native'
import {PROJECT_ID, EMPLOYEE_CONTRACT_ADDRESS} from "@env"
import React, { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import CryptoJS from "rn-crypto-js";
import * as Clipboard from 'expo-clipboard'

import employee from "./src/abis/employee.json";
import { G } from 'react-native-svg'

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = PROJECT_ID
console.log('projectId', PROJECT_ID)
const WalletAddress = ''

// 2. Create config
const metadata = {
  name: 'Web3Modal RN',
  description: 'Web3Modal RN Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: {
    native: 'YOUR_APP_SCHEME://',
    universal: 'YOUR_APP_UNIVERSAL_LINK.com'
  }
}

const chains = [sepolia]

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// 3. Create modal
createWeb3Modal({
  projectId,
  chains,
  wagmiConfig
})

function GetAccount({ onAddressUpdate }) {
  const { address, isConnecting, isDisconnected } = useAccount();

  useEffect(() => {
    if (address) {
      onAddressUpdate(address);
    }
  }, [address, onAddressUpdate]);  

  return (
    <View>
      {isConnecting ? <Text>Connecting</Text> : isDisconnected ? <Text>Disconnected</Text> : <Text>{address}</Text>}  
    </View>
  )
}

function RetrieveData({ account }) {
  const { data, error, loading } = useContractRead({
    address: EMPLOYEE_CONTRACT_ADDRESS,
    abi: employee,
    functionName: 'retrieveData',
    account : account,
  });

  console.log('data', data)
  return (
    <View>{loading ? <Text>Loading</Text> : error ? <Text>Error: {error.message}</Text> : <Text>RetrieveData: {data}</Text>}</View>
  )
}

function UploadData(){}

export default function App() {
  const [website, setWebsite] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [credentials, setCredentials] = useState([]);
  const [masterPassword, setMasterPassword] = useState('');
  const [isMasterPasswordSet, setIsMasterPasswordSet] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [passwordVisibility, setPasswordVisibility] = useState({});
  const [accountAddress, setAccountAddress] = useState('');
  const [contractAddress, setContractAddress] = useState('');

  // Pop up Prompt window to enter master password
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [tempMasterPassword, setTempMasterPassword] = useState('');
  const [decryptedPasswordToShow, setDecryptedPasswordToShow] = useState('');
  
  const [error, setError] = useState('');

  // initialize, load credentials and master password
  useEffect(() => {
    loadCredentials();
    loadMasterPassword();
  }, []);

  // save credentials when credentials change
  useEffect(() => {
    saveCredentials();
  }, [credentials]);

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Password copied to clipboard. It will be cleared in 30 seconds.");
    setTimeout(() => {
      Clipboard.setStringAsync(''); // Clear clipboard after 30 seconds
    }, 30000); // 30 seconds
  };

  const togglePasswordVisibility = (id) => {
    setPasswordVisibility(prevState => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const encryptData = () => {
    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
    const key = CryptoJS.PBKDF2(masterPassword, salt, { 
      keySize: 256 / 32,
      iterations: 1000
    }).toString();
    // console.log('enc-key', key);
    const encryptedPassword = CryptoJS.AES.encrypt(password, key).toString();
    return { encryptedPassword, salt };
  };

  // Decrypt the selected credential and show the password, if failed, show error message.
  const decryptAndShowPassword = async () => {
    // Assuming you have a selected credential to decrypt
    const selectedCredential = credentials.find(cred => cred.id === selectedId);
    if (selectedCredential) {
      try {
        const decryptedPassword = decryptData(selectedCredential.encryptedPassword, selectedCredential.salt, tempMasterPassword);
        setDecryptedPasswordToShow(decryptedPassword);
        setIsPromptVisible(false); // Close the modal
        setError('');
      } catch (error) {
        setError("Failed to decrypt the password. Please check the master password.");
      }
        // Clear the temporary master password after use
      setTempMasterPassword('');
    }
  };

  const decryptData = (encryptedPassword, salt, masterPassword) => {
    // const fakeMasterPassword = 'bbbb';
    const key = CryptoJS.PBKDF2(masterPassword, salt, {
      keySize: 256 / 32,
      iterations: 1000
    }).toString();
    const decryptedDataBytes = CryptoJS.AES.decrypt(encryptedPassword, key);
    const decryptedPassword = decryptedDataBytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedPassword) {
      throw new Error("Decryption failed");
    }
    return decryptedPassword;
  };

  const saveCredentials = async () => {
    await SecureStore.setItemAsync('credentials', JSON.stringify(credentials));
    // console.log('save: credentials', credentials);
    // console.log('save: json.stringify(credentials)', JSON.stringify(credentials));
  };

  const loadCredentials = async () => {
    const result = await SecureStore.getItemAsync('credentials');
    if (result) {
      setCredentials(JSON.parse(result));
    }
    // console.log('load: result', result);
    // console.log('load: json.parse(result)', JSON.parse(result));
  };

  // Alert.alert don't work in andorid emulator. need to modify alert method.
  const saveMasterPassword = async () => {
    if (masterPassword.trim() === '') {
      Alert.alert('Error', 'Master password cannot be empty.');
      return;
    }
    try {
      await SecureStore.setItemAsync('masterPassword', masterPassword);
      // console.log('save: masterPassword', masterPassword);
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
    const { encryptedPassword, salt } = encryptData();
    const newCredential = { website, username, password, encryptedPassword, salt, id: credentials.length.toString() };
    const newCredentials = [...credentials, newCredential];
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
    setTempMasterPassword('');
    setDecryptedPasswordToShow('');
    setPasswordVisibility({});
    
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        if (selectedId !== item.id) {
          setDecryptedPasswordToShow(''); // Reset decrypted password display
          setError(''); // Reset error message  
        }
        setSelectedId(selectedId === item.id ? null : item.id);
      }}
    >
      <Text style={styles.itemTextStyle}>Website: {item.website}</Text>
      {selectedId === item.id && (
        <>
          <Text style={styles.itemTextStyle}>Username: {item.username}</Text>
          {/* <Text style={styles.itemTextStyle}>Password: {item.password}</Text> */}
          {/* <Text style={styles.itemTextStyle}>Password: {passwordVisibility[item.id] ? item.password : '••••••••'}</Text> */}
          {/* <Text style={styles.itemTextStyle}>Password: {passwordVisibility[item.id] ? decryptData(item.encryptedPassword, item.salt) : '••••••••'}</Text> */}
          <Text style={styles.itemTextStyle}>Password: {decryptedPasswordToShow  ? decryptedPasswordToShow : '••••••••'}</Text>
          <TouchableOpacity onPress={() => { setSelectedId(item.id); setIsPromptVisible(true); }} style={styles.appButtonContainer}>
            <Text style={styles.appButtonText}>Show Password</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={() => togglePasswordVisibility(item.id)} style={styles.appButtonContainer}>
            <Text style={styles.appButtonText}>{passwordVisibility[item.id] ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity> */}
          <TouchableOpacity onPress={() => copyToClipboard(decryptedPasswordToShow  ? decryptedPasswordToShow : '••••••••')} style={styles.appButtonContainer}>
            <Text style={styles.appButtonText}>Copy</Text>
          </TouchableOpacity>
          <Text style={styles.itemTextStyle}>Encrypted Password: {item.encryptedPassword}</Text>
          <Text style={styles.itemTextStyle}>Salt: {item.salt}</Text>
          <Text style={styles.itemTextStyle}>id: {item.id}</Text>
          <TouchableOpacity onPress={() => deleteCredential(item.id)}>
            <Text style={[styles.deleteButton, styles.itemTextStyle]}>Delete</Text>
          </TouchableOpacity>
        </>
      )}
    </TouchableOpacity>
  );

  const handleAddressUpdate = (newAddress) => {
    setAccountAddress(newAddress);
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
      <WagmiConfig config={wagmiConfig}>
        <View style={[styles.container, styles.marginVertical]}>
          <W3mButton balance='show'/>
          <StatusBar style="auto" />
          <GetAccount onAddressUpdate={handleAddressUpdate} />
          <RetrieveData account={accountAddress}/>
        </View>
      <Web3Modal />
      </WagmiConfig>
      <Text>{"\n"}</Text>
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
      <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isPromptVisible}
        onRequestClose={() => {
          setIsPromptVisible(!isPromptVisible);
          setTempMasterPassword('');
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null} 
            <TextInput
              secureTextEntry
              style={styles.modalText}
              placeholder="Enter Master Password"
              onChangeText={text => setTempMasterPassword(text)}
              value={tempMasterPassword}
            />
            <Button
              title="Decrypt"
              onPress={() => {
                // setIsPromptVisible(!isPromptVisible);
                decryptAndShowPassword(); // Call the decrypt function here
              }}
            />
          </View>
        </View>
      </Modal>
      </View>
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
  appButtonContainer: {
    elevation: 8,
    backgroundColor: "#009688",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  appButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase"
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  marginVertical: {
    marginVertical: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});
