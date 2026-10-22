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
import { BorrowRecord } from "../types";
import { borrowService } from "../services/borrowService";

type RouteProps = RouteProp<RootStackParamList, "BorrowDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BorrowDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { borrowId } = route.params;

  const { returnBorrow, renewBorrow } = useLibrary();

  const [record, setRecord] = useState<BorrowRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const loadDetail = async () => {
    try {
      const data = await borrowService.getBorrowDetail(borrowId);
      setRecord(data);
    } catch (e: any) {
      Alert.alert("Lỗi", e.message || "Không thể tải chi tiết phiếu mượn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await borrowService.getBorrowDetail(borrowId);
        if (isMounted) setRecord(data);
      } catch (e: any) {
        if (isMounted)
          Alert.alert("Lỗi", e.message || "Không thể tải chi tiết phiếu mượn");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [borrowId]);

  const handleReturn = () => {
    if (!record) return;
    const isOverdue = record.status === "overdue";
    const suggestedFine = record.fine_amount ? Number(record.fine_amount) : 0;

    const alertMsg = isOverdue
      ? `Phiếu mượn này QUÁ HẠN ${record.days_overdue} ngày. Phí phạt dự kiến: ${suggestedFine.toLocaleString(
          "vi-VN",
        )} đ. Xác nhận hoàn tất trả sách?`
      : `Xác nhận độc giả ${record.reader_name} trả sách đầy đủ?`;

    Alert.alert("Xác nhận trả sách", alertMsg, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xác nhận trả",
        onPress: async () => {
          try {
            setProcessing(true);
            await returnBorrow({
              borrow_id: record.id,
              fine_amount: suggestedFine,
              condition_note: "Đã trả sách",
            });
            Alert.alert(
              "Thành công",
              "Đã cập nhật trạng thái trả sách thành công!",
            );
            await loadDetail();
          } catch (err: any) {
            Alert.alert("Lỗi", err.message);
          } finally {
            setProcessing(false);
          }
        },
      },
    ]);
  };

  const handleRenew = () => {
    if (!record) return;
    Alert.alert(
      "Gia hạn sách",
      "Bạn có muốn gia hạn thêm 7 ngày cho phiếu mượn này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Gia hạn +7 ngày",
          onPress: async () => {
            try {
              setProcessing(true);
              await renewBorrow({
                borrow_id: record.id,
                extra_days: 7,
              });
              Alert.alert("Thành công", "Đã gia hạn phiếu mượn thành công!");
              await loadDetail();
            } catch (err: any) {
              Alert.alert("Lỗi", err.message);
            } finally {
              setProcessing(false);
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
        <Text style={styles.loadingText}>Đang tải chi tiết phiếu mượn...</Text>
      </View>
    );
  }

  if (!record) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
        <Text style={styles.notFoundText}>Không tìm thấy phiếu mượn này.</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isReturned = record.status === "returned";
  const isOverdue = record.status === "overdue";

  return (
    <ScrollView style={styles.container}>
      {/* Header Info */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <Text style={styles.borrowCode}>{record.borrow_code}</Text>
          <View
            style={[
              styles.badge,
              isReturned && { backgroundColor: "#DCFCE7" },
              isOverdue && { backgroundColor: "#FEE2E2" },
              !isReturned && !isOverdue && { backgroundColor: "#EFF6FF" },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                isReturned && { color: "#15803D" },
                isOverdue && { color: "#B91C1C" },
                !isReturned && !isOverdue && { color: "#1D4ED8" },
              ]}
            >
              {isReturned
                ? "ĐÃ TRẢ SÁCH"
                : isOverdue
                  ? `QUÁ HẠN (${record.days_overdue} NGÀY)`
                  : "ĐANG MƯỢN"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Độc giả:</Text>
          <Text style={styles.infoValBold}>{record.reader_name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mã thẻ:</Text>
          <Text style={styles.infoVal}>{record.reader_card_number}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Số điện thoại:</Text>
          <Text style={styles.infoVal}>{record.reader_phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ngày mượn:</Text>
          <Text style={styles.infoVal}>
            {record.borrow_date?.split(" ")[0]}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Hạn trả:</Text>
          <Text style={[styles.infoValBold, isOverdue && { color: "#DC2626" }]}>
            {record.due_date?.split(" ")[0]}
          </Text>
        </View>

        {isReturned && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày trả thực tế:</Text>
            <Text style={[styles.infoValBold, { color: "#15803D" }]}>
              {record.return_date?.split(" ")[0]}
            </Text>
          </View>
        )}

        {isOverdue && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phí phạt quá hạn:</Text>
            <Text style={[styles.infoValBold, { color: "#DC2626" }]}>
              {record.fine_amount
                ? `${Number(record.fine_amount).toLocaleString("vi-VN")} đ`
                : "0 đ"}
            </Text>
          </View>
        )}

        {record.notes ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ghi chú:</Text>
            <Text style={styles.infoVal}>{record.notes}</Text>
          </View>
        ) : null}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Người lập phiếu:</Text>
          <Text style={styles.infoVal}>{record.created_by || "Thủ thư"}</Text>
        </View>
      </View>

      {/* Action Buttons if borrowing */}
      {!isReturned && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.returnBtn}
            onPress={handleReturn}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Xác Nhận Trả Sách</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.renewBtn}
            onPress={handleRenew}
            disabled={processing}
          >
            <Ionicons name="calendar-outline" size={18} color="#1E40AF" />
            <Text style={styles.renewBtnText}>Gia Hạn +7 Ngày</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Book Items List */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Danh Sách Sách Trong Phiếu ({record.items?.length || 0})
        </Text>

        {record.items && record.items.length > 0 ? (
          record.items.map((item, idx) => (
            <View key={idx} style={styles.bookItemRow}>
              <Image
                source={{
                  uri:
                    item.image_url ||
                    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150",
                }}
                style={styles.bookImg}
              />
              <View style={styles.bookItemInfo}>
                <Text style={styles.bookItemTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.bookItemAuthor} numberOfLines={1}>
                  Tác giả: {item.author}
                </Text>
                <Text style={styles.bookItemQty}>
                  Số lượng mượn: {item.quantity}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyBookText}>Không có chi tiết sách</Text>
        )}
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
  headerCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  borrowCode: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E40AF",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  infoVal: {
    fontSize: 13,
    color: "#0F172A",
  },
  infoValBold: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0F172A",
  },
  actionsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  returnBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  renewBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  renewBtnText: {
    color: "#1E40AF",
    fontWeight: "600",
    fontSize: 13,
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 6,
  },
  bookItemRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F1F5F9",
    alignItems: "center",
  },
  bookImg: {
    width: 45,
    height: 60,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
  },
  bookItemInfo: {
    flex: 1,
    marginLeft: 10,
  },
  bookItemTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0F172A",
  },
  bookItemAuthor: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  bookItemQty: {
    fontSize: 11,
    color: "#2563EB",
    marginTop: 2,
    fontWeight: "500",
  },
  emptyBookText: {
    color: "#94A3B8",
    fontSize: 13,
    fontStyle: "italic",
    paddingVertical: 8,
  },
});
