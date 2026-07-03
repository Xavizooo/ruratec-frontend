import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Image,
  SafeAreaView, KeyboardAvoidingView, ScrollView, Platform, Alert, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Award, DollarSign } from "lucide-react-native";
import { API_URL } from "../config";
import { registrarNotificaciones, guardarTokenEnBackend } from "../utils/notificaciones";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verPassword, setVerPassword] = useState(false);
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa tu correo y contraseña");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({ username: email.trim().toLowerCase(), password }),
      });
      const data = await response.json();
      if (response.ok) {
        const { nombre, rol, token, user_id, documento_validado } = data;
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("user_id", user_id.toString());
        await AsyncStorage.setItem("rol", rol);
        await AsyncStorage.setItem("nombre", nombre);
        const pushToken = await registrarNotificaciones();
        if (pushToken) await guardarTokenEnBackend(pushToken);

        const destino = rol === "Comerciante" ? "HomeComerciante" : "HomeAgricultor";

        // ✅ NUEVO: si el documento todavía no fue validado por OCR, lo
        // mandamos primero a la pantalla de verificación (con opción de
        // omitir). Si ya está validado, entra directo a su Home como antes.
        if (!documento_validado) {
          Alert.alert(`¡Bienvenido, ${nombre}!`, `Has iniciado sesión como ${rol}`, [{
            text: "Continuar",
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: "VerificarDocumento", params: { destino } }],
            }),
          }]);
        } else {
          Alert.alert(`¡Bienvenido, ${nombre}!`, `Has iniciado sesión como ${rol}`, [{
            text: "Continuar",
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: destino }],
            }),
          }]);
        }
      } else {
        Alert.alert("Error", "Correo o contraseña incorrectos");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error de conexión", "No se pudo conectar con el servidor.");
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

          {/* ── Header verde oscuro ── */}
          <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
            <View style={styles.brandRow}>
              <View style={styles.logoBox}>
                <Image source={require("../../imagenes/logo.png")} style={styles.logo} resizeMode="contain" />
              </View>
              <View>
                <Text style={styles.brandName}>RURATEC</Text>
                <Text style={styles.brandSub}>Plataforma B2B Agrícola</Text>
              </View>
            </View>
            <Text style={styles.headerTitle}>Conecta campo{"\n"}con comercio</Text>
            <View style={styles.badgesRow}>
              <View style={styles.badge}>
                <ShieldCheck size={13} color="#A8D08D" />
                <Text style={styles.badgeText}>Datos cifrados</Text>
              </View>
              <View style={styles.badge}>
                <Award size={13} color="#A8D08D" />
                <Text style={styles.badgeText}>Usuarios verificados</Text>
              </View>
              <View style={styles.badge}>
                <DollarSign size={13} color="#A8D08D" />
                <Text style={styles.badgeText}>Pagos seguros</Text>
              </View>
            </View>
          </View>

          {/* ── Formulario blanco ── */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Iniciar sesión</Text>
            <Text style={styles.formSub}>Accede a tu cuenta de negocios</Text>

            <Text style={styles.fieldLabel}>CORREO ELECTRÓNICO</Text>
            <View style={styles.inputBox}>
              <Mail size={18} color="#709742" />
              <TextInput
                style={styles.input}
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#bbb"
              />
            </View>

            <Text style={styles.fieldLabel}>CONTRASEÑA</Text>
            <View style={styles.inputBox}>
              <Lock size={18} color="#709742" />
              <TextInput
                style={styles.input}
                placeholder="Tu contraseña"
                secureTextEntry={!verPassword}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#bbb"
              />
              <TouchableOpacity onPress={() => setVerPassword(!verPassword)}>
                {verPassword ? <EyeOff size={18} color="#aaa" /> : <Eye size={18} color="#aaa" />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.btn, loading && { opacity: 0.8 }]} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Entrar</Text>}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity onPress={() => navigation.navigate("Registro")}>
              <Text style={styles.registerText}>
                ¿No tienes cuenta? <Text style={styles.registerLink}>Regístrate aquí</Text>
              </Text>
            </TouchableOpacity>

            {/* Sello de confianza */}
            <View style={styles.trustBadge}>
              <ShieldCheck size={20} color="#709742" />
              <View>
                <Text style={styles.trustTitle}>Plataforma de negocios verificada</Text>
                <Text style={styles.trustSub}>Tus datos y transacciones están protegidos</Text>
              </View>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1B3A1B" },
  scroll: { flexGrow: 1 },

  // Header
  header: { backgroundColor: "#1B3A1B", padding: 28 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  logoBox: {
    width: 44, height: 44, backgroundColor: "#ffffff",
    borderRadius: 12, justifyContent: "center", alignItems: "center", overflow: "hidden",
  },
  logo: { width: 36, height: 36 },
  brandName: { color: "#fff", fontSize: 18, fontWeight: "bold", letterSpacing: 1 },
  brandSub: { color: "#A8D08D", fontSize: 12, marginTop: 1 },
  headerTitle: { color: "#fff", fontSize: 28, fontWeight: "bold", lineHeight: 36, marginBottom: 20 },
  badgesRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 0.5, borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  badgeText: { color: "#A8D08D", fontSize: 12 },

  // Formulario
  formCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, flex: 1, minHeight: 500,
  },
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
  forgotBtn: { alignSelf: "flex-end", marginBottom: 20, marginTop: -6 },
  forgotText: { fontSize: 13, color: "#709742", fontWeight: "600" },
  btn: {
    backgroundColor: "#709742", borderRadius: 14,
    height: 54, justifyContent: "center", alignItems: "center",
    marginBottom: 20, elevation: 2,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16, letterSpacing: 0.3 },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: "#e0e0e0" },
  dividerText: { fontSize: 13, color: "#bbb" },
  registerText: { fontSize: 14, color: "#888", textAlign: "center", marginBottom: 24 },
  registerLink: { color: "#709742", fontWeight: "bold" },
  trustBadge: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#F4F9F0", borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: "#D4E8BC",
  },
  trustTitle: { fontSize: 13, fontWeight: "600", color: "#1B3A1B" },
  trustSub: { fontSize: 12, color: "#888", marginTop: 2 },
});

export default LoginScreen;