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
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useLibrary } from "../context/LibraryContext";

type RouteProps = RouteProp<RootStackParamList, "ReaderForm">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const getDefaultExpiry = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
};

const getDefaultCardNum = () => {
  const year = new Date().getFullYear();
  const suffix = Date.now().toString().slice(-4);
  return `DG-${year}${suffix}`;
};

export default function ReaderFormScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const reader = route.params?.reader;
  const isEditing = Boolean(reader);

  const { createReader, updateReader } = useLibrary();

  const [name, setName] = useState(reader?.name || "");
  const [cardNumber, setCardNumber] = useState(reader?.card_number || "");

  const [phone, setPhone] = useState(reader?.phone || "");
  const [email, setEmail] = useState(reader?.email || "");
  const [gender, setGender] = useState(reader?.gender || "Nam");
  const [expiryDate, setExpiryDate] = useState(reader?.expiry_date || getDefaultExpiry());
  const [status, setStatus] = useState<string>(reader?.status || "active");
  const [avatar, setAvatar] = useState(reader?.avatar || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ và tên độc giả");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
      return;
    }

    const finalCardNumber = cardNumber.trim() || getDefaultCardNum();

    const payload = {
      name: name.trim(),
      card_number: finalCardNumber,
      phone: phone.trim(),
      email: email.trim() || undefined,
      gender,
      expiry_date: expiryDate.trim(),
      status,
      avatar: avatar.trim() || undefined,
    };

    try {
      setSubmitting(true);
      if (isEditing && reader) {
        await updateReader({ id: reader.id, ...payload });
        Alert.alert("Thành công", "Đã cập nhật thông tin độc giả");
      } else {
        await createReader(payload);
        Alert.alert("Thành công", "Đã thêm độc giả mới thành công");
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Lỗi", err.message || "Không thể lưu độc giả");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formCard}>
        {/* Name */}
        <Text style={styles.label}>Họ và Tên <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="VD: Nguyễn Văn A"
          value={name}
          onChangeText={setName}
        />

        {/* Card Number & Phone */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Mã Thẻ <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="VD: DG-2026..."
              value={cardNumber}
              onChangeText={setCardNumber}
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Số Điện Thoại <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="0912..."
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        </View>

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Gender Selection */}
        <Text style={styles.label}>Giới Tính</Text>
        <View style={styles.choiceRow}>
          {["Nam", "Nữ", "Khác"].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.choiceBtn, gender === g && styles.choiceBtnActive]}
              onPress={() => setGender(g)}
            >
              <Text
                style={[
                  styles.choiceText,
                  gender === g && styles.choiceTextActive,
                ]}
              >
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Expiry Date */}
        <Text style={styles.label}>Ngày Hết Hạn Thẻ (YYYY-MM-DD) <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="2027-12-31"
          value={expiryDate}
          onChangeText={setExpiryDate}
        />

        {/* Status */}
        <Text style={styles.label}>Trạng Thái Thẻ</Text>
        <View style={styles.choiceRow}>
          {[
            { key: "active", label: "Hoạt động" },
            { key: "locked", label: "Khóa thẻ" },
            { key: "expired", label: "Hết hạn" },
          ].map((st) => (
            <TouchableOpacity
              key={st.key}
              style={[styles.choiceBtn, status === st.key && styles.choiceBtnActive]}
              onPress={() => setStatus(st.key)}
            >
              <Text
                style={[
                  styles.choiceText,
                  status === st.key && styles.choiceTextActive,
                ]}
              >
                {st.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Avatar URL */}
        <Text style={styles.label}>Link Ảnh Đại Diện (Avatar URL)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://..."
          autoCapitalize="none"
          value={avatar}
          onChangeText={setAvatar}
        />

        {/* Submit */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSave}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>
              {isEditing ? "Cập Nhật Thông Tin Độc Giả" : "Lưu Độc Giả Mới"}
            </Text>
          )}
        </TouchableOpacity>
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
  formCard: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginTop: 10,
    marginBottom: 4,
  },
  required: {
    color: "#DC2626",
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 14,
    color: "#0F172A",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  col: {
    flex: 1,
  },
  choiceRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  choiceBtn: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    paddingVertical: 9,
    borderRadius: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  choiceBtnActive: {
    backgroundColor: "#1E40AF",
    borderColor: "#1E40AF",
  },
  choiceText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  choiceTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  submitBtn: {
    backgroundColor: "#1E40AF",
    borderRadius: 8,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});
