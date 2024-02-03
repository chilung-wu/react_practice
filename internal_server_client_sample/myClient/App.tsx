/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

const localIp = '192.168.47.129';

const App = () => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  const fetchTitle = async () => {
    try {
      const response = await fetch(`http://${localIp}:3000/title?url=${encodeURIComponent(url)}`);
      // const response = await fetch(`http://192.168.47.129:3000/title?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      setTitle(data.title);
    } catch (error) {
      console.error('Error fetching title:', error);
      setTitle('Failed to fetch title');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20 }}
        onChangeText={text => setUrl(text)}
        value={url}
        placeholder="Enter URL"
      />
      <Button
        onPress={fetchTitle}
        title="Get Title"
      />
      <Text>Title: {title}</Text>
    </View>
  );
};

export default App;
