import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { Check, X, ShoppingCart, DollarSign, Box } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";
import { useTema } from "../context/ThemeContext";
const NegociacionesAgricultorScreen = ({ navigation }) => {
  const [negociaciones, setNegociaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { tema } = useTema();
  const s = estilos(tema);

  useEffect(() => {
    cargarNegociaciones();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      cargarNegociaciones();
    });
    return unsubscribe;
  }, [navigation]);

  const cargarNegociaciones = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_URL}/negociaciones/agricultor/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await response.json();
      setNegociaciones(data);
    } catch (error) {
      console.error("Error cargando negociaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarNegociaciones();
    setRefreshing(false);
  };

  const responder = async (id, accion) => {
    const mensaje =
      accion === "aceptar"
        ? "¿Aceptar esta negociación? El comerciante podrá proceder al pago."
        : "¿Rechazar esta negociación?";

    Alert.alert(
      accion === "aceptar" ? "Aceptar negociación" : "Rechazar negociación",
      mensaje,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: accion === "aceptar" ? "Aceptar" : "Rechazar",
          style: accion === "aceptar" ? "default" : "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const response = await fetch(
                `${API_URL}/negociaciones/${id}/responder/`,
                {
                  method: "PUT",
                  headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ accion }),
                },
              );

              if (response.ok) {
                Alert.alert(
                  accion === "aceptar" ? "✅ Aceptada" : "❌ Rechazada",
                  accion === "aceptar"
                    ? "El comerciante fue notificado y puede proceder al pago."
                    : "La negociación fue rechazada.",
                );
                cargarNegociaciones();
              } else {
                const data = await response.json();
                Alert.alert("Error", data.error || "No se pudo procesar");
              }
            } catch (error) {
              Alert.alert("Error de conexión", "Verifica tu conexión");
            }
          },
        },
      ],
    );
  };

  const colorEstado = (estado) => {
    switch (estado) {
      case "pendiente_agricultor":
        return { bg: "#FEF3C7", text: "#D97706" };
      case "aceptado":
      case "pendiente":
        return { bg: "#D1FAE5", text: "#059669" };
      case "rechazado":
        return { bg: "#FEE2E2", text: "#DC2626" };
      case "pagado":
        return { bg: "#DBEAFE", text: "#2563EB" };
      default:
        return { bg: "#F3F4F6", text: "#6B7280" };
    }
  };

  const labelEstado = (estado) => {
    switch (estado) {
      case "pendiente_agricultor":
        return "Pendiente tu respuesta";
      case "aceptado":
      case "pendiente":
        return "Aceptada - Esperando pago";
      case "rechazado":
        return "Rechazada";
      case "pagado":
        return "Pagada ✅";
      default:
        return estado;
    }
  };

  const renderNegociacion = ({ item }) => {
    const colores = colorEstado(item.estado);
    const esPendiente = item.estado === "pendiente_agricultor";

    return (
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View style={s.headerLeft}>
            <ShoppingCart size={18} color="#709742" />
            <Text style={s.producto}>{item.publicacion_nombre}</Text>
          </View>
          <View style={[s.estadoBadge, { backgroundColor: colores.bg }]}>
            <Text style={[s.estadoText, { color: colores.text }]}>
              {labelEstado(item.estado)}
            </Text>
          </View>
        </View>

        <View style={s.infoRow}>
          <View style={s.infoItem}>
            <Box size={14} color="#999" />
            <Text style={s.infoText}>{item.cantidad} unidades</Text>
          </View>
          <View style={s.infoItem}>
            <DollarSign size={14} color="#999" />
            <Text style={s.infoText}>
              $
              {parseFloat(item.total).toLocaleString("es-CO", {
                maximumFractionDigits: 0,
              })}
            </Text>
          </View>
        </View>

        <Text style={s.comerciante}>
          Comerciante: {item.comerciante_nombre}
        </Text>

        <Text style={s.fecha}>
          {new Date(item.creado_en).toLocaleDateString("es-CO", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>

        {esPendiente && (
          <View style={s.botonesRow}>
            <TouchableOpacity
              style={[s.btn, s.rechazarBtn]}
              onPress={() => responder(item.id, "rechazar")}
            >
              <X size={18} color="#DC2626" />
              <Text style={s.rechazarText}>Rechazar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btn, s.aceptarBtn]}
              onPress={() => responder(item.id, "aceptar")}
            >
              <Check size={18} color="#fff" />
              <Text style={s.aceptarText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" />

      <View style={s.header}>
        <ShoppingCart size={22} color="#709742" />
        <Text style={s.headerTitle}>Negociaciones</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#709742"
          style={{ marginTop: 30 }}
        />
      ) : (
        <FlatList
          data={negociaciones}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNegociacion}
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#709742"]}
              tintColor="#709742"
            />
          }
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <ShoppingCart size={50} color="#ddd" />
              <Text style={s.emptyTitle}>Sin negociaciones</Text>
              <Text style={s.emptyText}>
                Aquí aparecerán las solicitudes de compra de tus productos
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const estilos = (tema) => StyleSheet.create({
  container: { flex: 1, backgroundColor: tema.fondo },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1B3A1B" },
  list: { padding: 15 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 8,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  producto: { fontSize: 16, fontWeight: "bold", color: "#1B3A1B" },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  estadoText: { fontSize: 12, fontWeight: "600" },
  infoRow: { flexDirection: "row", gap: 20, marginBottom: 8 },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  infoText: { fontSize: 14, color: "#555", fontWeight: "600" },
  comerciante: { fontSize: 13, color: "#666", marginBottom: 4 },
  fecha: { fontSize: 11, color: "#999", marginBottom: 12 },
  botonesRow: { flexDirection: "row", gap: 10 },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 12,
    borderRadius: 10,
  },
  rechazarBtn: { borderWidth: 1, borderColor: "#DC2626" },
  rechazarText: { color: "#DC2626", fontWeight: "bold", fontSize: 15 },
  aceptarBtn: { backgroundColor: "#709742" },
  aceptarText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  emptyContainer: { alignItems: "center", marginTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});

export default NegociacionesAgricultorScreen;
