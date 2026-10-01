import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "expo-router";
import { db, storage } from "../../services/firebase";
import { useAuth } from "../../hooks/useAuth";
import { CATEGORIES, ItemType } from "../../constants/categories";
import { COLORS } from "../../constants/colors";

export default function PostItemScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [type, setType] = useState<ItemType>("lost");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow photo access to attach an image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setImageUri(null);
    setCategory(CATEGORIES[0]);
    setType("lost");
  };

  const handleSubmit = async () => {
    if (!title || !description || !location) {
      Alert.alert("Missing info", "Please fill in title, description, and location.");
      return;
    }
    if (!user) return;

    setSubmitting(true);
    try {
      let photoUrl: string | undefined;

      if (imageUri) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const fileRef = ref(storage, `items/${user.uid}_${Date.now()}.jpg`);
        await uploadBytes(fileRef, blob);
        photoUrl = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, "items"), {
        type,
        title,
        description,
        category,
        location,
        photoUrl: photoUrl ?? null,
        postedBy: user.uid,
        postedByName: user.displayName ?? user.email,
        status: "open",
        createdAt: serverTimestamp(),
      });

      Alert.alert("Posted!", "Your item has been listed.");
      resetForm();
      router.push("/(tabs)/home");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.label}>What are you posting?</Text>
      <View style={styles.typeRow}>
        {(["lost", "found"] as ItemType[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.typeButton, type === t && styles.typeButtonActive]}
            onPress={() => setType(t)}
          >
            <Text style={[styles.typeButtonText, type === t && styles.typeButtonTextActive]}>
              {t === "lost" ? "I Lost Something" : "I Found Something"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Item title</Text>
      <TextInput style={styles.input} placeholder="e.g. Black wallet" value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe the item, any identifying details..."
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, category === cat && styles.catChipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={category === cat ? styles.catChipTextActive : styles.catChipText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Library, 2nd floor"
        value={location}
        onChangeText={setLocation}
      />

      <Text style={styles.label}>Photo (optional)</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        ) : (
          <Text style={{ color: COLORS.textMuted }}>Tap to add a photo</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.submitButtonText}>{submitting ? "Posting..." : "Post Item"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  label: { fontWeight: "600", fontSize: 14, marginBottom: 6, marginTop: 14, color: COLORS.text },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  textArea: { height: 90, textAlignVertical: "top" },
  typeRow: { flexDirection: "row", gap: 10 },
  typeButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    alignItems: "center",
  },
  typeButtonActive: { backgroundColor: COLORS.primary },
  typeButtonText: { color: COLORS.text, fontWeight: "500", fontSize: 13 },
  typeButtonTextActive: { color: COLORS.white },
  catChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    marginRight: 8,
  },
  catChipActive: { backgroundColor: COLORS.secondary },
  catChipText: { color: COLORS.textMuted, fontSize: 13 },
  catChipTextActive: { color: COLORS.white, fontSize: 13, fontWeight: "600" },
  imagePicker: {
    height: 140,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  previewImage: { width: "100%", height: "100%" },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 26,
  },
  submitButtonText: { color: COLORS.white, fontWeight: "700", fontSize: 16 },
});
