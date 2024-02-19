import React, { useState } from 'react';
import CryptoJS from 'crypto-js';

function App() {
  const [masterPassword, setMasterPassword] = useState('');
  const [dataToEncrypt, setDataToEncrypt] = useState('');
  const [result, setResult] = useState({});

  const deriveAndEncrypt = () => {
    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
    const key = CryptoJS.PBKDF2(masterPassword, salt, {
      keySize: 512 / 32,
      iterations: 1000
    }).toString();

    const encryptedData = CryptoJS.AES.encrypt(dataToEncrypt, key).toString();
    const decryptedDataBytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedData = decryptedDataBytes.toString(CryptoJS.enc.Utf8);

    setResult({ salt, key, encryptedData, decryptedData });
  };

  return (
    <div>
      <h2>PBKDF2 Key Derivation and Encryption Demo</h2>
      <input
        type="password"
        value={masterPassword}
        onChange={(e) => setMasterPassword(e.target.value)}
        placeholder="Enter Master Password"
      />
      <input
        type="text"
        value={dataToEncrypt}
        onChange={(e) => setDataToEncrypt(e.target.value)}
        placeholder="Enter Data to Encrypt"
      />
      <button onClick={deriveAndEncrypt}>Derive Key & Encrypt</button>
      {result.salt && <p>Random Salt: {result.salt}</p>}
      {result.key && <p>Master Key: {result.key}</p>}
      {result.encryptedData && <p>Encrypted Data: {result.encryptedData}</p>}
      {result.decryptedData && <p>Decrypted Data: {result.decryptedData}</p>}
    </div>
  );
}

export default App;

