import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Search, X } from "lucide-react-native";
import { API_URL } from "../config";
import { useTema } from "../context/ThemeContext";

// ... (EMOJIS y CATEGORIAS igual, no cambian)
const EMOJIS = { papa_pastusa: "🥔", papa_criolla: "🥔", papa_r12: "🥔", papa_capiro: "🥔", papa_negra: "🥔", arracacha: "🌿", yuca: "🌿", name: "🌿", batata: "🍠", arroz: "🌾", arroz_diana: "🌾", lenteja: "🫘", garbanzo: "🫘", frijol_verde: "🫘", frijol_cargamanto: "🫘", maiz: "🌽", cuchuco_trigo: "🌾", harina_trigo: "🌾", pasta: "🍝", zanahoria: "🥕", cebolla_blanca: "🧅", cebolla_roja: "🧅", cebolla_junca: "🧅", tomate_chonto: "🍅", tomate_larga_vida: "🍅", mazorca: "🌽", pepino_comun: "🥒", pepino_cohombro: "🥒", auyama: "🎃", repollo: "🥬", remolacha: "🍠", espinaca: "🥬", lechuga: "🥬", habichuela: "🫛", arveja_verde: "🫛", cilantro: "🌿", acelga: "🥬", apio: "🌿", coliflor: "🥦", brocoli: "🥦", ajo: "🧄", rabano: "🌿", alcachofa: "🌿", haba_verde: "🫛", pimenton: "🫑", platano_harton: "🍌", platano_colicero: "🍌", banano_uraba: "🍌", banano_criollo: "🍌", limon_tahiti: "🍋", limon_comun: "🍋", naranja_valencia: "🍊", naranja_armenia: "🍊", mandarina: "🍊", tangelo: "🍊", aguacate_hass: "🥑", aguacate_papelillo: "🥑", pina: "🍍", papaya: "🍈", gulupa: "🍇", maracuya: "🍈", mango_tommy: "🥭", mango_comun: "🥭", melon: "🍈", sandia: "🍉", fresa: "🍓", uva_isabela: "🍇", mora: "🫐", feijoa: "🍏", lulo: "🍊", tomate_arbol: "🍅", guanabana: "🍈", curuba: "🍈", granadilla: "🍊", pitahaya: "🌵", coco: "🥥", huevo: "🥚", pollo: "🍗", carne_res: "🥩", pescado_mojarra: "🐟", leche: "🥛", queso: "🧀", panela: "🍯", aceite: "🫙", azucar: "🍬", sal: "🧂" };
const CATEGORIAS = { "Tubérculos": ["papa_pastusa", "papa_criolla", "papa_r12", "papa_capiro", "papa_negra", "arracacha", "yuca", "name", "batata"], "Cereales y granos": ["arroz", "arroz_diana", "lenteja", "garbanzo", "frijol_verde", "frijol_cargamanto", "maiz", "cuchuco_trigo", "harina_trigo", "pasta"], "Hortalizas": ["zanahoria", "cebolla_blanca", "cebolla_roja", "cebolla_junca", "tomate_chonto", "tomate_larga_vida", "mazorca", "pepino_comun", "pepino_cohombro", "auyama", "repollo", "remolacha", "espinaca", "lechuga", "habichuela", "arveja_verde", "cilantro", "acelga", "apio", "coliflor", "brocoli", "ajo", "rabano", "alcachofa", "haba_verde", "pimenton"], "Frutas": ["platano_harton", "platano_colicero", "banano_uraba", "banano_criollo", "limon_tahiti", "limon_comun", "naranja_valencia", "naranja_armenia", "mandarina", "tangelo", "aguacate_hass", "aguacate_papelillo", "pina", "papaya", "gulupa", "maracuya", "mango_tommy", "mango_comun", "melon", "sandia", "fresa", "uva_isabela", "mora", "feijoa", "lulo", "tomate_arbol", "guanabana", "curuba", "granadilla", "pitahaya", "coco"], "Proteínas y lácteos": ["huevo", "pollo", "carne_res", "pescado_mojarra", "leche", "queso", "panela"], "Procesados": ["aceite", "azucar", "sal"] };

export default function CanastaPreciosScreen() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mercado, setMercado] = useState("");
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const { tema } = useTema();
  const s = estilos(tema);

  const cargarPrecios = async (esRefresh = false) => {
    esRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${API_URL}/canasta/`, { headers: { Authorization: `Token ${token}` } });
      setProductos(res.data.productos);
      setMercado(res.data.mercado);
    } catch { setError("No se pudo cargar la información. Intenta de nuevo."); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { cargarPrecios(); }, []);

  const formatPrecio = (precio, unidad) => !precio ? "No disponible" : `$${precio.toLocaleString("es-CO")} / ${unidad || "kg"}`;
  const productosFiltrados = productos.filter((p) => p.nombre_display?.toLowerCase().includes(busqueda.toLowerCase()));

  const CardProducto = ({ p }) => (
    <View style={[s.card, !p.precio && s.cardGris]}>
      <Text style={s.emoji}>{EMOJIS[p.producto] || "🌿"}</Text>
      <Text style={s.nombreProducto}>{p.nombre_display}</Text>
      <Text style={[s.precio, !p.precio && s.precioGris]}>{formatPrecio(p.precio, p.unidad)}</Text>
      {p.fecha && <Text style={s.fecha}>📅 {p.fecha}</Text>}
    </View>
  );

  const renderContenido = () => {
    if (busqueda.trim()) {
      if (productosFiltrados.length === 0) return <View style={s.sinResultados}><Text style={s.sinResultadosTxt}>No se encontró "{busqueda}"</Text></View>;
      return <View style={s.grid}>{productosFiltrados.map((p, i) => <CardProducto key={i} p={p} />)}</View>;
    }
    const cats = Object.entries(CATEGORIAS).map(([cat, claves]) => ({ nombre: cat, items: productos.filter((p) => claves.includes(p.producto)) })).filter((c) => c.items.length > 0);
    const otros = productos.filter((p) => !Object.values(CATEGORIAS).flat().includes(p.producto));
    if (otros.length > 0) cats.push({ nombre: "Otros", items: otros });
    return cats.map((cat, ci) => (
      <View key={ci}>
        <Text style={s.categoriaTitulo}>{cat.nombre}</Text>
        <View style={s.grid}>{cat.items.map((p, i) => <CardProducto key={i} p={p} />)}</View>
      </View>
    ));
  };

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => cargarPrecios(true)} colors={["#2e7d32"]} />}>
      <View style={s.header}>
        <Text style={s.titulo}>🛒 Canasta Familiar</Text>
        <Text style={s.subtitulo}>Precios mayoristas • {mercado}</Text>
        <Text style={s.fuente}>Fuente: Corabastos · SIPSA DANE</Text>
        <View style={s.searchBox}>
          <Search size={18} color="#a5d6a7" />
          <TextInput style={s.searchInput} placeholder="Buscar producto..." placeholderTextColor="#a5d6a7" value={busqueda} onChangeText={setBusqueda} />
          {busqueda.length > 0 && <TouchableOpacity onPress={() => setBusqueda("")}><X size={18} color="#a5d6a7" /></TouchableOpacity>}
        </View>
      </View>
      {loading ? <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 40 }} /> : error ? (
        <View style={s.errorBox}>
          <Text style={s.errorTxt}>{error}</Text>
          <TouchableOpacity onPress={() => cargarPrecios()} style={s.btnReintentar}><Text style={s.btnReintentarTxt}>Reintentar</Text></TouchableOpacity>
        </View>
      ) : <View style={{ paddingBottom: 30 }}>{renderContenido()}</View>}
    </ScrollView>
  );
}

const estilos = (tema) => StyleSheet.create({
  container: { flex: 1, backgroundColor: tema.fondo },
  header: { backgroundColor: "#2e7d32", padding: 20, paddingTop: 40, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  titulo: { fontSize: 26, fontWeight: "bold", color: "#fff" },
  subtitulo: { color: "#c8e6c9", fontSize: 13, marginTop: 4 },
  fuente: { color: "#a5d6a7", fontSize: 11, marginTop: 2, marginBottom: 16 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  searchInput: { flex: 1, color: "#fff", fontSize: 15 },
  categoriaTitulo: { fontSize: 13, fontWeight: "700", color: tema.textoSecundario, textTransform: "uppercase", letterSpacing: 1, marginTop: 20, marginBottom: 8, marginHorizontal: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 10, gap: 10 },
  card: { backgroundColor: tema.card, borderRadius: 16, padding: 14, width: "46%", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 6, elevation: 3, marginHorizontal: 2 },
  cardGris: { backgroundColor: tema.fondo },
  emoji: { fontSize: 30, marginBottom: 6 },
  nombreProducto: { fontSize: 12, fontWeight: "600", color: tema.texto, textAlign: "center" },
  precio: { fontSize: 13, fontWeight: "bold", color: "#2e7d32", marginTop: 5 },
  precioGris: { color: tema.textoSecundario },
  fecha: { fontSize: 10, color: tema.textoSecundario, marginTop: 3 },
  sinResultados: { alignItems: "center", padding: 40 },
  sinResultadosTxt: { color: tema.textoSecundario, fontSize: 15 },
  errorBox: { alignItems: "center", padding: 30 },
  errorTxt: { color: "#c62828", textAlign: "center", marginBottom: 12 },
  btnReintentar: { backgroundColor: "#2e7d32", borderRadius: 8, padding: 10 },
  btnReintentarTxt: { color: "#fff", fontWeight: "bold" },
});