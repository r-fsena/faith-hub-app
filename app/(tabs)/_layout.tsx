import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const primaryBrandColor = '#5bc3bb'; // Updated to primary logo icon color
  const isDark = theme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: primaryBrandColor,
        tabBarInactiveTintColor: isDark ? '#747c86' : '#8c949c',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: isDark ? '#2c3444' : '#f1f1f1', // Updated to exact logo background
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
      }}>
      
      {/* 1. Devocional (Left 1) */}
      <Tabs.Screen
        name="devotional"
        options={{
          title: 'Devocional',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Feather size={focused ? 26 : 24} name="sun" color={color} />
              {focused && <View style={[styles.activeDot, { backgroundColor: primaryBrandColor }]} />}
            </View>
          ),
        }}
      />
      
      {/* 2. Bíblia (Left 2) */}
      <Tabs.Screen
        name="bible"
        options={{
          title: 'Bíblia',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Feather size={focused ? 26 : 24} name="book" color={color} />
              {focused && <View style={[styles.activeDot, { backgroundColor: primaryBrandColor }]} />}
            </View>
          ),
        }}
      />

      {/* 3. Início - CENTRAL (Home) */}
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.centerButton, { backgroundColor: primaryBrandColor }]}>
              <Feather size={26} name="home" color="#FFFFFF" />
            </View>
          ),
          tabBarLabel: () => null, // Remove text to keep it just a clean floating button
        }}
      />

      {/* 4. Doar (Right 1) */}
      <Tabs.Screen
        name="donate"
        options={{
          title: 'Doar',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Feather size={focused ? 26 : 24} name="heart" color={color} />
              {focused && <View style={[styles.activeDot, { backgroundColor: primaryBrandColor }]} />}
            </View>
          ),
        }}
      />

      {/* 5. Menu / Células / Mais (Right 2) */}
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Feather size={focused ? 26 : 24} name="grid" color={color} />
              {focused && <View style={[styles.activeDot, { backgroundColor: primaryBrandColor }]} />}
            </View>
          ),
        }}
      />

      {/* Hidden Screens */}
      <Tabs.Screen
        name="explore"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="groups"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30, // Elevated over the bar
    shadowColor: '#5bc3bb', // Updated shadow drop color to match button
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    position: 'absolute',
    bottom: -8,
  }
});
