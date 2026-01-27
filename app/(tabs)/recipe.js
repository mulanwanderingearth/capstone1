

import { collection, getDocs, } from "firebase/firestore";
import { db } from "@/firebase/config"; 
import { useRouter } from 'expo-router';
import { useState, useEffect} from "react";
import { StyleSheet, Text, TextInput, View, FlatList, Image, TouchableOpacity } from "react-native";
// import { stripHtml } from '@/utils/htmlUtils';

export default function Recipe() {
    const router = useRouter();
    const [text, setText] = useState('');
    const [savedRecipes,setSavedRecipes] = useState([])

    const getAllSavedRecipes = async()=> {
        const querySnapshot = await getDocs(collection(db,"users","testUser","savedRecipes"));
        const recipes = [];
        querySnapshot.forEach((doc)=>{
            recipes.push({id:doc.id, ...doc.data()})
        });
        setSavedRecipes(recipes);
       
    }
    useEffect(()=>{
         getAllSavedRecipes();
        
},[])
    return (
        <View style={styles.container}>
          <Text style={styles.header}> All </Text>
        <View style={styles.searchContainer}>
        <TextInput
          placeholder="🔍Search for Saved Recipes!"
          onChangeText={newText => setText(newText)}
          value={text}
          style={styles.input}
        //   onSubmitEditing={() => handleSearch(searchType)}
          returnKeyType="search"
        />
         </View>
        
         
        <FlatList
        style={styles.flatListContainer}
        data={savedRecipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push({
            pathname: '/recipe-detail',
            params: { recipe: JSON.stringify(item) }
          })}>
            <View style={styles.recipeCard}>
              <Image
                source={{ uri: item.image }}
                style={styles.recipeImage}
              />
              <Text style={styles.recipeTitle}>{item.title}</Text>
              <Text style={styles.recipeTime}>⏱ {item.readyInMinutes} mins</Text>
            </View>
          </TouchableOpacity>

        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No recipes found.</Text>}
      />
</View>
    );
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: "coral",
  },
header:{
marginTop: 50,
borderWidth:1,
fontSize:20,
padding:10,
bold:true,

},
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth:1,
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
  flatListContainer: {
    flex: 1,
  },
  recipeCard: {
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  recipeImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  recipeTime: {
    fontSize: 14,
    color: 'gray',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  },
});
