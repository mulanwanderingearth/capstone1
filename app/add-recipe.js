import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View , Alert} from 'react-native';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { stripHtml } from './utils/htmlUtils';

export default function AddRecipe() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const recipe = params.recipe ? JSON.parse(params.recipe) : {};
  const [savedRecipe, setSavedRecipe] = useState(() => ({
    ...recipe,
    summary: stripHtml(recipe.summary),
  }));
  const handleChange=(field, value)=>{
    setSavedRecipe(prev => ({
        ...prev,
        [field]:value
    }))};


 const handleSave = async() => {
    try {
            const userId = "testUser";
            const ref = collection(db, "users", userId, "savedRecipes");
            const cleanData = {
              id: savedRecipe.id,
              title: savedRecipe.title,
              image: savedRecipe.image,
              servings: savedRecipe.servings || null,
              sourceName: savedRecipe.sourceName,
              preparationMinutes: savedRecipe.preparationMinutes || null,
              cookingMinutes: savedRecipe.cookingMinutes || null,
              readyInMinutes: savedRecipe.readyInMinutes || null,
              summary: savedRecipe.summary,
              extendedIngredients: savedRecipe.extendedIngredients || [],
              analyzedInstructions:savedRecipe.analyzedInstructions || [],
              notes: savedRecipe.notes || null,
              createdAt: serverTimestamp(),
            };
            
            await addDoc(ref, cleanData)
            Alert.alert("Success", `You just saved a recipe! `);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", String(err));
        }}
 
 
  return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => {
                    router.back();
            }}>
                 <Text style={styles.headerButton}>CANCEL</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => {
                    router.push({ pathname: '/recipe'})
                    handleSave();}
                }>
                    <Text style={styles.headerButton}>SAVE THIS RECIPE</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
                <View style={styles.field}>
                    <Text style={styles.label}>IMAGES</Text>
                    <TextInput style={styles.input} />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>TITLE</Text>
                    <TextInput style={styles.input}
                    value={savedRecipe.title || ''} 
                    onChangeText={(value)=> handleChange('title',value)}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>SOURCE</Text>
                    <TextInput style={styles.input}
                    value={savedRecipe.sourceName || ''}
                    onChangeText={(value)=> handleChange('sourceName',value)}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>SERVINGS</Text>
                    <TextInput style={styles.input} keyboardType="numeric"
                    value={savedRecipe.servings?.toString() || ''}
                    onChangeText={(value)=> handleChange('servings',value)}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>PREP TIME</Text>
                    <TextInput style={styles.input} keyboardType="numeric"
                    value={savedRecipe.preparationMinutes?.toString() || ''}
                    onChangeText={(value)=> handleChange('preparationMinutes',value)}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>COOK TIME</Text>
                    <TextInput style={styles.input} keyboardType="numeric"
                    value={savedRecipe.cookingMinutes?.toString() || ''}
                    onChangeText={(value)=> handleChange('cookingMinutes',value)}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>TOTAL TIME</Text>
                    <TextInput style={styles.input} keyboardType="numeric"
                    value={savedRecipe.readyInMinutes?.toString() || ''}
                    onChangeText={(value)=> handleChange('readyInMinutes',value)}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>DESCRIPTION</Text>
                    <TextInput style={styles.input} multiline={true} numberOfLines={15}
                    value={savedRecipe.summary || ''}
                    onChangeText={(value)=> handleChange('summary',value)}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>INGREDIENTS</Text>
                    <TextInput style={styles.input} multiline={true} numberOfLines={12}
                    value={savedRecipe.extendedIngredients?.map(item => item.original).join('\n') || ''}
                    onChangeText={(value)=> handleChange('extendedIngredients',value)}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>INSTRUCTIONS</Text>
                    <TextInput style={styles.input} multiline={true} numberOfLines={12}
                    value={savedRecipe.analyzedInstructions?.[0]?.steps.map(item =>
          `${item.number}. ${item.step}`).join('\n') || ''}
                    onChangeText={(value)=> handleChange('analyzedInstructions',value)}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>NOTES</Text>
                    <TextInput style={styles.input} multiline={true} numberOfLines={12}
                    value={savedRecipe.notes || ''}
                    onChangeText={(value)=> handleChange('notes',value)}
                    />
                </View>

               
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'coral',
    },
    header: {  
      flexDirection: 'row',          
      justifyContent: 'space-between', 
      alignItems: 'center',           
      paddingTop: 10,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',

    },
    headerButton: {
        fontSize: 18,
        color: '#007AFF',
        marginTop: 30
    },
    scrollView: {
        flex: 1,
        padding: 15,
    },
    field: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        backgroundColor: 'white',
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