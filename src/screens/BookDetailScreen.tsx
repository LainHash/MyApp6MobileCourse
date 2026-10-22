import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useLibrary } from "../context/LibraryContext";
import { Book } from "../types";
import { bookService } from "../services/bookService";

type RouteProps = RouteProp<RootStackParamList, "BookDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BookDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { bookId } = route.params;
  const { deleteBook } = useLibrary();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await bookService.getBookDetail(bookId);
        if (isMounted) setBook(data);
      } catch (e: any) {
        if (isMounted)
          Alert.alert("Lỗi", e.message || "Không thể tải chi tiết sách");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [bookId]);

  const handleDelete = () => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa cuốn sách "${book?.title}"? Hành động này không thể hoàn tác.`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa sách",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteBook(bookId);
              Alert.alert("Thành công", "Đã xóa sách khỏi thư viện");
              navigation.goBack();
            } catch (err: any) {
              Alert.alert("Lỗi xóa sách", err.message);
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={styles.loadingText}>Đang tải chi tiết sách...</Text>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
        <Text style={styles.notFoundText}>
          Không tìm thấy thông tin cuốn sách này.
        </Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isAvailable = (book.available_copies ?? 0) > 0;

  return (
    <ScrollView style={styles.container}>
      {/* Cover and Primary Header */}
      <View style={styles.coverSection}>
        <Image
          source={{
            uri:
              book.image_url ||
              "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
          }}
          style={styles.bookCover}
        />
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>Tác giả: {book.author}</Text>
        {book.category_name ? (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{book.category_name}</Text>
          </View>
        ) : null}
      </View>

      {/* Stock Cards */}
      <View style={styles.stockRow}>
        <View style={styles.stockBox}>
          <Text style={styles.stockNum}>{book.total_copies ?? 0}</Text>
          <Text style={styles.stockLabel}>Tổng số bản</Text>
        </View>
        <View style={styles.stockBox}>
          <Text
            style={[
              styles.stockNum,
              { color: isAvailable ? "#15803D" : "#DC2626" },
            ]}
          >
            {book.available_copies ?? 0}
          </Text>
          <Text style={styles.stockLabel}>Khả dụng</Text>
        </View>
        <View style={styles.stockBox}>
          <Text style={[styles.stockNum, { color: "#F59E0B" }]}>
            {book.borrowed_copies ?? book.total_copies - book.available_copies}
          </Text>
          <Text style={styles.stockLabel}>Đang mượn</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={[
            styles.borrowBtn,
            !isAvailable && { backgroundColor: "#94A3B8" },
          ]}
          disabled={!isAvailable}
          onPress={() =>
            navigation.navigate("CreateBorrow", { preselectedBookId: book.id })
          }
        >
          <Ionicons name="cart-outline" size={18} color="#FFFFFF" />
          <Text style={styles.borrowBtnText}>
            {isAvailable ? "Lập Phiếu Mượn" : "Đã Hết Sách"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate("BookForm", { book })}
        >
          <Ionicons name="create-outline" size={18} color="#1E40AF" />
          <Text style={styles.editBtnText}>Chỉnh Sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#DC2626" />
          ) : (
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          )}
        </TouchableOpacity>
      </View>

      {/* Detailed Info Table */}
      <View style={styles.detailsCard}>
        <Text style={styles.sectionHeader}>Thông Tin Chi Tiết</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Vị trí kệ sách:</Text>
          <Text style={styles.infoVal}>{book.location || "Chưa xếp kệ"}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mã ISBN:</Text>
          <Text style={styles.infoVal}>{book.isbn || "Không có"}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nhà xuất bản:</Text>
          <Text style={styles.infoVal}>
            {book.publisher || "Chưa cập nhật"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Năm xuất bản:</Text>
          <Text style={styles.infoVal}>{book.publish_year || "Chưa rõ"}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Giá trị sách:</Text>
          <Text style={styles.infoVal}>
            {book.price
              ? `${Number(book.price).toLocaleString("vi-VN")} đ`
              : "0 đ"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tổng lượt mượn:</Text>
          <Text style={styles.infoVal}>
            {book.total_borrow_count ?? 0} lượt
          </Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.detailsCard}>
        <Text style={styles.sectionHeader}>Mô Tả Nội Dung</Text>
        <Text style={styles.descriptionText}>
          {book.description || "Chưa có mô tả chi tiết cho cuốn sách này."}
        </Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 10,
    color: "#64748B",
    fontSize: 14,
  },
  notFoundText: {
    marginTop: 10,
    fontSize: 15,
    color: "#64748B",
  },
  backBtn: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#1E40AF",
    borderRadius: 6,
  },
  backBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  coverSection: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  bookCover: {
    width: 120,
    height: 170,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#E2E8F0",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
    textAlign: "center",
  },
  author: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
  },
  categoryBadge: {
    marginTop: 8,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: "#1D4ED8",
    fontSize: 12,
    fontWeight: "600",
  },
  stockRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  stockBox: {
    flex: 1,
    alignItems: "center",
  },
  stockNum: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
  },
  stockLabel: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  borrowBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#1E40AF",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  borrowBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 4,
  },
  editBtnText: {
    color: "#1E40AF",
    fontWeight: "600",
    fontSize: 13,
  },
  deleteBtn: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 6,
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
  descriptionText: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 20,
  },
});
