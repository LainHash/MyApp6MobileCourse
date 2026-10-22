import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { stats, loading, refreshing, refreshAll, error } = useLibrary();
  const { user } = useAuth();

  const bookStats = stats?.books;
  const readerStats = stats?.readers;
  const borrowStats = stats?.borrows;
  const topBooks = stats?.top_books || [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshAll} colors={["#1E40AF"]} />
      }
    >
      {/* Header Info */}
      <View style={styles.header}>
        <View style={styles.headerUserInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
            </Text>
          </View>
          <View style={styles.headerTextContainer}>
            <View style={styles.greetingRow}>
              <Text style={styles.headerSubtitle}>Xin chào,</Text>
              <View
                style={[
                  styles.roleBadge,
                  user?.role === "admin"
                    ? styles.roleBadgeAdmin
                    : styles.roleBadgeLibrarian,
                ]}
              >
                <Text
                  style={[
                    styles.roleBadgeText,
                    user?.role === "admin"
                      ? styles.roleBadgeTextAdmin
                      : styles.roleBadgeTextLibrarian,
                  ]}
                >
                  {user?.role === "admin" ? "Quản trị viên" : "Thủ thư"}
                </Text>
              </View>
            </View>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {user?.full_name || "Thủ thư"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="settings-outline" size={24} color="#1E40AF" />
        </TouchableOpacity>
      </View>

      {/* Error message banner if any */}
      {error && (
        <TouchableOpacity
          style={styles.errorBanner}
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="alert-circle" size={20} color="#DC2626" />
          <Text style={styles.errorText} numberOfLines={2}>
            {error} (Nhấn để cấu hình IP API)
          </Text>
        </TouchableOpacity>
      )}

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text style={styles.loadingText}>Đang tải dữ liệu từ máy chủ...</Text>
        </View>
      ) : (
        <>
          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderLeftColor: "#2563EB" }]}>
              <View style={styles.statIconWrap}>
                <Ionicons name="book" size={22} color="#2563EB" />
              </View>
              <Text style={styles.statValue}>{bookStats?.total_titles ?? 0}</Text>
              <Text style={styles.statLabel}>Tổng đầu sách</Text>
              <Text style={styles.statSub}>
                {bookStats?.available_copies ?? 0} bản khả dụng
              </Text>
            </View>

            <View style={[styles.statCard, { borderLeftColor: "#10B981" }]}>
              <View style={[styles.statIconWrap, { backgroundColor: "#ECFDF5" }]}>
                <Ionicons name="people" size={22} color="#10B981" />
              </View>
              <Text style={styles.statValue}>{readerStats?.total_readers ?? 0}</Text>
              <Text style={styles.statLabel}>Độc giả</Text>
              <Text style={styles.statSub}>
                {readerStats?.active_readers ?? 0} đang hoạt động
              </Text>
            </View>

            <View style={[styles.statCard, { borderLeftColor: "#F59E0B" }]}>
              <View style={[styles.statIconWrap, { backgroundColor: "#FFFBEB" }]}>
                <Ionicons name="time" size={22} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>{borrowStats?.current_borrowing ?? 0}</Text>
              <Text style={styles.statLabel}>Đang mượn</Text>
              <Text style={styles.statSub}>Chưa hoàn trả</Text>
            </View>

            <View style={[styles.statCard, { borderLeftColor: "#EF4444" }]}>
              <View style={[styles.statIconWrap, { backgroundColor: "#FEF2F2" }]}>
                <Ionicons name="alert-circle" size={22} color="#EF4444" />
              </View>
              <Text style={[styles.statValue, { color: "#EF4444" }]}>
                {borrowStats?.current_overdue ?? 0}
              </Text>
              <Text style={styles.statLabel}>Quá hạn</Text>
              <Text style={styles.statSub}>Cần thu hồi</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Chức Năng Nhanh</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate("CreateBorrow", {})}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#DBEAFE" }]}>
                <Ionicons name="add-circle" size={28} color="#2563EB" />
              </View>
              <Text style={styles.actionText}>Lập Phiếu Mượn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate("BookForm", {})}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#EDE9FE" }]}>
                <Ionicons name="book-outline" size={28} color="#7C3AED" />
              </View>
              <Text style={styles.actionText}>Thêm Sách Mới</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate("ReaderForm", {})}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#DCFCE7" }]}>
                <Ionicons name="person-add-outline" size={28} color="#15803D" />
              </View>
              <Text style={styles.actionText}>Thêm Độc Giả</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate("Settings")}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#F3F4F6" }]}>
                <Ionicons name="server-outline" size={28} color="#4B5563" />
              </View>
              <Text style={styles.actionText}>Cấu Hình API</Text>
            </TouchableOpacity>
          </View>

          {/* Top Borrowed Books */}
          {topBooks.length > 0 && (
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionTitle}>Sách Mượn Nhiều Nhất</Text>
              {topBooks.map((book) => (
                <TouchableOpacity
                  key={book.id}
                  style={styles.topBookCard}
                  onPress={() => navigation.navigate("BookDetail", { bookId: book.id })}
                >
                  <Image
                    source={{
                      uri:
                        book.image_url ||
                        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200",
                    }}
                    style={styles.topBookImg}
                  />
                  <View style={styles.topBookInfo}>
                    <Text style={styles.topBookTitle} numberOfLines={1}>
                      {book.title}
                    </Text>
                    <Text style={styles.topBookAuthor} numberOfLines={1}>
                      Tác giả: {book.author}
                    </Text>
                    <View style={styles.topBookMeta}>
                      <Text style={styles.topBookBadge}>
                        {book.category_name || "Sách"}
                      </Text>
                      <Text style={styles.topBookCount}>
                        Đã mượn: {book.borrow_count} lượt
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1E40AF",
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerTextContainer: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  roleBadgeAdmin: {
    backgroundColor: "#EFF6FF",
    borderWidth: 0.5,
    borderColor: "#93C5FD",
  },
  roleBadgeLibrarian: {
    backgroundColor: "#ECFDF5",
    borderWidth: 0.5,
    borderColor: "#A7F3D0",
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  roleBadgeTextAdmin: {
    color: "#1E40AF",
  },
  roleBadgeTextLibrarian: {
    color: "#059669",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
  },
  settingsBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#991B1B",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingTop: 16,
    gap: 8,
  },
  statCard: {
    width: "48.5%",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F172A",
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginTop: 2,
  },
  statSub: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  actionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  actionItem: {
    alignItems: "center",
    width: "23%",
  },
  actionIcon: {
    width: 54,
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  actionText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#334155",
    textAlign: "center",
  },
  sectionWrap: {
    marginTop: 10,
    marginBottom: 24,
  },
  topBookCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  topBookImg: {
    width: 45,
    height: 60,
    borderRadius: 4,
    backgroundColor: "#F1F5F9",
  },
  topBookInfo: {
    flex: 1,
    marginLeft: 12,
  },
  topBookTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  topBookAuthor: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  topBookMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  topBookBadge: {
    fontSize: 10,
    backgroundColor: "#E0F2FE",
    color: "#0369A1",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  topBookCount: {
    fontSize: 11,
    color: "#F59E0B",
    fontWeight: "500",
  },
});
