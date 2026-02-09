// import useTheme from "@/hooks/useTheme";
import axios from "axios";
import { useRouter } from 'expo-router';
import { useState } from "react";
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const apiUrl = process.env.EXPO_PUBLIC_API_URL
const apiKey = process.env.EXPO_PUBLIC_API_KEY

export default function Index() {
  // const { toggleDarkMode } = useTheme();
  const [text, setText] = useState('');
  const [recipes, setRecipes] = useState(null);
  const [searchType, setSearchType] = useState('title');
  const router = useRouter();

  const getSearchedApi = (type) => {
    let params = {
      addRecipeInformation: true,
      number: 5,
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
      })
      .catch(error => {
        console.log(error);
        alert('failed: ' + error.message);
      })
  }


  const handleRecipePress = async (item) => {
    try {
      const response = await axios.get(`${apiUrl}/${item.id}/information`, { params: { apiKey } });
      const detailedRecipe = response.data;
      router.push({
        pathname: '/recipe-detail',
        params: { recipe: JSON.stringify(detailedRecipe) }
      });
    } catch (error) {
      console.log(error);
      alert('failed to load recipe details');
    }
  }

  return (
    <View style={styles.container}>
      {recipes === null ? (
        <View style={styles.centerContainer}>
          <Image
            source={require('@/assets/images/theme.png')}
            style={styles.appIcon}
          />
          <Text style={styles.appTitle}>Cookly</Text>

          <View style={styles.searchContainerCenter}>
            <TextInput
              placeholder="🔍Search for Recipes!"
              placeholderTextColor="#999"
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
              <Text style={[styles.toggleText, searchType === 'title' && styles.activeText]}>Title</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSearchType('ingredient')
                if (text) {
                  handleSearch('ingredient')
                }
              }}
              style={[styles.toggleBtn, searchType === 'ingredient' && styles.active]}>
              <Text style={[styles.toggleText, searchType === 'ingredient' && styles.activeText]}>Ingredients</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          style={styles.flatListContainer}
          data={recipes}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={
            <>
              <View style={styles.headerContainer}>
                <Image
                  source={require('@/assets/images/theme.png')}
                  style={styles.appIcon}
                />
                <Text style={styles.appTitle}>Cookly</Text>
              </View>

              <View style={styles.searchContainer}>
                <TextInput
                  placeholder="🔍Search for Recipes!"
                  placeholderTextColor="#999"
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
                  <Text style={[styles.toggleText, searchType === 'title' && styles.activeText]}>Title</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setSearchType('ingredient')
                    if (text) {
                      handleSearch('ingredient')
                    }
                  }}
                  style={[styles.toggleBtn, searchType === 'ingredient' && styles.active]}>
                  <Text style={[styles.toggleText, searchType === 'ingredient' && styles.activeText]}>Ingredients</Text>
                </TouchableOpacity>
              </View>
            </>
          }
          renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleRecipePress(item)}>
                <View style={styles.recipeCard}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.recipeImage}
                  />
                  <View style={styles.recipeInfo}>
                    <Text style={styles.recipeTitle}>{item.title}</Text>
                    <Text style={styles.recipeTime}>⏱ {item.readyInMinutes} mins</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No recipes found.</Text>}
          />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "coral",
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  centerContainerSmall: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    minHeight: 180,
  },

  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    minHeight: 350,
  },

  appIcon: {
    width: 100,
    height: 100,
    marginBottom: 30,
    borderRadius: 20,
    
  },

  appTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },

  appSubtitle: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 40,
  },

  highlight: {
    color: '#FFD700',
    fontWeight: 'bold',
  },

  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: -20,
  },

  searchContainerCenter: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  flatListContainer: {
    flex: 1,
    paddingHorizontal: 10,
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

  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 10,
    marginTop: 15,
    gap: 10,
  },

  toggleBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#ccc',
  },

  toggleText: {
    color: '#666',
    fontSize: 14,
  },

  active: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },

  activeText: {
    color: '#fff',
  },

  recipeCard: {
    backgroundColor: 'white',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  recipeImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },

  recipeInfo: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },

  recipeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },

  recipeTime: {
    fontSize: 12,
    color: '#666',
  },

  emptyText: {
    textAlign: 'center',
    fontSize: 20,
    color: '#fff',
    marginTop: 20,
  },
})
