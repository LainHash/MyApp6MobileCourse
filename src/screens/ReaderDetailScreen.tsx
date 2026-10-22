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
import { Reader, BorrowRecord } from "../types";
import { readerService } from "@/services/readerService";
import { borrowService } from "@/services/borrowService";

type RouteProps = RouteProp<RootStackParamList, "ReaderDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ReaderDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { readerId } = route.params;
  const { deleteReader } = useLibrary();

  const [reader, setReader] = useState<Reader | null>(null);
  const [history, setHistory] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const readerData = await readerService.getReaderDetail(readerId);
        if (isMounted) setReader(readerData);

        try {
          const histData = await borrowService.getBorrowHistory({
            reader_id: readerId,
          });
          if (isMounted) setHistory(histData.history);
        } catch {
          // history optional
        }
      } catch (e: any) {
        if (isMounted)
          Alert.alert("Lỗi", e.message || "Không thể tải chi tiết độc giả");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [readerId]);

  const handleDelete = () => {
    Alert.alert(
      "Xác nhận xóa độc giả",
      `Bạn có chắc chắn muốn xóa độc giả "${reader?.name}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa độc giả",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteReader(readerId);
              Alert.alert("Thành công", "Đã xóa độc giả khỏi hệ thống");
              navigation.goBack();
            } catch (err: any) {
              Alert.alert("Lỗi", err.message);
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
        <Text style={styles.loadingText}>Đang tải chi tiết độc giả...</Text>
      </View>
    );
  }

  if (!reader) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
        <Text style={styles.notFoundText}>
          Không tìm thấy thông tin độc giả.
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

  const isLocked = reader.status === "locked";
  const isExpired = reader.status === "expired";

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header Card */}
      <View style={styles.profileSection}>
        <Image
          source={{
            uri:
              reader.avatar ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
          }}
          style={styles.avatar}
        />
        <Text style={styles.readerName}>{reader.name}</Text>
        <Text style={styles.cardNumber}>
          Thẻ thư viện: {reader.card_number}
        </Text>

        <View style={styles.statusBadgeWrap}>
          {reader.status === "active" && (
            <View style={[styles.statusBadge, { backgroundColor: "#DCFCE7" }]}>
              <Text style={[styles.statusText, { color: "#15803D" }]}>
                Đang Hoạt Động
              </Text>
            </View>
          )}
          {reader.status === "expired" && (
            <View style={[styles.statusBadge, { backgroundColor: "#FEF3C7" }]}>
              <Text style={[styles.statusText, { color: "#B45309" }]}>
                Thẻ Đã Hết Hạn
              </Text>
            </View>
          )}
          {reader.status === "locked" && (
            <View style={[styles.statusBadge, { backgroundColor: "#FEE2E2" }]}>
              <Text style={[styles.statusText, { color: "#B91C1C" }]}>
                Thẻ Bị Khóa
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[
            styles.borrowActionBtn,
            (isLocked || isExpired) && { backgroundColor: "#94A3B8" },
          ]}
          disabled={isLocked || isExpired}
          onPress={() =>
            navigation.navigate("CreateBorrow", {
              preselectedReaderId: reader.id,
            })
          }
        >
          <Ionicons name="cart-outline" size={18} color="#FFFFFF" />
          <Text style={styles.borrowActionText}>
            {isLocked
              ? "Thẻ Bị Khóa"
              : isExpired
                ? "Thẻ Hết Hạn"
                : "Lập Phiếu Mượn"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate("ReaderForm", { reader })}
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

      {/* Profile Details Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thông Tin Cá Nhân</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Số điện thoại:</Text>
          <Text style={styles.infoVal}>{reader.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoVal}>{reader.email || "Chưa cập nhật"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Giới tính:</Text>
          <Text style={styles.infoVal}>{reader.gender || "Chưa rõ"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Hạn sử dụng thẻ:</Text>
          <Text style={styles.infoVal}>{reader.expiry_date}</Text>
        </View>
      </View>

      {/* Borrow History */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Lịch Sử Mượn Trả Của Độc Giả</Text>
        {history.length === 0 ? (
          <Text style={styles.emptyHistText}>
            Chưa có lịch sử mượn sách nào.
          </Text>
        ) : (
          history.map((record) => (
            <TouchableOpacity
              key={record.id}
              style={styles.histItem}
              onPress={() =>
                navigation.navigate("BorrowDetail", { borrowId: record.id })
              }
            >
              <View style={styles.histTop}>
                <Text style={styles.histCode}>{record.borrow_code}</Text>
                <Text
                  style={[
                    styles.histStatus,
                    record.status === "returned" && { color: "#15803D" },
                    record.status === "overdue" && { color: "#DC2626" },
                    record.status === "borrowing" && { color: "#2563EB" },
                  ]}
                >
                  {record.status === "returned"
                    ? "Đã trả"
                    : record.status === "overdue"
                      ? "Quá hạn"
                      : "Đang mượn"}
                </Text>
              </View>
              <Text style={styles.histDate}>
                Ngày mượn: {record.borrow_date?.split(" ")[0]} • Hạn trả:{" "}
                {record.due_date?.split(" ")[0]}
              </Text>
            </TouchableOpacity>
          ))
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
  profileSection: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E2E8F0",
    marginBottom: 10,
  },
  readerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
  },
  cardNumber: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "600",
    marginTop: 2,
  },
  statusBadgeWrap: {
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  actionsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  borrowActionBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#1E40AF",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  borrowActionText: {
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
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 6,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
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
  emptyHistText: {
    color: "#94A3B8",
    fontSize: 13,
    fontStyle: "italic",
    paddingVertical: 8,
  },
  histItem: {
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F1F5F9",
  },
  histTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  histCode: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0F172A",
  },
  histStatus: {
    fontSize: 12,
    fontWeight: "600",
  },
  histDate: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
});
