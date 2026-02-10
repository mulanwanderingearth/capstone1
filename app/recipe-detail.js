import { db, auth } from "@/firebase/config";
import { stripHtml } from '@/utils/htmlUtils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RecipeDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const recipe = JSON.parse(params.recipe);
  const recipeDetail = recipe;
  const [savedRecipeId, setSavedRecipeId] = useState(null);

  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        const userId = auth.currentUser?.uid;
        const q = query(
          collection(db, "users", userId, "savedRecipes"),
          where("id", "==", recipe.id)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setSavedRecipeId(snapshot.docs[0].id);
        }
      } catch (err) {
        console.log("Error checking saved recipe:", err);
      }
    };
    checkIfSaved();
  }, [recipe.id]);

  const isFromDatabase = !!savedRecipeId;

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
              const userId = auth.currentUser?.uid;
              await deleteDoc(doc(db, 'users', userId, 'savedRecipes', savedRecipeId))
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
      const userId = auth.currentUser?.uid;
      const ref = collection(db, "users", userId, "groceryItems");
      const writes = recipeDetail.extendedIngredients.map((item) =>
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
      )
      await Promise.all(writes);
      Alert.alert("You successfully added groceries!");

    } catch (err) {
      Alert.alert("Error", String(err));
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        {!isFromDatabase && (
          <TouchableOpacity
            onPress={() => router.push({
              pathname: '/add-recipe',
              params: { recipe: JSON.stringify(recipeDetail) }
            })}
          >
            <Text style={styles.addRecipeButton}>+ ADD THIS RECIPE</Text>
          </TouchableOpacity>
        )}
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

        <View style={styles.sourceContainer}>
          <Text style={styles.sourceIcon}>📖</Text>
          <Text style={styles.sourceText}>{recipe.sourceName}</Text>
        </View>

        <View style={styles.servingsContainer}>
          <Text style={styles.servingsIcon}>👥</Text>
          <Text style={styles.servingsText}>{recipe.servings} to {recipe.servings + 2} servings</Text>
        </View>

        <View style={styles.timeContainer}>
          <View style={styles.timeItem}>
            <Text style={styles.timeIcon}>⏱</Text>
            <Text style={styles.timeValue}>{recipe.preparationMinutes || 0}min</Text>
            <Text style={styles.timeLabel}>PREP</Text>
          </View>
          <View style={styles.timeItem}>
            <Text style={styles.timeIcon}>🍳</Text>
            <Text style={styles.timeValue}>{recipe.cookingMinutes || 0}min</Text>
            <Text style={styles.timeLabel}>COOK</Text>
          </View>
          <View style={styles.timeItem}>
            <Text style={styles.timeIcon}>⏰</Text>
            <Text style={styles.timeValue}>{recipe.readyInMinutes}min</Text>
            <Text style={styles.timeLabel}>TOTAL</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.cookButton]}>
            <View style={styles.playButton}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
            <Text style={styles.actionButtonText}>Start to Cook</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.groceriesButton]}
            onPress={async () => {
              await handleSaveGroceries();
            }}
          >
            <View style={styles.addButton}>
              <Text style={styles.addIcon}>+</Text>
            </View>
            <Text style={styles.actionButtonText}>Add Groceries</Text>
          </TouchableOpacity>
        </View>

        {recipe.summary && (
          <Text style={styles.summaryText}>{stripHtml(recipe.summary)}</Text>
        )}
        {recipeDetail?.categories && recipeDetail.categories !== null && (
          <>
            <Text style={styles.categoriesTitle}>CATEGORIES</Text>
            <Text style={styles.categoriesText}>{recipeDetail.categories}</Text>
          </>
        )}

        {recipeDetail?.extendedIngredients && recipeDetail.extendedIngredients.length > 0 && (
          <>
            <Text style={styles.ingredientsTitle}>INGREDIENTS</Text>
            {recipeDetail.extendedIngredients.map((item, index) => (
              <View key={index} style={styles.ingredientRow}>
                <Text style={styles.ingredientAmount}>{item.amount}</Text>
                <Text style={styles.ingredientUnit}>{item.unit}</Text>
                <Text style={styles.ingredientName}>{item.name}</Text>
              </View>
            ))}
          </>
        )}

        {recipeDetail?.analyzedInstructions && recipeDetail.analyzedInstructions.length > 0 && (
          <>
            <Text style={styles.instructionsTitle}>INSTRUCTIONS</Text>
            {recipeDetail.analyzedInstructions[0]?.steps.map((item) => (
              <View key={item.number} style={styles.instructionRow}>
                <Text style={styles.instructionNumber}>{item.number}</Text>
                <Text style={styles.instructionStep}>{item.step}</Text>
              </View>
            ))}
          </>
        )}

        {recipeDetail?.notes && recipeDetail.notes !== null && (
          <>
            <Text style={styles.notesTitle}>NOTES</Text>
            <Text style={styles.notesText}>{recipeDetail.notes}</Text>
          </>
        )}

        <View style={{ height: 40 }} />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    fontSize: 20,
    color: '#FF8C00',
    marginTop: 30,
    fontWeight: '800',
  },
  addRecipeButton: {
    fontSize: 14,
    color: '#FF8C00',
    marginTop: 30,
    fontWeight: '700',
  },
  menuButton: {
    fontSize: 24,
    color: '#FF8C00',
    marginTop: 30,
    fontWeight: '800',
  },
  recipeImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    padding: 15,
    paddingBottom: 10,
    lineHeight: 44,
    color: '#1a1a1a',
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 8,
  },
  sourceIcon: {
    marginRight: 8,
    fontSize: 18,
  },
  sourceText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  servingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 12,
  },
  servingsIcon: {
    marginRight: 8,
    fontSize: 18,
  },
  servingsText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 15,
  },
  timeItem: {
    alignItems: 'center',
  },
  timeIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  timeLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    gap: 12,
  },
  addRecipeLargeButton: {
    marginHorizontal: 15,
    marginVertical: 20,
    paddingVertical: 14,
    backgroundColor: '#FF8C00',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addRecipeLargeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF8C00',
    marginRight: 8,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  playIcon: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addIcon: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  adjustIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  adjustIcon: {
    fontSize: 16,
  },
  cookButton: {
    backgroundColor: '#ffffff',
    borderColor: '#eee',
  },
  groceriesButton: {
    backgroundColor: '#ffffff',
  },
  adjustButton: {
    backgroundColor: '#ffffff',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  actionItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  cookIconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cookIcon: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  groceryIconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  groceryIcon: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  actionTextButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 20,
    textAlign: 'justify',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 15,
  },
  ingredientsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF8C00',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    lineHeight: 24,
  },
  ingredientAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF8C00',
    marginRight: 4,
  },
  ingredientUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginRight: 4,
  },
  ingredientName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  ingredientNote: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  ingredient: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 8,
    lineHeight: 22,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF8C00',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    lineHeight: 24,
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF8C00',
    marginRight: 10,
    minWidth: 24,
  },
  instructionStep: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 24,
  },
  instruction: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 8,
    lineHeight: 22,
  },
  categoriesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF8C00',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  categoriesText: {
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    lineHeight: 24,
  },
  notesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF8C00',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    lineHeight: 24,
  },
});