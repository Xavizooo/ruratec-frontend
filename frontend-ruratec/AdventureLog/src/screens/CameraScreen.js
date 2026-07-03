import React, { useState, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, ScrollView, FlatList } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";
import { useTema } from "../context/ThemeContext";

// ─── PRODUCTOS ───────────────────────────────────────────────────────────────
const PRODUCTOS_AGRICOLAS = [
  "Papa pastusa", "Papa criolla", "Papa R-12", "Papa capiro", "Papa negra",
  "Yuca", "Ñame", "Arracacha", "Batata / Camote", "Remolacha", "Zanahoria",
  "Rábano rojo", "Nabo",
  "Arroz corriente", "Arroz Diana", "Maíz amarillo", "Trigo", "Cebada",
  "Sorgo", "Avena", "Quinua", "Cuchuco de trigo", "Harina de trigo", "Pasta",
  "Fríjol verde", "Fríjol cargamanto", "Lenteja", "Garbanzo", "Arveja verde",
  "Habichuela", "Haba verde", "Soya",
  "Tomate chonto", "Tomate larga vida", "Cebolla cabezona blanca",
  "Cebolla cabezona roja", "Cebolla junca", "Ajo rosado", "Pimentón",
  "Ají", "Pepino cohombro", "Pepino común", "Berenjena", "Auyama",
  "Calabaza", "Mazorca", "Espinaca", "Lechuga", "Repollo", "Brócoli",
  "Coliflor", "Acelga", "Apio", "Alcachofa", "Cidra / Guatila", "Cilantro",
  "Puerro", "Balú",
  "Plátano hartón", "Plátano colicero", "Plátano dominico",
  "Banano Urabá", "Banano criollo", "Mango Tommy", "Mango común",
  "Papaya", "Piña", "Guanábana", "Maracuyá", "Granadilla", "Curuba",
  "Gulupa", "Tomate de árbol", "Lulo", "Feijoa", "Uchuva", "Guayaba",
  "Melón", "Sandía", "Aguacate Hass", "Aguacate papelillo",
  "Pitahaya amarilla", "Coco", "Chontaduro", "Borojó",
  "Fresa", "Mora", "Uva Isabella", "Manzana", "Pera",
  "Durazno / Melocotón", "Ciruela", "Kiwi",
  "Naranja Valencia", "Naranja Armenia", "Mandarina arrayana",
  "Tangelo", "Limón Tahití", "Limón común", "Pomelo / Toronja", "Lima",
  "Café pergamino", "Café cereza", "Cacao en baba", "Cacao seco",
  "Caña panelera", "Panela", "Palma de aceite (fruto)",
  "Albahaca", "Perejil", "Menta / Hierbabuena", "Romero",
  "Tomillo", "Orégano", "Eneldo", "Cúrcuma", "Jengibre",
  "Rosas", "Claveles", "Crisantemos", "Astromelias", "Orquídeas", "Girasoles",
  "Maní", "Ajonjolí", "Macadamia", "Marañón / Anacardo",
  "Espárrago", "Champiñón / Hongo", "Tabaco",
];

// ─── CAPACIDAD DE ENTREGA ────────────────────────────────────────────────────
const OPCIONES_ENTREGA = [
  {
    valor: "retiro_finca",
    emoji: "🏡",
    titulo: "Solo retiro en finca",
    descripcion: "El comerciante envía su transporte a recoger el producto.",
  },
  {
    valor: "casco_urbano",
    emoji: "🛵",
    titulo: "Llevo al casco urbano",
    descripcion: "El agricultor acerca el producto al municipio más cercano.",
  },
  {
    valor: "transporte_propio",
    emoji: "🚛",
    titulo: "Transporte propio al destino",
    descripcion: "El agricultor entrega directamente en la ciudad o plaza del comerciante (flete aparte).",
  },
];

// ─── MAPEO PRODUCTO → CLAVE CANASTA ─────────────────────────────────────────
const MAPA_CANASTA = {
  "Papa pastusa": { clave: "papa_pastusa", precio: 1500, unidad: "kg" },
  "Papa criolla": { clave: "papa_criolla", precio: 2500, unidad: "kg" },
  "Papa R-12": { clave: "papa_r12", precio: 1800, unidad: "kg" },
  "Papa capiro": { clave: "papa_capiro", precio: 1600, unidad: "kg" },
  "Papa negra": { clave: "papa_negra", precio: 2000, unidad: "kg" },
  "Yuca": { clave: "yuca", precio: 1400, unidad: "kg" },
  "Ñame": { clave: "name", precio: 2200, unidad: "kg" },
  "Arracacha": { clave: "arracacha", precio: 2300, unidad: "kg" },
  "Batata / Camote": { clave: "batata", precio: 1800, unidad: "kg" },
  "Zanahoria": { clave: "zanahoria", precio: 1500, unidad: "kg" },
  "Rábano rojo": { clave: "rabano", precio: 1500, unidad: "kg" },
  "Arroz corriente": { clave: "arroz", precio: 1800, unidad: "kg" },
  "Arroz Diana": { clave: "arroz_diana", precio: 2200, unidad: "kg" },
  "Maíz amarillo": { clave: "maiz", precio: 1200, unidad: "kg" },
  "Cuchuco de trigo": { clave: "cuchuco_trigo", precio: 3500, unidad: "kg" },
  "Harina de trigo": { clave: "harina_trigo", precio: 2800, unidad: "kg" },
  "Pasta": { clave: "pasta", precio: 3800, unidad: "kg" },
  "Fríjol verde": { clave: "frijol_verde", precio: 6000, unidad: "kg" },
  "Fríjol cargamanto": { clave: "frijol_cargamanto", precio: 7000, unidad: "kg" },
  "Lenteja": { clave: "lenteja", precio: 4200, unidad: "kg" },
  "Garbanzo": { clave: "garbanzo", precio: 5500, unidad: "kg" },
  "Arveja verde": { clave: "arveja_verde", precio: 6400, unidad: "kg" },
  "Habichuela": { clave: "habichuela", precio: 5600, unidad: "kg" },
  "Haba verde": { clave: "haba_verde", precio: 4500, unidad: "kg" },
  "Tomate chonto": { clave: "tomate_chonto", precio: 2800, unidad: "kg" },
  "Tomate larga vida": { clave: "tomate_larga_vida", precio: 3200, unidad: "kg" },
  "Cebolla cabezona blanca": { clave: "cebolla_blanca", precio: 1500, unidad: "kg" },
  "Cebolla cabezona roja": { clave: "cebolla_roja", precio: 1900, unidad: "kg" },
  "Cebolla junca": { clave: "cebolla_junca", precio: 3333, unidad: "kg" },
  "Ajo rosado": { clave: "ajo", precio: 12000, unidad: "kg" },
  "Pimentón": { clave: "pimenton", precio: 3500, unidad: "kg" },
  "Pepino cohombro": { clave: "pepino_cohombro", precio: 1800, unidad: "kg" },
  "Pepino común": { clave: "pepino_comun", precio: 1600, unidad: "kg" },
  "Auyama": { clave: "auyama", precio: 1400, unidad: "kg" },
  "Mazorca": { clave: "mazorca", precio: 1200, unidad: "kg" },
  "Espinaca": { clave: "espinaca", precio: 3500, unidad: "kg" },
  "Lechuga": { clave: "lechuga", precio: 2200, unidad: "kg" },
  "Repollo": { clave: "repollo", precio: 1200, unidad: "kg" },
  "Brócoli": { clave: "brocoli", precio: 3200, unidad: "kg" },
  "Coliflor": { clave: "coliflor", precio: 3000, unidad: "kg" },
  "Acelga": { clave: "acelga", precio: 2500, unidad: "kg" },
  "Apio": { clave: "apio", precio: 2800, unidad: "kg" },
  "Alcachofa": { clave: "alcachofa", precio: 4000, unidad: "kg" },
  "Cilantro": { clave: "cilantro", precio: 6000, unidad: "kg" },
  "Remolacha": { clave: "remolacha", precio: 1300, unidad: "kg" },
  "Plátano hartón": { clave: "platano_harton", precio: 1400, unidad: "kg" },
  "Plátano colicero": { clave: "platano_colicero", precio: 1200, unidad: "kg" },
  "Banano Urabá": { clave: "banano_uraba", precio: 2200, unidad: "kg" },
  "Banano criollo": { clave: "banano_criollo", precio: 1800, unidad: "kg" },
  "Mango Tommy": { clave: "mango_tommy", precio: 3000, unidad: "kg" },
  "Mango común": { clave: "mango_comun", precio: 2000, unidad: "kg" },
  "Papaya": { clave: "papaya", precio: 2000, unidad: "kg" },
  "Piña": { clave: "pina", precio: 1800, unidad: "kg" },
  "Guanábana": { clave: "guanabana", precio: 4000, unidad: "kg" },
  "Maracuyá": { clave: "maracuya", precio: 3500, unidad: "kg" },
  "Granadilla": { clave: "granadilla", precio: 5500, unidad: "kg" },
  "Curuba": { clave: "curuba", precio: 3800, unidad: "kg" },
  "Gulupa": { clave: "gulupa", precio: 5000, unidad: "kg" },
  "Tomate de árbol": { clave: "tomate_arbol", precio: 3500, unidad: "kg" },
  "Lulo": { clave: "lulo", precio: 4000, unidad: "kg" },
  "Feijoa": { clave: "feijoa", precio: 4500, unidad: "kg" },
  "Melón": { clave: "melon", precio: 2500, unidad: "kg" },
  "Sandía": { clave: "sandia", precio: 1500, unidad: "kg" },
  "Aguacate Hass": { clave: "aguacate_hass", precio: 7500, unidad: "kg" },
  "Aguacate papelillo": { clave: "aguacate_papelillo", precio: 10500, unidad: "kg" },
  "Pitahaya amarilla": { clave: "pitahaya", precio: 15000, unidad: "kg" },
  "Coco": { clave: "coco", precio: 3000, unidad: "und" },
  "Fresa": { clave: "fresa", precio: 6000, unidad: "kg" },
  "Mora": { clave: "mora", precio: 5500, unidad: "kg" },
  "Uva Isabella": { clave: "uva_isabela", precio: 5000, unidad: "kg" },
  "Naranja Valencia": { clave: "naranja_valencia", precio: 2600, unidad: "kg" },
  "Naranja Armenia": { clave: "naranja_armenia", precio: 2200, unidad: "kg" },
  "Mandarina arrayana": { clave: "mandarina", precio: 10000, unidad: "kg" },
  "Tangelo": { clave: "tangelo", precio: 4200, unidad: "kg" },
  "Limón Tahití": { clave: "limon_tahiti", precio: 4000, unidad: "kg" },
  "Limón común": { clave: "limon_comun", precio: 3850, unidad: "kg" },
  "Panela": { clave: "panela", precio: 3500, unidad: "kg" },
};

// ─── LÓGICA DE SUGERENCIA DE PRECIO ─────────────────────────────────────────
const getSugerencia = (producto, precioStr, unidad) => {
  const ref = MAPA_CANASTA[producto];
  if (!ref || !precioStr || !unidad) return null;
  if (unidad !== ref.unidad) return null;
  const precio = parseInt(precioStr.replace(/\./g, ""), 10);
  if (!precio || precio <= 0) return null;
  const pRef = ref.precio;
  const diff = ((precio - pRef) / pRef) * 100;
  const pct = Math.abs(diff).toFixed(0);
  if (diff < -20) return { tipo: "bajo", texto: ` ${pct}% por debajo del mercado · Ref: $${pRef.toLocaleString()}/${ref.unidad}`, color: "#F59E0B" };
  if (diff > 20) return { tipo: "alto", texto: ` ${pct}% por encima del mercado · Ref: $${pRef.toLocaleString()}/${ref.unidad}`, color: "#EF4444" };
  return { tipo: "ok", texto: ` Precio en rango (${diff > 0 ? "+" : ""}${pct}%) · Ref: $${pRef.toLocaleString()}/${ref.unidad}`, color: "#709742" };
};

const DEPARTAMENTOS = ["Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá", "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindío", "Risaralda", "San Andrés y Providencia", "Santander", "Sucre", "Tolima", "Valle del Cauca", "Vaupés", "Vichada"];
const UNIDADES = ["kg", "lb", "arroba", "tonelada", "bulto", "caja", "canastilla", "saco", "unidad", "docena", "racimo", "atado", "manojo"];
const PESOS_SUGERIDOS = { lb: "0.5", arroba: "12.5", tonelada: "1000", bulto: "50", caja: "20", canastilla: "20", saco: "50", unidad: "", docena: "", racimo: "", atado: "", manojo: "" };

const formatNumero = (value) => value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const ListModal = ({ visible, onClose, title, data, onSelect, searchable = true }) => {
  const [query, setQuery] = useState("");
  const filtered = searchable && query.trim() ? data.filter((item) => item.toLowerCase().includes(query.toLowerCase())) : data;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={lm.backdrop}>
        <View style={lm.container}>
          <Text style={lm.title}>{title}</Text>
          {searchable && (
            <TextInput style={lm.search} placeholder="Buscar..." placeholderTextColor="#999" value={query} onChangeText={setQuery} autoFocus />
          )}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity style={lm.item} onPress={() => { onSelect(item); setQuery(""); onClose(); }}>
                <Text style={lm.itemText}>{item}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={lm.empty}>Sin resultados</Text>}
          />
          <TouchableOpacity style={lm.cancelBtn} onPress={() => { setQuery(""); onClose(); }}>
            <Text style={lm.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const lm = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
  container: { backgroundColor: "#fff", width: "90%", maxHeight: "80%", borderRadius: 15, padding: 16 },
  title: { fontSize: 17, fontWeight: "bold", marginBottom: 10, color: "#222" },
  search: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 9, fontSize: 14, marginBottom: 8, color: "#222" },
  item: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  itemText: { fontSize: 15, color: "#333" },
  empty: { textAlign: "center", color: "#999", marginTop: 20 },
  cancelBtn: { marginTop: 10, padding: 10, alignItems: "center" },
  cancelText: { color: "#888", fontSize: 14 },
});

// ─── SELECTOR DE CAPACIDAD DE ENTREGA ────────────────────────────────────────
const SelectorEntrega = ({ value, onChange, tema }) => (
  <View style={{ marginBottom: 12 }}>
    {OPCIONES_ENTREGA.map((opcion) => {
      const seleccionada = value === opcion.valor;
      return (
        <TouchableOpacity
          key={opcion.valor}
          onPress={() => onChange(opcion.valor)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: seleccionada ? 2 : 1,
            borderColor: seleccionada ? "#F59E0B" : tema.borde,
            borderRadius: 10,
            padding: 12,
            marginBottom: 8,
            backgroundColor: seleccionada ? "#FFFBEB" : tema.fondo,
          }}
        >
          <Text style={{ fontSize: 24, marginRight: 10 }}>{opcion.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "bold", color: seleccionada ? "#B45309" : tema.texto }}>
              {opcion.titulo}
            </Text>
            <Text style={{ fontSize: 12, color: tema.textoSecundario, marginTop: 2 }}>
              {opcion.descripcion}
            </Text>
          </View>
          {seleccionada && (
            <Text style={{ fontSize: 18, color: "#F59E0B", marginLeft: 6 }}>✓</Text>
          )}
        </TouchableOpacity>
      );
    })}
  </View>
);

const CameraScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showProductoModal, setShowProductoModal] = useState(false);
  const [showDepModal, setShowDepModal] = useState(false);
  const [showUnidadModal, setShowUnidadModal] = useState(false);
  const [tempPhoto, setTempPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    producto: "", descripcion: "", precio: "", unidad: "",
    stock: "", pesoKg: "", cantidadMinima: "", ubicacion: "",
    capacidad_entrega: "", // ✅ NUEVO
  });
  const cameraRef = useRef(null);
  const { tema } = useTema();
  const s = estilos(tema);

  if (!permission) return <View style={s.container} />;
  if (!permission.granted) {
    return (
      <View style={s.container}>
        <TouchableOpacity onPress={requestPermission} style={s.btnAction}>
          <Text style={{ color: "white" }}>Conceder Permisos de Cámara</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (isProcessing || !cameraRef.current) return;
    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      setTempPhoto(photo);
      setShowModal(true);
    } catch { Alert.alert("Error", "No se pudo tomar la foto"); }
    finally { setIsProcessing(false); }
  };

  const seleccionarUnidad = (item) => {
    setForm({ ...form, unidad: item, pesoKg: item === "kg" ? "" : (PESOS_SUGERIDOS[item] || "") });
  };

  const requierePeso = form.unidad && form.unidad !== "kg";
  const sugerencia = getSugerencia(form.producto, form.precio, form.unidad);

  const publicar = async () => {
    if (!form.producto.trim()) return Alert.alert("Error", "Selecciona el nombre del producto");
    if (!form.precio.trim()) return Alert.alert("Error", "Escribe el precio");
    if (!form.unidad.trim()) return Alert.alert("Error", "Selecciona la unidad");
    if (!form.stock.trim()) return Alert.alert("Error", "Escribe el stock disponible");
    if (requierePeso && !form.pesoKg.trim()) return Alert.alert("Error", `Indica cuánto pesa 1 ${form.unidad} en kilogramos`);
    if (!form.capacidad_entrega) return Alert.alert("Error", "Selecciona la capacidad de entrega"); // ✅ NUEVO
    if (!form.ubicacion.trim()) return Alert.alert("Error", "Selecciona la ubicación");

    const stockNum = parseInt(form.stock.replace(/\./g, "")) || 0;
    const minimaNum = form.cantidadMinima.trim() ? parseInt(form.cantidadMinima.replace(/\./g, "")) : null;
    if (minimaNum !== null && minimaNum <= 0) return Alert.alert("Error", "La cantidad mínima debe ser mayor a 0");
    if (minimaNum !== null && minimaNum > stockNum) return Alert.alert("Error", "La cantidad mínima no puede ser mayor al stock disponible");

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      formData.append("producto", form.producto);
      formData.append("descripcion", form.descripcion);
      formData.append("precio", form.precio.replace(/\./g, ""));
      formData.append("unidad", form.unidad);
      formData.append("stock", form.stock.replace(/\./g, ""));
      if (requierePeso && form.pesoKg.trim()) formData.append("peso_kg_unidad", form.pesoKg.replace(",", "."));
      if (minimaNum !== null) formData.append("cantidad_minima", minimaNum);
      formData.append("capacidad_entrega", form.capacidad_entrega); // ✅ NUEVO
      formData.append("ubicacion", form.ubicacion);
      if (tempPhoto) formData.append("imagen", { uri: tempPhoto.uri, type: "image/jpeg", name: "publicacion.jpg" });

      const response = await fetch(`${API_URL}/publicaciones/crear/`, {
        method: "POST",
        headers: { Authorization: `Token ${token}` },
        body: formData,
      });

      if (response.ok) {
        setShowModal(false);
        setForm({ producto: "", descripcion: "", precio: "", unidad: "", stock: "", pesoKg: "", cantidadMinima: "", ubicacion: "", capacidad_entrega: "" });
        Alert.alert("¡Éxito!", "Publicación creada correctamente", [{ text: "OK", onPress: () => navigation.replace("HomeAgricultor") }]);
      } else {
        Alert.alert("Error", "No se pudo crear la publicación");
      }
    } catch {
      Alert.alert("Error de conexión", "Verifica que el servidor esté corriendo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView style={StyleSheet.absoluteFillObject} ref={cameraRef} />
      <View style={s.overlay}>
        <TouchableOpacity style={s.captureBtn} onPress={takePicture}>
          <View style={s.innerBtn} />
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={s.modalBackdrop}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Detalles del producto</Text>
            <ScrollView keyboardShouldPersistTaps="handled">

              <Text style={s.fieldLabel}>Producto *</Text>
              <TouchableOpacity style={[s.input, s.selector]} onPress={() => setShowProductoModal(true)}>
                <Text style={{ color: form.producto ? tema.texto : tema.textoSecundario, fontSize: 15 }}>
                  {form.producto || "Seleccionar producto ▼"}
                </Text>
              </TouchableOpacity>

              <Text style={s.fieldLabel}>Descripción</Text>
              <TextInput
                style={[s.input, { minHeight: 70, textAlignVertical: "top" }]}
                placeholder="Opcional: variedad, calidad, cosecha..."
                placeholderTextColor={tema.textoSecundario}
                value={form.descripcion}
                onChangeText={(v) => setForm({ ...form, descripcion: v })}
                multiline
              />

              <Text style={s.fieldLabel}>Precio *</Text>
              <TextInput
                style={s.input}
                placeholder="ej: 5.000"
                placeholderTextColor={tema.textoSecundario}
                value={form.precio}
                onChangeText={(v) => setForm({ ...form, precio: formatNumero(v) })}
                keyboardType="numeric"
              />
              {sugerencia && (
                <View style={[s.sugerenciaChip, { backgroundColor: sugerencia.color + "20", borderColor: sugerencia.color }]}>
                  <Text style={[s.sugerenciaTexto, { color: sugerencia.color }]}>{sugerencia.texto}</Text>
                </View>
              )}

              <Text style={s.fieldLabel}>Unidad *</Text>
              <TouchableOpacity style={[s.input, s.selector]} onPress={() => setShowUnidadModal(true)}>
                <Text style={{ color: form.unidad ? tema.texto : tema.textoSecundario, fontSize: 15 }}>
                  {form.unidad || "Seleccionar unidad ▼"}
                </Text>
              </TouchableOpacity>

              <Text style={s.fieldLabel}>Cantidad disponible *</Text>
              <TextInput
                style={s.input}
                placeholder={form.unidad ? `Cantidad en ${form.unidad}` : "Cantidad"}
                placeholderTextColor={tema.textoSecundario}
                value={form.stock}
                onChangeText={(v) => setForm({ ...form, stock: formatNumero(v) })}
                keyboardType="numeric"
              />

              {requierePeso && (
                <>
                  <Text style={s.fieldLabel}>¿Cuánto pesa 1 {form.unidad} en kg? *</Text>
                  <TextInput
                    style={s.input}
                    placeholder="ej: 50"
                    placeholderTextColor={tema.textoSecundario}
                    value={form.pesoKg}
                    onChangeText={(v) => setForm({ ...form, pesoKg: v.replace(/[^0-9.,]/g, "").replace(",", ".") })}
                    keyboardType="decimal-pad"
                  />
                </>
              )}

              <Text style={s.fieldLabel}>Cantidad mínima de compra (opcional)</Text>
              <TextInput
                style={s.input}
                placeholder={form.unidad ? `ej: 50 ${form.unidad}` : "Opcional"}
                placeholderTextColor={tema.textoSecundario}
                value={form.cantidadMinima}
                onChangeText={(v) => setForm({ ...form, cantidadMinima: formatNumero(v) })}
                keyboardType="numeric"
              />

              {/* ✅ NUEVO: Capacidad de entrega */}
              <Text style={s.fieldLabel}>Capacidad de entrega *</Text>
              <SelectorEntrega
                value={form.capacidad_entrega}
                onChange={(v) => setForm({ ...form, capacidad_entrega: v })}
                tema={tema}
              />

              <Text style={s.fieldLabel}>Departamento *</Text>
              <TouchableOpacity style={[s.input, s.selector]} onPress={() => setShowDepModal(true)}>
                <Text style={{ color: form.ubicacion ? tema.texto : tema.textoSecundario, fontSize: 15 }}>
                  {form.ubicacion || "Seleccionar departamento ▼"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={[s.modalBtn, loading && { opacity: 0.7 }]} onPress={publicar} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.modalBtnText}>Publicar</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={s.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ListModal visible={showProductoModal} onClose={() => setShowProductoModal(false)} title="Selecciona el producto" data={PRODUCTOS_AGRICOLAS} onSelect={(item) => setForm({ ...form, producto: item })} searchable />
      <ListModal visible={showUnidadModal} onClose={() => setShowUnidadModal(false)} title="Selecciona la unidad" data={UNIDADES} onSelect={seleccionarUnidad} searchable={false} />
      <ListModal visible={showDepModal} onClose={() => setShowDepModal(false)} title="Selecciona tu departamento" data={DEPARTAMENTOS} onSelect={(item) => setForm({ ...form, ubicacion: item })} searchable />
    </View>
  );
};

const estilos = (tema) => StyleSheet.create({
  overlay: { position: "absolute", bottom: 40, width: "100%", alignItems: "center" },
  captureBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: "#fff", justifyContent: "center", alignItems: "center" },
  innerBtn: { width: 55, height: 55, borderRadius: 27.5, borderWidth: 2, borderColor: "#000" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: tema.card, width: "90%", maxHeight: "85%", padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, color: tema.textoTitulo },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: tema.textoSecundario, marginBottom: 5, marginTop: 2 },
  input: { borderWidth: 1, borderColor: tema.borde, padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 15, color: tema.texto, backgroundColor: tema.fondo },
  selector: { justifyContent: "center" },
  sugerenciaChip: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 12 },
  sugerenciaTexto: { fontSize: 13, fontWeight: "600" },
  modalBtn: { backgroundColor: "#709742", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 5 },
  modalBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancelBtn: { padding: 12, alignItems: "center", marginTop: 8 },
  cancelText: { color: tema.textoSecundario, fontSize: 14 },
  btnAction: { backgroundColor: "#709742", padding: 15, borderRadius: 10, margin: 20 },
});

export default CameraScreen;