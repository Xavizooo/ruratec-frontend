import React, { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ActivityIndicator, BackHandler, Alert,
} from "react-native";
import { Package, Clock, X, CheckCircle, ChevronLeft } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";
import { useTema } from "../context/ThemeContext";

const EsperandoPagoScreen = ({ route, navigation }) => {
  const { negociacion, item } = route.params;
  const insets = useSafeAreaInsets();
  const intervalRef = useRef(null);
  const [estado, setEstado] = useState("esperando");
  const { tema } = useTema();
  const s = estilos(tema);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      navigation.navigate("HomeComerciante");
      return true;
    });
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("HomeComerciante")}
          style={{ paddingHorizontal: 12 }}
        >
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    verificarEstado();
    intervalRef.current = setInterval(verificarEstado, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const verificarEstado = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/negociaciones/${negociacion.id}/estado/`,
        {
          headers: {
            Authorization: `Token ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const data = await response.json();

      if (data.estado === "aceptado") {
        clearInterval(intervalRef.current);
        setEstado("aceptado");
        setTimeout(() => {
          navigation.replace("Pago", { negociacion: data, item });
        }, 1500);
      } else if (data.estado === "rechazado") {
        clearInterval(intervalRef.current);
        setEstado("rechazado");
        setTimeout(() => {
          Alert.alert(
            "Solicitud rechazada",
            "El agricultor no pudo aceptar tu solicitud en este momento.",
            [{ text: "OK", onPress: () => navigation.navigate("HomeComerciante") }]
          );
        }, 500);
      }
    } catch (error) {
      console.error("Error verificando estado:", error);
    }
  };

  const handleCancelar = () => {
    Alert.alert(
      "Cancelar solicitud",
      "¿Estás seguro de que quieres cancelar esta solicitud?",
      [
        { text: "No, esperar", style: "cancel" },
        { text: "Sí, cancelar", style: "destructive", onPress: cancelarNegociacion },
      ]
    );
  };

  const cancelarNegociacion = async () => {
    clearInterval(intervalRef.current);
    try {
      const token = await AsyncStorage.getItem("token");
      await fetch(`${API_URL}/negociaciones/${negociacion.id}/cancelar/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });
    } catch (error) {
      console.error("Error cancelando:", error);
    } finally {
      navigation.navigate("HomeComerciante");
    }
  };

  if (estado === "aceptado") {
    return (
      <SafeAreaView style={[s.container, { justifyContent: "center", alignItems: "center" }]}>
        <CheckCircle size={64} color="#709742" />
        <Text style={[s.titulo, { marginTop: 20, textAlign: "center" }]}>
          ¡Solicitud aceptada!
        </Text>
        <Text style={s.subtitulo}>Redirigiendo al pago...</Text>
        <ActivityIndicator size="small" color="#709742" style={{ marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={[s.content, { paddingBottom: insets.bottom + 20 }]}>
        <View style={s.header}>
          <Clock size={48} color="#709742" />
          <Text style={s.titulo}>Esperando respuesta</Text>
          <Text style={s.subtitulo}>
            El agricultor está revisando tu solicitud. Te avisaremos cuando responda.
          </Text>
        </View>

        <View style={s.card}>
          <View style={s.cardHeader}>
            <Package size={20} color="#709742" />
            <Text style={s.cardTitulo}>Detalle de la solicitud</Text>
          </View>
          <View style={s.fila}>
            <Text style={s.filaLabel}>Producto</Text>
            <Text style={s.filaValor}>{item.producto}</Text>
          </View>
          <View style={s.fila}>
            <Text style={s.filaLabel}>Vendedor</Text>
            <Text style={s.filaValor}>{item.vendedor_nombre}</Text>
          </View>
          <View style={s.fila}>
            <Text style={s.filaLabel}>Cantidad</Text>
            {/* ✅ 'stock_unidad' eliminado — usa la unidad única */}
            <Text style={s.filaValor}>{negociacion.cantidad} {item.unidad}</Text>
          </View>
          <View style={s.fila}>
            <Text style={s.filaLabel}>Precio / {item.unidad}</Text>
            <Text style={s.filaValor}>${item.precio?.toLocaleString("es-CO")}</Text>
          </View>
          <View style={[s.fila, s.totalFila]}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalValor}>
              ${parseFloat(negociacion.total).toLocaleString("es-CO", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </Text>
          </View>
        </View>

        <View style={s.esperandoRow}>
          <ActivityIndicator size="small" color="#709742" />
          <Text style={s.esperandoText}>Esperando confirmación del agricultor...</Text>
        </View>

        <TouchableOpacity style={s.cancelBtn} onPress={handleCancelar}>
          <X size={18} color="#e74c3c" />
          <Text style={s.cancelText}>Cancelar solicitud</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const estilos = (tema) => StyleSheet.create({
  container: { flex: 1, backgroundColor: tema.fondo },
  content: { flex: 1, padding: 24, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 30, gap: 12 },
  titulo: { fontSize: 24, fontWeight: "bold", color: "#1B3A1B", textAlign: "center" },
  subtitulo: { fontSize: 14, color: "#666", textAlign: "center", lineHeight: 20, paddingHorizontal: 10 },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 20, marginBottom: 16, elevation: 3 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  cardTitulo: { fontSize: 16, fontWeight: "bold", color: "#1B3A1B" },
  fila: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  filaLabel: { fontSize: 14, color: "#888" },
  filaValor: { fontSize: 14, fontWeight: "600", color: "#333" },
  totalFila: { borderBottomWidth: 0, marginTop: 4 },
  totalLabel: { fontSize: 17, fontWeight: "bold", color: "#1B3A1B" },
  totalValor: { fontSize: 20, fontWeight: "bold", color: "#709742" },
  esperandoRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 24 },
  esperandoText: { fontSize: 14, color: "#709742", fontWeight: "600" },
  cancelBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 15, borderWidth: 1.5, borderColor: "#e74c3c" },
  cancelText: { color: "#e74c3c", fontSize: 15, fontWeight: "600" },
});

export default EsperandoPagoScreen;