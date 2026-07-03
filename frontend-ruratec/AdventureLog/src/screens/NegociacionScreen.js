import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { DollarSign, Box, ShoppingCart } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";
import { useTema } from "../context/ThemeContext";

const NegociacionScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [cantidad, setCantidad] = useState("");
  const [loading, setLoading] = useState(false);
  const { tema } = useTema();
  const s = estilos(tema);
  const cantidadNum = parseFloat(cantidad.replace(/,/g, ".")) || 0;
  const total = cantidadNum * item.precio;

  const pesoTotalKg =
    item.peso_kg_unidad && cantidadNum > 0
      ? (parseFloat(item.peso_kg_unidad) * cantidadNum).toLocaleString("es-CO", { maximumFractionDigits: 1 })
      : null;

  const cantidadMinima = item.cantidad_minima ? parseFloat(item.cantidad_minima) : null;
  const bajoMinimo = cantidadNum > 0 && cantidadMinima !== null && cantidadNum < cantidadMinima;

  const handleCantidad = (v) => {
    const limpio = v.replace(/[^0-9.,]/g, "").replace(",", ".");
    const partes = limpio.split(".");
    if (partes.length > 2) return;
    setCantidad(limpio);
  };

  const handleNegociar = async () => {
    if (!cantidad.trim())
      return Alert.alert("Error", "Ingresa la cantidad que deseas comprar");
    if (cantidadNum <= 0)
      return Alert.alert("Error", "La cantidad debe ser mayor a 0");
    if (cantidadNum > item.stock) {
      return Alert.alert(
        "Stock insuficiente",
        `El agricultor solo tiene ${item.stock} ${item.unidad} disponibles`,
      );
    }
    if (bajoMinimo) {
      return Alert.alert(
        "Cantidad insuficiente",
        `El agricultor definió una compra mínima de ${cantidadMinima} ${item.unidad}`,
      );
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/publicaciones/${item.id}/negociar/`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ cantidad: cantidadNum }),
        },
      );

      const text = await response.text();
      console.log("Respuesta negociar:", text);
      const data = JSON.parse(text);

      if (response.ok) {
        navigation.replace("EsperandoPago", { negociacion: data, item });
      } else if (response.status === 403 && data.error?.includes("verificar tu documento")) {
        // ✅ NUEVO: el backend bloquea negociar sin documento validado
        Alert.alert(
          "Verifica tu cuenta",
          "Necesitas validar tu documento de identidad antes de poder negociar.",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Verificar ahora", onPress: () => navigation.navigate("VerificarDocumento") },
          ]
        );
      } else {
        Alert.alert("Error", data.error || "No se pudo crear la negociación");
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={s.keyboardView}
      >
        <ScrollView
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.titulo}>Negociar Compra</Text>

          <View style={s.productoCard}>
            <Text style={s.productoNombre}>{item.producto}</Text>
            <Text style={s.productoInfo}>
              Vendedor: {item.vendedor_nombre}
            </Text>
            <Text style={s.productoInfo}>Ubicación: {item.ubicacion}</Text>
            <View style={s.precioRow}>
              <Text style={s.precioLabel}>Precio por {item.unidad}:</Text>
              <Text style={s.precioValor}>
                ${item.precio.toLocaleString()}
              </Text>
            </View>
            <View style={s.precioRow}>
              <Text style={s.precioLabel}>Stock disponible:</Text>
              <Text style={s.precioValor}>
                {item.stock} {item.unidad}
              </Text>
            </View>
            {cantidadMinima !== null && (
              <View style={s.precioRow}>
                <Text style={s.precioLabel}>Compra mínima:</Text>
                <Text style={s.precioValor}>
                  {cantidadMinima} {item.unidad}
                </Text>
              </View>
            )}
          </View>

          <View style={s.inputGroup}>
            <Text style={s.label}>
              ¿Cuánto quieres comprar? ({item.unidad})
            </Text>
            <View style={s.inputWrapper}>
              <Box size={20} color="#709742" />
              <TextInput
                style={s.input}
                placeholder={
                  cantidadMinima !== null
                    ? `Mín: ${cantidadMinima} · Máx: ${item.stock} ${item.unidad}`
                    : `Máx: ${item.stock} ${item.unidad}`
                }
                value={cantidad}
                onChangeText={handleCantidad}
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />
            </View>
            {cantidadNum > item.stock && (
              <Text style={s.errorText}>
                ⚠️ Superas el stock disponible ({item.stock} {item.unidad})
              </Text>
            )}
            {bajoMinimo && (
              <Text style={s.errorText}>
                ⚠️ La compra mínima para esta publicación es {cantidadMinima} {item.unidad}
              </Text>
            )}
            {pesoTotalKg && cantidadNum <= item.stock && !bajoMinimo && (
              <Text style={s.pesoText}>≈ {pesoTotalKg} kg en total</Text>
            )}
          </View>

          {cantidadNum > 0 && cantidadNum <= item.stock && !bajoMinimo ? (
            <View style={s.totalCard}>
              <Text style={s.totalLabel}>Total a pagar:</Text>
              <Text style={s.totalValor}>
                $
                {total.toLocaleString("es-CO", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              s.btn,
              (loading || cantidadNum > item.stock || cantidadNum <= 0 || bajoMinimo) && {
                opacity: 0.5,
              },
            ]}
            onPress={handleNegociar}
            disabled={loading || cantidadNum > item.stock || cantidadNum <= 0 || bajoMinimo}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <ShoppingCart size={22} color="#fff" />
                <Text style={s.btnText}>Enviar solicitud</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const estilos = (tema) => StyleSheet.create({
  container: { flex: 1, backgroundColor: tema.fondo },
  keyboardView: { flex: 1 },
  content: { padding: 20 },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B3A1B",
    marginBottom: 20,
  },
  productoCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    elevation: 3,
  },
  productoNombre: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B3A1B",
    marginBottom: 8,
  },
  productoInfo: { fontSize: 14, color: "#666", marginBottom: 5 },
  precioRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
  },
  precioLabel: { fontSize: 15, color: "#666" },
  precioValor: { fontSize: 16, fontWeight: "bold", color: "#709742" },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: "600", color: "#666", marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  input: { flex: 1, paddingVertical: 14, paddingHorizontal: 10, fontSize: 16 },
  errorText: { color: "#e74c3c", fontSize: 13, marginTop: 6, marginLeft: 4 },
  pesoText: { color: "#709742", fontSize: 13, marginTop: 6, marginLeft: 4 },
  totalCard: {
    backgroundColor: "#F0F7E9",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: 16, color: "#333", fontWeight: "600" },
  totalValor: { fontSize: 24, fontWeight: "bold", color: "#709742" },
  btn: {
    backgroundColor: "#709742",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 15,
    elevation: 4,
  },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default NegociacionScreen;