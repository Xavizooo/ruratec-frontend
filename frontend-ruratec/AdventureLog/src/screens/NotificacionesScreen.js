import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,

  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  Check,
  CheckCheck,
  ShoppingCart,
  Eye,
  DollarSign,
  Clock,
  X,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";
import { useTema } from "../context/ThemeContext";

const iconoPorTipo = (tipo) => {
  switch (tipo) {
    case "visita":
      return <Eye size={20} color="#709742" />;
    case "negociacion":
      return <ShoppingCart size={20} color="#F59E0B" />;
    case "aceptado":
      return <Check size={20} color="#10B981" />;
    case "rechazado":
      return <X size={20} color="#EF4444" />;
    case "pago":
      return <DollarSign size={20} color="#3B82F6" />;
    case "expiracion":
      return <Clock size={20} color="#F97316" />;
    default:
      return <Bell size={20} color="#709742" />;
  }
};

const colorPorTipo = (tipo) => {
  switch (tipo) {
    case "visita":
      return "#F0F7E9";
    case "negociacion":
      return "#FEF3C7";
    case "aceptado":
      return "#D1FAE5";
    case "rechazado":
      return "#FEE2E2";
    case "pago":
      return "#DBEAFE";
    case "expiracion":
      return "#FFEDD5";
    default:
      return "#F0F7E9";
  }
};

const NotificacionesScreen = ({ navigation }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rol, setRol] = useState("");
  const { tema } = useTema();
  const s = estilos(tema);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      cargarDatos();
    });
    return unsubscribe;
  }, [navigation]);

  const cargarDatos = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const rolGuardado = await AsyncStorage.getItem("rol");
      setRol(rolGuardado || "");

      const response = await fetch(`${API_URL}/notificaciones/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await response.json();
      setNotificaciones(data);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarDatos();
    setRefreshing(false);
  };

  const marcarLeida = async (id) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await fetch(`${API_URL}/notificaciones/${id}/leer/`, {
        method: "PUT",
        headers: { Authorization: `Token ${token}` },
      });
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
    } catch (error) {
      console.error("Error marcando notificación:", error);
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await fetch(`${API_URL}/notificaciones/leer-todas/`, {
        method: "PUT",
        headers: { Authorization: `Token ${token}` },
      });
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch (error) {
      console.error("Error marcando todas:", error);
    }
  };



  const handlePresionar = async (notif) => {
  if (!notif.leida) await marcarLeida(notif.id);

  if (rol === "Agricultor" && notif.tipo === "negociacion") {
    navigation.navigate("NegociacionesAgricultor");
  }

  if (rol === "Comerciante" && notif.tipo === "aceptado" && notif.negociacion_id) {
    try {
      const token = await AsyncStorage.getItem("token");
      const negRes = await fetch(`${API_URL}/negociaciones/${notif.negociacion_id}/estado/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const negociacion = await negRes.json();
      const pubRes = await fetch(`${API_URL}/publicaciones/${negociacion.publicacion}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const item = await pubRes.json();
      navigation.navigate("Pago", { negociacion, item });
    } catch {
      Alert.alert("Error", "No se pudo cargar la negociación");
    }
  }

  if (rol === "Comerciante" && notif.tipo === "rechazado") {
    Alert.alert(
      "Negociación rechazada",
      "El agricultor no pudo aceptar tu solicitud en este momento.",
      [{ text: "OK" }]
    );
  }
};

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  const renderNotif = ({ item }) => {
    const esNegociacionPendiente =
      rol === "Agricultor" &&
      item.tipo === "negociacion" &&
      item.negociacion_id &&
      !item.leida;

    return (
      <TouchableOpacity
        style={[s.card, !item.leida && s.cardNoLeida]}
        onPress={() => handlePresionar(item)}
        activeOpacity={0.8}
      >
        <View style={[s.iconBox, { backgroundColor: colorPorTipo(item.tipo) }]}>
          {iconoPorTipo(item.tipo)}
        </View>

        <View style={s.cardContent}>
          <Text style={s.titulo}>{item.titulo}</Text>
          <Text style={s.mensaje}>{item.mensaje}</Text>
          <Text style={s.fecha}>
            {new Date(item.creado_en).toLocaleDateString("es-CO", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>

          {/* ✅ Botones de aceptar/rechazar inline para el agricultor */}
          {esNegociacionPendiente && (
            <View style={s.botonesRow}>
              <TouchableOpacity
                style={[s.btn, s.rechazarBtn]}
                onPress={() =>
                  responderDesdeNotif(item.negociacion_id, "rechazar", item.id)
                }
              >
                <X size={15} color="#DC2626" />
                <Text style={s.rechazarText}>Rechazar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btn, s.aceptarBtn]}
                onPress={() =>
                  responderDesdeNotif(item.negociacion_id, "aceptar", item.id)
                }
              >
                <Check size={15} color="#fff" />
                <Text style={s.aceptarText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {!item.leida && <View style={s.puntito} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" />

      <View style={s.header}>
        <View style={s.headerLeft}>
          <Bell size={22} color="#709742" />
          <Text style={s.headerTitle}>Notificaciones</Text>
          {noLeidas > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeText}>{noLeidas}</Text>
            </View>
          )}
        </View>
        {noLeidas > 0 && (
          <TouchableOpacity onPress={marcarTodasLeidas} style={s.marcarBtn}>
            <CheckCheck size={16} color="#709742" />
            <Text style={s.marcarText}>Marcar todas</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#709742"
          style={{ marginTop: 30 }}
        />
      ) : (
        <FlatList
          data={notificaciones}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNotif}
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
              <Bell size={50} color="#ddd" />
              <Text style={s.emptyTitle}>Sin notificaciones</Text>
              <Text style={s.emptyText}>
                Aquí aparecerán tus alertas y novedades
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const estilos = (tema) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: tema.fondo },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#fff",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1B3A1B" },
    badge: {
      backgroundColor: "#FF3B30",
      borderRadius: 10,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    badgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
    marcarBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
    marcarText: { color: "#709742", fontSize: 13, fontWeight: "600" },
    list: { padding: 15 },
    card: {
      backgroundColor: "#fff",
      borderRadius: 15,
      padding: 15,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      elevation: 2,
    },
    cardNoLeida: {
      borderLeftWidth: 3,
      borderLeftColor: "#709742",
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    cardContent: { flex: 1 },
    titulo: {
      fontSize: 15,
      fontWeight: "bold",
      color: "#1B3A1B",
      marginBottom: 3,
    },
    mensaje: { fontSize: 13, color: "#555", lineHeight: 18, marginBottom: 5 },
    fecha: { fontSize: 11, color: "#999", marginBottom: 8 },
    // ✅ Botones
    botonesRow: { flexDirection: "row", gap: 8, marginTop: 4 },
    btn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      paddingVertical: 8,
      borderRadius: 8,
    },
    rechazarBtn: { borderWidth: 1, borderColor: "#DC2626" },
    rechazarText: { color: "#DC2626", fontWeight: "bold", fontSize: 13 },
    aceptarBtn: { backgroundColor: "#709742" },
    aceptarText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
    puntito: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: "#709742",
    },
    emptyContainer: { alignItems: "center", marginTop: 80, gap: 12 },
    emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
    emptyText: { fontSize: 14, color: "#999", textAlign: "center" },
  });

export default NotificacionesScreen;