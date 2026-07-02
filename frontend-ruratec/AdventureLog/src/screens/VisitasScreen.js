import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { User, Phone, Clock, } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";
import { useTema } from "../context/ThemeContext";

const VisitasScreen = ({ route, navigation }) => {
  const { publicacion } = route.params;
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { tema } = useTema();
  const s = estilos(tema);
  useEffect(() => {
    cargarVisitas();
  }, []);

  const cargarVisitas = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/publicaciones/${publicacion.id}/visitas/`,
        {
          headers: { Authorization: `Token ${token}` },
        },
      );
      const data = await response.json();
      setVisitas(data);
    } catch (error) {
      console.error("Error cargando visitas:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderVisita = ({ item }) => (
    <View style={s.card}>
      <View style={s.cardHeader}>
        {item.comerciante_foto ? (
          <Image
            source={{ uri: item.comerciante_foto }}
            style={s.avatarImg}
          />
        ) : (
          <View style={s.avatar}>
            <User size={24} color="#709742" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={s.nombre}>{item.comerciante_nombre}</Text>
          <View style={s.infoRow}>
            <Phone size={13} color="#999" />
            <Text style={s.telefono}>
              {item.comerciante_telefono || "Sin teléfono"}
            </Text>
          </View>
          <View style={s.infoRow}>
            <Clock size={13} color="#999" />
            <Text style={s.fecha}>
              {new Date(item.visitado_en).toLocaleDateString("es-CO")}
            </Text>
          </View>
        </View>
      </View>

      
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      <Text style={s.titulo}>Interesados en {publicacion.producto}</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#709742"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={visitas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderVisita}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <Text style={s.emptyText}>
                Nadie ha visto esta publicación aún
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
  titulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B3A1B",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
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
    alignItems: "center",
    gap: 15,
    marginBottom: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0F7E9",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  nombre: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 4 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },
  telefono: { fontSize: 13, color: "#666" },
  fecha: { fontSize: 12, color: "#999" },
  negociarBtn: {
    backgroundColor: "#709742",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  negociarText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  emptyContainer: { alignItems: "center", marginTop: 50 },
  emptyText: { color: "#999", fontSize: 15 },
});

export default VisitasScreen;
