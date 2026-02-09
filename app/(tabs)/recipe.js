

import { db } from "@/firebase/config";
import { useFocusEffect, useRouter } from 'expo-router';
import { collection, getDocs, } from "firebase/firestore";
import { Alert, React, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Recipe() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);

  const getAllSavedRecipes = async () => {
    const querySnapshot = await getDocs(collection(db, "users", "testUser", "savedRecipes"));
    const recipes = [];
    try {
      querySnapshot.forEach((doc) => {
        recipes.push({ docId: doc.id, ...doc.data() })
      });
      setSavedRecipes(recipes);
      setFilteredRecipes(recipes);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", String(err));
    }
  };

  const handleSearch = (keyword) => {
    setText(keyword);
    if (keyword.trim() === '') {
      setFilteredRecipes(savedRecipes);
    } else {
      const keyword_lower = keyword.toLowerCase();
      const filtered = savedRecipes.filter(recipe => 
        JSON.stringify(recipe).toLowerCase().includes(keyword_lower)
      );
      setFilteredRecipes(filtered);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getAllSavedRecipes();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>My Recipes</Text>
        <Text style={styles.recipeCount}>{filteredRecipes.length} recipes</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="🔍 Search recipes..."
          onChangeText={handleSearch}
          value={text}
          style={styles.input}
          returnKeyType="search"
          placeholderTextColor="#999"
        />
      </View>


      <FlatList
        style={styles.flatListContainer}
        data={filteredRecipes}
        keyExtractor={(item) => item.docId.toString()}
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
              <View style={styles.cardContent}>
                <Text style={styles.recipeTitle}>{item.title}</Text>
                <View style={styles.recipeMetaContainer}>
                  <Text style={styles.recipeTime}>⏱ {item.readyInMinutes} mins</Text>
                  {item.notes && <Text style={styles.recipeNotes}>✍️ {item.notes}</Text>}
                </View>
              </View>
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
    backgroundColor: '#eeeeee',
  },
  headerContainer: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  header: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  recipeCount: {
    fontSize: 14,
    color: '#999',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#eeeeee',
  },
  input: {
    width: '100%',
    height: 44,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    fontSize: 16,
    color: '#333',
  },
  flatListContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  recipeCard: {
    marginVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  recipeImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 14,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  recipeMetaContainer: {
    flexDirection: 'column',
    gap: 6,
  },
  recipeTime: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  recipeNotes: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
  },
});
