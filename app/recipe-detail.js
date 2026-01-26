import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { useState, useEffect } from "react";
import axios from "axios";


// const router = useRouter();
const apiUrl = process.env.EXPO_PUBLIC_API_URL
const apiKey = process.env.EXPO_PUBLIC_API_KEY

export default function RecipeDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const recipe = JSON.parse(params.recipe);

  const [recipeDetail, setRecipeDetail] = useState();

  const stripHtml = (html) => {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
  };

  useEffect(() => {
    const getRecipeDetail = () => {
      return axios.get(`${apiUrl}/${recipe.id}/information`, { params: { apiKey } })
        .then(response => setRecipeDetail(response.data))
        .catch(error => console.log(error));
    }
    getRecipeDetail()
  }, [recipe.id])


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push({
          pathname: '/add-recipe',
          params: { recipe: JSON.stringify(recipeDetail) }
        })}>
          <Text style={styles.backButton}>ADD THIS RECIPE</Text>
        </TouchableOpacity>
      </View>


      <ScrollView>
        <Image
          source={{ uri: recipe.image }}
          style={styles.recipeImage}
        />
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.text}>📖  {recipe.sourceName}</Text>
        <Text style={styles.text}>👥 Serves:{recipe.servings}</Text>
        <Text style={styles.text}>⏰Total time:{recipe.readyInMinutes} mins</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>Add Groceries</Text>
        </TouchableOpacity>
        <Text style={styles.text}>{stripHtml(recipe.summary)} </Text>
        <Text style={styles.text}>🧂Ingredients:{'\n'}{recipeDetail?.extendedIngredients?.map(item => item.original).join('\n')}</Text>
        <Text style={styles.text}>👨‍🍳 Instructions:{'\n'}{recipeDetail?.analyzedInstructions?.[0]?.steps.map(item =>
          `${item.number}. ${item.step}`).join('\n')}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'coral',
  },
  header: {

    paddingTop: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center'

  },
  backButton: {
    fontSize: 18,
    color: '#007AFF',
    marginTop: 30
  },
  recipeImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 15,
  },

  text: {
    padding: 10,
    textAlign: 'justify',
    fontSize: 14,
    lineHeight: 20,
  }

});