import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Image,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
  Modal, FlatList, Alert, ActivityIndicator,
} from "react-native";
import { User, Mail, Lock, MapPin, ChevronDown, Phone, Eye, EyeOff, ShieldCheck, IdCard } from "lucide-react-native";
import { API_URL } from "../config";

const DEPARTAMENTOS = [
  "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá",
  "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba",
  "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena",
  "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindío", "Risaralda",
  "San Andrés y Providencia", "Santander", "Sucre", "Tolima", "Valle del Cauca",
  "Vaupés", "Vichada",
];

const ROLES = ["Agricultor", "Comerciante"];

const TERMINOS_TEXTO = `¡Bienvenido a Ruratec! Antes de crear tu cuenta, es importante que conozcas cómo operamos en nuestra comunidad:

¿Qué hace Ruratec?: Somos una plataforma digital que conecta a agricultores con comerciantes y facilita herramientas para coordinar el transporte. Ruratec no compra, vende, ni transporta los productos directamente.

Responsabilidad de Logística: El estado de las vías, el tipo de camión necesario y los costos de flete se acuerdan entre las partes según los datos del formulario de cada publicación. Ruratec no se hace responsable por retrasos, daños en la mercancía o problemas viales durante el viaje.

Calidad y Cambios: Al tratarse de alimentos perecederos, la calidad del producto debe verificarse en el momento exacto de la carga/recogida. Una vez el camión arranca, el pedido se entiende aceptado a satisfacción.

Comisión por Gestión: Al concretar una venta exitosa a través de la app, se aplicará una tarifa de gestión de [Tu % o valor fijo] destinada al mantenimiento técnico y soporte de la plataforma.

Tus Datos están Seguros: En cumplimiento de la Ley 1581 de 2012 (Habeas Data), usamos tu ubicación y datos de contacto únicamente para conectar tus pedidos y garantizar la seguridad de los despachos. Nunca compartiremos tu información con terceros.

Al presionar "Acepto los Términos y Condiciones", declaras que eres mayor de edad y que aceptas estas reglas para mantener un comercio justo y seguro en el campo colombano.`;

// ── Selector de rol con tarjetas visuales ──────────────────────────────────
const RolSelector = ({ value, onChange }) => (
  <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
    {ROLES.map((rol) => {
      const activo = value === rol;
      const esAgricultor = rol === "Agricultor";
      return (
        <TouchableOpacity
          key={rol}
          onPress={() => onChange(rol)}
          style={[styles.rolCard, activo && styles.rolCardActivo]}
        >
          <Text style={styles.rolEmoji}>{esAgricultor ? "🌱" : "🏪"}</Text>
          <Text style={[styles.rolLabel, activo && styles.rolLabelActivo]}>{rol}</Text>
          <Text style={[styles.rolDesc, activo && { color: "#709742" }]}>
            {esAgricultor ? "Vendo mis cosechas" : "Compro al por mayor"}
          </Text>
          {activo && <View style={styles.rolCheck}><Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>✓</Text></View>}
        </TouchableOpacity>
      );
    })}
  </View>
);

const RegistroScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", cedula: "", role: "", location: "", password: "", confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [modalDep, setModalDep] = useState(false);
  const [verPassword, setVerPassword] = useState(false);
  const [verConfirm, setVerConfirm] = useState(false);
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [showTerminos, setShowTerminos] = useState(false);

  const handleRegister = async () => {
    if (!form.fullName || !form.email || !form.password) {
      Alert.alert("Error", "Completa los campos principales.");
      return;
    }
    // ✅ NUEVO: la cédula es lo que después va a comparar el OCR contra
    // la foto del documento, así que la pedimos desde ahora aunque la
    // verificación en sí se haga en una pantalla posterior.
    if (!form.cedula || form.cedula.trim().length < 6) {
      Alert.alert("Error", "Ingresa un número de cédula válido.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }
    if (!aceptoTerminos) {
      Alert.alert("Error", "Debes aceptar los términos y condiciones para registrarte.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/usuarios/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({
          first_name: form.fullName.trim().split(" ")[0],
          last_name: form.fullName.trim().split(" ").slice(1).join(" "),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          telefono: form.phone,
          rol: form.role,
          ubicacion: form.location,
          numero_cedula: form.cedula.trim(),
        }),
      });
      const text = await response.text();
      const data = JSON.parse(text);
      if (response.ok) {
        Alert.alert(
          "¡Éxito!",
          "Tu cuenta en RURATEC fue creada correctamente. Inicia sesión para verificar tu documento y activar tu sello de cuenta verificada."
        );
        navigation.navigate("Login");
      } else {
        console.log("Error del servidor:", data);
        Alert.alert("Error", "Revisa los datos ingresados.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error de conexión", "Asegúrate de que el servidor esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={{ color: "#A8D08D", fontSize: 14 }}>← Volver</Text>
            </TouchableOpacity>
            <View style={styles.brandRow}>
              <View style={styles.logoBox}>
                <Image source={require("../../imagenes/logo.png")} style={styles.logo} resizeMode="contain" />
              </View>
              <View>
                <Text style={styles.brandName}>RURATEC</Text>
                <Text style={styles.brandSub}>Plataforma B2B Agrícola</Text>
              </View>
            </View>
            <Text style={styles.headerTitle}>Crea tu cuenta{"\n"}de negocios</Text>
          </View>

          {/* ── Formulario ── */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Registro de usuario</Text>
            <Text style={styles.formSub}>Completa los datos para comenzar</Text>

            {/* Nombre */}
            <Text style={styles.fieldLabel}>NOMBRE Y APELLIDO</Text>
            <View style={styles.inputBox}>
              <User size={18} color="#709742" />
              <TextInput
                style={styles.input}
                placeholder="Juan Pérez"
                autoCapitalize="words"
                placeholderTextColor="#bbb"
                onChangeText={(v) => setForm({ ...form, fullName: v })}
              />
            </View>

            {/* Email */}
            <Text style={styles.fieldLabel}>CORREO ELECTRÓNICO</Text>
            <View style={styles.inputBox}>
              <Mail size={18} color="#709742" />
              <TextInput
                style={styles.input}
                placeholder="tucorreo@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#bbb"
                onChangeText={(v) => setForm({ ...form, email: v })}
              />
            </View>

            {/* Celular */}
            <Text style={styles.fieldLabel}>CELULAR</Text>
            <View style={styles.inputBox}>
              <Phone size={18} color="#709742" />
              <TextInput
                style={styles.input}
                placeholder="3001234567"
                keyboardType="phone-pad"
                placeholderTextColor="#bbb"
                onChangeText={(v) => setForm({ ...form, phone: v })}
              />
            </View>

            {/* ✅ NUEVO: Cédula */}
            <Text style={styles.fieldLabel}>NÚMERO DE CÉDULA</Text>
            <View style={styles.inputBox}>
              <IdCard size={18} color="#709742" />
              <TextInput
                style={styles.input}
                placeholder="1234567890"
                keyboardType="number-pad"
                placeholderTextColor="#bbb"
                onChangeText={(v) => setForm({ ...form, cedula: v })}
              />
            </View>
            <Text style={styles.hintText}>
              La usaremos para verificar tu documento de identidad después del registro.
            </Text>

            {/* Rol */}
            <Text style={styles.fieldLabel}>SOY</Text>
            <RolSelector value={form.role} onChange={(v) => setForm({ ...form, role: v })} />

            {/* Departamento */}
            <Text style={styles.fieldLabel}>DEPARTAMENTO</Text>
            <TouchableOpacity style={styles.inputBox} onPress={() => setModalDep(true)}>
              <MapPin size={18} color="#709742" />
              <Text style={[styles.input, !form.location && { color: "#bbb" }]}>
                {form.location || "Seleccionar departamento"}
              </Text>
              <ChevronDown size={18} color="#aaa" />
            </TouchableOpacity>

            {/* Contraseña */}
            <Text style={styles.fieldLabel}>CONTRASEÑA</Text>
            <View style={styles.inputBox}>
              <Lock size={18} color="#709742" />
              <TextInput
                style={styles.input}
                placeholder="Mínimo 8 caracteres"
                secureTextEntry={!verPassword}
                placeholderTextColor="#bbb"
                onChangeText={(v) => setForm({ ...form, password: v })}
              />
              <TouchableOpacity onPress={() => setVerPassword(!verPassword)}>
                {verPassword ? <EyeOff size={18} color="#aaa" /> : <Eye size={18} color="#aaa" />}
              </TouchableOpacity>
            </View>

            {/* Confirmar */}
            <Text style={styles.fieldLabel}>CONFIRMAR CONTRASEÑA</Text>
            <View style={styles.inputBox}>
              <Lock size={18} color="#709742" />
              <TextInput
                style={styles.input}
                placeholder="Repite tu contraseña"
                secureTextEntry={!verConfirm}
                placeholderTextColor="#bbb"
                onChangeText={(v) => setForm({ ...form, confirmPassword: v })}
              />
              <TouchableOpacity onPress={() => setVerConfirm(!verConfirm)}>
                {verConfirm ? <EyeOff size={18} color="#aaa" /> : <Eye size={18} color="#aaa" />}
              </TouchableOpacity>
            </View>

            {/* Términos */}
            <TouchableOpacity style={styles.terminosRow} onPress={() => setAceptoTerminos(!aceptoTerminos)}>
              <View style={[styles.checkbox, aceptoTerminos && styles.checkboxActivo]}>
                {aceptoTerminos && <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 12 }}>✓</Text>}
              </View>
              <Text style={styles.terminosTexto}>
                Acepto los{" "}
                <Text style={styles.terminosLink} onPress={() => setShowTerminos(true)}>
                  términos y condiciones
                </Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, (!aceptoTerminos || loading) && { opacity: 0.6 }]}
              onPress={handleRegister}
              disabled={loading || !aceptoTerminos}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Crear cuenta</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ marginTop: 16 }}>
              <Text style={styles.loginText}>
                ¿Ya tienes cuenta? <Text style={styles.loginLink}>Inicia sesión</Text>
              </Text>
            </TouchableOpacity>

            {/* Sello */}
            <View style={styles.trustBadge}>
              <ShieldCheck size={20} color="#709742" />
              <View>
                <Text style={styles.trustTitle}>Registro seguro y verificado</Text>
                <Text style={styles.trustSub}>Tus datos están protegidos por la Ley 1581 de 2012</Text>
              </View>
            </View>

            <View style={{ height: 20 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal departamento */}
      <Modal visible={modalDep} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona tu departamento</Text>
            <FlatList
              data={DEPARTAMENTOS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => { setForm({ ...form, location: item }); setModalDep(false); }}
                >
                  <Text style={styles.modalOptionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalDep(false)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal términos */}
      <Modal visible={showTerminos} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { flex: 0.85 }]}>
            <Text style={styles.modalTitle}>Términos y condiciones</Text>
            <ScrollView style={{ flex: 1 }}>
              <Text style={styles.terminosContenido}>{TERMINOS_TEXTO}</Text>
            </ScrollView>
            <TouchableOpacity style={[styles.btn, { marginTop: 16 }]} onPress={() => { setAceptoTerminos(true); setShowTerminos(false); }}>
              <Text style={styles.btnText}>Aceptar y cerrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 10, alignItems: "center" }} onPress={() => setShowTerminos(false)}>
              <Text style={{ color: "#aaa", fontSize: 14 }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1B3A1B" },
  scroll: { flexGrow: 1 },

  // Header
  header: { backgroundColor: "#1B3A1B", padding: 28, paddingTop: 16 },
  backBtn: { marginBottom: 16 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  logoBox: { width: 44, height: 44, backgroundColor: "#709742", borderRadius: 12, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  logo: { width: 36, height: 36 },
  brandName: { color: "#fff", fontSize: 18, fontWeight: "bold", letterSpacing: 1 },
  brandSub: { color: "#A8D08D", fontSize: 12, marginTop: 1 },
  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "bold", lineHeight: 34 },

  // Formulario
  formCard: { backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, flex: 1 },
  formTitle: { fontSize: 20, fontWeight: "bold", color: "#1B3A1B", marginBottom: 4 },
  formSub: { fontSize: 13, color: "#999", marginBottom: 24 },
  fieldLabel: { fontSize: 11, fontWeight: "700", color: "#888", letterSpacing: 0.8, marginBottom: 6 },
  inputBox: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderColor: "#e0e0e0",
    borderRadius: 12, paddingHorizontal: 14, height: 52,
    marginBottom: 16, backgroundColor: "#FAFAFA", gap: 10,
  },
  input: { flex: 1, fontSize: 15, color: "#1B3A1B" },
  hintText: { fontSize: 11, color: "#aaa", marginTop: -10, marginBottom: 16 },

  // Selector de rol
  rolCard: {
    flex: 1, borderWidth: 1.5, borderColor: "#e0e0e0",
    borderRadius: 14, padding: 14, alignItems: "center",
    backgroundColor: "#FAFAFA", position: "relative",
  },
  rolCardActivo: { borderColor: "#709742", backgroundColor: "#F4F9F0" },
  rolEmoji: { fontSize: 28, marginBottom: 6 },
  rolLabel: { fontSize: 14, fontWeight: "bold", color: "#555", marginBottom: 4 },
  rolLabelActivo: { color: "#1B3A1B" },
  rolDesc: { fontSize: 11, color: "#aaa", textAlign: "center" },
  rolCheck: {
    position: "absolute", top: 8, right: 8,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: "#709742", justifyContent: "center", alignItems: "center",
  },

  // Términos
  terminosRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#709742", justifyContent: "center", alignItems: "center" },
  checkboxActivo: { backgroundColor: "#709742" },
  terminosTexto: { fontSize: 14, color: "#666", flex: 1 },
  terminosLink: { color: "#709742", fontWeight: "bold" },

  // Botón
  btn: { backgroundColor: "#709742", borderRadius: 14, height: 54, justifyContent: "center", alignItems: "center", elevation: 2 },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16, letterSpacing: 0.3 },

  loginText: { fontSize: 14, color: "#888", textAlign: "center" },
  loginLink: { color: "#709742", fontWeight: "bold" },

  // Trust badge
  trustBadge: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F4F9F0", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#D4E8BC", marginTop: 20 },
  trustTitle: { fontSize: 13, fontWeight: "600", color: "#1B3A1B" },
  trustSub: { fontSize: 12, color: "#888", marginTop: 2 },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", width: "88%", maxHeight: "75%", borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: "bold", color: "#1B3A1B", marginBottom: 14 },
  modalOption: { paddingVertical: 13, borderBottomWidth: 0.5, borderColor: "#f0f0f0" },
  modalOptionText: { fontSize: 15, color: "#333" },
  modalCancelBtn: { marginTop: 12, alignItems: "center" },
  modalCancelText: { color: "#888", fontSize: 14 },
  terminosContenido: { fontSize: 14, color: "#555", lineHeight: 22 },
});

export default RegistroScreen;