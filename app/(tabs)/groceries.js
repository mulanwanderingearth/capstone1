import { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from "@/firebase/config";
import { addDoc, collection, deleteDoc, doc, getDocs,updateDoc, onSnapshot, serverTimestamp } from "firebase/firestore";

export default function Groceries() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const itemsChecked = items.filter(item => item.checked);
  const itemsUnchecked = items.filter(item=> !item.checked);

  const getAllGroceries = async () => {
    const querySnapshot = await getDocs(collection(db, "users", "testUser", "groceryItems"));
    const allItems = querySnapshot.docs.map(doc => ({
      id:doc.id,
      ...doc.data()
    }));
    setItems(allItems);
  }
  
  const handleAddNewItem = async() => {
    const userId = "testUser";
    const ref = collection(db, "users", userId, "groceryItems");
    try {
      await addDoc(ref,{
        ingredient: newItem,
        checked: false,
        createdAt: serverTimestamp(),
      });
      setNewItem("");
      getAllGroceries();
    } catch (err) {
      Alert.alert("Error", String(err));
    }
  };
  const handleClearChecked = async ()=> {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete all grocery items in the cart?",
      [
        { text: "cancel", style: "cancel" },
        {
          text: "delete",
          style: "destructive",
          onPress: async () => {
            try {
              const deletePromises = itemsChecked.map(item =>
                deleteDoc(doc(db, "users", "testUser", "groceryItems", item.id))
              );
              await Promise.all(deletePromises);
              getAllGroceries();
              Alert.alert("Success", "All grocery items in the cart have been deleted");
            } catch (err) {
              Alert.alert("Error", String(err));
            }
          }
        }
      ]
    );

  }
  const handleClearAll = async () => { 
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete all grocery items?",
      [
        { text: "cancel", style: "cancel" },
        {
          text: "delete",
          style: "destructive",
          onPress: async () => {
            try {
              const querySnapshot = await getDocs(collection(db, "users", "testUser", "groceryItems"));
              const deletePromises = querySnapshot.docs.map(item =>
                deleteDoc(doc(db, "users", "testUser", "groceryItems", item.id))
              );
              await Promise.all(deletePromises);
              setItems([]);
              Alert.alert("Success", "All grocery items have been deleted");
            } catch (err) {
              Alert.alert("Error", String(err));
            }
          }
        }
      ]
    );
  };

const handleToggleChecked = async(id) => {
  try {
    const result = items.map((item)=> {
      return item.id === id ? { ...item, checked: !item.checked } : item
  }
);
  setItems(result);
  const currentItem = items.find(item => item.id===id);
  await updateDoc(doc(db, "users", "testUser", "groceryItems",id),{
    checked:!currentItem.checked
  });
  } catch (err){
    Alert.alert("Error", String(err));
  }
};
  useEffect(()=>{
    const unsubscribe = onSnapshot(
      collection(db,"users","testUser","groceryItems"),
      (querySnapshot) => {
        const allItems =querySnapshot.docs.map(doc =>({
          id: doc.id,
          ...doc.data()
        }));
        setItems(allItems);
      },
      (err)=>{
        console.log("Error", String(err));
      }
    )
    return ()=>unsubscribe();
  },[]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>groceries</Text>
      <ScrollView style={styles.scrollContent}>
      <View style={styles.addContainer}>
      <TextInput
      style={styles.input}
      placeholder="Add New Items!"
      value={newItem}
      onChangeText={newItem=>setNewItem(newItem)}
      onSubmitEditing={() => handleAddNewItem()}
      returnKeyType="add"
      />
      </View>
      
      <View style={styles.clearBottons}>
        <TouchableOpacity onPress={handleClearChecked}>
          <Text>Clear Checked</Text>
           </TouchableOpacity>
           <TouchableOpacity onPress={handleClearAll}>
            <Text >Clear All</Text>
           </TouchableOpacity>
         </View>

      <View>
         <Text style={styles.sectionTitle}>To Buy</Text>
         <FlatList
         data={itemsUnchecked}
         keyExtractor={(item)=>item.id}
         renderItem={({item})=>(
          <View style={styles.itemRow}>
            <TouchableOpacity onPress={() => handleToggleChecked(item.id)}>
              <Text style={styles.checkBtn}>☐</Text>
            </TouchableOpacity>
            <Text style={styles.itemText}>{item.ingredient}</Text>
            </View>
         )}
         scrollEnabled={false}/>
      </View>

      <View>
         <Text style={styles.sectionTitle}>In Cart</Text>
         <FlatList
         data={itemsChecked}
         keyExtractor={(item)=>item.id}
         renderItem={({item})=>(
          <View style={styles.itemRow}>
            <TouchableOpacity onPress={() => handleToggleChecked(item.id)}>
              <Text style={styles.checkBtn}>☑</Text>
            </TouchableOpacity>
            <Text style={styles.itemTextChecked}>{item.ingredient}</Text>
            </View>
         )}
         scrollEnabled={false}
         />
      </View>
      </ScrollView>
    
    </View>
  )
  }





const styles = StyleSheet.create({
  container: {
        flex: 1,
        backgroundColor: 'coral',
    },
    
  scrollContent:{
    flex:1,
    paddingBottom:20
  },
    
  header: {
    marginTop: 50,
    borderWidth:1,
    fontSize:20,
    padding:10,
    bold:true,
},
  addContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth:1,
  },

  flatListContainer: {
    flex: 1,
  },

  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'white',
   
  },
clearBottons:{
  flexDirection:'row',
  justifyContent:'space-between',
  alignItems:'center',
  padding:20,
  borderWidth:1
},
listContainer:{
  flex:1,
  paddingBottom:10
},
sectionTitle:{
  fontSize:18,
  fontWeight:'bold',
  marginTop:15,
  marginBottom:10,
  marginHorizontal:20,
  color:'#333'
},
itemRow:{
  flexDirection:'row',
  alignItems:'center',
  paddingHorizontal:20,
  paddingVertical:12,
  borderBottomWidth:1,
  borderBottomColor:'#eee'
},
checkBtn:{
  fontSize:20,
  marginRight:12,
  padding:4
},
itemText:{
  fontSize:16,
  color:'#333',
  flex:1
},
itemTextChecked:{
  fontSize:16,
  color:'#999',
  flex:1,
  textDecorationLine:'line-through'
}
})


// import React, { useState, useRef } from 'react';
// import { View, TextInput, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// // 注意：这里不需要引入 Firebase 了

// // --- 1. 准备假数据 (Mock Data) ---
// const INITIAL_DATA = [
//   {
//     id: '1',
//     name: 'beef ribs',
//     amount: '6',
//     unit: 'pounds',
//     isChecked: true, // 模拟已买
//   },
//   {
//     id: '2',
//     name: 'Mussleman’s Apple Butter',
//     amount: '1',
//     unit: 'cup',
//     isChecked: true,
//   },
//   {
//     id: '3',
//     name: 'garlic',
//     amount: '3',
//     unit: 'cloves',
//     meta: 'minced', // 备注
//     isChecked: false,
//   },
// ];

// export default function GroceryTab() {
//   // --- 2. 本地 State 管理 ---
//   const [items, setItems] = useState(INITIAL_DATA);
  
//   // 输入框的状态
//   const [newName, setNewName] = useState('');
//   const [newAmount, setNewAmount] = useState('');
  
//   // 焦点控制 (用于跳格)
//   const amountInputRef = useRef(null);
//   const nameInputRef = useRef(null);

//   // --- 3. 手动添加逻辑 (替代 addDoc) ---
//   const handleSave = () => {
//     if (!newName.trim()) return;

//     const newItem = {
//       id: Date.now().toString(), // 只有本地测试才这样生成ID
//       name: newName.trim(),
//       amount: newAmount.trim() || '1',
//       unit: 'unit', 
//       isChecked: false,
//       createdAt: new Date()
//     };

//     // 关键：手动更新数组，把新项加进去
//     setItems(prevItems => [...prevItems, newItem]);

//     // 清空状态，并把光标移回“名字”栏，准备下一条
//     setNewName('');
//     setNewAmount('');
    
//     // 保持键盘不收起，焦点回到名字栏
//     nameInputRef.current?.focus(); 
//   };

//   // --- 4. 手动打勾逻辑 (替代 updateDoc) ---
//   const toggleCheck = (id) => {
//     setItems(prevItems => 
//       prevItems.map(item => 
//         item.id === id ? { ...item, isChecked: !item.isChecked } : item
//       )
//     );
//   };

//   // --- 5. 渲染单个列表项 (GroceryItem) ---
//   // 为了方便复制，我把 Item 组件直接写在这里了
//   const renderItem = ({ item }) => (
//     <TouchableOpacity 
//       style={styles.itemRow} 
//       onPress={() => toggleCheck(item.id)}
//       activeOpacity={0.7}
//     >
//       {/* 左侧勾选框 */}
//       <View style={styles.iconContainer}>
//         {item.isChecked ? (
//             <Ionicons name="checkmark-circle" size={24} color="#FFD700" />
//         ) : (
//             <Ionicons name="ellipse" size={24} color="#333" />
//         )}
//       </View>

//       {/* 右侧文字 */}
//       <View style={styles.textContainer}>
//         <View style={{flexDirection:'row', flexWrap:'wrap', alignItems:'baseline'}}>
//           <Text style={[styles.nameText, item.isChecked && styles.dimText]}>
//             {item.name}
//           </Text>
//           {item.meta && (
//             <Text style={styles.metaText}> {item.meta}</Text>
//           )}
//         </View>
        
//         {/* 数量显示 */}
//         <Text style={[styles.amountText, item.isChecked && styles.dimText]}>
//           {item.amount} {item.unit}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );

//   // --- 6. 幽灵输入行 (Footer) ---
//   const ListFooter = () => (
//     <View style={styles.inputRow}>
//       {/* 左边占位圆圈 */}
//       <View style={styles.iconPlaceholder}>
//          <Ionicons name="ellipse-outline" size={24} color="#333" />
//       </View>

//       <View style={styles.textContainer}>
//         {/* 输入名字 (白色) */}
//         <TextInput
//           ref={nameInputRef}
//           style={styles.inputName}
//           placeholder="Add item..."
//           placeholderTextColor="#666"
//           value={newName}
//           onChangeText={setNewName}
//           returnKeyType="next"
//           onSubmitEditing={() => amountInputRef.current?.focus()} // 回车跳到数量
//           blurOnSubmit={false} // 键盘不收
//           autoCorrect={false}
//         />

//         {/* 输入数量 (黄色) */}
//         {/* 为了体验更好，只要开始输名字了，就显示数量框 */}
//         {(newName.length > 0 || newAmount.length > 0) && (
//           <TextInput
//             ref={amountInputRef}
//             style={styles.inputAmount}
//             placeholder="Amount"
//             placeholderTextColor="#666"
//             value={newAmount}
//             onChangeText={setNewAmount}
//             returnKeyType="done"
//             onSubmitEditing={handleSave} // 回车保存
//             blurOnSubmit={false} // 保存完键盘依然不收！
//           />
//         )}
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.headerTitle}>Groceries</Text>
      
//       <FlatList
//         data={items}
//         keyExtractor={item => item.id}
//         renderItem={renderItem}
//         ListFooterComponent={ListFooter}
        
//         // 核心属性：确保点击列表任何地方都能收起键盘（除了点击输入框）
//         keyboardShouldPersistTaps="handled" 
//         contentContainerStyle={{ paddingBottom: 100 }} 
//       />
//     </View>
//   );
// }

// // --- 样式复刻 (Dark Mode) ---
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#121212', // 纯黑背景
//     paddingTop: 60,
//     paddingHorizontal: 20,
//   },
//   headerTitle: {
//     fontSize: 36,
//     fontWeight: '800',
//     color: '#FFFFFF',
//     fontFamily: 'serif',
//     marginBottom: 20,
//   },
//   // 列表项样式
//   itemRow: {
//     flexDirection: 'row',
//     marginBottom: 20,
//     alignItems: 'flex-start',
//   },
//   iconContainer: {
//     marginRight: 15,
//     marginTop: 2,
//   },
//   textContainer: {
//     flex: 1,
//     borderBottomWidth: 1,
//     borderBottomColor: '#333',
//     paddingBottom: 10,
//   },
//   nameText: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#FFFFFF',
//     marginBottom: 4,
//   },
//   metaText: {
//     fontSize: 16,
//     fontStyle: 'italic',
//     color: '#666',
//   },
//   amountText: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#FFD700', // 黄色
//   },
//   dimText: {
//     opacity: 0.3,
//     textDecorationLine: 'line-through',
//   },
  
//   // 输入行样式
//   inputRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     marginTop: 10,
//   },
//   iconPlaceholder: {
//     marginRight: 15,
//     marginTop: 2,
//     opacity: 0.5
//   },
//   inputName: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#FFFFFF',
//     padding: 0, 
//     marginBottom: 4,
//   },
//   inputAmount: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#FFD700',
//     padding: 0,
//   }
// });