// import useTheme from "@/hooks/useTheme";
import { useRouter } from 'expo-router';
import { useState } from "react";
import { StyleSheet, Text, TextInput, View, FlatList, Image } from "react-native";
import axios from "axios";

// const router = useRouter();
const apiUrl = process.env.EXPO_PUBLIC_API_URL
const apiKey = process.env.EXPO_PUBLIC_API_KEY
export default function Index() {
  // const { toggleDarkMode } = useTheme();
  const [text, setText] = useState('');
  const [recipes, setRecipes] = useState([])

  // call api to get the recipes by user's input of ingredient
  const getSearchedApi = () => {
    return axios.get(`${apiUrl}`, {
      params: {
        includeIngredients: text,
        addRecipeInformation: true,
        number: 10,
        apiKey: apiKey
      }
    })
      .then(response => response.data.results)
      .catch(error => console.log(error));
  };




  const handleSearch = () => {
    return getSearchedApi()
      .then(recipes => {
        setRecipes(recipes)
      })
      .catch(error => {
        console.log(error);
        alert('搜索失败: ' + error.message);
      })
  }



  return (
    <View style={styles.container}>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search for Recipe!"
          onChangeText={newText => setText(newText)}
          value={text}
          style={styles.input}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      <FlatList
        style={styles.flatListContainer}
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.recipeCard}>
            <Image
              source={{ uri: item.image }}
              style={styles.recipeImage}
            />
            <Text style={styles.recipeTitle}>{item.title}</Text>
            <Text style={styles.recipeTime}>⏱ {item.readyInMinutes} mins</Text>
          </View>

        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No result, please try with other words!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "coral",
    marginTop: 100
  },

  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
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
  },
  recipeCard: {
    backgroundColor: 'white',
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recipeImage: {
    width: '100%',
    height: 200,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 10,
    color: '#333',
  },
  recipeTime: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
})
