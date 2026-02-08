import { db, storage } from "@/firebase/config";
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { stripHtml } from '../utils/htmlUtils';

export default function AddRecipe() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const recipe = params.recipe ? JSON.parse(params.recipe) : {};
    const isEditing = !!recipe.docId;
    const [savedRecipe, setSavedRecipe] = useState(() => ({
        ...recipe,
        summary: stripHtml(recipe.summary),
    }));

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Permission to access the media library is required.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) {
            await uploadImage(result.assets[0].uri);
        };
    };
    const uploadImage = async (uri) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        const userId = "testUser";
        const filename = `users/${userId}/recipes/${Date.now()}.jpg`;
        const storageRef = ref(storage, filename);
        await uploadBytes(storageRef, blob);
        const downloadUrl = await getDownloadURL(storageRef);
        handleChange('image', downloadUrl);
    };
    const handleChange = (field, value) => {
        setSavedRecipe(prev => ({
            ...prev,
            [field]: value
        }))
    };

     const getIngredientsText = () => {
        const data = savedRecipe.extendedIngredients;
        if (!data) return '';
        if (typeof data === 'string') return data;
        if (Array.isArray(data)) return data.map(item => item.original).join('\n');
        return '';
    };

    const getInstructionsText = () => {
        const data = savedRecipe.analyzedInstructions;
        if (!data) return '';
        if (typeof data === 'string') return data;
        if (Array.isArray(data) && data[0]?.steps) {
            return data[0].steps.map(item => `${item.number}. ${item.step}`).join('\n');
        }
        return '';
    };

    const handleSave = async () => {
        try {
            const userId = "testUser";
            const ref = collection(db, "users", userId, "savedRecipes");
            
            let ingredients = savedRecipe.extendedIngredients;
            if (typeof ingredients === 'string') {
                ingredients = ingredients.split('\n').filter(line => line.trim()).map(line => ({
                    original: line.trim()
                }));
            }

            let instructions = savedRecipe.analyzedInstructions;
            if (typeof instructions === 'string') {
                const steps = instructions.split('\n').filter(line => line.trim()).map((line, index) => ({
                    number: index + 1,
                    step: line.replace(/^\d+\.\s*/, '').trim()
                }));
                instructions = [{ steps }];
            }
            
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
                extendedIngredients: ingredients || [],
                analyzedInstructions: instructions || [],
                notes: savedRecipe.notes || null,
                createdAt: serverTimestamp(),
            };

            if (isEditing) {
                await updateDoc(doc(db, 'users', 'testUser', 'savedRecipes', recipe.docId), cleanData);
                Alert.alert("Success! You update a recipe!")
                router.push('./(tabs)/recipe');
            } else {

                await addDoc(ref, cleanData)
                router.back();
                Alert.alert("Success", `You just saved a recipe! `);
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Error", String(err));
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        router.back();
                    }}>
                    <Text style={styles.headerButton}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        handleSave();
                    }}>
                    <Text style={styles.headerButton}>SAVE THIS RECIPE</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
                <View style={styles.field}>
                    <Text style={styles.label}>IMAGES</Text>
                    <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
                        {savedRecipe.image ? (
                            <View>
                                <Image source={{ uri: savedRecipe.image }} style={styles.image} />
                                <View style={styles.imageOverlay}>
                                    <Text style={styles.imageOverlayText}>Tap to change</Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.placeholder}>
                                <Text style={styles.addImageIcon}>+</Text>
                                <Text style={styles.addImageText}>Add Image</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>TITLE</Text>
                    <TextInput style={styles.input}
                        value={savedRecipe.title || ''}
                        onChangeText={(value) => handleChange('title', value)}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>SOURCE</Text>
                    <TextInput style={styles.input}
                        value={savedRecipe.sourceName || ''}
                        onChangeText={(value) => handleChange('sourceName', value)}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>SERVINGS</Text>
                    <TextInput style={styles.input} keyboardType="numeric"
                        value={savedRecipe.servings?.toString() || ''}
                        onChangeText={(value) => handleChange('servings', value)}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>PREP TIME</Text>
                    <TextInput style={styles.input} keyboardType="numeric"
                        value={savedRecipe.preparationMinutes?.toString() || ''}
                        onChangeText={(value) => handleChange('preparationMinutes', value)}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>COOK TIME</Text>
                    <TextInput style={styles.input} keyboardType="numeric"
                        value={savedRecipe.cookingMinutes?.toString() || ''}
                        onChangeText={(value) => handleChange('cookingMinutes', value)}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>TOTAL TIME</Text>
                    <TextInput style={styles.input} keyboardType="numeric"
                        value={savedRecipe.readyInMinutes?.toString() || ''}
                        onChangeText={(value) => handleChange('readyInMinutes', value)}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>DESCRIPTION</Text>
                    <TextInput style={styles.input} multiline={true} numberOfLines={15}
                        value={savedRecipe.summary || ''}
                        onChangeText={(value) => handleChange('summary', value)}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>INGREDIENTS</Text>
                    <TextInput style={styles.input} multiline={true} numberOfLines={12}
                        value={getIngredientsText()}
                        onChangeText={(value) => handleChange('extendedIngredients', value)}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>INSTRUCTIONS</Text>
                    <TextInput style={styles.input} multiline={true} numberOfLines={12}
                        value={getInstructionsText()}
                        onChangeText={(value) => handleChange('analyzedInstructions', value)}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>NOTES</Text>
                    <TextInput style={styles.input} multiline={true} numberOfLines={12}
                        value={savedRecipe.notes || ''}
                        onChangeText={(value) => handleChange('notes', value)}
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
    image: {
        width: 120,
        height: 120,
        borderRadius: 8,
    },
    imageBox: {
        width: 120,
        height: 120,
        borderRadius: 8,
        overflow: 'hidden',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 4,
    },
    imageOverlayText: {
        color: 'white',
        fontSize: 10,
        textAlign: 'center',
    },
    placeholder: {
        width: 120,
        height: 120,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addImageIcon: {
        fontSize: 30,
        color: 'rgba(255,255,255,0.5)',
    },
    addImageText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 5,
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