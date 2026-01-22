import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';

export default function RecipeDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const recipe = JSON.parse(params.recipe);
  const stripHtml = (html) => {
  return html
    .replace(/<[^>]*>/g, '')  
    .replace(/&nbsp;/g, ' ')  
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>ADD THIS RECIPE</Text>
        </TouchableOpacity>
      </View>


      <ScrollView>
        <Image
          source={{uri:recipe.image}}
          style={styles.recipeImage}
        />
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.text}>Serves:{recipe.servings}</Text>
        <Text style={styles.text}>Total time:{recipe.readyInMinutes} mins</Text>
        <Text style={styles.text}>{stripHtml(recipe.summary)} </Text>
        {/* <Text style={styles}>{recipe.analyzedInstructions}</Text> */}

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>Add Groceries</Text>
        </TouchableOpacity>

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

  text:{
  padding: 10,
  textAlign: 'justify',
  fontSize: 14,
  lineHeight: 20,
  }

});