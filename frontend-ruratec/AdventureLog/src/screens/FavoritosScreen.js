import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Star,
  MapPin,
  DollarSign,
  Box,
  Trash2,
  ChevronRight,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";
import { useTema } from "../context/ThemeContext";

const FavoritosScreen = ({ navigation }) => {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { tema } = useTema();
  const s = estilos(tema);
  useEffect(() => {
    cargarFavoritos();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      cargarFavoritos();
    });
    return unsubscribe;
  }, [navigation]);

  const cargarFavoritos = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_URL}/favoritos/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await response.json();
      setFavoritos(data);
    } catch (error) {
      console.error("Error cargando favoritos:", error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarFavorito = async (favoritoId, nombreProducto) => {
    Alert.alert(
      "Quitar favorito",
      `¿Quieres quitar "${nombreProducto}" de tus favoritos?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Quitar",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const response = await fetch(
                `${API_URL}/favoritos/${favoritoId}/eliminar/`,
                {
                  method: "DELETE",
                  headers: { Authorization: `Token ${token}` },
                },
              );
              if (response.ok) {
                setFavoritos((prev) => prev.filter((f) => f.id !== favoritoId));
              }
            } catch (error) {
              console.error("Error eliminando favorito:", error);
            }
          },
        },
      ],
    );
  };

  const renderFavorito = ({ item }) => {
    const pub = item.publicacion_detalle;
    return (
      <TouchableOpacity
        style={s.card}
        onPress={() => navigation.navigate("DetallePublicacion", { item: pub })}
      >
        {pub.imagen ? (
          <Image source={{ uri: pub.imagen_url }} style={s.cardImage} />
        ) : (
          <View style={[s.cardImage, styles.noImage]}>
            <Text style={{ color: "#999", fontSize: 11 }}>Sin imagen</Text>
          </View>
        )}

        <View style={s.cardContent}>
          <View style={s.headerCard}>
            <Text style={s.cardTitle}>{pub.producto}</Text>
            <TouchableOpacity
              onPress={() => eliminarFavorito(item.id, pub.producto)}
            >
              <Trash2 size={18} color="#e74c3c" />
            </TouchableOpacity>
          </View>

          {pub.descripcion ? (
            <Text style={s.descripcion} numberOfLines={1}>
              {pub.descripcion}
            </Text>
          ) : null}

          <View style={s.infoRow}>
            <MapPin size={13} color="#709742" />
            <Text style={s.infoText}>{pub.ubicacion}</Text>
          </View>

          <View style={s.statsRow}>
            <View style={s.stat}>
              <Box size={13} color="#555" />
              {/* ✅ 'stock_unidad' eliminado — usa la unidad única */}
              <Text style={s.statText}>
                {pub.stock} {pub.unidad}
              </Text>
            </View>
            <View style={s.stat}>
              <DollarSign size={13} color="#555" />
              <Text style={s.statText}>
                ${pub.precio ? pub.precio.toLocaleString() : "--"} /{" "}
                {pub.unidad}
              </Text>
            </View>
          </View>

          <View style={s.footerCard}>
            <Text style={s.farmerName}>Por: {pub.vendedor_nombre}</Text>
            <ChevronRight size={16} color="#709742" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={s.header}>
        <Star size={22} color="#709742" fill="#709742" />
        <Text style={s.headerTitle}>Mis Favoritos</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#709742"
          style={{ marginTop: 30 }}
        />
      ) : (
        <FlatList
          data={favoritos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFavorito}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <Star size={50} color="#ddd" />
              <Text style={s.emptyTitle}>Sin favoritos aún</Text>
              <Text style={s.emptyText}>
                Guarda productos que te interesen para verlos aquí
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B3A1B",
  },
  list: { padding: 15 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 15,
    flexDirection: "row",
    elevation: 3,
    overflow: "hidden",
  },
  cardImage: { width: 110, height: "100%", backgroundColor: "#eee" },
  noImage: { justifyContent: "center", alignItems: "center" },
  cardContent: { flex: 1, padding: 12 },
  headerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#1B3A1B", flex: 1 },
  descripcion: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 6,
  },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  infoText: { fontSize: 12, color: "#709742", marginLeft: 4 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 8 },
  stat: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontSize: 12, fontWeight: "bold", color: "#444" },
  footerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f1f1",
    paddingTop: 8,
  },
  farmerName: { fontSize: 11, color: "#999", fontWeight: "600" },
  emptyContainer: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  emptyText: { fontSize: 14, color: "#999", textAlign: "center" },
});

export default FavoritosScreen;