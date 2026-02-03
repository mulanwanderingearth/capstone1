import { db } from "@/firebase/config";
import { stripHtml } from '@/utils/htmlUtils';
import axios from "axios";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const apiUrl = process.env.EXPO_PUBLIC_API_URL
const apiKey = process.env.EXPO_PUBLIC_API_KEY

export default function RecipeDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const recipe = JSON.parse(params.recipe);
  const isFromDatabase = !!recipe.docId;
  const [recipeDetail, setRecipeDetail] = useState();
  const [isRecipeSaved, setIsRecipeSaved] = useState(null);

  const showMenu = () => {
    Alert.alert(
      'Menu',
      'Choose an action',
      [
        {
          text: 'Edit',
          onPress: () => handleEdit(recipeDetail.docId),
        },
        {
          text: 'Delete',
          onPress: handleDelete,

          style: 'destructive'
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ])
  }
  const handleEdit = async () => {
    router.push({
      pathname: './add-recipe',
      params: { recipe: JSON.stringify(recipe) }
    });
  }
  const handleDelete = () => {
    Alert.alert(
      'Are you sure you want to delete this recipe?',
      '',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', 'testUser', 'savedRecipes', recipe.docId))
              Alert.alert('Successfully deleted!')
              router.back();
            } catch (err) {
              Alert.alert('Error', String(err));
            }
          },
          style: 'distructive'
        }
      ]
    )
  }
  const handleSaveGroceries = async () => {
    try {
      const userId = "testUser";
      const ref = collection(db, "users", userId, "groceryItems");
      const writes = recipeDetail.extendedIngredients.map((item) => {
        addDoc(ref, {
          recipeId: recipe.id,
          recipeTitle: recipe.title,
          ingredient: item.original,
          name: item.name,
          amount: item.amount,
          unit: item.unit,
          checked: false,
          createdAt: serverTimestamp(),
        })
      })
      await Promise.all(writes);
      Alert.alert("You successfully added groceries!");

    } catch (err) {
      Alert.alert("Error", String(err));
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        const response = await axios.get(`${apiUrl}/${recipe.id}/information`, { params: { apiKey } });
        setRecipeDetail(response.data);
      } catch (error) {
        console.log(error);
      }

      try {
        const querySnapshot = await getDocs(collection(db, "users", "testUser", "savedRecipes"));
        const found = querySnapshot.docs.find((doc) => doc.data().id === recipe.id);
        setIsRecipeSaved(!!found);
      } catch (err) {
        console.error(err);
        Alert.alert("Error", String(err));
      }
    };

    init();
  }, [recipe.id]);


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        {!isFromDatabase && !isRecipeSaved &&
          <TouchableOpacity
            onPress={() => router.push({
              pathname: '/add-recipe',
              params: { recipe: JSON.stringify(recipeDetail) }
            })}>
            <Text style={styles.backButton}>ADD THIS RECIPE</Text>
          </TouchableOpacity>}
        {isFromDatabase && (
          <TouchableOpacity onPress={() => showMenu()}>
            <Text style={styles.menuButton}>⋯</Text>
          </TouchableOpacity>
        )}
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
        {recipeDetail && (
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: '/groceries',
                params: {
                  groceryItems: JSON.stringify(recipeDetail.extendedIngredients)

                }
              })
              handleSaveGroceries();
            }}
          >
            <Text style={styles.backButton}>Add Groceries</Text>
          </TouchableOpacity>)}

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
  menuButton: {
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