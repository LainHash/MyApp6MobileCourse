import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useLibrary } from "../context/LibraryContext";
import { Reader } from "../types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ReadersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { readers, fetchReaders, refreshing, loading } = useLibrary();

  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const handleSearch = () => {
    fetchReaders({
      search: searchText.trim(),
      status: selectedStatus,
    });
  };

  const handleStatusFilter = (status: string | null) => {
    setSelectedStatus(status);
    fetchReaders({
      search: searchText.trim(),
      status,
    });
  };

  const onRefresh = () => {
    fetchReaders({
      search: searchText.trim(),
      status: selectedStatus,
    });
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <View style={[styles.badge, { backgroundColor: "#DCFCE7" }]}>
            <Text style={[styles.badgeText, { color: "#15803D" }]}>
              Hoạt động
            </Text>
          </View>
        );
      case "expired":
        return (
          <View style={[styles.badge, { backgroundColor: "#FEF3C7" }]}>
            <Text style={[styles.badgeText, { color: "#B45309" }]}>
              Hết hạn thẻ
            </Text>
          </View>
        );
      case "locked":
        return (
          <View style={[styles.badge, { backgroundColor: "#FEE2E2" }]}>
            <Text style={[styles.badgeText, { color: "#B91C1C" }]}>
              Đang bị khóa
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  const renderReaderItem = ({ item }: { item: Reader }) => {
    return (
      <TouchableOpacity
        style={styles.readerCard}
        onPress={() =>
          navigation.navigate("ReaderDetail", { readerId: item.id })
        }
      >
        <Image
          source={{
            uri:
              item.avatar ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
          }}
          style={styles.avatar}
        />
        <View style={styles.readerContent}>
          <View style={styles.topRow}>
            <Text style={styles.readerName} numberOfLines={1}>
              {item.name}
            </Text>
            {renderStatusBadge(item.status)}
          </View>

          <Text style={styles.readerCardNum}>Mã thẻ: {item.card_number}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoText}>
              <Ionicons name="call-outline" size={12} color="#64748B" />{" "}
              {item.phone}
            </Text>
            <Text style={styles.infoText}>
              <Ionicons name="calendar-outline" size={12} color="#64748B" />{" "}
              Hạn: {item.expiry_date}
            </Text>
          </View>

          {item.email ? (
            <Text style={styles.emailText} numberOfLines={1}>
              <Ionicons name="mail-outline" size={11} color="#94A3B8" />{" "}
              {item.email}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputWrap}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên, mã thẻ, số ĐT..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchText("");
                fetchReaders({ status: selectedStatus });
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
        <TouchableOpacity
          style={[
            styles.tabItem,
            selectedStatus === null && styles.tabItemActive,
          ]}
          onPress={() => handleStatusFilter(null)}
        >
          <Text
            style={[
              styles.tabItemText,
              selectedStatus === null && styles.tabItemTextActive,
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabItem,
            selectedStatus === "active" && styles.tabItemActive,
          ]}
          onPress={() => handleStatusFilter("active")}
        >
          <Text
            style={[
              styles.tabItemText,
              selectedStatus === "active" && styles.tabItemTextActive,
            ]}
          >
            Đang hoạt động
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabItem,
            selectedStatus === "expired" && styles.tabItemActive,
          ]}
          onPress={() => handleStatusFilter("expired")}
        >
          <Text
            style={[
              styles.tabItemText,
              selectedStatus === "expired" && styles.tabItemTextActive,
            ]}
          >
            Hết hạn
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabItem,
            selectedStatus === "locked" && styles.tabItemActive,
          ]}
          onPress={() => handleStatusFilter("locked")}
        >
          <Text
            style={[
              styles.tabItemText,
              selectedStatus === "locked" && styles.tabItemTextActive,
            ]}
          >
            Bị khóa
          </Text>
        </TouchableOpacity>
      </View>

      {/* Readers List */}
      {loading && !refreshing ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text style={styles.loadingText}>Đang tải danh sách độc giả...</Text>
        </View>
      ) : (
        <FlatList
          data={readers}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderReaderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#1E40AF"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="people-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Không tìm thấy độc giả nào</Text>
              <Text style={styles.emptySub}>
                Kiểm tra lại từ khóa tìm kiếm hoặc bấm Thêm độc giả mới
              </Text>
            </View>
          }
        />
      )}

      {/* Add Reader FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("ReaderForm", {})}
      >
        <Ionicons name="person-add" size={24} color="#FFFFFF" />
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
  },
  tabItemActive: {
    backgroundColor: "#1E40AF",
  },
  tabItemText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  tabItemTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  listContainer: {
    padding: 12,
    paddingBottom: 80,
  },
  readerCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E2E8F0",
  },
  readerContent: {
    flex: 1,
    marginLeft: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  readerName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0F172A",
    flex: 1,
    marginRight: 6,
  },
  readerCardNum: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "600",
    marginTop: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  infoText: {
    fontSize: 12,
    color: "#64748B",
  },
  emailText: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 3,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
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
