import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from './HomePage'; // 引用新的 HomePage 組件
// 引用其他需要導航到的頁面

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomePage} />
        {/* 配置其他頁面 */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}