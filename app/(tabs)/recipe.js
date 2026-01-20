import { StyleSheet, Text, View } from "react-native";

export default function Receipe() {
    return (
    <View style={styles.container}>
        <Text>This is the page of my saved receipes page</Text>
    </View>);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "coral",
    },
    content: {

        fontSize: 40,

    }
})