import React, { useState, useEffect, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  View, Text, StyleSheet, FlatList, Image, TextInput, TouchableOpacity,
  StatusBar, ActivityIndicator, Modal, Animated, ScrollView, RefreshControl
} from "react-native";
import {
  Search, Filter, MapPin, Box, DollarSign, ChevronRight, Star,
  User, Settings, X, Check, ShoppingBasket, TrendingUp, Bell
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";
import { useTema } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";


const DEPARTAMENTOS = [
  "Todos","Amazonas","Antioquia","Arauca","Atlántico","Bolívar","Boyacá","Caldas",
  "Caquetá","Casanare","Cauca","Cesar","Chocó","Córdoba","Cundinamarca","Guainía",
  "Guaviare","Huila","La Guajira","Magdalena","Meta","Nariño","Norte de Santander",
  "Putumayo","Quindío","Risaralda","San Andrés y Providencia","Santander","Sucre",
  "Tolima","Valle del Cauca","Vaupés","Vichada"
];

const HomeComercianteScreen = ({ navigation }) => {
  const [search, setSearch] = useState("");
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFiltro, setShowFiltro] = useState(false);
  const [filtroDep, setFiltroDep] = useState("Todos");
  const [filtroPrecio, setFiltroPrecio] = useState(null);
  const [filtrosAplicados, setFiltrosAplicados] = useState({ dep: "Todos", precio: null });
  const [refreshing, setRefreshing] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [filtroCercano, setFiltroCercano] = useState(false);
  const [ubicacionUsuario, setUbicacionUsuario] = useState(null);

  const insets = useSafeAreaInsets();
  const { tema } = useTema();
  const s = estilos(tema);

  const slideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { cargarDatos(); }, []);
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => { cargarDatos(); });
    return unsubscribe;
  }, [navigation]);

  const cargarDatos = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_URL}/publicaciones/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await response.json();
      setPublicaciones(data);

      const notifResponse = await fetch(`${API_URL}/notificaciones/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const notifData = await notifResponse.json();
      setNotifCount(notifData.filter((n) => !n.leida).length);

      const perfilResponse = await fetch(`${API_URL}/perfil/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const perfilData = await perfilResponse.json();
      setUbicacionUsuario(perfilData.ubicacion || null);

    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => { setRefreshing(true); await cargarDatos(); setRefreshing(false); };

  const abrirFiltro = () => {
    setShowFiltro(true);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const cerrarFiltro = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 500, duration: 250, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setShowFiltro(false));
  };

  const aplicarFiltros = () => { setFiltrosAplicados({ dep: filtroDep, precio: filtroPrecio }); cerrarFiltro(); };
  const limpiarFiltros = () => {
    setFiltroDep("Todos");
    setFiltroPrecio(null);
    setFiltrosAplicados({ dep: "Todos", precio: null });
    cerrarFiltro();
  };

  const publicacionesFiltradas = () => {
    let r = publicaciones.filter((p) =>
      p.producto.toLowerCase().includes(search.toLowerCase())
    );
    if (filtrosAplicados.dep !== "Todos")
      r = r.filter((p) => p.ubicacion === filtrosAplicados.dep);
    if (filtrosAplicados.precio === "asc")
      r = [...r].sort((a, b) => a.precio - b.precio);
    else if (filtrosAplicados.precio === "desc")
      r = [...r].sort((a, b) => b.precio - a.precio);

    if (filtroCercano && ubicacionUsuario) {
      r = r.filter((p) => p.ubicacion === ubicacionUsuario);
    }

    return r;
  };

  const hayFiltros = filtrosAplicados.dep !== "Todos" || filtrosAplicados.precio !== null;

  const CardCanasta = () => (
    <TouchableOpacity style={s.cardCanasta} onPress={() => navigation.navigate("CanastaPreciosScreen")} activeOpacity={0.82}>
      <View style={s.canastaBgCircle1} />
      <View style={s.canastaBgCircle2} />
      <View style={s.canastaIconBox}><ShoppingBasket size={26} color="#fff" /></View>
      <View style={s.canastaTextos}>
        <Text style={s.canastaTitulo}>Canasta Familiar</Text>
        <Text style={s.canastaSubtitulo}>Precios mayoristas oficiales · SIPSA DANE</Text>
      </View>
      <View style={s.canastaArrow}><TrendingUp size={18} color="#fff" /></View>
    </TouchableOpacity>
  );

  const renderCard = ({ item }) => (
    <TouchableOpacity style={s.card} onPress={() => navigation.navigate("DetallePublicacion", { item })}>
      {item.imagen_url ? (
        <Image source={{ uri: item.imagen_url }} style={s.cardImage} />
      ) : (
        <View style={[s.cardImage, s.noImage]}>
          <Text style={{ color: tema.textoSecundario, fontSize: 11 }}>Sin imagen</Text>
        </View>
      )}
      <View style={s.cardContent}>
        <View style={s.headerCard}>
          <Text style={s.cardTitle}>{item.producto}</Text>
          <Text style={s.varietyText}>{item.descripcion}</Text>
        </View>
        <View style={s.infoRow}>
          <MapPin size={14} color={tema.iconoVerde} />
          <Text style={s.infoText}>{item.ubicacion}</Text>
        </View>
        <View style={s.statsRow}>
          <View style={s.stat}>
            <Box size={14} color={tema.textoSecundario} />
            {/* ✅ 'stock_unidad' eliminado — ahora usa la unidad única */}
            <Text style={s.statText}>{item.stock ? `${item.stock.toLocaleString()} ${item.unidad || ""}` : "--"}</Text>
          </View>
          <View style={s.stat}>
            <DollarSign size={14} color={tema.textoSecundario} />
            <Text style={s.statText}>${item.precio ? item.precio.toLocaleString() : "--"} / {item.unidad}</Text>
          </View>
        </View>
        <View style={s.footerCard}>
          <Text style={s.farmerName}>Por: {item.vendedor_nombre}</Text>
          <ChevronRight size={18} color={tema.iconoVerde} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle={tema.statusBar} />

      <View style={s.header}>
        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", position: "relative", width: "100%" }}>
          <TouchableOpacity onPress={onRefresh} activeOpacity={0.7}>
            <Image source={require("../../imagenes/logo.png")} style={s.logo} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity style={s.notifButton} onPress={() => navigation.navigate("Notificaciones")} activeOpacity={0.7}>
            <Bell size={24} color={tema.iconoVerde} />
            {notifCount > 0 && <View style={s.badge}><Text style={s.badgeText}>{notifCount}</Text></View>}
          </TouchableOpacity>
        </View>

        <View style={s.searchContainer}>
          <View style={s.searchBar}>
            <Search size={20} color={tema.textoSecundario} />
            <TextInput
              style={s.searchInput}
              placeholder="¿Qué producto buscas?"
              placeholderTextColor={tema.textoSecundario}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <TouchableOpacity
            style={[s.chipCercano, filtroCercano && s.chipCercanoActivo]}
            onPress={() => setFiltroCercano(!filtroCercano)}
            activeOpacity={0.8}
          >
            <MapPin size={15} color={filtroCercano ? "#fff" : tema.iconoVerde} />
            <Text style={[s.chipCercanoText, filtroCercano && s.chipCercanoTextActivo]}>
              Cercano
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.filterBtn, hayFiltros && s.filterBtnActivo]}
            onPress={abrirFiltro}
          >
            <Filter size={20} color="#fff" />
            {hayFiltros && <View style={s.filterDot} />}
          </TouchableOpacity>
        </View>

        <CardCanasta />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#709742" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={publicacionesFiltradas()}
          renderItem={renderCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[s.list, { paddingBottom: 100 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#709742"]} tintColor="#709742" />}
          ListHeaderComponent={
            <View style={s.listHeader}>
              <Text style={s.listTitle}>
                {filtroCercano && ubicacionUsuario
                  ? `Cerca de ${ubicacionUsuario}`
                  : "Ofertas disponibles"}
              </Text>
              {(hayFiltros || filtroCercano) && (
                <TouchableOpacity onPress={() => { limpiarFiltros(); setFiltroCercano(false); }}>
                  <Text style={s.limpiarText}>Limpiar filtros</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <Text style={s.emptyText}>
                {filtroCercano && ubicacionUsuario
                  ? `No hay publicaciones en ${ubicacionUsuario}.`
                  : "No hay publicaciones disponibles."}
              </Text>
            </View>
          }
        />
      )}

      <View style={[s.bottomBar, { bottom: insets.bottom + 10 }]}>
        <TouchableOpacity style={s.barBtn} onPress={() => navigation.navigate("Perfil")}>
          <User size={24} color={tema.iconoVerde} />
          <Text style={s.barLabel}>Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.barBtnCenter} onPress={() => navigation.navigate("Favoritos")}>
          <Star size={26} color="#fff" fill="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={s.barBtn} onPress={() => navigation.navigate("Configuracion")}>
          <Settings size={24} color={tema.iconoVerde} />
          <Text style={s.barLabel}>Ajustes</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showFiltro} transparent animationType="none">
        <Animated.View style={[s.modalOverlay, { opacity: fadeAnim }]}>
          <TouchableOpacity style={{ flex: 1 }} onPress={cerrarFiltro} />
          <Animated.View style={[s.filtroPanel, { transform: [{ translateY: slideAnim }] }]}>
            <View style={s.filtroHeader}>
              <Text style={s.filtroTitulo}>Filtrar publicaciones</Text>
              <TouchableOpacity onPress={cerrarFiltro}><X size={24} color={tema.texto} /></TouchableOpacity>
            </View>

            <Text style={s.filtroSeccion}>Ordenar por precio</Text>
            <View style={s.precioRow}>
              <TouchableOpacity
                style={[s.precioBtn, filtroPrecio === "asc" && s.precioBtnActivo]}
                onPress={() => setFiltroPrecio(filtroPrecio === "asc" ? null : "asc")}
              >
                {filtroPrecio === "asc" && <Check size={14} color="#fff" />}
                <Text style={[s.precioBtnText, filtroPrecio === "asc" && { color: "#fff" }]}>Menor precio</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.precioBtn, filtroPrecio === "desc" && s.precioBtnActivo]}
                onPress={() => setFiltroPrecio(filtroPrecio === "desc" ? null : "desc")}
              >
                {filtroPrecio === "desc" && <Check size={14} color="#fff" />}
                <Text style={[s.precioBtnText, filtroPrecio === "desc" && { color: "#fff" }]}>Mayor precio</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.filtroSeccion}>Departamento</Text>
            <ScrollView style={s.depScroll} showsVerticalScrollIndicator={false}>
              {DEPARTAMENTOS.map((dep) => (
                <TouchableOpacity
                  key={dep}
                  style={[s.depItem, filtroDep === dep && s.depItemActivo]}
                  onPress={() => setFiltroDep(dep)}
                >
                  <Text style={[s.depText, filtroDep === dep && s.depTextActivo]}>{dep}</Text>
                  {filtroDep === dep && <Check size={16} color="#709742" />}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={s.filtroFooter}>
              <TouchableOpacity style={s.limpiarBtn} onPress={limpiarFiltros}>
                <Text style={s.limpiarBtnText}>Limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.aplicarBtn} onPress={aplicarFiltros}>
                <Text style={s.aplicarBtnText}>Aplicar filtros</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

const estilos = (tema) => StyleSheet.create({
  container: { flex: 1, backgroundColor: tema.fondo },
  header: { backgroundColor: tema.header, paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: tema.borde },
  logo: { width: 140, height: 50, alignSelf: "center", marginBottom: 10 },
  notifButton: { position: "absolute", right: 0, top: 5, padding: 8 },
  badge: { position: "absolute", right: 4, top: 4, backgroundColor: "#FF3B30", borderRadius: 8, width: 16, height: 16, justifyContent: "center", alignItems: "center" },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "bold" },
  searchContainer: { flexDirection: "row", gap: 10, alignItems: "center" },
  searchBar: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: tema.fondo, borderRadius: 12, paddingHorizontal: 12, height: 45 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: tema.texto },
  filterBtn: { backgroundColor: "#709742", width: 45, height: 45, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  filterBtnActivo: { backgroundColor: "#4a6b2a" },
  filterDot: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFD700" },
  chipCercano: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: tema.iconoVerde,
    backgroundColor: "transparent",
    height: 45,
  },
  chipCercanoActivo: {
    backgroundColor: tema.iconoVerde,
    borderColor: tema.iconoVerde,
  },
  chipCercanoText: {
    fontSize: 13,
    fontWeight: "700",
    color: tema.iconoVerde,
  },
  chipCercanoTextActivo: {
    color: "#fff",
  },
  cardCanasta: { flexDirection: "row", alignItems: "center", backgroundColor: "#709742", borderRadius: 18, marginTop: 14, paddingVertical: 15, paddingHorizontal: 18, overflow: "hidden", elevation: 5, shadowColor: "#709742", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
  canastaBgCircle1: { position: "absolute", width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.08)", top: -30, right: 60 },
  canastaBgCircle2: { position: "absolute", width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.06)", bottom: -20, right: 10 },
  canastaIconBox: { width: 46, height: 46, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center", marginRight: 14 },
  canastaTextos: { flex: 1 },
  canastaTitulo: { fontSize: 16, fontWeight: "700", color: "#fff", marginBottom: 3 },
  canastaSubtitulo: { fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: "500" },
  canastaArrow: { width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center", marginLeft: 10 },
  list: { padding: 20 },
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  listTitle: { fontSize: 18, fontWeight: "bold", color: tema.texto },
  limpiarText: { fontSize: 13, color: tema.iconoVerde, fontWeight: "600" },
  emptyContainer: { alignItems: "center", marginTop: 50 },
  emptyText: { color: tema.textoSecundario, textAlign: "center" },
  card: { backgroundColor: tema.card, borderRadius: 16, marginBottom: 20, flexDirection: "row", elevation: 3, overflow: "hidden" },
  cardImage: { width: 110, height: "100%", backgroundColor: tema.fondo },
  noImage: { justifyContent: "center", alignItems: "center" },
  cardContent: { flex: 1, padding: 12 },
  headerCard: { marginBottom: 8 },
  cardTitle: { fontSize: 17, fontWeight: "bold", color: tema.textoTitulo },
  varietyText: { fontSize: 12, color: tema.textoSecundario, fontStyle: "italic" },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  infoText: { fontSize: 13, color: tema.iconoVerde, marginLeft: 4 },
  statsRow: { flexDirection: "row", gap: 15, marginBottom: 10 },
  stat: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontSize: 13, fontWeight: "bold", color: tema.texto },
  footerCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: tema.separador, paddingTop: 8 },
  farmerName: { fontSize: 11, color: tema.textoSecundario, fontWeight: "600" },
  bottomBar: { position: "absolute", left: 30, right: 30, height: 65, backgroundColor: tema.card, borderRadius: 35, flexDirection: "row", alignItems: "center", justifyContent: "space-around", elevation: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, paddingHorizontal: 10 },
  barBtn: { alignItems: "center", justifyContent: "center", flex: 1 },
  barLabel: { fontSize: 11, color: tema.iconoVerde, marginTop: 2, fontWeight: "600" },
  barBtnCenter: { width: 58, height: 58, borderRadius: 29, backgroundColor: "#709742", justifyContent: "center", alignItems: "center", elevation: 6, shadowColor: "#709742", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 6 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  filtroPanel: { backgroundColor: tema.card, borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, maxHeight: "75%" },
  filtroHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  filtroTitulo: { fontSize: 20, fontWeight: "bold", color: tema.textoTitulo },
  filtroSeccion: { fontSize: 14, fontWeight: "700", color: tema.textoSecundario, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, marginTop: 5 },
  precioRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  precioBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: tema.borde },
  precioBtnActivo: { backgroundColor: "#709742", borderColor: "#709742" },
  precioBtnText: { fontSize: 14, color: tema.texto, fontWeight: "600" },
  depScroll: { maxHeight: 200, marginBottom: 20 },
  depItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: tema.separador },
  depItemActivo: { backgroundColor: tema.fondo, borderRadius: 8 },
  depText: { fontSize: 15, color: tema.texto },
  depTextActivo: { color: tema.iconoVerde, fontWeight: "bold" },
  filtroFooter: { flexDirection: "row", gap: 12 },
  limpiarBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: tema.borde, alignItems: "center" },
  limpiarBtnText: { color: tema.textoSecundario, fontWeight: "bold", fontSize: 15 },
  aplicarBtn: { flex: 2, padding: 14, borderRadius: 12, backgroundColor: "#709742", alignItems: "center" },
  aplicarBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});

export default HomeComercianteScreen;