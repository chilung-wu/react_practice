import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [masterPassword, setMasterPassword] = useState('');
  const [isMasterPasswordSet, setIsMasterPasswordSet] = useState(false);
  const [dataToEncrypt, setDataToEncrypt] = useState('');
  const [encryptionResults, setEncryptionResults] = useState([]);
  const [selectedEncryption, setSelectedEncryption] = useState(null);
  const [decryptionPassword, setDecryptionPassword] = useState('');
  const [decryptedData, setDecryptedData] = useState('');

  useEffect(() => {
    // 檢查localStorage中是否已經存儲了主密碼
    const savedMasterPassword = localStorage.getItem('masterPassword');
    if (savedMasterPassword) {
      setMasterPassword(savedMasterPassword);
      setIsMasterPasswordSet(true); // 如果存在主密碼，設置isMasterPasswordSet為true
    }
    const savedEncryptionResults = localStorage.getItem('encryptionResults');
    if (savedEncryptionResults) {
      setEncryptionResults(JSON.parse(savedEncryptionResults));
    }
  }, []);

  const encryptData = () => {
    // 生成一個隨機的鹽值（salt），用於與密碼結合生成鍵。這裡使用 128 位（16 字節）的隨機數。
    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
    // 使用 PBKDF2 函數根據提供的密碼（masterPassword）、鹽值（salt）、鍵大小（keySize）和迭代次數（iterations）來生成密鑰。
    // keySize 設置為 512 位（64 字節），迭代次數設置為 1000。這個過程增加了密鑰生成的計算難度，提高了安全性。
    const key = CryptoJS.PBKDF2(masterPassword, salt, {
      keySize: 512 / 32,
      iterations: 1000
    }).toString();
    console.log('enc-key', key);

    const encryptedData = CryptoJS.AES.encrypt(dataToEncrypt, key).toString();
    const uuid = uuidv4();
    const newEncryptionResult = { uuid, salt, encryptedData, dataToEncrypt };
    const updatedEncryptionResults = [...encryptionResults, newEncryptionResult];
    setEncryptionResults(updatedEncryptionResults);
  
    // 存儲加密結果到localStorage
    localStorage.setItem('encryptionResults', JSON.stringify(updatedEncryptionResults));
    console.log('encryptionResults', updatedEncryptionResults);
  };

  const decryptData = (encryptedData, salt) => {
    const key = CryptoJS.PBKDF2(decryptionPassword, salt, {
      keySize: 512 / 32,
      iterations: 1000
    }).toString();
    console.log('dec-key', key); //same key as encryption

    const decryptedDataBytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedData = decryptedDataBytes.toString(CryptoJS.enc.Utf8);
    console.log('decryptedData', decryptedData);
    setDecryptedData(decryptedData);
  };

  const saveMasterPassword = () => {
    localStorage.setItem('masterPassword', masterPassword);
    setIsMasterPasswordSet(true);
  };

  // 當設置主密碼時，也將其保存到localStorage
  const handleMasterPasswordChange = (e) => {
    const newMasterPassword = e.target.value;
    setMasterPassword(newMasterPassword);
  };

  const clearData = () => {
    // 清除localStorage中的數據
    localStorage.removeItem('masterPassword');
    localStorage.removeItem('encryptionResults');
  
    // 重置應用狀態
    setMasterPassword('');
    setIsMasterPasswordSet(false);
    setDataToEncrypt('');
    setEncryptionResults([]);
    setSelectedEncryption(null);
    setDecryptionPassword('');
    setDecryptedData('');
  };

  return (
    <div>
      <h2>PBKDF2 Key Derivation and Encryption Demo</h2>
      <div>
        <button onClick={clearData}>Clear All Data</button>
      </div>
      <div>
        <h3>Set Master Password</h3>
        {!isMasterPasswordSet ? (
          <div>
            <input
              type="password"
              value={masterPassword}
              onChange={handleMasterPasswordChange}
              placeholder="Master Password"
            />
            <button onClick={saveMasterPassword} style={{ padding: '10px 20px' }}>Save</button>
          </div>
        ) : (
          <p>masterPassword: {masterPassword}</p>
        )}
      </div>
      <div>
        <h3>Encrypt Data</h3>
        <input
          type="text"
          value={dataToEncrypt}
          onChange={(e) => setDataToEncrypt(e.target.value)}
          placeholder="Data to Encrypt"
        />
        <button onClick={encryptData}>Encrypt</button>
      </div>
      <div>
        <h3>Encrypted Data List</h3>
        <ul>
          {encryptionResults.map((result) => (
            <li key={result.uuid} onClick={() => setSelectedEncryption(result)}>
              <p>encryptedData: {result.encryptedData} (Click to Decrypt)</p>
              <p>uuid = {result.uuid}</p>
            </li>
          ))}
        </ul>
      </div>
      {selectedEncryption && (
        <div>
          <h3>Decrypt Data</h3>
          <p>Selected Encrypted Data: {selectedEncryption.encryptedData}</p>
          <input
            type="password"
            value={decryptionPassword}
            onChange={(e) => setDecryptionPassword(e.target.value)}
            placeholder="Master Password for Decryption"
          />
          <button onClick={() => decryptData(selectedEncryption.encryptedData, selectedEncryption.salt)}>Decrypt</button>
          <p>Decrypted Data: {decryptedData}</p>
        </div>
      )}
    </div>
  );
}

export default App;
