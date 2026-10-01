import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useRouter } from "expo-router";
import { db } from "../../services/firebase";
import { useAuth } from "../../hooks/useAuth";
import { COLORS } from "../../constants/colors";

interface ChatPreview {
  id: string;
  itemTitle: string;
  lastMessage: string;
  updatedAt: number;
}

export default function ChatListScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ChatPreview[];
      setChats(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />;
  }

  if (chats.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          No conversations yet. Contact someone from an item's detail page to start chatting.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: COLORS.background }}
      data={chats}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.row} onPress={() => router.push(`/chat/${item.id}`)}>
          <Text style={styles.title}>{item.itemTitle}</Text>
          <Text style={styles.preview} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: { fontWeight: "600", fontSize: 15, color: COLORS.text },
  preview: { color: COLORS.textMuted, marginTop: 2, fontSize: 13 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30 },
  emptyText: { color: COLORS.textMuted, textAlign: "center" },
});
