import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useAuth } from "../context/AuthContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập tên đăng nhập");
      return;
    }
    if (!password) {
      Alert.alert("Thông báo", "Vui lòng nhập mật khẩu");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      await login({
        username: username.trim(),
        password,
      });
      // Navigation is automatically handled or will switch to MainTabs
    } catch (err: any) {
      const msg = err.message || "Đăng nhập không thành công. Vui lòng kiểm tra lại.";
      setErrorMessage(msg);
      Alert.alert("Lỗi đăng nhập", msg);
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMessage(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Header Controls */}
        <View style={styles.topBar}>
          <View style={styles.topBarEmpty} />
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate("Settings")}
            accessibilityLabel="Cấu hình máy chủ API"
          >
            <Ionicons name="settings-outline" size={22} color="#1E40AF" />
            <Text style={styles.settingsBtnText}>Cấu hình API</Text>
          </TouchableOpacity>
        </View>

        {/* Brand / Logo */}
        <View style={styles.brandContainer}>
          <View style={styles.iconBadge}>
            <Ionicons name="library" size={44} color="#FFFFFF" />
          </View>
          <Text style={styles.appTitle}>Quản Lý Thư Viện</Text>
          <Text style={styles.appSubtitle}>
            Hệ thống quản lý sách, độc giả & mượn trả
          </Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Đăng Nhập Hệ Thống</Text>
          <Text style={styles.cardSubtitle}>
            Nhập tài khoản quản trị viên hoặc thủ thư để tiếp tục
          </Text>

          {errorMessage && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tên đăng nhập</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#64748B"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: admin hoặc thuthu01"
                placeholderTextColor="#94A3B8"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {username.length > 0 && (
                <TouchableOpacity onPress={() => setUsername("")}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mật khẩu</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#64748B"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
                <Text style={styles.loginBtnText}>Đăng Nhập</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Quick Demo Accounts */}
          <View style={styles.demoSection}>
            <Text style={styles.demoSectionTitle}>Tài khoản mẫu để thử nghiệm nhanh:</Text>
            <View style={styles.demoButtonsRow}>
              <TouchableOpacity
                style={styles.demoChip}
                onPress={() => fillQuickAccount("admin", "123456")}
              >
                <Ionicons name="shield-checkmark" size={14} color="#1E40AF" />
                <Text style={styles.demoChipText}>Admin (123456)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.demoChip}
                onPress={() => fillQuickAccount("thuthu01", "123456")}
              >
                <Ionicons name="book" size={14} color="#059669" />
                <Text style={[styles.demoChipText, { color: "#059669" }]}>
                  Thủ thư (123456)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Link to Register */}
          <View style={styles.registerPrompt}>
            <Text style={styles.registerPromptText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer info */}
        <Text style={styles.footerText}>
          Ứng Dụng Quản Lý Thư Viện • Phiên bản 1.0
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
    justifyContent: "center",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 20 : 15,
    marginBottom: 10,
  },
  topBarEmpty: {
    width: 40,
  },
  settingsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  settingsBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E40AF",
  },
  brandContainer: {
    alignItems: "center",
    marginVertical: 18,
  },
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#1E40AF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 14,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: 0.3,
  },
  appSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 18,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: "#DC2626",
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
  },
  loginBtn: {
    flexDirection: "row",
    backgroundColor: "#1E40AF",
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  demoSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  demoSectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 10,
  },
  demoButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  demoChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 6,
  },
  demoChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E40AF",
  },
  registerPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  registerPromptText: {
    fontSize: 14,
    color: "#64748B",
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E40AF",
  },
  footerText: {
    textAlign: "center",
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 24,
  },
});
