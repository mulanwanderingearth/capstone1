
import { StyleSheet, Text, View, Button, } from "react-native";
// import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// import { db } from "@/firebase/config"; 

export default function Recipe() {
    

    return (
        <View style={styles.container}>
            <Text>This is the page of my saved recipes page</Text>
            <Button title="Add recipe to firestore" />
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
