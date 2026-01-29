// import useTheme from "@/hooks/useTheme";
import { useRouter } from 'expo-router';
import { useState } from "react";
import { StyleSheet, Text, TextInput, View, FlatList, Image, TouchableOpacity } from "react-native";
import axios from "axios";

// const router = useRouter();
const apiUrl = process.env.EXPO_PUBLIC_API_URL
const apiKey = process.env.EXPO_PUBLIC_API_KEY

export default function Index() {
  // const { toggleDarkMode } = useTheme();
  const [text, setText] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [searchType, setSearchType] = useState('title')

  const router = useRouter();


  // call api to search the recipes by user's input of ingredient
  const getSearchedApi = (type) => {
    let params = {
      addRecipeInformation: true,
      number: 1,
      apiKey: apiKey
    }
    if (type === 'title') {
      params.titleMatch = text;
    } else {
      params.includeIngredients = text;
    }
    return axios.get(`${apiUrl}/complexSearch`, { params })
      .then(response => response.data.results)
      .catch(error => console.log(error));
  };

 

  //hand the api data
  const handleSearch = (type) => {
    return getSearchedApi(type)
      .then(recipes => {
        setRecipes(recipes)
        console.log(type)
      })
      .catch(error => {
        console.log(error);
        alert('failed: ' + error.message);
      })
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="🔍Search for Recipes!"
          onChangeText={newText => setText(newText)}
          value={text}
          style={styles.input}
          onSubmitEditing={() => handleSearch(searchType)}
          returnKeyType="search"
        />
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          onPress={() => {
            setSearchType('title')
            if (text) {
              handleSearch('title')
            }
          }}
          style={[styles.toggleBtn, searchType === 'title' && styles.active]}>
          <Text>Title</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setSearchType('ingredient')
            if (text) {
              handleSearch('ingredient')
            }
          }}
          style={[styles.toggleBtn, searchType === 'ingredient' && styles.active]}>
          <Text>Ingredient</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.flatListContainer}
        data={recipes}
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

  searchContainer: {
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
    marginTop: 50,
  },

  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 10,
  },

  toggleBtn: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',  // 未选中的颜色
    borderWidth: 1,
    borderColor: '#ccc',
  },

  active: {
    backgroundColor: '#007AFF',  // 选中的颜色
    borderColor: '#007AFF',
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
    fontSize: 20,
    marginTop: 20,
  },
})
