import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { serverUrl, setServerUrl, testConnection } = useLibrary();
  const { user, logout } = useAuth();

  const [urlInput, setUrlInput] = useState(
    serverUrl.replace(/\/api$/, "") || "http://10.0.2.2:8082/Mobile_CuoiKy_Api"
  );
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleLogout = () => {
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              // Điều hướng tự động về màn hình Đăng Nhập
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            } catch (err: any) {
              Alert.alert("Lỗi", "Không thể đăng xuất: " + err.message);
            }
          },
        },
      ]
    );
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await testConnection(urlInput);
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || "Lỗi kiểm tra kết nối" });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!urlInput.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập địa chỉ URL máy chủ API");
      return;
    }
    await setServerUrl(urlInput.trim());
    Alert.alert("Thành công", "Đã lưu và áp dụng địa chỉ máy chủ API mới!");
  };

  const setPreset = (presetUrl: string) => {
    setUrlInput(presetUrl);
    setTestResult(null);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Account Info Card (if logged in) or Guest Card with Login / Register buttons */}
      {user ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-circle" size={22} color="#1E40AF" />
            <Text style={styles.cardTitle}>Tài Khoản Đang Đăng Nhập</Text>
          </View>

          <View style={styles.accountProfileRow}>
            <View style={styles.accountAvatar}>
              <Text style={styles.accountAvatarText}>
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
            <View style={styles.accountDetails}>
              <Text style={styles.accountName}>{user.full_name}</Text>
              <Text style={styles.accountUsername}>@{user.username}</Text>
              <View style={styles.accountRoleBadge}>
                <Ionicons
                  name={user.role === "admin" ? "shield-checkmark" : "book"}
                  size={13}
                  color="#1E40AF"
                />
                <Text style={styles.accountRoleText}>
                  {user.role === "admin"
                    ? "Quản trị viên hệ thống"
                    : "Thủ thư quản lý"}
                </Text>
              </View>
            </View>
          </View>

          {user.email ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoVal}>{user.email}</Text>
            </View>
          ) : null}

          {user.phone ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số điện thoại:</Text>
              <Text style={styles.infoVal}>{user.phone}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#DC2626" />
            <Text style={styles.logoutBtnText}>Đăng Xuất</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-circle-outline" size={22} color="#64748B" />
            <Text style={styles.cardTitle}>Tài Khoản Hệ Thống</Text>
          </View>

          <View style={styles.guestContent}>
            <View style={styles.guestIconBadge}>
              <Ionicons name="lock-closed" size={24} color="#1E40AF" />
            </View>
            <View style={styles.guestTextContainer}>
              <Text style={styles.guestStatusText}>Bạn chưa đăng nhập</Text>
              <Text style={styles.guestDescText}>
                Đăng nhập hoặc đăng ký tài khoản để quản lý sách, độc giả và phiếu mượn.
              </Text>
            </View>
          </View>

          <View style={styles.guestBtnGroup}>
            <TouchableOpacity
              style={styles.guestLoginBtn}
              onPress={() => navigation.navigate("Login")}
            >
              <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
              <Text style={styles.guestLoginBtnText}>Đăng Nhập Ngay</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestRegisterBtn}
              onPress={() => navigation.navigate("Register")}
            >
              <Ionicons name="person-add-outline" size={18} color="#1E40AF" />
              <Text style={styles.guestRegisterBtnText}>Đăng Ký Tài Khoản</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="server" size={20} color="#1E40AF" />
          <Text style={styles.cardTitle}>Cấu Hình Máy Chủ API</Text>
        </View>

        <Text style={styles.helpText}>
          Nhập địa chỉ máy tính đang chạy XAMPP (Apache/PHP). Lưu ý: Thiết bị chạy Expo
          và máy chủ phải kết nối cùng một mạng Wi-Fi.
        </Text>

        <Text style={styles.inputLabel}>URL Base API:</Text>
        <TextInput
          style={styles.input}
          placeholder="http://10.0.2.2:8082/Mobile_CuoiKy_Api"
          value={urlInput}
          onChangeText={setUrlInput}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Quick Presets */}
        <Text style={styles.presetLabel}>Địa chỉ gợi ý:</Text>
        <View style={styles.presetRow}>
          <TouchableOpacity
            style={styles.presetChip}
            onPress={() => setPreset("http://10.0.2.2:8082/Mobile_CuoiKy_Api")}
          >
            <Text style={styles.presetChipText}>Emulator (10.0.2.2:8082)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.presetChip}
            onPress={() => setPreset("http://192.168.1.17:8082/Mobile_CuoiKy_Api")}
          >
            <Text style={styles.presetChipText}>LAN (192.168.1.17:8082)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.presetChip}
            onPress={() => setPreset("http://localhost:8082/Mobile_CuoiKy_Api")}
          >
            <Text style={styles.presetChipText}>Localhost:8082</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.presetChip}
            onPress={() => setPreset("http://192.168.2.17:8080/Mobile_CuoiKy_Api")}
          >
            <Text style={styles.presetChipText}>Cổng 8080</Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.testBtn}
            onPress={handleTest}
            disabled={testing}
          >
            {testing ? (
              <ActivityIndicator size="small" color="#1E40AF" />
            ) : (
              <>
                <Ionicons name="pulse-outline" size={16} color="#1E40AF" />
                <Text style={styles.testBtnText}>Kiểm Tra Kết Nối</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Ionicons name="save-outline" size={16} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>Lưu Cấu Hình</Text>
          </TouchableOpacity>
        </View>

        {/* Test Result Message */}
        {testResult && (
          <View
            style={[
              styles.resultBanner,
              testResult.success
                ? { backgroundColor: "#DCFCE7", borderColor: "#86EFAC" }
                : { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5" },
            ]}
          >
            <Ionicons
              name={testResult.success ? "checkmark-circle" : "close-circle"}
              size={18}
              color={testResult.success ? "#15803D" : "#DC2626"}
            />
            <Text
              style={[
                styles.resultText,
                { color: testResult.success ? "#15803D" : "#DC2626" },
              ]}
            >
              {testResult.message}
            </Text>
          </View>
        )}
      </View>

      {/* Database & API Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="information-circle-outline" size={20} color="#475569" />
          <Text style={styles.cardTitle}>Thông Tin Hệ Thống</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Database:</Text>
          <Text style={styles.infoVal}>library_db (MySQL)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mã nguồn Backend:</Text>
          <Text style={styles.infoVal}>Mobile_CuoiKy_Api (PHP)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Đường dẫn hiện tại:</Text>
          <Text style={[styles.infoVal, { color: "#1E40AF", fontSize: 12 }]} numberOfLines={2}>
            {serverUrl}
          </Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0F172A",
  },
  helpText: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: "#0F172A",
  },
  presetLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 10,
    marginBottom: 4,
  },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  presetChip: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  presetChipText: {
    fontSize: 11,
    color: "#334155",
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  testBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    height: 42,
    borderRadius: 6,
    gap: 6,
  },
  testBtnText: {
    color: "#1E40AF",
    fontWeight: "bold",
    fontSize: 13,
  },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E40AF",
    height: 42,
    borderRadius: 6,
    gap: 6,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  resultBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    gap: 8,
  },
  resultText: {
    fontSize: 12,
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F8FAFC",
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  infoVal: {
    fontSize: 13,
    fontWeight: "500",
    color: "#0F172A",
  },
  accountProfileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },
  accountAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1E40AF",
    justifyContent: "center",
    alignItems: "center",
  },
  accountAvatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
  },
  accountUsername: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 1,
  },
  accountRoleBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
    gap: 4,
  },
  accountRoleText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1E40AF",
  },
  logoutBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 14,
    gap: 6,
  },
  logoutBtnText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "600",
  },
  guestContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  guestIconBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
  guestTextContainer: {
    flex: 1,
  },
  guestStatusText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  guestDescText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 17,
  },
  guestBtnGroup: {
    flexDirection: "row",
    gap: 10,
  },
  guestLoginBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E40AF",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  guestLoginBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  guestRegisterBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  guestRegisterBtnText: {
    color: "#1E40AF",
    fontSize: 14,
    fontWeight: "700",
  },
});

