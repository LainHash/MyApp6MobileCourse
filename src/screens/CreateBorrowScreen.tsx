import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext";

type RouteProps = RouteProp<RootStackParamList, "CreateBorrow">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CreateBorrowScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { preselectedBookId, preselectedReaderId } = route.params || {};

  const { readers, books, createBorrow } = useLibrary();
  const { user } = useAuth();

  const [selectedReaderId, setSelectedReaderId] = useState<number | null>(
    preselectedReaderId || null
  );
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>(
    preselectedBookId ? [preselectedBookId] : []
  );

  const calculateDueDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  const [loanDays, setLoanDays] = useState<number>(14);
  const [dueDate, setDueDate] = useState<string>(calculateDueDate(14));
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const handleSelectDays = (days: number) => {
    setLoanDays(days);
    setDueDate(calculateDueDate(days));
  };

  const toggleBookSelection = (bookId: number) => {
    if (selectedBookIds.includes(bookId)) {
      setSelectedBookIds(selectedBookIds.filter((id) => id !== bookId));
    } else {
      setSelectedBookIds([...selectedBookIds, bookId]);
    }
  };

  const handleCreate = async () => {
    if (!selectedReaderId) {
      Alert.alert("Lỗi", "Vui lòng chọn độc giả mượn sách");
      return;
    }
    if (selectedBookIds.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất 1 cuốn sách để mượn");
      return;
    }

    try {
      setSubmitting(true);
      await createBorrow({
        reader_id: selectedReaderId,
        books: selectedBookIds.map((id) => ({ book_id: id, quantity: 1 })),
        due_date: dueDate,
        notes: notes.trim() || undefined,
        created_by: user?.full_name || "Thủ thư",
      });
      Alert.alert("Thành công", "Đã tạo phiếu mượn sách thành công!");
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Lỗi tạo phiếu mượn", err.message || "Không thể tạo phiếu mượn");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter active readers
  const validReaders = readers.filter((r) => r.status === "active");

  return (
    <ScrollView style={styles.container}>
      {/* 1. Chọn Độc Giả */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          1. Chọn Độc Giả <Text style={styles.required}>*</Text>
        </Text>
        <Text style={styles.sectionSubtitle}>
          Chỉ độc giả có thẻ đang hoạt động mới được mượn
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          {validReaders.map((r) => {
            const isSelected = selectedReaderId === r.id;
            return (
              <TouchableOpacity
                key={r.id}
                style={[styles.readerChip, isSelected && styles.readerChipSelected]}
                onPress={() => setSelectedReaderId(r.id)}
              >
                <Ionicons
                  name={isSelected ? "checkmark-circle" : "person-outline"}
                  size={16}
                  color={isSelected ? "#FFFFFF" : "#1E40AF"}
                />
                <View>
                  <Text
                    style={[
                      styles.readerChipName,
                      isSelected && styles.readerChipTextSelected,
                    ]}
                  >
                    {r.name}
                  </Text>
                  <Text
                    style={[
                      styles.readerChipCard,
                      isSelected && styles.readerChipTextSelected,
                    ]}
                  >
                    {r.card_number}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 2. Chọn Sách Mượn */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            2. Chọn Sách Cần Mượn <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.selectedCount}>
            Đã chọn: {selectedBookIds.length} cuốn
          </Text>
        </View>

        <View style={styles.bookList}>
          {books.map((b) => {
            const isAvailable = (b.available_copies ?? 0) > 0;
            const isSelected = selectedBookIds.includes(b.id);

            return (
              <TouchableOpacity
                key={b.id}
                style={[
                  styles.bookSelectCard,
                  isSelected && styles.bookSelectCardActive,
                  !isAvailable && styles.bookSelectCardDisabled,
                ]}
                disabled={!isAvailable}
                onPress={() => toggleBookSelection(b.id)}
              >
                <Ionicons
                  name={
                    isSelected
                      ? "checkbox"
                      : isAvailable
                      ? "square-outline"
                      : "ban"
                  }
                  size={22}
                  color={
                    isSelected
                      ? "#1E40AF"
                      : isAvailable
                      ? "#94A3B8"
                      : "#DC2626"
                  }
                />
                <View style={styles.bookSelectInfo}>
                  <Text style={styles.bookSelectTitle} numberOfLines={1}>
                    {b.title}
                  </Text>
                  <Text style={styles.bookSelectAuthor} numberOfLines={1}>
                    {b.author} • {b.location || "Chưa xếp kệ"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.stockPill,
                    { backgroundColor: isAvailable ? "#DCFCE7" : "#FEE2E2" },
                  ]}
                >
                  <Text
                    style={[
                      styles.stockPillText,
                      { color: isAvailable ? "#15803D" : "#B91C1C" },
                    ]}
                  >
                    {isAvailable ? `Còn ${b.available_copies}` : "Hết"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Thời Hạn Mượn */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>3. Thời Hạn Mượn Sách</Text>
        <View style={styles.daysRow}>
          {[7, 14, 21, 30].map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.dayBtn, loanDays === d && styles.dayBtnActive]}
              onPress={() => handleSelectDays(d)}
            >
              <Text
                style={[styles.dayBtnText, loanDays === d && styles.dayBtnTextActive]}
              >
                {d} ngày
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.dueDateNotice}>
          Hạn trả sách dự kiến: <Text style={styles.dueDateText}>{dueDate}</Text>
        </Text>
      </View>

      {/* 4. Ghi Chú */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>4. Ghi Chú</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Nhập ghi chú mượn sách nếu có..."
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleCreate}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Xác Nhận Tạo Phiếu Mượn</Text>
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
  sectionCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F172A",
  },
  sectionSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    marginBottom: 8,
  },
  required: {
    color: "#DC2626",
  },
  selectedCount: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "600",
  },
  horizontalScroll: {
    flexDirection: "row",
    paddingVertical: 4,
  },
  readerChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    gap: 6,
  },
  readerChipSelected: {
    backgroundColor: "#1E40AF",
    borderColor: "#1E40AF",
  },
  readerChipName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1E293B",
  },
  readerChipCard: {
    fontSize: 11,
    color: "#64748B",
  },
  readerChipTextSelected: {
    color: "#FFFFFF",
  },
  bookList: {
    marginTop: 8,
    gap: 6,
  },
  bookSelectCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 8,
    borderRadius: 6,
  },
  bookSelectCardActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },
  bookSelectCardDisabled: {
    opacity: 0.5,
  },
  bookSelectInfo: {
    flex: 1,
    marginLeft: 8,
  },
  bookSelectTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0F172A",
  },
  bookSelectAuthor: {
    fontSize: 11,
    color: "#64748B",
  },
  stockPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockPillText: {
    fontSize: 10,
    fontWeight: "600",
  },
  daysRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  dayBtn: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dayBtnActive: {
    backgroundColor: "#1E40AF",
    borderColor: "#1E40AF",
  },
  dayBtnText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
  },
  dayBtnTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  dueDateNotice: {
    marginTop: 10,
    fontSize: 13,
    color: "#475569",
  },
  dueDateText: {
    fontWeight: "bold",
    color: "#1E40AF",
  },
  notesInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    padding: 8,
    height: 60,
    fontSize: 13,
    marginTop: 8,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: "#1E40AF",
    borderRadius: 8,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});
