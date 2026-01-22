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
import { db } from "@/firebase/config"; // 路径按你项目结构调整

export default function Recipe() {
  const testWrite = async () => {
    try {
      const userId = "testUser";

      const ref = collection(db, "users", userId, "savedRecipes");

      const docRef = await addDoc(ref, {
        title: "Test Recipe",
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", `Saved with id: ${docRef.id}`);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", String(err));
    }
  };

  return (
    <View style={styles.container}>
      <Text>This is the page of my saved recipes page</Text>
      <Button title="Test Firestore Write" onPress={testWrite} />
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
