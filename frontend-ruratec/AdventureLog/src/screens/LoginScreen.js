import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { API_URL } from "../config";
import {
  registrarNotificaciones,
  guardarTokenEnBackend,
} from "../utils/notificaciones";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verPassword, setVerPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa tu correo y contraseña");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          username: email.trim().toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const { nombre, rol, token, user_id } = data;

        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("user_id", user_id.toString());
        await AsyncStorage.setItem("rol", rol);
        await AsyncStorage.setItem("nombre", nombre);

        // Registrar notificaciones
        const pushToken = await registrarNotificaciones();
        if (pushToken) {
          await guardarTokenEnBackend(pushToken);
        }

        Alert.alert(
          `¡Bienvenido, ${nombre}!`,
          `Has iniciado sesión como ${rol}`,
          [
            {
              text: "Continuar",
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name:
                        rol === "Comerciante"
                          ? "HomeComerciante"
                          : "HomeAgricultor",
                    },
                  ],
                });
              },
            },
          ],
        );
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
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../../imagenes/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Iniciar Sesión</Text>

          <View style={styles.inputBox}>
            <Mail size={20} color="#709742" />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputBox}>
            <Lock size={20} color="#709742" />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              secureTextEntry={!verPassword}
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={() => setVerPassword(!verPassword)}>
              {verPassword ? (
                <EyeOff size={20} color="#999" />
              ) : (
                <Eye size={20} color="#999" />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.8 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.btnText}>ENTRAR</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate("Registro")}
          >
            <Text style={styles.registerText}>
              ¿No tienes cuenta?{" "}
              <Text style={styles.bold}>Regístrate aquí</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F2" },
  keyboardView: { flex: 1 },
  content: {
    flexGrow: 1,
    padding: 30,
    justifyContent: "center",
    alignItems: "center",
  },
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
  },
  logo: { width: 220, height: 140 },
  title: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 30 },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#709742",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    width: "100%",
    height: 55,
    backgroundColor: "#fff",
  },
  input: { flex: 1, marginLeft: 10, color: "#333" },
  btn: {
    backgroundColor: "#709742",
    width: "100%",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
  },
  btnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  registerLink: { marginTop: 25 },
  registerText: { color: "#666", fontSize: 14 },
  bold: { color: "#709742", fontWeight: "bold" },
});

export default LoginScreen;
