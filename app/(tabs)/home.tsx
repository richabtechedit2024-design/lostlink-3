import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import { LostFoundItem, CATEGORIES, ItemType } from "../../constants/categories";
import { COLORS } from "../../constants/colors";
import ItemCard from "../../components/ItemCard";

export default function HomeScreen() {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ItemType | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");

  useEffect(() => {
    const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as LostFoundItem[];
      setItems(data.filter((i) => i.status === "open"));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [items, search, typeFilter, categoryFilter]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search items..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Lost / Found toggle */}
      <View style={styles.typeRow}>
        {(["all", "lost", "found"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.typeChip, typeFilter === t && styles.typeChipActive]}
            onPress={() => setTypeFilter(t)}
          >
            <Text style={[styles.typeChipText, typeFilter === t && styles.typeChipTextActive]}>
              {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
        <TouchableOpacity
          style={[styles.catChip, categoryFilter === "all" && styles.catChipActive]}
          onPress={() => setCategoryFilter("all")}
        >
          <Text style={categoryFilter === "all" ? styles.catChipTextActive : styles.catChipText}>
            All Categories
          </Text>
        </TouchableOpacity>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, categoryFilter === cat && styles.catChipActive]}
            onPress={() => setCategoryFilter(cat)}
          >
            <Text style={categoryFilter === cat ? styles.catChipTextActive : styles.catChipText}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No items found. Try a different search or filter.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ItemCard item={item} />}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  search: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  typeRow: { flexDirection: "row", marginBottom: 10 },
  typeChip: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    marginRight: 8,
  },
  typeChipActive: { backgroundColor: COLORS.primary },
  typeChipText: { color: COLORS.text, fontWeight: "500" },
  typeChipTextActive: { color: COLORS.white, fontWeight: "600" },
  catRow: { marginBottom: 8, maxHeight: 36 },
  catChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    marginRight: 8,
    height: 32,
  },
  catChipActive: { backgroundColor: COLORS.secondary },
  catChipText: { color: COLORS.textMuted, fontSize: 13 },
  catChipTextActive: { color: COLORS.white, fontSize: 13, fontWeight: "600" },
  empty: { alignItems: "center", marginTop: 60 },
  emptyText: { color: COLORS.textMuted, textAlign: "center", paddingHorizontal: 30 },
});
