import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../hooks/useAuth";
import { LostFoundItem } from "../../constants/categories";
import { COLORS } from "../../constants/colors";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [myItems, setMyItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "items"),
      where("postedBy", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as LostFoundItem[];
      setMyItems(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const markResolved = async (itemId: string) => {
    await updateDoc(doc(db, "items", itemId), { status: "resolved" });
  };

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.email ?? "?")[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <Text style={styles.sectionTitle}>My Posted Items</Text>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : myItems.length === 0 ? (
        <Text style={styles.emptyText}>You haven't posted any items yet.</Text>
      ) : (
        <FlatList
          data={myItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemStatus}>
                  {item.type.toUpperCase()} · {item.status === "resolved" ? "✅ Resolved" : "🟡 Open"}
                </Text>
              </View>
              {item.status === "open" && (
                <TouchableOpacity style={styles.resolveButton} onPress={() => markResolved(item.id)}>
                  <Text style={styles.resolveButtonText}>Mark Resolved</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  header: { alignItems: "center", marginBottom: 24, marginTop: 8 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarText: { color: COLORS.white, fontSize: 26, fontWeight: "700" },
  email: { fontSize: 15, color: COLORS.text },
  sectionTitle: { fontWeight: "700", fontSize: 16, marginBottom: 10 },
  emptyText: { color: COLORS.textMuted },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  itemTitle: { fontWeight: "600", fontSize: 14, color: COLORS.text },
  itemStatus: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  resolveButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  resolveButtonText: { color: COLORS.white, fontSize: 11, fontWeight: "600" },
  logoutButton: {
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
  },
  logoutButtonText: { color: COLORS.danger, fontWeight: "600" },
});
