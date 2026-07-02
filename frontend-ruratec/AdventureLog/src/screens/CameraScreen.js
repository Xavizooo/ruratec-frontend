import React, { useState, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, ScrollView, FlatList } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";
import { useTema } from "../context/ThemeContext";

const PRODUCTOS_AGRICOLAS = [
  // Cereales y granos
  "Arroz", "Maíz", "Trigo", "Cebada", "Sorgo", "Avena", "Quinua",
  // Tubérculos y raíces
  "Papa", "Yuca", "Ñame", "Arracacha", "Batata / Camote", "Remolacha", "Zanahoria", "Rábano", "Nabo",
  // Leguminosas
  "Fríjol", "Lenteja", "Garbanzo", "Arveja", "Habichuela", "Soya",
  // Hortalizas
  "Tomate", "Cebolla cabezona", "Cebolla larga", "Ajo", "Pimentón", "Ají", "Pepino cohombro",
  "Pepino de rellenar", "Berenjena", "Ahuyama / Zapallo", "Calabaza", "Mazorca", "Espinaca",
  "Lechuga", "Col / Repollo", "Brócoli", "Coliflor", "Acelga", "Apio", "Pepino amargo",
  "Cidra / Guatila", "Balú", "Puerro", "Alcachofa",
  // Frutas tropicales
  "Banano", "Plátano hartón", "Plátano dominico", "Mango", "Papaya", "Piña", "Guanábana",
  "Maracuyá", "Granadilla", "Curuba", "Cholupa", "Tomate de árbol", "Lulo", "Feijoa",
  "Uchuva", "Guayaba", "Melón", "Sandía", "Aguacate Hass", "Aguacate criollo",
  "Chontaduro", "Borojó", "Noni", "Carambolo", "Mamey", "Zapote", "Níspero",
  "Caimito", "Anón", "Chirimoya",
  // Frutas de clima frío
  "Fresa", "Mora", "Manzana", "Pera", "Durazno / Melocotón", "Ciruela", "Uva", "Kiwi",
  // Cítricos
  "Naranja", "Mandarina", "Limón Tahití", "Limón Pajarito", "Pomelo / Toronja", "Lima",
  // Café y cacao
  "Café pergamino", "Café cereza", "Cacao en baba", "Cacao seco",
  // Palma y aceites
  "Palma de aceite (fruto)", "Coco",
  // Caña
  "Caña panelera", "Caña de azúcar",
  // Plantas aromáticas y medicinales
  "Albahaca", "Cilantro", "Perejil", "Menta / Hierbabuena", "Romero", "Tomillo",
  "Orégano", "Laurel", "Hierbabuena", "Eneldo", "Cúrcuma", "Jengibre",
  // Flores y ornamentales
  "Rosas", "Claveles", "Crisantemos", "Astromelias", "Orquídeas", "Girasoles",
  // Nueces y semillas
  "Maní", "Macadamia", "Nuez del Brasil", "Marañón / Anacardo", "Ajonjolí",
  // Otros
  "Espárrago", "Champiñón / Hongo", "Caña brava (artesanal)", "Tabaco",
];

const DEPARTAMENTOS = ["Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá", "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindío", "Risaralda", "San Andrés y Providencia", "Santander", "Sucre", "Tolima", "Valle del Cauca", "Vaupés", "Vichada"];

// ✅ Lista única de unidades: aplica tanto al precio como al stock.
// Ya no existen "UNIDADES" y "UNIDADES_PRECIO" por separado.
const UNIDADES = ["kg", "lb", "arroba", "tonelada", "bulto", "caja", "canastilla", "saco", "unidad", "docena", "racimo", "atado", "manojo"];

// ✅ Sugerencias de peso en kg por unidad (valores típicos en Colombia).
// Se usan para precargar el campo "Peso en kg" cuando el usuario elige
// una unidad distinta a "kg". El usuario puede editarlo libremente.
const PESOS_SUGERIDOS = {
  lb: "0.5",
  arroba: "12.5",
  tonelada: "1000",
  bulto: "50",
  caja: "20",
  canastilla: "20",
  saco: "50",
  unidad: "",
  docena: "",
  racimo: "",
  atado: "",
  manojo: "",
};

const formatNumero = (value) => value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// Modal genérico de lista con búsqueda
const ListModal = ({ visible, onClose, title, data, onSelect, searchable = true }) => {
  const [query, setQuery] = useState("");
  const filtered = searchable && query.trim()
    ? data.filter((item) => item.toLowerCase().includes(query.toLowerCase()))
    : data;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={lm.backdrop}>
        <View style={lm.container}>
          <Text style={lm.title}>{title}</Text>
          {searchable && (
            <TextInput
              style={lm.search}
              placeholder="Buscar..."
              placeholderTextColor="#999"
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
          )}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={lm.item}
                onPress={() => { onSelect(item); setQuery(""); onClose(); }}
              >
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

const CameraScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showProductoModal, setShowProductoModal] = useState(false);
  const [showDepModal, setShowDepModal] = useState(false);
  const [showUnidadModal, setShowUnidadModal] = useState(false);
  const [tempPhoto, setTempPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  // ✅ 'stockUnidad' eliminado. 'pesoKg' agregado (solo aplica si unidad != 'kg').
  const [form, setForm] = useState({ producto: "", descripcion: "", precio: "", unidad: "", stock: "", pesoKg: "", ubicacion: "" });
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

  // ✅ Al elegir la unidad, precargamos una sugerencia de peso en kg
  // (editable). Si es "kg", no aplica y se limpia el campo.
  const seleccionarUnidad = (item) => {
    setForm({
      ...form,
      unidad: item,
      pesoKg: item === "kg" ? "" : (PESOS_SUGERIDOS[item] || ""),
    });
  };

  const requierePeso = form.unidad && form.unidad !== "kg";

  const publicar = async () => {
    if (!form.producto.trim()) return Alert.alert("Error", "Selecciona el nombre del producto");
    if (!form.precio.trim()) return Alert.alert("Error", "Escribe el precio");
    if (!form.unidad.trim()) return Alert.alert("Error", "Selecciona la unidad");
    if (!form.stock.trim()) return Alert.alert("Error", "Escribe el stock disponible");
    if (requierePeso && !form.pesoKg.trim()) {
      return Alert.alert("Error", `Indica cuánto pesa 1 ${form.unidad} en kilogramos`);
    }
    if (!form.ubicacion.trim()) return Alert.alert("Error", "Selecciona la ubicación");
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      formData.append("producto", form.producto);
      formData.append("descripcion", form.descripcion);
      formData.append("precio", form.precio.replace(/\./g, ""));
      formData.append("unidad", form.unidad);
      formData.append("stock", form.stock.replace(/\./g, ""));
      if (requierePeso && form.pesoKg.trim()) {
        formData.append("peso_kg_unidad", form.pesoKg.replace(",", "."));
      }
      formData.append("ubicacion", form.ubicacion);
      if (tempPhoto) formData.append("imagen", { uri: tempPhoto.uri, type: "image/jpeg", name: "publicacion.jpg" });
      const response = await fetch(`${API_URL}/publicaciones/crear/`, { method: "POST", headers: { Authorization: `Token ${token}` }, body: formData });
      if (response.ok) {
        setShowModal(false);
        setForm({ producto: "", descripcion: "", precio: "", unidad: "", stock: "", pesoKg: "", ubicacion: "" });
        Alert.alert("¡Éxito!", "Publicación creada correctamente", [{ text: "OK", onPress: () => navigation.replace("HomeAgricultor") }]);
      } else { Alert.alert("Error", "No se pudo crear la publicación"); }
    } catch { Alert.alert("Error de conexión", "Verifica que el servidor esté corriendo"); }
    finally { setLoading(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView style={StyleSheet.absoluteFillObject} ref={cameraRef} />
      <View style={s.overlay}>
        <TouchableOpacity style={s.captureBtn} onPress={takePicture}>
          <View style={s.innerBtn} />
        </TouchableOpacity>
      </View>

      {/* Modal principal del formulario */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={s.modalBackdrop}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Detalles del producto</Text>
            <ScrollView keyboardShouldPersistTaps="handled">

              {/* Producto — selector de lista */}
              <Text style={s.fieldLabel}>Producto *</Text>
              <TouchableOpacity style={[s.input, s.selector]} onPress={() => setShowProductoModal(true)}>
                <Text style={{ color: form.producto ? tema.texto : tema.textoSecundario, fontSize: 15 }}>
                  {form.producto || "Seleccionar producto ▼"}
                </Text>
              </TouchableOpacity>

              {/* Descripción — texto libre */}
              <Text style={s.fieldLabel}>Descripción</Text>
              <TextInput
                style={[s.input, { minHeight: 70, textAlignVertical: "top" }]}
                placeholder="Opcional: variedad, calidad, cosecha..."
                placeholderTextColor={tema.textoSecundario}
                value={form.descripcion}
                onChangeText={(v) => setForm({ ...form, descripcion: v })}
                multiline
              />

              {/* Precio */}
              <Text style={s.fieldLabel}>Precio *</Text>
              <TextInput
                style={s.input}
                placeholder="ej: 5.000"
                placeholderTextColor={tema.textoSecundario}
                value={form.precio}
                onChangeText={(v) => setForm({ ...form, precio: formatNumero(v) })}
                keyboardType="numeric"
              />

              {/* Unidad — un solo selector, aplica a precio y a stock */}
              <Text style={s.fieldLabel}>Unidad *</Text>
              <TouchableOpacity style={[s.input, s.selector]} onPress={() => setShowUnidadModal(true)}>
                <Text style={{ color: form.unidad ? tema.texto : tema.textoSecundario, fontSize: 15 }}>
                  {form.unidad || "Seleccionar unidad ▼"}
                </Text>
              </TouchableOpacity>

              {/* Cantidad disponible (en la unidad elegida arriba) */}
              <Text style={s.fieldLabel}>Cantidad disponible *</Text>
              <TextInput
                style={s.input}
                placeholder={form.unidad ? `Cantidad en ${form.unidad}` : "Cantidad"}
                placeholderTextColor={tema.textoSecundario}
                value={form.stock}
                onChangeText={(v) => setForm({ ...form, stock: formatNumero(v) })}
                keyboardType="numeric"
              />

              {/* ✅ Campo condicional: solo aparece si la unidad no es kg */}
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

              {/* Ubicación */}
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

      {/* Modal: Producto agrícola (con búsqueda) */}
      <ListModal
        visible={showProductoModal}
        onClose={() => setShowProductoModal(false)}
        title="Selecciona el producto"
        data={PRODUCTOS_AGRICOLAS}
        onSelect={(item) => setForm({ ...form, producto: item })}
        searchable
      />

      {/* Modal: Unidad (única, aplica a precio y stock) */}
      <ListModal
        visible={showUnidadModal}
        onClose={() => setShowUnidadModal(false)}
        title="Selecciona la unidad"
        data={UNIDADES}
        onSelect={seleccionarUnidad}
        searchable={false}
      />

      {/* Modal: Departamento */}
      <ListModal
        visible={showDepModal}
        onClose={() => setShowDepModal(false)}
        title="Selecciona tu departamento"
        data={DEPARTAMENTOS}
        onSelect={(item) => setForm({ ...form, ubicacion: item })}
        searchable
      />
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
  modalBtn: { backgroundColor: "#709742", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 5 },
  modalBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancelBtn: { padding: 12, alignItems: "center", marginTop: 8 },
  cancelText: { color: tema.textoSecundario, fontSize: 14 },
  btnAction: { backgroundColor: "#709742", padding: 15, borderRadius: 10, margin: 20 },
});

export default CameraScreen;33