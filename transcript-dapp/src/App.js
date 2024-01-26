import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import { contractAddress, contractABI } from "./contract-info";
import { ethers } from 'ethers';
// const ethers = require("ethers");

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [connected, setConnected] = useState(false);
  const [studentAddress, setStudentAddress] = useState('');
  const [scores, setScores] = useState({ math: 0, science: 0, literature: 0 });
  const [viewedScores, setViewedScores] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // const provider = new ethers.BrowserProvider(window.ethereum); // ethers v6.0
      setProvider(provider);
    }
  }, []);

  const connectWallet = async () => {
    if (provider) {
      const signer = provider.getSigner();
      setSigner(signer);
      alert(await signer.getAddress())
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(contract);
      // alert('contract address:', contract)
      setConnected(true);
    } else {
      console.error("Ethereum object doesn't exist!");
    }
  };

  const handleAddStudent = async () => {
    if (contract) {
      try {
        const tx = await contract.addStudent(studentAddress);
        await tx.wait();
        alert('Student added successfully');
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to add student');
      }
    }
  };

  const handleUpdateScores = async () => {
    if (contract) {
      try {
        const { math, science, literature } = scores;
        const tx = await contract.updateScores(studentAddress, math, science, literature);
        await tx.wait();
        alert('Scores updated successfully');
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to update scores');
      }
    }
  };

  const handleViewScores = async () => {
    // if (contract) {
    //   try {
    //     const scores = await contract.viewScores(studentAddress);
    if (contract && signer) {
      try {
        // Fetch the current signer's address
        const address = await signer.getAddress();
        // Call the viewScores function with the current address
        const scores = await contract.viewScores(address);

        // Convert BigNumber to a readable format
        const formattedScores = {
          math: scores.math.toString(),
          science: scores.science.toString(),
          literature: scores.literature.toString(),
          total: scores.total.toString()
        };

        setViewedScores(formattedScores);

        // setViewedScores(scores);
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to view scores');
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {!connected ? (
          <button onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <div>
            <input
              type="text"
              placeholder="Student Address"
              value={studentAddress}
              onChange={(e) => setStudentAddress(e.target.value)}
            />
            <div>
              <input
                type="number"
                placeholder="Math Score"
                value={scores.math}
                onChange={(e) => setScores({ ...scores, math: e.target.value })}
              />
              <input
                type="number"
                placeholder="Science Score"
                value={scores.science}
                onChange={(e) => setScores({ ...scores, science: e.target.value })}
              />
              <input
                type="number"
                placeholder="Literature Score"
                value={scores.literature}
                onChange={(e) => setScores({ ...scores, literature: e.target.value })}
              />
            </div>
            <button onClick={handleAddStudent}>Add Student</button>
            <button onClick={handleUpdateScores}>Update Scores</button>
            <button onClick={handleViewScores}>View Scores</button>
            {viewedScores && (
              <div>
                <p>Math: {viewedScores.math}</p>
                <p>Science: {viewedScores.science}</p>
                <p>Literature: {viewedScores.literature}</p>
                <p>Total: {viewedScores.total}</p>
              </div>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;

