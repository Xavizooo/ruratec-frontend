import React, { useState, useCallback } from "react";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import {
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, Linking, ActivityIndicator, Share,
} from "react-native";
import {
  MapPin, Box, Calendar, Info, Truck,
  Phone, MessageCircle, ChevronLeft, Star, Share2,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";
import { useTema } from "../context/ThemeContext";

// ─── MAPA CAPACIDAD DE ENTREGA → TEXTO/EMOJI ─────────────────────────────────
const ENTREGA_INFO = {
  retiro_finca: {
    emoji: "🏡",
    titulo: "Solo retiro en finca",
    descripcion: "El comerciante debe enviar su transporte a recoger el producto.",
  },
  casco_urbano: {
    emoji: "🛵",
    titulo: "Lleva al casco urbano",
    descripcion: "El agricultor acerca el producto al municipio más cercano.",
  },
  transporte_propio: {
    emoji: "🚛",
    titulo: "Transporte propio al destino",
    descripcion: "El agricultor entrega directamente en tu ciudad o plaza (flete aparte).",
  },
};

const DetallePublicacionComerciante = ({ route, navigation }) => {
  const { item } = route.params;
  const insets = useSafeAreaInsets();
  const [esFavorito, setEsFavorito] = useState(false);
  const [favoritoId, setFavoritoId] = useState(null);
  const [checkingPendiente, setCheckingPendiente] = useState(true);
  const { tema } = useTema();
  const s = estilos(tema);

  useFocusEffect(
    useCallback(() => {
      setCheckingPendiente(true);
      registrarVisita();
      verificarFavorito();
      verificarNegociacionPendiente();
      return () => {};
    }, [item.id])
  );

  const handleCompartir = async () => {
    try {
      await Share.share({
        message: `🌱 *${item.producto}* - Disponible en RURATEC\n\n📍 ${item.ubicacion}\n💰 $${item.precio?.toLocaleString()} / ${item.unidad}\n📦 Stock: ${item.stock} ${item.unidad}\n\n¡Descarga RURATEC y conecta con agricultores colombianos!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const verificarNegociacionPendiente = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${API_URL}/publicaciones/${item.id}/negociacion-activa/`,
        { headers: { Authorization: `Token ${token}` } }
      );

      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType?.includes("application/json")) {
        console.warn(`Respuesta no válida: status=${response.status}`);
        return;
      }

      const data = await response.json();
      if (data.activa && data.negociacion) {
        const estado = data.negociacion.estado;
        if (estado === "pendiente_agricultor") {
          navigation.replace("EsperandoPago", { negociacion: data.negociacion, item });
          return;
        } else if (estado === "aceptado") {
          navigation.replace("Pago", { negociacion: data.negociacion, item });
          return;
        }
      }
    } catch (error) {
      console.error("Error verificando negociación pendiente:", error);
    } finally {
      setCheckingPendiente(false);
    }
  };

  const registrarVisita = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await fetch(`${API_URL}/publicaciones/${item.id}/visita/`, {
        method: "POST",
        headers: { Authorization: `Token ${token}` },
      });
    } catch (error) {
      console.error("Error registrando visita:", error);
    }
  };

  const verificarFavorito = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_URL}/favoritos/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await response.json();
      const fav = data.find((f) => f.publicacion === item.id);
      if (fav) { setEsFavorito(true); setFavoritoId(fav.id); }
    } catch (error) {
      console.error("Error verificando favorito:", error);
    }
  };

  const toggleFavorito = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (esFavorito) {
        await fetch(`${API_URL}/favoritos/${favoritoId}/eliminar/`, {
          method: "DELETE",
          headers: { Authorization: `Token ${token}` },
        });
        setEsFavorito(false);
        setFavoritoId(null);
      } else {
        await fetch(`${API_URL}/publicaciones/${item.id}/favorito/`, {
          method: "POST",
          headers: { Authorization: `Token ${token}` },
        });
        await verificarFavorito();
        setEsFavorito(true);
      }
    } catch (error) {
      console.error("Error toggling favorito:", error);
    }
  };

  const handleContactar = () => {
    const mensaje = `Hola, estoy interesado en tu publicación de ${item.producto} en RURATEC.`;
    const telefono = item.vendedor_telefono || "573000000000";
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(mensaje)}&phone=${telefono}`);
  };

  const pesoTotalKg =
    item.peso_kg_unidad && item.stock
      ? (parseFloat(item.peso_kg_unidad) * item.stock).toLocaleString("es-CO", { maximumFractionDigits: 1 })
      : null;

  const cantidadMinima = item.cantidad_minima ? parseFloat(item.cantidad_minima) : null;

  // ✅ Info de entrega
  const entregaInfo = item.capacidad_entrega ? ENTREGA_INFO[item.capacidad_entrega] : null;

  if (checkingPendiente) {
    return (
      <SafeAreaView style={[s.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#709742" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView bounces={false}>
        <View style={s.imageContainer}>
          {item.imagen_url ? (
            <Image source={{ uri: item.imagen_url }} style={s.mainImage} />
          ) : (
            <View style={[s.mainImage, { backgroundColor: "#e0e0e0", justifyContent: "center", alignItems: "center" }]}>
              <Text style={{ color: "#999", fontSize: 16 }}>Sin imagen</Text>
            </View>
          )}
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={s.favBtn} onPress={toggleFavorito}>
            <Star size={24} color={esFavorito ? "#FFD700" : "#fff"} fill={esFavorito ? "#FFD700" : "transparent"} />
          </TouchableOpacity>
        </View>

        <View style={s.infoContent}>
          <View style={s.headerSection}>
            <View style={{ flex: 1 }}>
              <Text style={s.productTitle}>{item.producto}</Text>
              <Text style={s.farmerSub}>Publicado por: {item.vendedor_nombre || "Productor Ruratec"}</Text>
            </View>
            <View style={s.priceBadge}>
              <Text style={s.priceValue}>${item.precio ? item.precio.toLocaleString() : "--"}</Text>
              <Text style={s.priceUnit}>/ {item.unidad}</Text>
            </View>
          </View>

          {/* ✅ BADGE DE CAPACIDAD DE ENTREGA — resaltado en amarillo */}
          {entregaInfo && (
            <View style={s.entregaBadge}>
              <View style={s.entregaHeader}>
                <Text style={s.entregaEmoji}>{entregaInfo.emoji}</Text>
                <Text style={s.entregaTitulo}>{entregaInfo.titulo}</Text>
              </View>
              <Text style={s.entregaDescripcion}>{entregaInfo.descripcion}</Text>
            </View>
          )}

          <View style={s.detailsGrid}>
            <View style={s.detailItem}>
              <Box size={20} color={tema.iconoVerde} />
              <View>
                <Text style={s.detailLabel}>Stock disponible</Text>
                <Text style={s.detailValue}>{item.stock ? `${item.stock.toLocaleString()} ${item.unidad || ""}` : "No especificado"}</Text>
                {pesoTotalKg && <Text style={s.detailSub}>≈ {pesoTotalKg} kg en total</Text>}
                {cantidadMinima !== null && <Text style={s.detailSub}>Compra mínima: {cantidadMinima} {item.unidad}</Text>}
              </View>
            </View>
            <View style={s.detailItem}>
              <MapPin size={20} color={tema.iconoVerde} />
              <View>
                <Text style={s.detailLabel}>Origen</Text>
                <Text style={s.detailValue}>{item.ubicacion}</Text>
              </View>
            </View>
            <View style={s.detailItem}>
              <Calendar size={20} color={tema.iconoVerde} />
              <View>
                <Text style={s.detailLabel}>Publicado</Text>
                <Text style={s.detailValue}>{new Date(item.creado_en).toLocaleDateString("es-CO")}</Text>
              </View>
            </View>
            <View style={s.detailItem}>
              <Phone size={20} color={tema.iconoVerde} />
              <View>
                <Text style={s.detailLabel}>Contacto</Text>
                <Text style={s.detailValue}>{item.vendedor_telefono || "N/A"}</Text>
              </View>
            </View>
          </View>

          <View style={s.descriptionCard}>
            <Text style={s.sectionTitle}>Descripción</Text>
            <View style={s.infoRow}>
              <Info size={18} color={tema.textoSecundario} />
              <Text style={s.infoPara}>{item.descripcion || "Sin descripción disponible."}</Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <View style={[s.footerActions, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity style={[s.actionBtn, s.callBtn]} onPress={() => Linking.openURL(`tel:${item.vendedor_telefono}`)}>
          <Phone size={22} color={tema.iconoVerde} />
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, s.whatsappBtn]} onPress={handleContactar}>
          <MessageCircle size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, s.shareBtn]} onPress={handleCompartir}>
          <Share2 size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, s.contactBtn]} onPress={() => navigation.navigate("Negociacion", { item })}>
          <Text style={s.contactBtnText}>Negociar y Pagar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const estilos = (tema) => StyleSheet.create({
  container: { flex: 1, backgroundColor: tema.fondo },
  imageContainer: { position: "relative" },
  mainImage: { width: "100%", height: 300, backgroundColor: "#eee" },
  backBtn: { position: "absolute", top: 20, left: 20, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20, padding: 8 },
  favBtn: { position: "absolute", top: 20, right: 20, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20, padding: 8 },
  infoContent: { padding: 20, marginTop: -30, backgroundColor: tema.card, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  headerSection: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  productTitle: { fontSize: 28, fontWeight: "bold", color: tema.textoTitulo },
  farmerSub: { fontSize: 14, color: tema.textoSecundario, marginTop: 4 },
  priceBadge: { backgroundColor: tema.fondo, padding: 12, borderRadius: 15, alignItems: "center" },
  priceValue: { fontSize: 22, fontWeight: "bold", color: tema.iconoVerde },
  priceUnit: { fontSize: 12, color: tema.iconoVerde, fontWeight: "600" },

  // ✅ Estilos badge entrega amarillo
  entregaBadge: {
    backgroundColor: "#FFFBEB",
    borderWidth: 2,
    borderColor: "#F59E0B",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  entregaHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  entregaEmoji: { fontSize: 20, marginRight: 8 },
  entregaTitulo: { fontSize: 15, fontWeight: "bold", color: "#B45309" },
  entregaDescripcion: { fontSize: 13, color: "#92400E", lineHeight: 18 },

  detailsGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 25 },
  detailItem: { width: "50%", flexDirection: "row", alignItems: "flex-start", marginBottom: 20, gap: 10 },
  detailLabel: { fontSize: 12, color: tema.textoSecundario, fontWeight: "600" },
  detailValue: { fontSize: 15, color: tema.texto, fontWeight: "bold" },
  detailSub: { fontSize: 11, color: tema.textoSecundario, marginTop: 2 },
  descriptionCard: { backgroundColor: tema.fondo, padding: 18, borderRadius: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: tema.textoTitulo, marginBottom: 10 },
  infoRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  infoPara: { fontSize: 14, color: tema.textoSecundario, lineHeight: 20, flex: 1 },
  footerActions: { position: "absolute", bottom: 0, width: "100%", padding: 20, flexDirection: "row", gap: 10, backgroundColor: tema.card, borderTopWidth: 1, borderTopColor: tema.borde },
  actionBtn: { height: 55, borderRadius: 15, justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 10 },
  callBtn: { width: 55, borderWidth: 1, borderColor: tema.iconoVerde },
  whatsappBtn: { width: 55, backgroundColor: "#25D366" },
  shareBtn: { width: 55, backgroundColor: "#1DA1F2" },
  contactBtn: { flex: 1, backgroundColor: "#709742", elevation: 4 },
  contactBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default DetallePublicacionComerciante;