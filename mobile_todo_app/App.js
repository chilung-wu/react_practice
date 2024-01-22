import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, FlatList, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Load tasks from AsyncStorage
    const loadTasks = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem('tasks');
        if (savedTasks) setTasks(JSON.parse(savedTasks));
      } catch (e) {
        // error reading value
      }
    };
    loadTasks();
    console.log('loadTasks')
  }, []);

  useEffect(() => {
    // Save tasks to AsyncStorage
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (e) {
        // saving error
      }
    };

    saveTasks();
    console.log('saveTasks', tasks)
  }, [tasks]);

  const addTask = () => {
    if (!task) return;
    setTasks([...tasks, task]);
    setTask('');
  };

  const deleteTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        onChangeText={setTask}
        value={task}
        placeholder="Add a new task"
      />
      <Button onPress={addTask} title="Add" />
      <FlatList
        data={tasks}
        renderItem={({ item, index }) => (
          <View style={styles.listItem}>
            <Text>{item}</Text>
            <Button onPress={() => deleteTask(index)} title="Delete" />
          </View>
        )}
        keyExtractor={(_, index) => index.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '80%',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
    marginVertical: 10,
  },
});
