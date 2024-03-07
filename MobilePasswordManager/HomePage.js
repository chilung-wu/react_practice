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
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

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
  console.log('address ', address)
  useEffect(() => {
    if (isDisconnected) {
      onAddressUpdate('');
    } else if (address) {
      onAddressUpdate(address);
    }
  }, [address, isDisconnected, onAddressUpdate]);  

 //  finished : receive data not remove after logout,  
 // Todo : set receive data as credential in usestate( ovewrite it?)

  return (
    <View>
      {isConnecting ? <Text>Connecting</Text> : isDisconnected ? <Text>Disconnected</Text> : <Text>{address}</Text>}  
    </View>
  )
}

function RetrieveData({ account, setCredentials }) {
  const [triggerFetch, setTriggerFetch] = useState(false);
  const { data, error, isLoading } = useContractRead({
    address: EMPLOYEE_CONTRACT_ADDRESS,
    abi: employee,
    functionName: 'retrieveData',
    account: account,
    enabled: triggerFetch, // This tells the hook to fetch data when triggerFetch is true
  });
  console.log('RetrieveData: ', data)

  // Backup, sync to local storage
  // Effect to parse and set credentials after data is fetched
  useEffect(() => {
    if (data && !error) {
      // Assuming the data is returned as a JSON string
      try {
        const credentials = JSON.parse(data);
        setCredentials(credentials);
        setTriggerFetch(false); // Reset trigger to avoid refetching
      } catch (parseError) {
        console.error("Failed to parse credentials:", parseError);
      }
    }
  }, [data, error, setCredentials]);

  const handleRetrieveData = () => {
    setTriggerFetch(true);
  };

  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[styles.button, styles.uploadButton]}
        onPress={handleRetrieveData}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>Restore</Text>
      </TouchableOpacity>
      </View>
  );
}

function UploadData({ account, credentials }){
  const  { config , error: prepareError} = usePrepareContractWrite({
    address: EMPLOYEE_CONTRACT_ADDRESS,
    abi: employee,
    functionName: 'uploadData',
    account: account,
    args: [JSON.stringify(credentials)],
  });
  const { data, isLoading, isSuccess, write, error: writeError} = useContractWrite(config);
  console.log('Transaction hash: ', data)

  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[styles.button, styles.uploadButton]}
        onPress={() => write?.()}
        disabled={!write}
      >
        <Text style={styles.buttonText}>Upload Credentials</Text>
      </TouchableOpacity>
      {isLoading && <Text>Uploading...</Text>}
      {isSuccess && <Text>Upload Successful: {"\n"}Transaction:{JSON.stringify(data.hash)}</Text>}
      {prepareError && <Text>Error Preparing: {prepareError.message}</Text>}
      {writeError && <Text>Error Writing: {writeError.message}</Text>}
    </View>
  );
}

// Demo: send message to server
const sendMessageToServer = async () => {
  try { 
    const response = await axios.post('https://10.0.2.2/hello', {
      message: "hello"
    });
    alert(response.data.message);
  } catch (error) {
    // console.error(error);
    console.error(error.request?._response);
  }
};

// export default function App() {
const HomePage = ({ navigation }) => {
  const [website, setWebsite] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inputMasterPassword, setInputMasterPassword] = useState('');
  const [credentials, setCredentials] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [accountAddress, setAccountAddress] = useState('');
  const [contractAddress, setContractAddress] = useState('');

  // Pop up Prompt window to enter master password
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [isDecryptAllVisible, setIsDecryptAllVisible] = useState(false);
  const [tempMasterPassword, setTempMasterPassword] = useState('');
  const [decryptedPasswordToShow, setDecryptedPasswordToShow] = useState('');
  const [decryptedAllCredentials, setDecryptedAllCredentials] = useState([]);
  const [error, setError] = useState('');

  // initialize, load credentials and master password
  useEffect(() => {
    loadCredentials();
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


  const encryptData = () => {
    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
    const key = CryptoJS.PBKDF2(inputMasterPassword, salt, { 
      keySize: 256 / 32,
      iterations: 1000
    }).toString();
    // console.log('enc-key', key);
    const encryptedPassword = CryptoJS.AES.encrypt(password, key).toString();
    return { encryptedPassword, salt };
  };

  const decryptAll = async () => {
    // 檢查主密碼是否已設置
    if (!tempMasterPassword) {
      setError("請先輸入主密碼。");
      return;
    }
  
    try {
      // 創建一個新數組來存儲解密後的憑證
      const decryptedCredentials = await Promise.all(credentials.map(async (cred) => {
        // 對每個憑證進行解密
        console.log('cred', cred);
        const decryptedPassword = await decryptData(cred.encryptedPassword, cred.salt, tempMasterPassword);
        console.log('decryptedPassword', decryptedPassword);
        // 返回一個包含網站、用戶名和解密後密碼的新對象
        const decryptedCredential = {
          website: cred.website,
          username: cred.username,
          decryptedPassword: decryptedPassword, // 使用解密後的密碼
          id: cred.id
        };
        console.log(decryptedCredential);
        return decryptedCredential;
      }));
  
      // 將解密後的憑證數組設置到狀態中
      // setDecryptedAllCredentials(decryptedCredentials);
      console.log('decryptedAllCredentials', decryptedAllCredentials);
      setError('');
      return decryptedCredentials;
    } catch (error) {
      // 處理解密過程中可能發生的任何錯誤
      setError("解密過程中發生錯誤。請檢查主密碼。");
      console.error("Decrypt All Error:", error);
    }
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
    setInputMasterPassword('');
    // setTempMasterPassword('');
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
    setCredentials([]);
    setWebsite('');
    setUsername('');
    setPassword('');
    setCredentials([]);
    setInputMasterPassword('');
    setTempMasterPassword('');
    setDecryptedPasswordToShow('');
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
      <Text style={styles.itemTextStyle}>Username: {item.username}</Text>
      {selectedId === item.id && (
        <>
          <Text style={styles.itemTextStyle}>Password: {decryptedPasswordToShow  ? decryptedPasswordToShow : '••••••••'}</Text>
          <TouchableOpacity onPress={() => { setSelectedId(item.id); setIsPromptVisible(true); }} style={styles.appButtonContainer}>
            <Text style={styles.appButtonText}>Show Password</Text>
          </TouchableOpacity>

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

  const handleNavigateToOrders = () => {
    setIsDecryptAllVisible(true);
  };

  const handleDecryptAndNavigate = async () => {
    const decryptedCredentials = await decryptAll();
    navigation.navigate('Orders', {DecryptedCredentials: decryptedCredentials});
    setIsDecryptAllVisible(false);
    setTempMasterPassword('');

  };

  const ListHeader = (
    <View>
      <Button title="Send Message" onPress={sendMessageToServer} />
      <Button title="Fetch Orders" onPress={handleNavigateToOrders} />
      <WagmiConfig config={wagmiConfig}>
        <View style={styles.marginVertical}>
          <W3mButton balance='show'/>
          <GetAccount onAddressUpdate={handleAddressUpdate} />
          {accountAddress && <RetrieveData account={accountAddress} setCredentials={setCredentials}/>}
          <UploadData account={accountAddress} credentials={credentials} />
        </View>
      <Web3Modal />
      </WagmiConfig>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={website}
          style={styles.picker}
          onValueChange={(itemValue, itemIndex) =>
            setWebsite(itemValue)
          }>
          <Picker.Item label="請選擇網站" value="" />
          <Picker.Item label="PChome" value="PChome" />
          <Picker.Item label="樂天市場" value="樂天市場" />
          <Picker.Item label="東森購物" value="東森購物" />
          <Picker.Item label="Momo" value="Momo" />
        </Picker>
      </View>
      {/* <TextInput style={[styles.input, styles.itemTextStyle]} placeholder="Website URL" value={website} onChangeText={setWebsite} /> */}
      <TextInput key="usernameInput" style={[styles.input, styles.itemTextStyle]} placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput key="passwordInput" style={[styles.input, styles.itemTextStyle]} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput key="masterpasswordInput" style={[styles.input, styles.itemTextStyle]} placeholder="Master Password" value={inputMasterPassword} onChangeText={setInputMasterPassword} secureTextEntry />
      <Button title="Add Credential" onPress={addCredential} />
      <Text>{"\n"}</Text>
      <Button title="Clear Data" onPress={_clearData}/>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList // FlatList是一個高效的滾動列表元件，用於顯示一個滾動的數據列表
      data={credentials} // 設定這個列表顯示的數據源，credentials是一個包含多個項目的數組
      ListHeaderComponent={ListHeader} // 設定列表頭部元件，這裡使用了一個自定義的ListHeader組件
      // ListHeader  ****直接將React元素傳遞給ListHeaderComponent屬性，而不是透過一個函數傳回***
      // ref https://github.com/facebook/react-native/issues/13365
      // https://github.com/callstack/react-native-paper/issues/736
      renderItem={renderItem} // 指定如何渲染每一項數據，這裡傳入了上面定義的renderItem函數
      keyExtractor={item => item.id} // 指定每一項數據的唯一鍵值，這裡使用每個項目的id作為唯一鍵
      extraData={selectedId} // 當selectedId變化時，會觸發列表重新渲染，確保選中狀態的更新能夠正確顯示
      />
      <Modal
      animationType="slide"
      transparent={true}
      visible={isDecryptAllVisible}
      onRequestClose={() => {
        setIsDecryptAllVisible(!isDecryptAllVisible);
        setTempMasterPassword('');
        setError('');
      }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}> 
            <TextInput
              secureTextEntry
              style={styles.modalText}
              placeholder="Enter Master Password"
              onChangeText={text => setTempMasterPassword(text)}
              value={tempMasterPassword}
            />
            <Button
              title="Decrypt All"
              onPress={handleDecryptAndNavigate} 
            />
          </View>
        </View>
      </Modal>
      <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isPromptVisible}
        onRequestClose={() => {
          setIsPromptVisible(!isPromptVisible);
          setTempMasterPassword('');
          setError('');
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

export default HomePage;

const styles = StyleSheet.create({
  container: { // 容器樣式
    flex: 1, // 彈性比例為 1，使其填滿父元件的空間
    paddingTop: 50, // 上邊距 50
    paddingHorizontal: 20, // 左右邊距 20
  },
  input: { // 輸入框樣式
    height: 40, // 高度 40
    marginBottom: 20, // 下邊距 20
    borderWidth: 1, // 邊框寬度 1
    padding: 10, // 內填充 10
  },
  item: { // 項目樣式
    flexDirection: 'column', // 排列方向為垂直（列）
    justifyContent: 'space-between', // 子元素間距平均分布
    padding: 10, // 內填充 10
    marginVertical: 8, // 垂直外邊距 8
    backgroundColor: '#f9c2ff', // 背景色為淺紫色
  },
  deleteButton: { // 刪除按鈕樣式
    color: 'red', // 文字顏色紅色
    marginTop: 10, // 上邊距 10
  },
  text: { // 文本樣式
    fontSize: 30, // 字體大小 30
  },
  itemTextStyle: { // 項目文本樣式
    fontSize: 20, // 字體大小 20
    fontWeight: 'bold', // 字重粗體
  },
  appButtonContainer: { // 應用按鈕容器樣式
    elevation: 8, // 陰影高度 8
    backgroundColor: "#009688", // 背景色為深綠色
    borderRadius: 10, // 邊框圓角 10
    paddingVertical: 10, // 垂直內填充 10
    paddingHorizontal: 12, // 水平內填充 12
    marginTop: 10, // 上邊距 10
  },
  appButtonText: { // 應用按鈕文本樣式
    fontSize: 18, // 字體大小 18
    color: "#fff", // 文字顏色白色
    fontWeight: "bold", // 字重粗體
    alignSelf: "center", // 自我對齊至中心
    textTransform: "uppercase" // 文字轉換為大寫
  },
  centeredView: { // 居中視圖樣式
    // flex: 1, // 彈性比例為 1
    justifyContent: 'center', // 內容居中對齊
    alignItems: 'center', // 項目居中對齊
    marginTop: 22, // 上邊距 22
  },
  modalView: { // 模態視窗樣式
    margin: 20, // 外邊距 20
    backgroundColor: 'white', // 背景色白色
    borderRadius: 20, // 邊框圓角 20
    padding: 35, // 內填充 35
    alignItems: 'center', // 項目居中對齊
    shadowColor: '#000', // 陰影顏色黑色
    shadowOffset: { // 陰影偏移
      width: 0, // 寬度 0
      height: 2, // 高度 2
    },
    shadowOpacity: 0.25, // 陰影透明度
    shadowRadius: 4, // 陰影半徑
    elevation: 5, // 陰影高度 5
  },
  buttonContainer: { // 按鈕容器樣式
    marginVertical: 5, // 垂直外邊距 5
    // zIndex: 1 // 層疊順序 1
  },
  uploadButton: { // 上傳按鈕樣式
    backgroundColor: '#2196F3', // 背景色藍色
    minWidth: 100, // 設定最小寬度
    maxWidth: 200, // 設定最大寬度
    alignSelf: 'center', // 自我對齊至中心
    padding: 5, // 內填充 5
    borderRadius: 5, // 邊框圓角 5
  },
  button: { // 按鈕樣式
    elevation: 2, // 陰影高度 2
  },
  buttonText: { // 按鈕文本樣式
    fontSize: 15, // 字體大小 15
    fontWeight: 'bold', // 字重粗體
    textAlign: 'center', // 文本居中對齊
    color: 'white', // 文本顏色白色
  },
  buttonOpen: { // 打開按鈕樣式
    backgroundColor: '#F194FF', // 背景色淺紫色
  },
  buttonClose: { // 關閉按鈕樣式
    backgroundColor: '#2196F3', // 背景色藍色
  },
  textStyle: { // 文本樣式
    color: 'white', // 文字顏色白色
    fontWeight: 'bold', // 字重粗體
    textAlign: 'center', // 文本居中對齊
  },
  modalText: { // 模態文本樣式
    marginBottom: 15, // 下邊距 15
    textAlign: 'center', // 文本居中對齊
  },
  errorText: { // 錯誤文本樣式
    color: 'red', // 文字顏色紅色
    marginBottom: 10, // 下邊距 10
  },
  marginVertical: { // 垂直邊距樣式
    marginVertical: 10, // 垂直外邊距 10
    display: "flex", // 顯示方式為彈性盒子
    alignItems: "center", // 項目居中對齊
    justifyContent: "center", // 內容居中對齊
  },
  pickerContainer: { // 選擇器容器樣式
    borderWidth: 2, // 設置邊框寬度
    borderColor: 'black', // 設置邊框顏色
    borderRadius: 5, // 設置邊框圓角
    overflow: 'hidden', // 確保子組件不會超出邊框圓角
    marginBottom: 15, // 下邊距 20

  },
  picker: { // 選擇器樣式
    fontSize: 20, // 字體大小 20
    fontWeight: 'bold', // 字重粗體
  },
});

