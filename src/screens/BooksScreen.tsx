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
import { Book } from "../types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BooksScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { books, categories, fetchBooks, refreshing, loading } = useLibrary();

  const [searchText, setSearchText] = useState("");
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const handleSearch = () => {
    fetchBooks({
      search: searchText.trim(),
      category_id: selectedCatId,
      status: selectedStatus,
    });
  };

  const handleCategorySelect = (catId: number | null) => {
    setSelectedCatId(catId);
    fetchBooks({
      search: searchText.trim(),
      category_id: catId,
      status: selectedStatus,
    });
  };

  const handleStatusSelect = (status: string | null) => {
    setSelectedStatus(status);
    fetchBooks({
      search: searchText.trim(),
      category_id: selectedCatId,
      status,
    });
  };

  const onRefresh = () => {
    fetchBooks({
      search: searchText.trim(),
      category_id: selectedCatId,
      status: selectedStatus,
    });
  };

  const renderBookItem = ({ item }: { item: Book }) => {
    const isAvailable = (item.available_copies ?? 0) > 0;

    return (
      <TouchableOpacity
        style={styles.bookCard}
        onPress={() => navigation.navigate("BookDetail", { bookId: item.id })}
      >
        <Image
          source={{
            uri:
              item.image_url ||
              "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300",
          }}
          style={styles.bookCover}
        />
        <View style={styles.bookContent}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>
            Tác giả: {item.author}
          </Text>

          <View style={styles.badgeRow}>
            {item.category_name ? (
              <View style={styles.catBadge}>
                <Text style={styles.catBadgeText}>{item.category_name}</Text>
              </View>
            ) : null}

            <View
              style={[
                styles.stockBadge,
                { backgroundColor: isAvailable ? "#DCFCE7" : "#FEE2E2" },
              ]}
            >
              <Text
                style={[
                  styles.stockBadgeText,
                  { color: isAvailable ? "#15803D" : "#B91C1C" },
                ]}
              >
                {isAvailable
                  ? `Còn ${item.available_copies}/${item.total_copies}`
                  : "Hết sách"}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              <Ionicons name="location-outline" size={12} color="#64748B" />{" "}
              {item.location || "Chưa xếp"}
            </Text>
            {item.isbn ? (
              <Text style={styles.metaText} numberOfLines={1}>
                ISBN: {item.isbn}
              </Text>
            ) : null}
          </View>
        </View>
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
            placeholder="Tìm tên sách, tác giả, ISBN..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchText("");
                fetchBooks({ category_id: selectedCatId, status: selectedStatus });
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
      <View style={styles.filtersWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: null, name: "Tất cả thể loại" }, ...categories]}
          keyExtractor={(item) => String(item.id ?? "all")}
          renderItem={({ item }) => {
            const isSelected = selectedCatId === item.id;
            return (
              <TouchableOpacity
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => handleCategorySelect(item.id as number | null)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.filterList}
        />

        {/* Availability Toggle */}
        <View style={styles.statusToggleRow}>
          <TouchableOpacity
            style={[
              styles.statusChip,
              selectedStatus === null && styles.statusChipActive,
            ]}
            onPress={() => handleStatusSelect(null)}
          >
            <Text
              style={[
                styles.statusChipText,
                selectedStatus === null && styles.statusChipTextActive,
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.statusChip,
              selectedStatus === "available" && styles.statusChipActive,
            ]}
            onPress={() => handleStatusSelect("available")}
          >
            <Text
              style={[
                styles.statusChipText,
                selectedStatus === "available" && styles.statusChipTextActive,
              ]}
            >
              Còn sách
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.statusChip,
              selectedStatus === "out_of_stock" && styles.statusChipActive,
            ]}
            onPress={() => handleStatusSelect("out_of_stock")}
          >
            <Text
              style={[
                styles.statusChipText,
                selectedStatus === "out_of_stock" && styles.statusChipTextActive,
              ]}
            >
              Hết sách
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Books List */}
      {loading && !refreshing ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text style={styles.loadingText}>Đang tải danh sách sách...</Text>
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderBookItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1E40AF"]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="book-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Không tìm thấy sách nào</Text>
              <Text style={styles.emptySub}>
                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc thể loại
              </Text>
            </View>
          }
        />
      )}

      {/* Add Book FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("BookForm", {})}
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
  filtersWrapper: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 8,
  },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 6,
  },
  filterChip: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterChipActive: {
    backgroundColor: "#1E40AF",
  },
  filterChipText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  statusToggleRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 4,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statusChipActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },
  statusChipText: {
    fontSize: 11,
    color: "#64748B",
  },
  statusChipTextActive: {
    color: "#2563EB",
    fontWeight: "600",
  },
  listContainer: {
    padding: 12,
    paddingBottom: 80,
  },
  bookCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  bookCover: {
    width: 65,
    height: 90,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
  },
  bookContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F172A",
    lineHeight: 18,
  },
  bookAuthor: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  catBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  catBadgeText: {
    fontSize: 10,
    color: "#1D4ED8",
  },
  stockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  metaText: {
    fontSize: 11,
    color: "#94A3B8",
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
