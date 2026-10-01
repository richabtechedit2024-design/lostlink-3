import { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../hooks/useAuth";
import { LostFoundItem } from "../../constants/categories";
import { COLORS } from "../../constants/colors";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [item, setItem] = useState<LostFoundItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      const snap = await getDoc(doc(db, "items", id));
      if (snap.exists()) {
        setItem({ id: snap.id, ...snap.data() } as LostFoundItem);
      }
      setLoading(false);
    };
    fetchItem();
  }, [id]);

  const handleContact = async () => {
    if (!user || !item) return;
    if (item.postedBy === user.uid) {
      Alert.alert("This is your own post", "You can't message yourself.");
      return;
    }

    setStarting(true);
    try {
      // Check if a chat already exists for this item between these two users
      const existingQuery = query(
        collection(db, "chats"),
        where("itemId", "==", item.id),
        where("participants", "array-contains", user.uid)
      );
      const existingSnap = await getDocs(existingQuery);
      const existingChat = existingSnap.docs.find((d) =>
        d.data().participants.includes(item.postedBy)
      );

      if (existingChat) {
        router.push(`/chat/${existingChat.id}`);
        return;
      }

      const newChat = await addDoc(collection(db, "chats"), {
        itemId: item.id,
        itemTitle: item.title,
        participants: [user.uid, item.postedBy],
        lastMessage: "Chat started",
        updatedAt: serverTimestamp(),
      });

      router.push(`/chat/${newChat.id}`);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 60 }} />;
  }

  if (!item) {
    return (
      <View style={styles.center}>
        <Text>Item not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {item.photoUrl ? (
        <Image source={{ uri: item.photoUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={{ fontSize: 48 }}>📦</Text>
        </View>
      )}

      <View style={styles.content}>
        <View
          style={[
            styles.badge,
            { backgroundColor: item.type === "lost" ? "#FEE2E2" : "#DCFCE7" },
          ]}
        >
          <Text
            style={{
              color: item.type === "lost" ? COLORS.danger : COLORS.success,
              fontWeight: "700",
              fontSize: 12,
            }}
          >
            {item.type.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>
          {item.category} · 📍 {item.location}
        </Text>

        <Text style={styles.sectionLabel}>Description</Text>
        <Text style={styles.description}>{item.description}</Text>

        <Text style={styles.sectionLabel}>Posted by</Text>
        <Text style={styles.description}>{item.postedByName}</Text>

        {item.status === "open" && item.postedBy !== user?.uid && (
          <TouchableOpacity style={styles.contactButton} onPress={handleContact} disabled={starting}>
            <Text style={styles.contactButtonText}>
              {starting ? "Starting chat..." : "💬 Contact " + (item.type === "lost" ? "Owner" : "Finder")}
            </Text>
          </TouchableOpacity>
        )}

        {item.status === "resolved" && (
          <View style={styles.resolvedBanner}>
            <Text style={styles.resolvedText}>✅ This item has been resolved</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  image: { width: "100%", height: 240, backgroundColor: COLORS.border },
  imagePlaceholder: { alignItems: "center", justifyContent: "center" },
  content: { padding: 18 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 10 },
  title: { fontSize: 22, fontWeight: "700", color: COLORS.text },
  meta: { color: COLORS.textMuted, marginTop: 4, marginBottom: 16, fontSize: 14 },
  sectionLabel: { fontWeight: "700", fontSize: 13, color: COLORS.text, marginTop: 12, marginBottom: 4 },
  description: { color: COLORS.text, fontSize: 14, lineHeight: 20 },
  contactButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 26,
  },
  contactButtonText: { color: COLORS.white, fontWeight: "700", fontSize: 15 },
  resolvedBanner: {
    backgroundColor: "#DCFCE7",
    padding: 14,
    borderRadius: 10,
    marginTop: 26,
    alignItems: "center",
  },
  resolvedText: { color: COLORS.success, fontWeight: "600" },
});
