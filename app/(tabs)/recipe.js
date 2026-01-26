// import { StyleSheet, Text, View } from "react-native";

// export default function Receipe() {
//     return (
//     <View style={styles.container}>
//         <Text>This is the page of my saved receipes page</Text>
//     </View>);
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//         backgroundColor: "coral",
//     },
//     content: {

//         fontSize: 40,

//     }
// })
import { StyleSheet, Text, View, Button, Alert } from "react-native";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config"; 

export default function Recipe() {
    const testWrite = async () => {
        try {
            const userId = "testUser";

            const ref = collection(db, "users", userId, "savedRecipes");

            const docRef = await addDoc(ref, {
                title: 1,
                createdAt: serverTimestamp(),
                "image": "https://img.spoonacular.com/recipes/715446-312x231.jpg",
                "imageType": "jpg",
                "readyInMinutes": 490,
                "servings": 6,
                "sourceUrl": "https://www.pinkwhen.com/slow-cooker-beef-stew-recipe/",
                "vegetarian": false,
                "vegan": false,
                "glutenFree": true,
                "dairyFree": true,
                "veryHealthy": true,
                "cheap": false,
                "veryPopular": false,
                "sustainable": false,
                "lowFodmap": false,
                "weightWatcherSmartPoints": 10,
                "gaps": "no",
                "preparationMinutes": 10,
                "cookingMinutes": 480,
                "aggregateLikes": 57,
                "healthScore": 100.0,
            });

            Alert.alert("Success", `You just saved a recipe! Saved with id: ${docRef.id} `);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", String(err));
        }
    };

    return (
        <View style={styles.container}>
            <Text>This is the page of my saved recipes page</Text>
            <Button title="Add recipe to firestore" onPress={testWrite} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "coral",
    },
});
