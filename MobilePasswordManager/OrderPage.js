// OrderPage.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';

const OrderPage = ({route}) => {
    const { DecryptedCredentials } = route.params;
    console.log('DecryptedCredentials:', DecryptedCredentials);

    // decryptedCredentials
    const DecryptedCredentialsItem = ({ item }) => (
        <View style={styles.item}>
            <Text style={styles.itemText}>Website: {item.website}</Text>
            <Text style={styles.itemText}>Username: {item.username}</Text>
            <Text style={styles.itemText}>Decrypted Password: {item.decryptedPassword}</Text>
        </View>
    );

    const [orders, setOrders] = useState([]); //
    const [loading, setLoading] = useState(true); // 用於追蹤資料是否正在載入的狀態

    // 一個函數，用於從伺服器取得訂單數據
    const fetchOrders = async () => {
        try {
        const response = await axios.get('http://10.0.2.2:5000/getOrders');
        setOrders(response.data); // 將取得的訂單資料儲存到狀態中
        setLoading(false); // 設定載入狀態為 false，表示資料載入完成
        } catch (error) {
        console.error(error);
        setLoading(false); // 如果發生錯誤，也設定載入狀態為 false
        }
    };

    // 使用 useEffect 鉤子，在元件掛載時取得訂單數據
    useEffect(() => {
        // fetchOrders();
    }, []); // 空數組表示這個 effect 只在元件掛載時運行一次

    // 一個渲染每個訂單的函數
    const renderOrderItem = ({ item }) => (
        <View style={styles.item}>
            <Text style={styles.titleText}>訂單編號: {item.訂單編號}</Text>
            <Text style={styles.itemText}>日期: {item.日期}</Text>
            <Text style={styles.itemText}>訂單狀態: {item.訂單狀態}</Text>
            <Text style={styles.itemText}>總價: {item.總價}</Text>
            <Text style={styles.itemText}>付款方式: {item.付款}</Text>
            <Text style={styles.itemText}>配送狀態: {item.配送狀態}</Text>
            <Text style={styles.itemText}>產品名稱: {item.產品名稱}</Text>
            <Text style={[styles.itemText, {fontWeight: 'bold'}]}>物流資訊: {item.物流資訊}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
        {/* {loading ? (
            <ActivityIndicator size="large" /> // 如果資料正在加載，顯示加載指示器
        ) : (
            <FlatList
            data={orders} // 將狀態中的訂單資料傳遞給 FlatList
            renderItem={renderOrderItem} // 指定如何渲染每個訂單
            keyExtractor={item => item.訂單編號} // 指定每個訂單的唯一鍵值
            />
        )} */}
        {/* ******decryptedCredentials********* */}
        <FlatList
            data={DecryptedCredentials} // Pass the credentials data from state to FlatList
            renderItem={DecryptedCredentialsItem} // Specify how to render each item
            keyExtractor={item => item.id} // Specify a unique key for each item
        />
        </View>
    );
};

const styles = StyleSheet.create({
   container: {
     flex: 1, // 使用 flex 版面填充整個螢幕
     marginTop: 20,
   },
   itemContainer: {
     backgroundColor: '#f9f9f9',
     padding: 20,
     marginVertic2al: 8,
     marginHorizontal: 16,
     borderRadius: 5,
     // 依需要新增其他樣式
   },
   itemText: {
    fontSize: 15,
   },
   titleText: {
     fontSize: 25,
     fontWeight: 'bold',
     // 依需要新增其他樣式
   },
   item: { // 項目樣式
    flexDirection: 'column', // 排列方向為垂直（列）
    justifyContent: 'space-between', // 子元素間距平均分佈
    padding: 10, // 內填 10
    marginVertical: 8, // 垂直外邊距 8
    backgroundColor: '#f9c2ff', // 背景色為淺紫色
   },
});

export default OrderPage;