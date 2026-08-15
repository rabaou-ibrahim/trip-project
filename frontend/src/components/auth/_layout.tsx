import { Stack } from 'expo-router';

export default function PrivateRoutesLayout() {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}