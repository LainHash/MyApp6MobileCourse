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
  Button,
  Image,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useLibrary } from "../context/LibraryContext";
import * as ImagePicker from "expo-image-picker";

type RouteProps = RouteProp<RootStackParamList, "BookForm">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BookFormScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const book = route.params?.book;
  const isEditing = Boolean(book);

  const { categories, createBook, updateBook } = useLibrary();

  const [title, setTitle] = useState(book?.title || "");
  const [author, setAuthor] = useState(book?.author || "");
  const [categoryId, setCategoryId] = useState<number>(
    book?.category_id || (categories.length > 0 ? categories[0].id : 1),
  );
  const [isbn, setIsbn] = useState(book?.isbn || "");
  const [publisher, setPublisher] = useState(book?.publisher || "");
  const [publishYear, setPublishYear] = useState(
    book?.publish_year ? String(book.publish_year) : "",
  );
  const [totalCopies, setTotalCopies] = useState(
    book?.total_copies ? String(book.total_copies) : "1",
  );
  const [location, setLocation] = useState(book?.location || "Kệ A-01");
  const [price, setPrice] = useState(book?.price ? String(book.price) : "0");
  const [imageUrl, setImageUrl] = useState(book?.image_url || "");
  const [description, setDescription] = useState(book?.description || "");
  const [submitting, setSubmitting] = useState(false);

  const handlePickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Thông báo", "Chưa cấp quyền truy cập thư viện ảnh");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUrl(result.assets[0].uri);
      }
    } catch (err: any) {
      Alert.alert("Lỗi", err.message || String(err));
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Thông báo", "Chưa cấp quyền máy ảnh");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUrl(result.assets[0].uri);
      }
    } catch (err: any) {
      Alert.alert("Lỗi", err.message || String(err));
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên sách");
      return;
    }
    if (!author.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên tác giả");
      return;
    }
    const copiesNum = parseInt(totalCopies, 10);
    if (isNaN(copiesNum) || copiesNum < 1) {
      Alert.alert("Lỗi", "Số lượng sách phải lớn hơn hoặc bằng 1");
      return;
    }

    const payload = {
      title: title.trim(),
      author: author.trim(),
      category_id: categoryId,
      isbn: isbn.trim() || undefined,
      publisher: publisher.trim() || undefined,
      publish_year: publishYear ? parseInt(publishYear, 10) : undefined,
      total_copies: copiesNum,
      location: location.trim() || "Kệ A-01",
      price: price ? parseFloat(price) : 0,
      image_url: imageUrl.trim() || undefined,
      description: description.trim() || undefined,
    };

    try {
      setSubmitting(true);
      if (isEditing && book) {
        await updateBook({ id: book.id, ...payload });
        Alert.alert("Thành công", "Đã cập nhật thông tin sách");
      } else {
        await createBook(payload);
        Alert.alert("Thành công", "Đã thêm sách mới thành công");
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(
        "Lỗi lưu sách",
        err.message || "Không thể lưu thông tin sách",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formCard}>
        {/* Title */}
        <Text style={styles.label}>
          Tên Sách <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tên sách..."
          value={title}
          onChangeText={setTitle}
        />

        {/* Author */}
        <Text style={styles.label}>
          Tác Giả <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tên tác giả..."
          value={author}
          onChangeText={setAuthor}
        />

        {/* Category Selector */}
        <Text style={styles.label}>
          Thể Loại Sách <Text style={styles.required}>*</Text>
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catScroll}
        >
          {categories.map((c) => {
            const isSelected = categoryId === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.catOption,
                  isSelected && styles.catOptionSelected,
                ]}
                onPress={() => setCategoryId(c.id)}
              >
                <Text
                  style={[
                    styles.catOptionText,
                    isSelected && styles.catOptionTextSelected,
                  ]}
                >
                  {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Two Columns: Total Copies & Location */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>
              Số Lượng <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: 5"
              keyboardType="number-pad"
              value={totalCopies}
              onChangeText={setTotalCopies}
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Vị Trí Kệ</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Kệ B2-01"
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        {/* Two Columns: ISBN & Price */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Mã ISBN</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 978-604..."
              value={isbn}
              onChangeText={setIsbn}
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Giá Tiền (VNĐ)</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 150000"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
        </View>

        {/* Two Columns: Publisher & Year */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Nhà Xuất Bản</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: NXB Trẻ"
              value={publisher}
              onChangeText={setPublisher}
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Năm Xuất Bản</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 2024"
              keyboardType="number-pad"
              value={publishYear}
              onChangeText={setPublishYear}
            />
          </View>
        </View>

        {/* Image URL */}
        <Text style={styles.label}>Ảnh Bìa</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Button title="Chọn ảnh từ thiết bị" onPress={handlePickImage} />
          </View>
          <View style={styles.col}>
            <Button title="Chụp ảnh từ camera" onPress={handleTakePhoto} />
          </View>
        </View>
        {imageUrl && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: imageUrl }} style={styles.image} />
          </View>
        )}

        {/* Description */}
        <Text style={styles.label}>Mô Tả Nội Dung</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tóm tắt nội dung cuốn sách..."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        {/* Save Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSave}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>
              {isEditing ? "Cập Nhật Thông Tin Sách" : "Lưu Sách Mới"}
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
  textArea: {
    height: 90,
    textAlignVertical: "top",
    paddingTop: 8,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  col: {
    flex: 1,
  },
  catScroll: {
    flexDirection: "row",
    marginBottom: 4,
  },
  catOption: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  catOptionSelected: {
    backgroundColor: "#1E40AF",
    borderColor: "#1E40AF",
  },
  catOptionText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
  },
  catOptionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  submitBtn: {
    backgroundColor: "#1E40AF",
    borderRadius: 8,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  imagePreview: {
    marginTop: 12,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#FFFFFF",
  },
  image: {
    width: 140,
    height: 180,
    resizeMode: "cover",
    borderRadius: 6,
  },
});
