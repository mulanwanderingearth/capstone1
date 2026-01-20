// import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import useTheme from "@/hooks/useTheme";
const TabsLayout = () => {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 90,
          paddingBottom: 30,
          paddingTop: 20,
        },
        tabBarLabelStyle: {
          fontSize: 18,
          fontWeight: "600",
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="recipe"
        options={{
          title: "Recipes",
          tabBarIcon: ({ color, size }) => <Ionicons name="menu" size={size} color={color}
          />
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color}
          />
        }}
      />
      <Tabs.Screen
        name="groceries"
        options={{
          title: "Groceries",
          tabBarIcon: ({ color, size }) => <Ionicons name="cart" size={size} color={color}
          />
        }}
      />

    </Tabs>

  )
}

export default TabsLayout