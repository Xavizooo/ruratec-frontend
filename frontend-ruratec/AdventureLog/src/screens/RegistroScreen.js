import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  User,
  Mail,
  Lock,
  MapPin,
  ChevronDown,
  Phone,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { API_URL } from "../config";

const DEPARTAMENTOS = [
  "Amazonas",
  "Antioquia",
  "Arauca",
  "Atlántico",
  "Bolívar",
  "Boyacá",
  "Caldas",
  "Caquetá",
  "Casanare",
  "Cauca",
  "Cesar",
  "Chocó",
  "Córdoba",
  "Cundinamarca",
  "Guainía",
  "Guaviare",
  "Huila",
  "La Guajira",
  "Magdalena",
  "Meta",
  "Nariño",
  "Norte de Santander",
  "Putumayo",
  "Quindío",
  "Risaralda",
  "San Andrés y Providencia",
  "Santander",
  "Sucre",
  "Tolima",
  "Valle del Cauca",
  "Vaupés",
  "Vichada",
];

const RegistroScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    location: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState({
    visible: false,
    type: "",
  });
  const [verPassword, setVerPassword] = useState(false);
  const [verConfirm, setVerConfirm] = useState(false);
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [showTerminos, setShowTerminos] = useState(false);

  const handleRegister = async () => {
    if (!form.fullName || !form.email || !form.password) {
      Alert.alert("Error", "Completa los campos principales.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }
    if (!aceptoTerminos) {
      Alert.alert(
        "Error",
        "Debes aceptar los términos y condiciones para registrarte.",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/usuarios/`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          first_name: form.fullName.trim().split(" ")[0],
          last_name: form.fullName.trim().split(" ").slice(1).join(" "),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          telefono: form.phone,
          rol: form.role,
          ubicacion: form.location,
        }),
      });

      const text = await response.text();
      console.log("Respuesta servidor:", text);
      const data = JSON.parse(text);

      if (response.ok) {
        Alert.alert("¡Éxito!", "Usuario creado en el servidor de RURATEC");
        navigation.navigate("Login");
      } else {
        console.log("Error del servidor:", data);
        Alert.alert("Error", "Revisa los datos ingresados.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error de conexión",
        "Asegúrate de que el servidor Django esté corriendo.",
      );
    } finally {
      setLoading(false);
    }
  };

  const selectOption = (item) => {
    setForm({ ...form, [modalVisible.type]: item });
    setModalVisible({ visible: false, type: "" });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo con bordes */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../imagenes/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Registro de Usuario</Text>

          <View style={styles.inputBox}>
            <User size={20} color="#709742" />
            <TextInput
              style={styles.input}
              placeholder="Nombre y Apellido"
              autoCapitalize="words"
              placeholderTextColor="#999"
              onChangeText={(v) => setForm({ ...form, fullName: v })}
            />
          </View>

          <View style={styles.inputBox}>
            <Mail size={20} color="#709742" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
              onChangeText={(v) => setForm({ ...form, email: v })}
            />
          </View>

          <View style={styles.inputBox}>
            <Phone size={20} color="#709742" />
            <TextInput
              style={styles.input}
              placeholder="Celular"
              keyboardType="phone-pad"
              placeholderTextColor="#999"
              onChangeText={(v) => setForm({ ...form, phone: v })}
            />
          </View>

          <TouchableOpacity
            style={styles.inputBox}
            onPress={() => setModalVisible({ visible: true, type: "role" })}
          >
            <User size={20} color="#709742" />
            <Text style={[styles.input, !form.role && { color: "#999" }]}>
              {form.role || "Seleccionar Rol"}
            </Text>
            <ChevronDown size={20} color="#709742" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.inputBox}
            onPress={() => setModalVisible({ visible: true, type: "location" })}
          >
            <MapPin size={20} color="#709742" />
            <Text style={[styles.input, !form.location && { color: "#999" }]}>
              {form.location || "Ubicación"}
            </Text>
            <ChevronDown size={20} color="#709742" />
          </TouchableOpacity>

          <View style={styles.inputBox}>
            <Lock size={20} color="#709742" />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              secureTextEntry={!verPassword}
              placeholderTextColor="#999"
              onChangeText={(v) => setForm({ ...form, password: v })}
            />
            <TouchableOpacity onPress={() => setVerPassword(!verPassword)}>
              {verPassword ? (
                <EyeOff size={20} color="#999" />
              ) : (
                <Eye size={20} color="#999" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputBox}>
            <Lock size={20} color="#709742" />
            <TextInput
              style={styles.input}
              placeholder="Confirmar contraseña"
              secureTextEntry={!verConfirm}
              placeholderTextColor="#999"
              onChangeText={(v) => setForm({ ...form, confirmPassword: v })}
            />
            <TouchableOpacity onPress={() => setVerConfirm(!verConfirm)}>
              {verConfirm ? (
                <EyeOff size={20} color="#999" />
              ) : (
                <Eye size={20} color="#999" />
              )}
            </TouchableOpacity>
          </View>

          {/* Términos y condiciones */}
          <View style={styles.terminosRow}>
            <TouchableOpacity
              style={[styles.checkbox, aceptoTerminos && styles.checkboxActivo]}
              onPress={() => setAceptoTerminos(!aceptoTerminos)}
            >
              {aceptoTerminos && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.terminosTexto}>
              Acepto los{" "}
              <Text
                style={styles.terminosLink}
                onPress={() => setShowTerminos(true)}
              >
                términos y condiciones
              </Text>
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.btn,
              (!aceptoTerminos || loading) && { opacity: 0.6 },
            ]}
            onPress={handleRegister}
            disabled={loading || !aceptoTerminos}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.btnText}>REGISTRARSE</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginTexto}>
              ¿Ya tienes cuenta? <Text style={styles.bold}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>

          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal opciones */}
      <Modal visible={modalVisible.visible} transparent animationType="fade">
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <FlatList
              data={
                modalVisible.type === "role"
                  ? ["Agricultor", "Comerciante"]
                  : DEPARTAMENTOS
              }
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => selectOption(item)}
                  style={styles.opt}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modal términos */}
      <Modal visible={showTerminos} transparent animationType="slide">
        <View style={styles.modal}>
          <View style={styles.terminosModal}>
            <Text style={styles.terminosTitulo}>Términos y Condiciones</Text>
            <ScrollView style={{ flex: 1 }}>
              <Text style={styles.terminosContenido}>
                {`Bienvenido a RURATEC. Al registrarte en nuestra plataforma, aceptas los siguientes términos:\n\n1. USO DE LA PLATAFORMA\nRURATEC es una plataforma que conecta agricultores y comerciantes en Colombia. El uso de la plataforma debe ser responsable y honesto.\n\n2. DATOS PERSONALES\nTus datos personales serán tratados de acuerdo con la Ley 1581 de 2012 de protección de datos personales de Colombia. Solo serán usados para facilitar las transacciones dentro de la plataforma.\n\n3. PUBLICACIONES\nLos agricultores son responsables de la veracidad de la información publicada sobre sus productos. RURATEC no se hace responsable por información incorrecta.\n\n4. TRANSACCIONES\nLas transacciones realizadas a través de RURATEC están protegidas por nuestra pasarela de pagos. En caso de disputas, RURATEC actuará como mediador.\n\n5. RESPONSABILIDADES\nEl usuario es responsable de mantener la confidencialidad de su contraseña y de todas las actividades realizadas desde su cuenta.\n\n6. MODIFICACIONES\nRURATEC se reserva el derecho de modificar estos términos en cualquier momento, notificando a los usuarios con anticipación.\n\nAl registrarte, confirmas que has leído y aceptas estos términos y condiciones.`}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => {
                setAceptoTerminos(true);
                setShowTerminos(false);
              }}
            >
              <Text style={styles.btnText}>Aceptar y cerrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cerrarTerminos}
              onPress={() => setShowTerminos(false)}
            >
              <Text
                style={{ color: "#999", textAlign: "center", marginTop: 10 }}
              >
                Cerrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F2" },
  keyboardView: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: 30, alignItems: "center" },
  logoContainer: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    marginBottom: 35,
    marginTop: 20,
  },
  logo: { width: 200, height: 200 },
  title: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 20 },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#709742",
    marginBottom: 15,
    width: "100%",
    height: 50,
  },
  input: { flex: 1, marginLeft: 10, color: "#333" },
  terminosRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
    marginBottom: 20,
    gap: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#709742",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActivo: { backgroundColor: "#709742" },
  checkmark: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  terminosTexto: { fontSize: 14, color: "#666", flex: 1 },
  terminosLink: { color: "#709742", fontWeight: "bold" },
  btn: {
    backgroundColor: "#709742",
    width: "100%",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  btnText: { color: "#FFF", fontWeight: "bold" },
  loginLink: { marginTop: 20 },
  loginTexto: { color: "#666", fontSize: 14 },
  bold: { color: "#709742", fontWeight: "bold" },
  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    width: "80%",
    maxHeight: "60%",
    borderRadius: 10,
    padding: 20,
  },
  opt: { padding: 15, borderBottomWidth: 1, borderColor: "#EEE" },
  terminosModal: {
    backgroundColor: "#fff",
    width: "90%",
    maxHeight: "80%",
    borderRadius: 15,
    padding: 20,
    flex: 0.8,
  },
  terminosTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B3A1B",
    marginBottom: 15,
    textAlign: "center",
  },
  terminosContenido: { fontSize: 14, color: "#555", lineHeight: 22 },
  cerrarTerminos: { marginTop: 5 },
});

export default RegistroScreen;
