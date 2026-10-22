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

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { register, login } = useAuth();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"librarian" | "admin">("librarian");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập họ và tên của bạn");
      return false;
    }
    if (!username.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập tên đăng nhập");
      return false;
    }
    if (username.trim().length < 3) {
      Alert.alert("Thông báo", "Tên đăng nhập phải chứa ít nhất 3 ký tự");
      return false;
    }
    if (/\s/.test(username.trim())) {
      Alert.alert("Thông báo", "Tên đăng nhập không được chứa khoảng trắng");
      return false;
    }
    if (!password) {
      Alert.alert("Thông báo", "Vui lòng nhập mật khẩu");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Thông báo", "Mật khẩu phải chứa ít nhất 6 ký tự");
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("Thông báo", "Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.");
      return false;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert("Thông báo", "Địa chỉ email không đúng định dạng");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrorMessage(null);

      await register({
        full_name: fullName.trim(),
        username: username.trim(),
        password,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        role,
      });

      Alert.alert(
        "Đăng ký thành công!",
        `Tài khoản "${username.trim()}" đã được khởi tạo thành công. Bạn muốn đăng nhập ngay bây giờ?`,
        [
          {
            text: "Quay về Đăng nhập",
            style: "cancel",
            onPress: () => navigation.navigate("Login"),
          },
          {
            text: "Đăng nhập ngay",
            onPress: async () => {
              try {
                setLoading(true);
                await login({
                  username: username.trim(),
                  password,
                });
              } catch {
                Alert.alert("Thông báo", "Đăng ký thành công. Vui lòng đăng nhập lại.");
                navigation.navigate("Login");
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    } catch (err: any) {
      const msg = err.message || "Không thể tạo tài khoản. Vui lòng thử lại.";
      setErrorMessage(msg);
      Alert.alert("Lỗi đăng ký", msg);
    } finally {
      setLoading(false);
    }
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
            <Ionicons name="settings-outline" size={20} color="#1E40AF" />
            <Text style={styles.settingsBtnText}>Cấu hình API</Text>
          </TouchableOpacity>
        </View>

        {/* Brand / Logo */}
        <View style={styles.brandContainer}>
          <View style={styles.iconBadge}>
            <Ionicons name="person-add" size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.appTitle}>Tạo Tài Khoản Mới</Text>
          <Text style={styles.appSubtitle}>
            Đăng ký tài khoản thủ thư hoặc quản trị viên thư viện
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {errorMessage && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Họ và tên <Text style={styles.requiredMark}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#64748B"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Nguyễn Văn An"
                placeholderTextColor="#94A3B8"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          </View>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Tên đăng nhập <Text style={styles.requiredMark}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="at-outline"
                size={20}
                color="#64748B"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: thuthu_nam"
                placeholderTextColor="#94A3B8"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Role Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Vai trò trong hệ thống</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  role === "librarian" && styles.roleCardActive,
                ]}
                onPress={() => setRole("librarian")}
              >
                <Ionicons
                  name={role === "librarian" ? "radio-button-on" : "radio-button-off"}
                  size={18}
                  color={role === "librarian" ? "#1E40AF" : "#94A3B8"}
                />
                <Text
                  style={[
                    styles.roleCardText,
                    role === "librarian" && styles.roleCardTextActive,
                  ]}
                >
                  Thủ thư
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleCard,
                  role === "admin" && styles.roleCardActive,
                ]}
                onPress={() => setRole("admin")}
              >
                <Ionicons
                  name={role === "admin" ? "radio-button-on" : "radio-button-off"}
                  size={18}
                  color={role === "admin" ? "#1E40AF" : "#94A3B8"}
                />
                <Text
                  style={[
                    styles.roleCardText,
                    role === "admin" && styles.roleCardTextActive,
                  ]}
                >
                  Quản trị viên
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Mật khẩu (ít nhất 6 ký tự) <Text style={styles.requiredMark}>*</Text>
            </Text>
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

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Xác nhận mật khẩu <Text style={styles.requiredMark}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#64748B"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#94A3B8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Địa chỉ Email (tùy chọn)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#64748B"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: thuthu@thuvien.edu.vn"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Số điện thoại (tùy chọn)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="call-outline"
                size={20}
                color="#64748B"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: 0912345678"
                placeholderTextColor="#94A3B8"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
                <Text style={styles.registerBtnText}>Hoàn Tất Đăng Ký</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Link back to login */}
          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 30 }} />
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
    paddingTop: 10,
    paddingBottom: 30,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  topBarEmpty: {
    width: 40,
  },
  settingsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  settingsBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E40AF",
  },
  brandContainer: {
    alignItems: "center",
    marginVertical: 14,
  },
  iconBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: "#1E40AF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  appSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
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
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  requiredMark: {
    color: "#DC2626",
    fontWeight: "bold",
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
  roleRow: {
    flexDirection: "row",
    gap: 12,
  },
  roleCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  roleCardActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3B82F6",
  },
  roleCardText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  roleCardTextActive: {
    color: "#1E40AF",
    fontWeight: "700",
  },
  registerBtn: {
    flexDirection: "row",
    backgroundColor: "#1E40AF",
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  registerBtnDisabled: {
    opacity: 0.7,
  },
  registerBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  loginPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
  loginPromptText: {
    fontSize: 14,
    color: "#64748B",
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E40AF",
  },
});
