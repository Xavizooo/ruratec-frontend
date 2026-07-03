import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  SafeAreaView, Alert, ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ShieldCheck, Camera, ArrowRight } from "lucide-react-native";
import { API_URL } from "../config";

// Pantalla que aparece justo después del login si el usuario todavía no
// tiene documento_validado = True. Deja subir la foto de la cédula, que
// el backend valida automáticamente por OCR (sin revisión manual).
// El usuario puede omitir este paso y hacerlo después desde su perfil.
const VerificarDocumentoScreen = ({ navigation, route }) => {
  const destino = route?.params?.destino || "HomeAgricultor";
  const [imagen, setImagen] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  const irAHome = () => {
    navigation.reset({ index: 0, routes: [{ name: destino }] });
  };

  const elegirFoto = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tus fotos para subir la cédula.");
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!resultado.canceled) {
      setImagen(resultado.assets[0]);
    }
  };

  const tomarFoto = async () => {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tu cámara para tomar la foto.");
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!resultado.canceled) {
      setImagen(resultado.assets[0]);
    }
  };

  const subirDocumento = async () => {
    if (!imagen) {
      Alert.alert("Falta la foto", "Toma o selecciona una foto de tu cédula primero.");
      return;
    }
    setSubiendo(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      formData.append("foto_cedula", {
        uri: imagen.uri,
        name: "cedula.jpg",
        type: "image/jpeg",
      });

      const response = await fetch(`${API_URL}/perfil/documento/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        if (data.documento_validado) {
          Alert.alert("¡Listo!", "Tu documento fue validado correctamente.", [
            { text: "Continuar", onPress: irAHome },
          ]);
        } else {
          Alert.alert(
            "No pudimos validarlo",
            data.message || "Verifica que la foto sea legible e inténtalo de nuevo, o continúa y hazlo más tarde desde tu perfil.",
            [
              { text: "Reintentar", style: "cancel" },
              { text: "Continuar de todas formas", onPress: irAHome },
            ]
          );
        }
      } else {
        Alert.alert("Error", data.error || "No se pudo subir el documento.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error de conexión", "No se pudo conectar con el servidor.");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <ShieldCheck size={40} color="#fff" />
        <Text style={s.headerTitle}>Verifica tu cuenta</Text>
        <Text style={s.headerSub}>
          Sube una foto de tu cédula para activar el sello de cuenta verificada.
          Esto genera confianza con la otra parte en cada negociación.
        </Text>
      </View>

      <View style={s.card}>
        {imagen ? (
          <Image source={{ uri: imagen.uri }} style={s.preview} resizeMode="cover" />
        ) : (
          <View style={s.placeholder}>
            <Camera size={40} color="#bbb" />
            <Text style={s.placeholderText}>Aún no has agregado una foto</Text>
          </View>
        )}

        <View style={s.botonesRow}>
          <TouchableOpacity style={s.btnSecundario} onPress={tomarFoto}>
            <Text style={s.btnSecundarioText}>Tomar foto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSecundario} onPress={elegirFoto}>
            <Text style={s.btnSecundarioText}>Elegir de galería</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[s.btnPrincipal, (!imagen || subiendo) && { opacity: 0.6 }]}
          onPress={subirDocumento}
          disabled={!imagen || subiendo}
        >
          {subiendo ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={s.btnPrincipalText}>Verificar documento</Text>
              <ArrowRight size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={irAHome} style={{ marginTop: 14, alignItems: "center" }}>
          <Text style={s.omitirText}>Hacerlo más tarde</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F9F0" },
  header: { backgroundColor: "#1B3A1B", padding: 28, paddingTop: 40, alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "bold", marginTop: 12, marginBottom: 8 },
  headerSub: { color: "#c8e6c9", fontSize: 13, textAlign: "center", lineHeight: 19 },
  card: { margin: 20, backgroundColor: "#fff", borderRadius: 16, padding: 20, elevation: 2 },
  preview: { width: "100%", height: 200, borderRadius: 12, marginBottom: 16, backgroundColor: "#eee" },
  placeholder: {
    width: "100%", height: 200, borderRadius: 12, marginBottom: 16,
    backgroundColor: "#FAFAFA", borderWidth: 1.5, borderColor: "#e0e0e0",
    borderStyle: "dashed", justifyContent: "center", alignItems: "center", gap: 8,
  },
  placeholderText: { color: "#bbb", fontSize: 13 },
  botonesRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  btnSecundario: {
    flex: 1, borderWidth: 1.5, borderColor: "#709742", borderRadius: 12,
    paddingVertical: 12, alignItems: "center",
  },
  btnSecundarioText: { color: "#709742", fontWeight: "bold", fontSize: 13 },
  btnPrincipal: {
    flexDirection: "row", backgroundColor: "#709742", borderRadius: 14,
    height: 52, justifyContent: "center", alignItems: "center", gap: 8,
  },
  btnPrincipalText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  omitirText: { color: "#999", fontSize: 13 },
});

export default VerificarDocumentoScreen;