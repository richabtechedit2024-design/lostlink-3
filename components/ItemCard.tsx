import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { LostFoundItem } from "../constants/categories";
import { COLORS } from "../constants/colors";

export default function ItemCard({ item }: { item: LostFoundItem }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/item/${item.id}`)}
      activeOpacity={0.7}
    >
      {item.photoUrl ? (
        <Image source={{ uri: item.photoUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={{ fontSize: 28 }}>📦</Text>
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.rowBetween}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: item.type === "lost" ? "#FEE2E2" : "#DCFCE7" },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: item.type === "lost" ? COLORS.danger : COLORS.success },
              ]}
            >
              {item.type.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.location} numberOfLines={1}>
          📍 {item.location}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  image: { width: 64, height: 64, borderRadius: 10, backgroundColor: COLORS.border },
  imagePlaceholder: { alignItems: "center", justifyContent: "center" },
  info: { flex: 1, marginLeft: 12, justifyContent: "center" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 15, fontWeight: "600", color: COLORS.text, flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  category: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  location: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
});
