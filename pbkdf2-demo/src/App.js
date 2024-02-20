import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [masterPassword, setMasterPassword] = useState('');
  const [dataToEncrypt, setDataToEncrypt] = useState('');
  const [encryptionResults, setEncryptionResults] = useState([]);
  const [selectedEncryption, setSelectedEncryption] = useState(null);
  const [decryptionPassword, setDecryptionPassword] = useState('');
  const [decryptedData, setDecryptedData] = useState('');

  const encryptData = () => {
    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
    const key = CryptoJS.PBKDF2(masterPassword, salt, {
      keySize: 512 / 32,
      iterations: 1000
    }).toString();

    const encryptedData = CryptoJS.AES.encrypt(dataToEncrypt, key).toString();
    const uuid = uuidv4();
    const newEncryptionResult = { uuid, salt, encryptedData, dataToEncrypt };
    setEncryptionResults([...encryptionResults, newEncryptionResult]);
  };

  const decryptData = (encryptedData, salt) => {
    const key = CryptoJS.PBKDF2(decryptionPassword, salt, {
      keySize: 512 / 32,
      iterations: 1000
    }).toString();

    const decryptedDataBytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedData = decryptedDataBytes.toString(CryptoJS.enc.Utf8);
    console.log('decryptedData', decryptedData);
    setDecryptedData(decryptedData);
  };

  return (
    <div>
      <h2>PBKDF2 Key Derivation and Encryption Demo</h2>
      <div>
        <h3>Set Master Password</h3>
        <input
          type="password"
          value={masterPassword}
          onChange={(e) => setMasterPassword(e.target.value)}
          placeholder="Master Password"
        />
        {masterPassword && <p>masterPassword: {masterPassword}</p>}
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
