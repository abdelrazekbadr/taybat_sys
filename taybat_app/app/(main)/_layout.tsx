import { Stack } from 'expo-router';
import React from 'react';

import { AuthGateSheet } from '@/components/auth/AuthGateSheet';

export default function MainLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="select-meal" />
        <Stack.Screen name="meal-detail" />
        <Stack.Screen name="topics" />
        <Stack.Screen name="topic-detail" />
        <Stack.Screen name="stats" />
        <Stack.Screen name="community" />
        <Stack.Screen name="account" />
        <Stack.Screen name="meal-preferences" />
        <Stack.Screen name="user-profile" />
        <Stack.Screen name="meal-history" />
      </Stack>
      <AuthGateSheet />
    </>
  );
}
