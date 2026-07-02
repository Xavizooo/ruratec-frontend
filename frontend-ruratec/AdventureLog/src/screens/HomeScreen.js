import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Image, StatusBar, ActivityIndicator,
  RefreshControl, Alert,
} from "react-native";
import {
  Plus, MapPin, Box, DollarSign, User,
  Settings, ShoppingBasket, TrendingUp, Bell,
} from "lucide-react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";
import { useTema } from "../context/ThemeContext";

const HomeScreen = ({ navigation }) => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const insets = useSafeAreaInsets();
  const { tema } = useTema();
  const s = estilos(tema);

  useEffect(() => { cargarDatos(); }, []);
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => { cargarDatos(); });
    return unsubscribe;
  }, [navigation]);

  const cargarDatos = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const nombreGuardado = await AsyncStorage.getItem("nombre");
      setNombre(nombreGuardado || "");
      const response = await fetch(`${API_URL}/publicaciones/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await response.json();
      const userId = await AsyncStorage.getItem("user_id");
      const misPubs = data.filter((p) => p.vendedor.toString() === userId);
      setPublicaciones(misPubs);
      const notifResponse = await fetch(`${API_URL}/notificaciones/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const notifData = await notifResponse.json();
      setNotifCount(notifData.filter((n) => !n.leida).length);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarDatos();
    setRefreshing(false);
  };

  const handleLongPress = (item) => {
    const horas = (new Date() - new Date(item.creado_en)) / (1000 * 60 * 60);
    if (horas >= 24) {
      Alert.alert("Sin permisos", "Ya pasaron las 24 horas para editar o eliminar esta publicación.");
      return;
    }
    Alert.alert(item.producto, "¿Qué deseas hacer?", [
      { text: "Editar", onPress: () => navigation.navigate("EditarPublicacion", { publicacion: item }) },
      { text: "Eliminar", style: "destructive", onPress: () => confirmarEliminar(item) },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const confirmarEliminar = async (item) => {
    Alert.alert("Eliminar publicación", `¿Seguro que quieres eliminar "${item.producto}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar", style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            const response = await fetch(`${API_URL}/publicaciones/${item.id}/eliminar/`, {
              method: "DELETE",
              headers: { Authorization: `Token ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
              Alert.alert("✅ Eliminada", "Publicación eliminada correctamente");
              cargarDatos();
            } else {
              Alert.alert("Error", data.error);
            }
          } catch {
            Alert.alert("Error de conexión", "Verifica tu conexión");
          }
        },
      },
    ]);
  };

  const CardCanasta = () => (
    <TouchableOpacity style={s.cardCanasta} onPress={() => navigation.navigate("CanastaPreciosScreen")} activeOpacity={0.82}>
      <View style={s.canastaBgCircle1} />
      <View style={s.canastaBgCircle2} />
      <View style={s.canastaIconBox}>
        <ShoppingBasket size={26} color="#fff" />
      </View>
      <View style={s.canastaTextos}>
        <Text style={s.canastaTitulo}>Canasta Familiar</Text>
        <Text style={s.canastaSubtitulo}>Precios mayoristas oficiales · SIPSA DANE</Text>
      </View>
      <View style={s.canastaArrow}>
        <TrendingUp size={18} color="#fff" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle={tema.statusBar} />
      <View style={s.header}>
        <TouchableOpacity onPress={onRefresh} activeOpacity={0.7}>
          <Image source={require("../../imagenes/logo.png")} style={s.logoImage} resizeMode="contain" />
        </TouchableOpacity>
        <Text style={s.saludo}>Bienvenido a Ruratec, {nombre} 👋</Text>
        <TouchableOpacity style={s.notifButton} onPress={() => navigation.navigate("Notificaciones")} activeOpacity={0.7}>
          <Bell size={24} color={tema.iconoVerde} />
          {notifCount > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeText}>{notifCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#709742" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={publicaciones}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListHeaderComponent={<CardCanasta />}
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <Text style={s.emptyText}>No tienes productos publicados aún</Text>
            </View>
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#709742"]} tintColor="#709742" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.card}
              onPress={() => navigation.navigate("Visitas", { publicacion: item })}
              onLongPress={() => handleLongPress(item)}
              delayLongPress={500}
            >
              {item.imagen_url ? (
                <Image source={{ uri: item.imagen_url }} style={s.cardImage} />
              ) : (
                <View style={[s.cardImage, s.noImage]}>
                  <Text style={{ color: "#999" }}>Sin imagen</Text>
                </View>
              )}
              <View style={s.cardContent}>
                <Text style={s.cardTitle}>{item.producto}</Text>
                <View style={s.infoRow}>
                  <MapPin size={14} color={tema.iconoVerde} />
                  <Text style={s.infoText}>{item.ubicacion}</Text>
                </View>
                <View style={s.statsRow}>
                  <View style={s.stat}>
                    <Box size={14} color={tema.textoSecundario} />
                    {/* ✅ 'stock_unidad' eliminado — usa la unidad única */}
                    <Text style={s.statText}>{item.stock} {item.unidad}</Text>
                  </View>
                  <View style={s.stat}>
                    <DollarSign size={14} color={tema.textoSecundario} />
                    <Text style={s.statText}>${item.precio.toLocaleString()}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <View style={[s.bottomBar, { bottom: insets.bottom + 10 }]}>
        <TouchableOpacity style={s.barBtn} onPress={() => navigation.navigate("Perfil")}>
          <User size={24} color={tema.iconoVerde} />
          <Text style={s.barLabel}>Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.barBtnCenter} onPress={() => navigation.navigate("Camera")}>
          <Plus size={30} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={s.barBtn} onPress={() => navigation.navigate("Configuracion")}>
          <Settings size={24} color={tema.iconoVerde} />
          <Text style={s.barLabel}>Ajustes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const estilos = (tema) => StyleSheet.create({
  container: { flex: 1, backgroundColor: tema.fondo },
  header: {
    backgroundColor: tema.header,
    height: 110,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: tema.borde,
    position: "relative",
  },
  logoImage: { width: 180, height: 60 },
  saludo: { fontSize: 14, color: tema.iconoVerde, fontWeight: "600", marginTop: 5 },
  notifButton: { position: "absolute", right: 20, top: 25, padding: 8 },
  badge: {
    position: "absolute", right: 4, top: 4,
    backgroundColor: "#FF3B30", borderRadius: 8,
    width: 16, height: 16, justifyContent: "center", alignItems: "center",
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "bold" },
  cardCanasta: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#709742", borderRadius: 18,
    marginHorizontal: 15, marginTop: 16, marginBottom: 8,
    paddingVertical: 16, paddingHorizontal: 18,
    overflow: "hidden", elevation: 5,
    shadowColor: "#709742", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8,
  },
  canastaBgCircle1: {
    position: "absolute", width: 120, height: 120, borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.08)", top: -30, right: 60,
  },
  canastaBgCircle2: {
    position: "absolute", width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.06)", bottom: -20, right: 10,
  },
  canastaIconBox: {
    width: 46, height: 46, borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center", marginRight: 14,
  },
  canastaTextos: { flex: 1 },
  canastaTitulo: { fontSize: 16, fontWeight: "700", color: "#fff", marginBottom: 3 },
  canastaSubtitulo: { fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: "500" },
  canastaArrow: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center", alignItems: "center", marginLeft: 10,
  },
  emptyContainer: { alignItems: "center", marginTop: 50 },
  emptyText: { color: tema.textoSecundario, fontSize: 16 },
  card: {
    backgroundColor: tema.card, borderRadius: 15,
    marginBottom: 20, elevation: 4, overflow: "hidden",
    borderWidth: 1, borderColor: tema.borde, marginHorizontal: 15,
  },
  cardImage: { width: "100%", height: 180 },
  noImage: { justifyContent: "center", alignItems: "center", backgroundColor: tema.fondo },
  cardContent: { padding: 15 },
  cardTitle: { fontSize: 20, fontWeight: "bold", color: tema.texto, marginBottom: 5 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  infoText: { fontSize: 14, color: tema.iconoVerde, marginLeft: 5, fontWeight: "600" },
  statsRow: {
    flexDirection: "row", gap: 25,
    borderTopWidth: 1, borderTopColor: tema.separador, paddingTop: 12,
  },
  stat: { flexDirection: "row", alignItems: "center", gap: 6 },
  statText: { fontSize: 15, color: tema.texto, fontWeight: "bold" },
  bottomBar: {
    position: "absolute", left: 30, right: 30, height: 65,
    backgroundColor: tema.card, borderRadius: 35,
    flexDirection: "row", alignItems: "center", justifyContent: "space-around",
    elevation: 10, shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10,
    paddingHorizontal: 10,
  },
  barBtn: { alignItems: "center", justifyContent: "center", flex: 1 },
  barLabel: { fontSize: 11, color: tema.iconoVerde, marginTop: 2, fontWeight: "600" },
  barBtnCenter: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: "#709742", justifyContent: "center", alignItems: "center",
    elevation: 6, shadowColor: "#709742",
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 6,
  },
});

export default HomeScreen;