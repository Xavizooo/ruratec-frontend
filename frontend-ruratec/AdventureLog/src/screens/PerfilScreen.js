import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Alert, ActivityIndicator, ScrollView, Image, KeyboardAvoidingView, Platform } from "react-native";
import { User, Phone, MapPin, Mail, Camera, LogOut } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "../config";
import { useTema } from "../context/ThemeContext"; // ✅ faltaba

const DEPARTAMENTOS = ["Amazonas","Antioquia","Arauca","Atlántico","Bolívar","Boyacá","Caldas","Caquetá","Casanare","Cauca","Cesar","Chocó","Córdoba","Cundinamarca","Guainía","Guaviare","Huila","La Guajira","Magdalena","Meta","Nariño","Norte de Santander","Putumayo","Quindío","Risaralda","San Andrés y Providencia","Santander","Sucre","Tolima","Valle del Cauca","Vaupés","Vichada"];

const PerfilScreen = ({ navigation }) => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editando, setEditando] = useState(false);
  const [showDepModal, setShowDepModal] = useState(false);
  const [form, setForm] = useState({ nombre: "", apellido: "", telefono: "", ubicacion: "" });
  const [fotoLocal, setFotoLocal] = useState(null);
  const { tema } = useTema(); // ✅ primero el hook
  const s = estilos(tema);   // ✅ luego los estilos

  useEffect(() => { cargarPerfil(); }, []);

  const cargarPerfil = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_URL}/perfil/`, {
        headers: { Authorization: `Token ${token}`, "ngrok-skip-browser-warning": "true" },
      });
      const data = await response.json();
      setPerfil(data);
      setForm({ nombre: data.nombre || "", apellido: data.apellido || "", telefono: data.telefono || "", ubicacion: data.ubicacion || "" });
    } catch (error) { console.error("Error cargando perfil:", error); }
    finally { setLoading(false); }
  };

  const seleccionarFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería"); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled) setFotoLocal(result.assets[0].uri);
  };

  const guardarPerfil = async () => {
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      formData.append("nombre", form.nombre);
      formData.append("apellido", form.apellido);
      formData.append("telefono", form.telefono);
      formData.append("ubicacion", form.ubicacion);
      if (fotoLocal) formData.append("foto", { uri: fotoLocal, type: "image/jpeg", name: "perfil.jpg" });
      const response = await fetch(`${API_URL}/perfil/`, { method: "PUT", headers: { Authorization: `Token ${token}` }, body: formData });
      if (response.ok) {
        await AsyncStorage.setItem("nombre", form.nombre);
        setEditando(false); setFotoLocal(null); cargarPerfil();
        Alert.alert("¡Listo!", "Perfil actualizado correctamente");
      } else { Alert.alert("Error", "No se pudo actualizar el perfil"); }
    } catch (error) { Alert.alert("Error de conexión", "Verifica que el servidor esté corriendo"); }
    finally { setSaving(false); }
  };

  const cerrarSesion = async () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sí, salir", style: "destructive", onPress: async () => { await AsyncStorage.clear(); navigation.reset({ index: 0, routes: [{ name: "Login" }] }); } },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <ActivityIndicator size="large" color="#709742" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  const fotoUri = fotoLocal || perfil?.foto;

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={s.fotoContainer}>
            {fotoUri ? <Image source={{ uri: fotoUri }} style={s.foto} /> : (
              <View style={s.fotoPlaceholder}><User size={50} color={tema.iconoVerde} /></View>
            )}
            {editando && (
              <TouchableOpacity style={s.cameraBtn} onPress={seleccionarFoto}>
                <Camera size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={s.nombre}>{perfil?.nombre} {perfil?.apellido}</Text>
          <View style={s.rolBadge}><Text style={s.rolText}>{perfil?.rol}</Text></View>

          <View style={s.card}>
            <View style={s.campo}>
              <User size={18} color={tema.iconoVerde} />
              <View style={s.campoContent}>
                <Text style={s.campoLabel}>Nombre</Text>
                {editando ? <TextInput style={s.campoInput} value={form.nombre} onChangeText={(v) => setForm({ ...form, nombre: v })} placeholderTextColor={tema.textoSecundario} />
                  : <Text style={s.campoValor}>{perfil?.nombre || "No definido"}</Text>}
              </View>
            </View>

            <View style={s.campo}>
              <User size={18} color={tema.iconoVerde} />
              <View style={s.campoContent}>
                <Text style={s.campoLabel}>Apellido</Text>
                {editando ? <TextInput style={s.campoInput} value={form.apellido} onChangeText={(v) => setForm({ ...form, apellido: v })} placeholderTextColor={tema.textoSecundario} />
                  : <Text style={s.campoValor}>{perfil?.apellido || "No definido"}</Text>}
              </View>
            </View>

            {!editando && (
              <View style={s.campo}>
                <Mail size={18} color={tema.iconoVerde} />
                <View style={s.campoContent}>
                  <Text style={s.campoLabel}>Email</Text>
                  <Text style={s.campoValor}>{perfil?.email}</Text>
                </View>
              </View>
            )}

            <View style={s.campo}>
              <Phone size={18} color={tema.iconoVerde} />
              <View style={s.campoContent}>
                <Text style={s.campoLabel}>Teléfono</Text>
                {editando ? <TextInput style={s.campoInput} value={form.telefono} onChangeText={(v) => setForm({ ...form, telefono: v })} keyboardType="phone-pad" placeholderTextColor={tema.textoSecundario} />
                  : <Text style={s.campoValor}>{perfil?.telefono || "No definido"}</Text>}
              </View>
            </View>

            <View style={s.campo}>
              <MapPin size={18} color={tema.iconoVerde} />
              <View style={s.campoContent}>
                <Text style={s.campoLabel}>Departamento</Text>
                {editando ? (
                  <TouchableOpacity onPress={() => setShowDepModal(true)}>
                    <Text style={[s.campoInput, { color: form.ubicacion ? tema.texto : tema.textoSecundario }]}>
                      {form.ubicacion || "Seleccionar ▼"}
                    </Text>
                  </TouchableOpacity>
                ) : <Text style={s.campoValor}>{perfil?.ubicacion || "No definido"}</Text>}
              </View>
            </View>
          </View>

          {editando ? (
            <View style={s.botonesRow}>
              <TouchableOpacity style={[s.btn, s.cancelarBtn]} onPress={() => { setEditando(false); setFotoLocal(null); }}>
                <Text style={s.cancelarText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btn, s.guardarBtn, saving && { opacity: 0.7 }]} onPress={guardarPerfil} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.guardarText}>Guardar</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={[s.btn, s.editarBtn]} onPress={() => setEditando(true)}>
              <Text style={s.editarText}>Editar Perfil</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={s.cerrarBtn} onPress={cerrarSesion}>
            <LogOut size={18} color="#e74c3c" />
            <Text style={s.cerrarText}>Cerrar Sesión</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {showDepModal && (
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitulo}>Selecciona tu departamento</Text>
            <ScrollView>
              {DEPARTAMENTOS.map((dep) => (
                <TouchableOpacity key={dep} style={s.depItem} onPress={() => { setForm({ ...form, ubicacion: dep }); setShowDepModal(false); }}>
                  <Text style={s.depText}>{dep}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const estilos = (tema) => StyleSheet.create({
  container: { flex: 1, backgroundColor: tema.fondo },
  content: { padding: 20, alignItems: "center" },
  fotoContainer: { position: "relative", marginBottom: 15, marginTop: 10 },
  foto: { width: 100, height: 100, borderRadius: 50 },
  fotoPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: tema.fondo, justifyContent: "center", alignItems: "center" },
  cameraBtn: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#709742", borderRadius: 15, width: 30, height: 30, justifyContent: "center", alignItems: "center" },
  nombre: { fontSize: 22, fontWeight: "bold", color: tema.textoTitulo, marginBottom: 8 },
  rolBadge: { backgroundColor: tema.fondo, paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20, marginBottom: 25 },
  rolText: { color: tema.iconoVerde, fontWeight: "bold", fontSize: 14 },
  card: { backgroundColor: tema.card, borderRadius: 15, padding: 15, width: "100%", marginBottom: 20, elevation: 3 },
  campo: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: tema.separador },
  campoContent: { flex: 1 },
  campoLabel: { fontSize: 12, color: tema.textoSecundario, marginBottom: 3 },
  campoValor: { fontSize: 15, color: tema.texto, fontWeight: "500" },
  campoInput: { fontSize: 15, color: tema.texto, borderBottomWidth: 1, borderBottomColor: tema.iconoVerde, paddingVertical: 2 },
  botonesRow: { flexDirection: "row", gap: 15, width: "100%", marginBottom: 15 },
  btn: { height: 50, borderRadius: 12, justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 8 },
  editarBtn: { backgroundColor: "#709742", width: "100%", marginBottom: 15 },
  editarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  guardarBtn: { backgroundColor: "#709742", flex: 1 },
  guardarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancelarBtn: { borderWidth: 1, borderColor: tema.borde, flex: 1 },
  cancelarText: { color: tema.textoSecundario, fontSize: 16 },
  cerrarBtn: { flexDirection: "row", alignItems: "center", gap: 8, padding: 15, marginTop: 5 },
  cerrarText: { color: "#e74c3c", fontSize: 15, fontWeight: "600" },
  modalOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: tema.card, width: "90%", maxHeight: "70%", borderRadius: 15, padding: 20 },
  modalTitulo: { fontSize: 18, fontWeight: "bold", color: tema.textoTitulo, marginBottom: 15 },
  depItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: tema.separador },
  depText: { fontSize: 15, color: tema.texto },
});

export default PerfilScreen;