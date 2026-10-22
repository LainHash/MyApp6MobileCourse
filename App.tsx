import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { LibraryProvider } from "./src/context/LibraryContext";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { RootStackParamList, MainTabParamList } from "./src/types/navigation";

// Screens
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import BooksScreen from "./src/screens/BooksScreen";
import BookDetailScreen from "./src/screens/BookDetailScreen";
import BookFormScreen from "./src/screens/BookFormScreen";
import ReadersScreen from "./src/screens/ReadersScreen";
import ReaderDetailScreen from "./src/screens/ReaderDetailScreen";
import ReaderFormScreen from "./src/screens/ReaderFormScreen";
import BorrowScreen from "./src/screens/BorrowScreen";
import CreateBorrowScreen from "./src/screens/CreateBorrowScreen";
import BorrowDetailScreen from "./src/screens/BorrowDetailScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#1E40AF" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "bold", fontSize: 17 },
        tabBarActiveTintColor: "#1E40AF",
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E2E8F0",
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: "Trang chủ",
          headerTitle: "Quản Lý Thư Viện",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="BooksTab"
        component={BooksScreen}
        options={{
          title: "Kho sách",
          headerTitle: "Quản Lý Kho Sách",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "book" : "book-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="BorrowsTab"
        component={BorrowScreen}
        options={{
          title: "Mượn / Trả",
          headerTitle: "Mượn Trả & Lịch Sử",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "receipt" : "receipt-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ReadersTab"
        component={ReadersScreen}
        options={{
          title: "Độc giả",
          headerTitle: "Quản Lý Độc Giả",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1E40AF",
        }}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text
          style={{
            marginTop: 14,
            color: "#FFFFFF",
            fontWeight: "600",
            fontSize: 15,
          }}
        >
          Đang khởi động hệ thống thư viện...
        </Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#1E40AF" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "bold", fontSize: 17 },
        headerBackTitle: "Trở lại",
      }}
    >
      {!isAuthenticated ? (
        // Unauthenticated Stack
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: "Đăng Ký Tài Khoản" }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={({ navigation }) => ({
              title: "Cấu Hình Kết Nối API",
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => {
                    if (navigation.canGoBack()) {
                      navigation.goBack();
                    } else {
                      navigation.navigate("Login");
                    }
                  }}
                  style={{ marginRight: 12, padding: 4 }}
                  accessibilityLabel="Quay lại"
                >
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              ),
            })}
          />
        </>
      ) : (
        // Authenticated Stack
        <>
          <Stack.Screen
            name="MainTabs"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BookDetail"
            component={BookDetailScreen}
            options={{ title: "Chi Tiết Sách" }}
          />
          <Stack.Screen
            name="BookForm"
            component={BookFormScreen}
            options={({ route }) => ({
              title: route.params?.book ? "Sửa Sách" : "Thêm Sách Mới",
            })}
          />
          <Stack.Screen
            name="ReaderDetail"
            component={ReaderDetailScreen}
            options={{ title: "Chi Tiết Độc Giả" }}
          />
          <Stack.Screen
            name="ReaderForm"
            component={ReaderFormScreen}
            options={({ route }) => ({
              title: route.params?.reader
                ? "Sửa Thông Tin Độc Giả"
                : "Thêm Độc Giả Mới",
            })}
          />
          <Stack.Screen
            name="CreateBorrow"
            component={CreateBorrowScreen}
            options={{ title: "Lập Phiếu Mượn Sách" }}
          />
          <Stack.Screen
            name="BorrowDetail"
            component={BorrowDetailScreen}
            options={{ title: "Chi Tiết Phiếu Mượn" }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: "Cấu Hình & Tài Khoản" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthProvider>
        <LibraryProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </LibraryProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
