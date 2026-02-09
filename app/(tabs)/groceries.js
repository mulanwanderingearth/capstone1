import { useEffect, useRef, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
// import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from "@/firebase/config";
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";

export default function Groceries() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editText, setEditText] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const rowMap = useRef({});
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

// 编辑单个项
const handleEditItem = (item) => {
  setEditingItem(item);
  setEditText(item.ingredient);
  setShowEditModal(true);
};

// 确认编辑
const handleConfirmEdit = async () => {
  if (editText && editText !== editingItem.ingredient) {
    await handleUpdateItem(editingItem.id, editText);
  }
  setShowEditModal(false);
  setEditingItem(null);
  setEditText("");
  
  // 关闭 SwipeListView 的行
  setTimeout(() => {
    if (editingItem && editingItem.checked) {
      rowMap.current.checked?.closeAllOpenRows();
    } else {
      rowMap.current.unchecked?.closeAllOpenRows();
    }
  }, 100);
};

// 更新项目
const handleUpdateItem = async (id, newIngredient) => {
  try {
    await updateDoc(doc(db, "users", "testUser", "groceryItems", id), {
      ingredient: newIngredient
    });
    getAllGroceries();
  } catch (err) {
    Alert.alert("Error", String(err));
  }
};

// 删除单个项
const handleDeleteItem = async (id) => {
  Alert.alert(
    "Delete Item",
    "Are you sure you want to delete this item?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "users", "testUser", "groceryItems", id));
            getAllGroceries();
          } catch (err) {
            Alert.alert("Error", String(err));
          }
        }
      }
    ]
  );
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
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Groceries</Text>
        <Text style={styles.itemCount}>To Buy: {itemsUnchecked.length}  |  In Cart: {itemsChecked.length}</Text>
      </View>
      <ScrollView style={styles.scrollContent}>
      <View style={styles.addContainer}>
      <TextInput
      style={styles.input}
      placeholder="Add New Items!"
      placeholderTextColor="#999"
      value={newItem}
      onChangeText={newItem=>setNewItem(newItem)}
      onSubmitEditing={() => handleAddNewItem()}
      returnKeyType="add"
      />
      </View>
      
      <View style={styles.clearButtonsContainer}>
        <TouchableOpacity 
          style={styles.clearButtonPrimary}
          onPress={handleClearChecked}
        >
          <Text style={styles.clearButtonText}> Clear Checked</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.clearButtonDanger}
          onPress={handleClearAll}
        >
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <View>
         <Text style={styles.sectionTitle}>To Buy</Text>
         <SwipeListView
           ref={(ref) => { rowMap.current.unchecked = ref; }}
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
           renderHiddenItem={({item}) => (
             <View style={styles.hiddenRowContainer}>
               <TouchableOpacity 
                 style={styles.editButton}
                 onPress={() => {
                   rowMap.current[item.id] = { closeRow: () => {} };
                   handleEditItem(item);
                 }}
               >
                 <Text style={styles.actionButtonText}>✏️</Text>
               </TouchableOpacity>
               <TouchableOpacity 
                 style={styles.deleteButton}
                 onPress={() => handleDeleteItem(item.id)}
               >
                 <Text style={styles.actionButtonText}>🗑️</Text>
               </TouchableOpacity>
             </View>
           )}
           rightOpenValue={-120}
           closeOnRowPress={true}
           scrollEnabled={false}
         />
      </View>

      <View>
         <Text style={styles.sectionTitle}>In Cart</Text>
         <SwipeListView
           ref={(ref) => { rowMap.current.checked = ref; }}
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
           renderHiddenItem={({item}) => (
             <View style={styles.hiddenRowContainer}>
               <TouchableOpacity 
                 style={styles.editButton}
                 onPress={() => {
                   rowMap.current[item.id] = { closeRow: () => {} };
                   handleEditItem(item);
                 }}
               >
                 <Text style={styles.actionButtonText}>✏️</Text>
               </TouchableOpacity>
               <TouchableOpacity 
                 style={styles.deleteButton}
                 onPress={() => handleDeleteItem(item.id)}
               >
                 <Text style={styles.actionButtonText}>🗑️</Text>
               </TouchableOpacity>
             </View>
           )}
           rightOpenValue={-120}
           closeOnRowPress={true}
           scrollEnabled={false}
         />
      </View>
      </ScrollView>
    
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Item</Text>
            <TextInput
              style={styles.modalInput}
              value={editText}
              onChangeText={setEditText}
              placeholder="Enter item name"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleConfirmEdit}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
  }





const styles = StyleSheet.create({
  container: {
        flex: 1,
        backgroundColor: '#eeeeee',
    },
    
  scrollContent:{
    flex:1,
    paddingBottom:20
  },
    
  header: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  headerContainer: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  addContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
   
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
    fontSize: 16,
    color: '#333',
  },
clearButtonsContainer:{
  flexDirection:'row',
  justifyContent:'space-between',
  padding:20,
  
},
clearButtonPrimary:{
  flex:1,
  backgroundColor:'#ffffff',
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 8,
  alignItems:'center',
  borderWidth: 1,
  borderColor: '#ddd',
},
clearButtonDanger:{
  flex:1,
  backgroundColor:'#ffffff',
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 8,
  alignItems:'center',
  borderWidth: 1,
  borderColor: '#ddd',
  marginLeft: 12,
},
clearButtonText:{
  color: '#333',
  fontSize: 14,
  fontWeight: '600',
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
  borderBottomColor:'#eee',
  backgroundColor: '#fff',
},
checkBtn:{
  fontSize:28,
  marginRight:12,
  padding:4
},
itemText:{
  fontSize:18,
  color:'#333',
  flex:1
},
itemTextChecked:{
  fontSize:18,
  color:'#999',
  flex:1
  
},
hiddenRowContainer:{
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end',
  paddingHorizontal: 10,
  backgroundColor: '#f0f0f0',
},
editButton:{
  // backgroundColor: '#4A90E2',
  width: 50,
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
},
deleteButton:{
  width: 50,
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
},
actionButtonText:{
  color: '#fff',
  fontSize: 18,
  fontWeight: 'bold',
},
modalContainer:{
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
},
modalContent:{
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 20,
  width: '80%',
  maxWidth: 300,
},
modalTitle:{
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 15,
  color: '#333',
},
modalInput:{
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  marginBottom: 20,
  fontSize: 16,
},
modalButtons:{
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 10,
},
modalButton:{
  flex: 1,
  paddingVertical: 10,
  borderRadius: 8,
  alignItems: 'center',
},
cancelButton:{
  backgroundColor: '#ddd',
},
saveButton:{
  backgroundColor: '#51CF66',
},
modalButtonText:{
  fontSize: 14,
  fontWeight: '600',
  color: '#333',
},
})
