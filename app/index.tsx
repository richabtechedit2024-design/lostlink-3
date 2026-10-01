import { Redirect } from "expo-router";

// The root layout's listener handles the real redirect logic based on
// auth state; this just gives expo-router a valid initial route.
export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
