import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";
import { useTema } from "../context/ThemeContext";

const DEPARTAMENTOS = [
  "Amazonas",
  "Antioquia",
  "Arauca",
  "Atlántico",
  "Bolívar",
  "Boyacá",
  "Caldas",
  "Caquetá",
  "Casanare",
  "Cauca",
  "Cesar",
  "Chocó",
  "Córdoba",
  "Cundinamarca",
  "Guainía",
  "Guaviare",
  "Huila",
  "La Guajira",
  "Magdalena",
  "Meta",
  "Nariño",
  "Norte de Santander",
  "Putumayo",
  "Quindío",
  "Risaralda",
  "San Andrés y Providencia",
  "Santander",
  "Sucre",
  "Tolima",
  "Valle del Cauca",
  "Vaupés",
  "Vichada",
];

// ✅ Misma lista única de unidades usada en CameraScreen.
const UNIDADES = ["kg", "lb", "arroba", "tonelada", "bulto", "caja", "canastilla", "saco", "unidad", "docena", "racimo", "atado", "manojo"];

const PESOS_SUGERIDOS = {
  lb: "0.5",
  arroba: "12.5",
  tonelada: "1000",
  bulto: "50",
  caja: "20",
  canastilla: "20",
  saco: "50",
  unidad: "",
  docena: "",
  racimo: "",
  atado: "",
  manojo: "",
};

const formatNumero = (value) => {
  const num = value.replace(/\D/g, "");
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const EditarPublicacionScreen = ({ route, navigation }) => {
  const { publicacion } = route.params;
  const [loading, setLoading] = useState(false);
  const [showDepModal, setShowDepModal] = useState(false);
  const [showUnidadModal, setShowUnidadModal] = useState(false);
  const [form, setForm] = useState({
    producto: publicacion.producto || "",
    descripcion: publicacion.descripcion || "",
    precio: publicacion.precio ? publicacion.precio.toString() : "",
    unidad: publicacion.unidad || "",
    stock: publicacion.stock ? publicacion.stock.toString() : "",
    // ✅ 'stockUnidad' eliminado. Precargamos 'pesoKg' si ya existía.
    pesoKg: publicacion.peso_kg_unidad ? publicacion.peso_kg_unidad.toString() : "",
    ubicacion: publicacion.ubicacion || "",
  });
  const { tema } = useTema();
  const s = estilos(tema);

  const requierePeso = form.unidad && form.unidad !== "kg";

  const seleccionarUnidad = (item) => {
    setForm({
      ...form,
      unidad: item,
      // Si ya tenía un peso cargado y solo está corrigiendo otros campos,
      // no lo pisamos a menos que esté vacío o cambie a "kg".
      pesoKg: item === "kg" ? "" : (form.pesoKg || PESOS_SUGERIDOS[item] || ""),
    });
  };

  const guardar = async () => {
    if (!form.producto.trim())
      return Alert.alert("Error", "Escribe el nombre del producto");
    if (!form.precio.trim()) return Alert.alert("Error", "Escribe el precio");
    if (!form.unidad.trim()) return Alert.alert("Error", "Selecciona la unidad");
    if (!form.stock.trim()) return Alert.alert("Error", "Escribe el stock");
    if (requierePeso && !form.pesoKg.trim())
      return Alert.alert("Error", `Indica cuánto pesa 1 ${form.unidad} en kilogramos`);
    if (!form.ubicacion.trim())
      return Alert.alert("Error", "Selecciona la ubicación");

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const body = {
        producto: form.producto,
        descripcion: form.descripcion,
        precio: parseInt(form.precio.replace(/\./g, "")),
        unidad: form.unidad,
        stock: parseInt(form.stock.replace(/\./g, "")),
        ubicacion: form.ubicacion,
      };
      // Solo enviamos peso_kg_unidad si aplica; si la unidad es kg, lo
      // limpiamos explícitamente para no dejar datos viejos inconsistentes.
      body.peso_kg_unidad = requierePeso ? parseFloat(form.pesoKg.replace(",", ".")) : null;

      const response = await fetch(
        `${API_URL}/publicaciones/${publicacion.id}/editar/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(body),
        },
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("✅ Actualizada", "Publicación editada correctamente", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert("Error", data.error || "No se pudo editar la publicación");
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
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.titulo}>Editar Publicación</Text>

          <Text style={s.label}>Nombre del producto *</Text>
          <TextInput
            style={s.input}
            value={form.producto}
            onChangeText={(v) => setForm({ ...form, producto: v })}
            placeholder="Ej: Papa Sabanera"
          />

          <Text style={s.label}>Descripción</Text>
          <TextInput
            style={[s.input, s.textArea]}
            value={form.descripcion}
            onChangeText={(v) => setForm({ ...form, descripcion: v })}
            placeholder="Descripción del producto"
            multiline
            numberOfLines={3}
          />

          <Text style={s.label}>Precio *</Text>
          <TextInput
            style={s.input}
            value={form.precio}
            onChangeText={(v) => setForm({ ...form, precio: formatNumero(v) })}
            placeholder="Ej: 5.000"
            keyboardType="numeric"
          />

          {/* ✅ Unidad ahora es un selector (antes era texto libre), y es
              la misma unidad que aplica al stock. */}
          <Text style={s.label}>Unidad *</Text>
          <TouchableOpacity
            style={[s.input, s.selector]}
            onPress={() => setShowUnidadModal(true)}
          >
            <Text style={{ color: form.unidad ? "#333" : "#999", fontSize: 15 }}>
              {form.unidad || "Seleccionar unidad ▼"}
            </Text>
          </TouchableOpacity>

          <Text style={s.label}>Cantidad disponible *</Text>
          <TextInput
            style={s.input}
            value={form.stock}
            onChangeText={(v) => setForm({ ...form, stock: formatNumero(v) })}
            placeholder={form.unidad ? `Cantidad en ${form.unidad}` : "Cantidad"}
            keyboardType="numeric"
          />

          {/* ✅ Campo condicional: solo si la unidad no es kg */}
          {requierePeso && (
            <>
              <Text style={s.label}>¿Cuánto pesa 1 {form.unidad} en kg? *</Text>
              <TextInput
                style={s.input}
                value={form.pesoKg}
                onChangeText={(v) => setForm({ ...form, pesoKg: v.replace(/[^0-9.,]/g, "").replace(",", ".") })}
                placeholder="ej: 50"
                keyboardType="decimal-pad"
              />
            </>
          )}

          <Text style={s.label}>Ubicación *</Text>
          <TouchableOpacity
            style={[s.input, s.selector]}
            onPress={() => setShowDepModal(true)}
          >
            <Text
              style={{ color: form.ubicacion ? "#333" : "#999", fontSize: 15 }}
            >
              {form.ubicacion || "Seleccionar departamento ▼"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.btn, loading && { opacity: 0.7 }]}
            onPress={guardar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnText}>Guardar cambios</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={s.cancelBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={s.cancelText}>Cancelar</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal departamentos */}
      <Modal visible={showDepModal} transparent animationType="fade">
        <View style={s.modalBackdrop}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Selecciona tu departamento</Text>
            <FlatList
              data={DEPARTAMENTOS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.depItem}
                  onPress={() => {
                    setForm({ ...form, ubicacion: item });
                    setShowDepModal(false);
                  }}
                >
                  <Text style={s.depText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modal unidades (único selector, aplica a precio y stock) */}
      <Modal visible={showUnidadModal} transparent animationType="fade">
        <View style={s.modalBackdrop}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Selecciona la unidad</Text>
            <FlatList
              data={UNIDADES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.depItem}
                  onPress={() => {
                    seleccionarUnidad(item);
                    setShowUnidadModal(false);
                  }}
                >
                  <Text style={s.depText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const estilos = (tema) => StyleSheet.create({
  container: { flex: 1, backgroundColor: tema.fondo },
  content: { padding: 20 },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B3A1B",
    marginBottom: 25,
  },
  label: { fontSize: 14, fontWeight: "600", color: "#666", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  textArea: { height: 80, textAlignVertical: "top" },
  selector: { justifyContent: "center" },
  btn: {
    backgroundColor: "#709742",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancelBtn: { padding: 14, alignItems: "center", marginTop: 8 },
  cancelText: { color: "#999", fontSize: 15 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    maxHeight: "80%",
    padding: 20,
    borderRadius: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#1B3A1B",
  },
  depItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#eee" },
  depText: { fontSize: 15, color: "#333" },
});

export default EditarPublicacionScreen;