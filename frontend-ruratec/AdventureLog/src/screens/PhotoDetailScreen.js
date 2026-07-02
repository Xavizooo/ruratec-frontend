import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  Save,
  MapPin,
  Box,
  DollarSign,
  Phone,
  Tag,
  Info,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";
import { useTema } from "../context/ThemeContext";

const PhotoDetailScreen = ({ route, navigation }) => {
  const { photo } = route.params;

  const [form, setForm] = useState({
    producto: photo.title || "",
    descripcion: photo.note || "",
    precio: photo.price || "",
    unidad: photo.quantity || "",
    ubicacion: photo.locationInfo || "",
    stock: "",
  });
  const [loading, setLoading] = useState(false);
  const { tema } = useTema();
  const s = estilos(tema);
  const handleSave = async () => {
    if (!form.producto.trim())
      return Alert.alert("Error", "Escribe el nombre del producto");
    if (!form.precio.trim()) return Alert.alert("Error", "Escribe el precio");
    if (!form.unidad.trim()) return Alert.alert("Error", "Escribe la unidad");
    if (!form.ubicacion.trim())
      return Alert.alert("Error", "Escribe la ubicación");
    if (!form.stock.trim())
      return Alert.alert("Error", "Escribe el stock disponible");

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");

      const formData = new FormData();
      formData.append("producto", form.producto);
      formData.append("descripcion", form.descripcion);
      formData.append("precio", form.precio)
      formData.append("unidad", form.unidad);
      formData.append("ubicacion", form.ubicacion);
      formData.append("stock", form.stock);

      if (photo.uri) {
        formData.append("imagen", {
          uri: photo.uri,
          type: "image/jpeg",
          name: "publicacion.jpg",
        });
      }

      const response = await fetch(`${API_URL}/publicaciones/crear/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (response.ok) {
        Alert.alert("¡Éxito!", "Producto publicado correctamente", [
          { text: "OK", onPress: () => navigation.navigate("HomeAgricultor") },
        ]);
      } else {
        const data = await response.json();
        console.error(data);
        Alert.alert("Error", "No se pudo publicar el producto");
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error de conexión",
        "Verifica que el servidor esté corriendo",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView>
          <Image source={{ uri: photo.uri }} style={styles.headerImage} />

          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Detalles de la Publicación</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre del Producto *</Text>
              <View style={styles.inputWrapper}>
                <Tag size={20} color="#709742" />
                <TextInput
                  style={styles.input}
                  value={form.producto}
                  onChangeText={(v) => setForm({ ...form, producto: v })}
                  placeholder="Ej: Papa Sabanera"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Precio *</Text>
                <View style={styles.inputWrapper}>
                  <DollarSign size={20} color="#709742" />
                  <TextInput
                    style={styles.input}
                    value={form.precio}
                    onChangeText={(v) => setForm({ ...form, precio: v })}
                    placeholder="Ej: 2800"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Unidad *</Text>
                <View style={styles.inputWrapper}>
                  <Box size={20} color="#709742" />
                  <TextInput
                    style={styles.input}
                    value={form.unidad}
                    onChangeText={(v) => setForm({ ...form, unidad: v })}
                    placeholder="kg, lb..."
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Stock disponible *</Text>
              <View style={styles.inputWrapper}>
                <Box size={20} color="#709742" />
                <TextInput
                  style={styles.input}
                  value={form.stock}
                  onChangeText={(v) => setForm({ ...form, stock: v })}
                  placeholder="Ej: 500"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ubicación *</Text>
              <View style={styles.inputWrapper}>
                <MapPin size={20} color="#709742" />
                <TextInput
                  style={styles.input}
                  value={form.ubicacion}
                  onChangeText={(v) => setForm({ ...form, ubicacion: v })}
                  placeholder="Ej: Mosquera, Cundinamarca"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.descripcion}
                onChangeText={(v) => setForm({ ...form, descripcion: v })}
                placeholder="Detalles sobre logística, empaque o estado..."
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, loading && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Save size={24} color="#FFF" />
                  <Text style={styles.saveButtonText}>Publicar Producto</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const estilos = (tema) => StyleSheet.create({
  container: { flex: 1, backgroundColor: tema.fondo },
  headerImage: { width: "100%", height: 250 },
  formContainer: {
    padding: 20,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1B3A1B",
    marginBottom: 20,
  },
  inputGroup: { marginBottom: 15 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#EEE",
  },
  row: { flexDirection: "row" },
  saveButton: {
    backgroundColor: "#709742",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 15,
    marginTop: 20,
    gap: 10,
    elevation: 4,
  },
  saveButtonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
});

export default PhotoDetailScreen;
