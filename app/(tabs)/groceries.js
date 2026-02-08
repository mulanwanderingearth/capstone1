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
      <Text style={styles.header}>Groceries</Text>
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
