import React, { useState } from "react";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { CreditCard } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";
import { WebView } from "react-native-webview";
import { useTema } from "../context/ThemeContext";

const PUBLIC_KEY = "pub_test_caKIlefINceNAUSIUfDQEXIWFBmIdHn3";

const PagoScreen = ({ route, navigation }) => {
  const { negociacion, item } = route.params;
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const { tema } = useTema();
  const s = estilos(tema);

  const wompiUrl = `https://checkout.wompi.co/p/?public-key=${PUBLIC_KEY}&currency=COP&amount-in-cents=${Math.round(negociacion.total * 100)}&reference=${negociacion.referencia}`;

  const handleWebViewNav = async (navState) => {
    const url = navState.url;

    if (url.includes("checkout.wompi.co/p/") && url.includes("id=")) {
      setShowWebView(false);
      setLoading(true);

      try {
        const transactionId = url.split("id=")[1]?.split("&")[0];
        const token = await AsyncStorage.getItem("token");

        const response = await fetch(
          `${API_URL}/negociaciones/${negociacion.id}/confirmar/`,
          {
            method: "POST",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify({ transaction_id: transactionId }),
          }
        );

        const data = await response.json();

        if (response.ok && data.estado === "pagado") {
          // ✅ Navegar a pantalla de espera en lugar del home
          navigation.replace("EsperandoPago", { negociacion, item });
        } else {
          Alert.alert(
            "Pago pendiente",
            "El pago está siendo procesado, verifica en unos minutos"
          );
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "No se pudo confirmar el pago");
      } finally {
        setLoading(false);
      }
    }
  };

  if (showWebView) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity
          style={s.cerrarBtn}
          onPress={() => setShowWebView(false)}
        >
          <Text style={s.cerrarText}>✕ Cancelar pago</Text>
        </TouchableOpacity>
        <WebView
          source={{ uri: wompiUrl }}
          onNavigationStateChange={handleWebViewNav}
          startInLoadingState
          renderLoading={() => (
            <ActivityIndicator
              size="large"
              color="#709742"
              style={s.webviewLoading}
            />
          )}
          style={{ flex: 1 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.titulo}>Resumen del Pago</Text>

        <View style={s.resumenCard}>
          <Text style={s.resumenTitulo}>{item.producto}</Text>

          <View style={s.fila}>
            <Text style={s.filaLabel}>Vendedor:</Text>
            <Text style={s.filaValor}>{item.vendedor_nombre}</Text>
          </View>
          <View style={s.fila}>
            <Text style={s.filaLabel}>Cantidad:</Text>
            <Text style={s.filaValor}>
              {negociacion.cantidad} {item.stock_unidad}
            </Text>
          </View>
          <View style={s.fila}>
            <Text style={s.filaLabel}>Precio por {item.unidad}:</Text>
            <Text style={s.filaValor}>
              ${item.precio.toLocaleString()}
            </Text>
          </View>
          <View style={[s.fila, s.totalFila]}>
            <Text style={s.totalLabel}>Total:</Text>
            <Text style={s.totalValor}>
              $
              {parseFloat(negociacion.total).toLocaleString("es-CO", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </Text>
          </View>
        </View>

        <View style={s.referenciaCard}>
          <Text style={s.referenciaLabel}>Referencia de pago:</Text>
          <Text style={s.referenciaValor}>{negociacion.referencia}</Text>
        </View>

        <TouchableOpacity
          style={[s.btn, loading && { opacity: 0.7 }]}
          onPress={() => setShowWebView(true)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <CreditCard size={22} color="#fff" />
              <Text style={s.btnText}>Pagar con Wompi</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={s.cancelBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={s.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const estilos = (tema) => StyleSheet.create({
  container: { flex: 1, backgroundColor: tema.fondo },
  content: { padding: 20 },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B3A1B",
    marginBottom: 20,
  },
  resumenCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  resumenTitulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B3A1B",
    marginBottom: 15,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filaLabel: { fontSize: 15, color: "#666" },
  filaValor: { fontSize: 15, fontWeight: "600", color: "#333" },
  totalFila: { borderBottomWidth: 0, marginTop: 5 },
  totalLabel: { fontSize: 18, fontWeight: "bold", color: "#1B3A1B" },
  totalValor: { fontSize: 22, fontWeight: "bold", color: "#709742" },
  referenciaCard: {
    backgroundColor: "#F0F7E9",
    borderRadius: 15,
    padding: 15,
    marginBottom: 25,
    alignItems: "center",
  },
  referenciaLabel: { fontSize: 13, color: "#666", marginBottom: 5 },
  referenciaValor: { fontSize: 14, fontWeight: "bold", color: "#709742" },
  btn: {
    backgroundColor: "#709742",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 15,
    elevation: 4,
    marginBottom: 15,
  },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  cancelBtn: { alignItems: "center", padding: 12 },
  cancelText: { color: "#999", fontSize: 15 },
  cerrarBtn: {
    backgroundColor: "#e74c3c",
    padding: 12,
    alignItems: "center",
  },
  cerrarText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  webviewLoading: {
    position: "absolute",
    top: "50%",
    left: "50%",
  },
});

export default PagoScreen;