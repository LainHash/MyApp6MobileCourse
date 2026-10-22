import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useLibrary } from "../context/LibraryContext";
import { BorrowRecord } from "../types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BorrowScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { borrows, fetchBorrows, returnBorrow, refreshing, loading } = useLibrary();

  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [returningId, setReturningId] = useState<number | null>(null);

  const handleSearch = () => {
    fetchBorrows({
      search: searchText.trim(),
      status: selectedStatus === "all" ? null : selectedStatus,
    });
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    fetchBorrows({
      search: searchText.trim(),
      status: status === "all" ? null : status,
    });
  };

  const onRefresh = () => {
    fetchBorrows({
      search: searchText.trim(),
      status: selectedStatus === "all" ? null : selectedStatus,
    });
  };

  const handleQuickReturn = (record: BorrowRecord) => {
    const isOverdue = record.status === "overdue";
    const promptMsg = isOverdue
      ? `Phiếu mượn này đã QUÁ HẠN. Bạn có muốn xác nhận thu hồi và tính tiền phạt không?`
      : `Xác nhận độc giả ${record.reader_name} đã hoàn trả sách?`;

    Alert.alert("Xác nhận trả sách", promptMsg, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xác nhận trả",
        onPress: async () => {
          try {
            setReturningId(record.id);
            await returnBorrow({
              borrow_id: record.id,
              condition_note: "Đã trả sách",
            });
            Alert.alert("Thành công", "Đã cập nhật trạng thái trả sách hoàn tất!");
          } catch (err: any) {
            Alert.alert("Lỗi trả sách", err.message);
          } finally {
            setReturningId(null);
          }
        },
      },
    ]);
  };

  const renderStatusBadge = (record: BorrowRecord) => {
    switch (record.status) {
      case "returned":
        return (
          <View style={[styles.badge, { backgroundColor: "#DCFCE7" }]}>
            <Text style={[styles.badgeText, { color: "#15803D" }]}>Đã trả sách</Text>
          </View>
        );
      case "overdue":
        return (
          <View style={[styles.badge, { backgroundColor: "#FEE2E2" }]}>
            <Text style={[styles.badgeText, { color: "#B91C1C" }]}>
              Quá hạn {record.days_overdue ? `(${record.days_overdue} ngày)` : ""}
            </Text>
          </View>
        );
      case "borrowing":
      default:
        return (
          <View style={[styles.badge, { backgroundColor: "#EFF6FF" }]}>
            <Text style={[styles.badgeText, { color: "#1D4ED8" }]}>Đang mượn</Text>
          </View>
        );
    }
  };

  const renderBorrowItem = ({ item }: { item: BorrowRecord }) => {
    const isReturned = item.status === "returned";
    const isProcessing = returningId === item.id;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("BorrowDetail", { borrowId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.codeRow}>
            <Ionicons name="receipt-outline" size={16} color="#1E40AF" />
            <Text style={styles.codeText}>{item.borrow_code}</Text>
          </View>
          {renderStatusBadge(item)}
        </View>

        <View style={styles.divider} />

        <View style={styles.readerRow}>
          <Text style={styles.readerName}>{item.reader_name}</Text>
          <Text style={styles.cardNum}>{item.reader_card_number}</Text>
        </View>

        <View style={styles.datesRow}>
          <Text style={styles.dateLabel}>
            Ngày mượn: <Text style={styles.dateVal}>{item.borrow_date?.split(" ")[0]}</Text>
          </Text>
          <Text style={styles.dateLabel}>
            Hạn trả: <Text style={[styles.dateVal, item.status === "overdue" && { color: "#DC2626", fontWeight: "bold" }]}>{item.due_date?.split(" ")[0]}</Text>
          </Text>
        </View>

        {isReturned && item.return_date && (
          <Text style={styles.returnedDate}>
            Ngày trả thực tế: {item.return_date.split(" ")[0]}
          </Text>
        )}

        {item.notes ? (
          <Text style={styles.notesText} numberOfLines={1}>
            Ghi chú: {item.notes}
          </Text>
        ) : null}

        {/* Action Bottom Row */}
        {!isReturned && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.returnBtn}
              onPress={() => handleQuickReturn(item)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
                  <Text style={styles.returnBtnText}>Xác Nhận Trả Sách</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputWrap}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm mã phiếu, độc giả, SĐT..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchText("");
                fetchBorrows({ status: selectedStatus === "all" ? null : selectedStatus });
              }}
            >
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Tìm</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {[
          { key: "all", label: "Tất cả" },
          { key: "borrowing", label: "Đang mượn" },
          { key: "overdue", label: "Quá hạn" },
          { key: "returned", label: "Đã trả" },
        ].map((tab) => {
          const isActive = selectedStatus === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => handleStatusFilter(tab.key)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      {loading && !refreshing ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text style={styles.loadingText}>Đang tải danh sách phiếu mượn...</Text>
        </View>
      ) : (
        <FlatList
          data={borrows}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderBorrowItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1E40AF"]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="receipt-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Chưa có phiếu mượn nào</Text>
              <Text style={styles.emptySub}>
                Bấm nút (+) bên dưới để tạo phiếu mượn mới
              </Text>
            </View>
          }
        />
      )}

      {/* Add Borrow FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreateBorrow", {})}
      >
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  searchHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
    gap: 8,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 42,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    height: "100%",
  },
  searchBtn: {
    backgroundColor: "#1E40AF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    borderRadius: 8,
    height: 42,
  },
  searchBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  filterTabs: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 6,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  tabItemActive: {
    backgroundColor: "#1E40AF",
  },
  tabText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  listContainer: {
    padding: 12,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  codeText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1E40AF",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 8,
  },
  readerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  readerName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0F172A",
  },
  cardNum: {
    fontSize: 12,
    color: "#64748B",
  },
  datesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  dateLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  dateVal: {
    color: "#0F172A",
    fontWeight: "500",
  },
  returnedDate: {
    fontSize: 11,
    color: "#15803D",
    marginTop: 4,
    fontWeight: "500",
  },
  notesText: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 4,
    fontStyle: "italic",
  },
  actionRow: {
    marginTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#F1F5F9",
    paddingTop: 8,
  },
  returnBtn: {
    backgroundColor: "#16A34A",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 7,
    borderRadius: 6,
    gap: 6,
  },
  returnBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  loadingWrap: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#64748B",
    fontSize: 13,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#64748B",
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 4,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#1E40AF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
