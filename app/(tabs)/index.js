// import useTheme from "@/hooks/useTheme";
import axios from "axios";
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const apiUrl = process.env.EXPO_PUBLIC_API_URL
const apiKey = process.env.EXPO_PUBLIC_API_KEY

function SearchHeader({
  searchType,
  text,
  setText,
  handleSearch,
  setSearchType
}) {
  return (
    <View style={styles.headerContainer}>
      <Image
        source={require('@/assets/images/theme.png')}
        style={styles.appIcon}
      />
      <Text style={styles.appTitle}>Cookly</Text>
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
    </View>
  );
}

export default function Index() {
  // const { toggleDarkMode } = useTheme();
  const [text, setText] = useState('');
  const [recipes, setRecipes] = useState(null);
  const [searchType, setSearchType] = useState('title');
  const [recommendations, setRecommendations] = useState([]);
  const router = useRouter();

  const getRecommendations = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/random`, {
        params: {
          apiKey: apiKey,
          number: 1,
        }
      });
      setRecommendations(response.data.recipes || []);
    } catch (error) {
      console.log('Error fetching recommendations:', error);
    }
  }, []);

  useEffect(() => {
    if (recommendations.length === 0) {
      getRecommendations();
    }
  }, [getRecommendations, recommendations.length]);

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
        <FlatList
          data={recommendations}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={
            <>
              <SearchHeader
                searchType={searchType}
                text={text}
                setText={setText}
                handleSearch={handleSearch}
                setSearchType={setSearchType}
              />
              <Text style={styles.recommendationTitle}>✨ Recommendations </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {recommendations.map((item) => (
                  <TouchableOpacity
                    key={item.id.toString()}
                    onPress={() => handleRecipePress(item)}
                    style={styles.horizontalCard}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={styles.horizontalImage}
                    />
                    <View style={styles.horizontalInfo}>
                      <Text style={styles.horizontalTitle}>{item.title}</Text>
                      <Text style={styles.horizontalTime}>⏱ {item.readyInMinutes} mins</Text>
                      {item.sourceName && <Text style={styles.horizontalSource}>{item.sourceName}</Text>}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          }

        />
      ) : (
        <FlatList
          style={styles.flatListContainer}
          data={recipes}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={
            <SearchHeader
              searchType={searchType}
              text={text}
              setText={setText}
              handleSearch={handleSearch}
              setSearchType={setSearchType}
            />
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
  },

  centerContainer: {
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    minHeight: 400,
  },

  appIcon: {
    width: 100,
    height: 100,
    marginBottom: 30,
    marginTop: 100,
    borderRadius: 20,

  },

  appTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginBottom: 10,
  },

  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    width: 350,
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
    marginTop: 10,
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
    fontWeight: 'bold',
  },

  active: {
    backgroundColor: '#FF8C00',
    borderColor: '#FF8C00',
  },

  activeText: {
    color: '#fff',
    fontWeight: 'bold',
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
    marginBottom: 6,
  },

  recipeTime: {
    fontSize: 12,
    color: '#666',
  },

  recipeSource: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },

  emptyText: {
    textAlign: 'center',
    fontSize: 20,
    color: '#fff',
    marginTop: 20,
  },

  recommendationContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },

  recommendationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 30,
    marginBottom: 20,
    paddingHorizontal: 20,
    letterSpacing: 0.5,
  },

  horizontalScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },

  horizontalCard: {
    width: 140,
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  horizontalImage: {
    width: 140,
    height: 140,
    resizeMode: 'cover',
  },

  horizontalInfo: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 8,
    flex: 1,
    justifyContent: 'space-between',
  },

  horizontalTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    numberOfLines: 2,
  },

  horizontalTime: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },

  horizontalSource: {
    fontSize: 9,
    color: '#999',
    numberOfLines: 1,
  },
})
