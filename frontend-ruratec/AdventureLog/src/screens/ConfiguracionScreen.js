import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Switch, Alert, Linking,
} from "react-native";
import {
  Bell, Moon, Globe, Camera, Image, MapPin,
  Info, ChevronRight, Shield, Check, X,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useCameraPermissions } from "expo-camera";
import { useIdioma } from "../context/IdiomaContext";
import { useTema } from "../context/ThemeContext";

const ConfiguracionScreen = ({ navigation }) => {
  const { idioma, cambiarIdioma, t } = useIdioma();
  const { temaOscuro, setTemaOscuro, tema } = useTema();
  const [notificaciones, setNotificaciones] = useState(true);
  const [permisos, setPermisos] = useState({ camara: null, galeria: null, ubicacion: null });
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  useEffect(() => { verificarPermisos(); }, []);

  const verificarPermisos = async () => {
    const galeria = await ImagePicker.getMediaLibraryPermissionsAsync();
    const ubicacion = await Location.getForegroundPermissionsAsync();
    setPermisos({
      camara: cameraPermission?.granted ?? false,
      galeria: galeria.status === "granted",
      ubicacion: ubicacion.status === "granted",
    });
  };

  const solicitarPermiso = async (tipo) => {
    let result;
    if (tipo === "camara") {
      result = await requestCameraPermission();
      setPermisos((prev) => ({ ...prev, camara: result.granted }));
    } else if (tipo === "galeria") {
      result = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setPermisos((prev) => ({ ...prev, galeria: result.status === "granted" }));
    } else if (tipo === "ubicacion") {
      result = await Location.requestForegroundPermissionsAsync();
      setPermisos((prev) => ({ ...prev, ubicacion: result.status === "granted" }));
    }
    if (result?.status === "denied" || result?.granted === false) {
      Alert.alert("Permiso denegado", "Para habilitarlo ve a Configuración del dispositivo.", [
        { text: "Cancelar", style: "cancel" },
        { text: "Abrir Configuración", onPress: () => Linking.openSettings() },
      ]);
    }
  };

  const s = estilos(tema);

  const PermisoItem = ({ icono, label, tipo, valor }) => (
    <TouchableOpacity style={s.permisoItem} onPress={() => !valor && solicitarPermiso(tipo)}>
      <View style={s.itemLeft}>
        <View style={[s.iconBox, { backgroundColor: tema.fondo }]}>{icono}</View>
        <Text style={s.itemLabel}>{label}</Text>
      </View>
      <View style={[s.permisoBadge, valor ? s.permisoOk : s.permisoDenegado]}>
        {valor ? <Check size={14} color="#fff" /> : <X size={14} color="#fff" />}
        <Text style={s.permisoText}>{valor ? t.permitido : t.denegar}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle={tema.statusBar} />
      <View style={s.header}>
        <Text style={s.headerTitle}>{t.configuracion}</Text>
      </View>
      <ScrollView contentContainerStyle={s.content}>

        {/* Notificaciones */}
        <Text style={s.seccionTitulo}>{t.notificaciones}</Text>
        <View style={s.card}>
          <View style={s.switchItem}>
            <View style={s.itemLeft}>
              <View style={[s.iconBox, { backgroundColor: "#FFF3E0" }]}>
                <Bell size={20} color="#FF9800" />
              </View>
              <View>
                <Text style={s.itemLabel}>{t.notificaciones}</Text>
                <Text style={s.itemSub}>{t.alertasVisitas}</Text>
              </View>
            </View>
            <Switch
              value={notificaciones}
              onValueChange={setNotificaciones}
              trackColor={{ false: "#ddd", true: "#A8D08D" }}
              thumbColor={notificaciones ? "#709742" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Apariencia */}
        <Text style={s.seccionTitulo}>{t.apariencia}</Text>
        <View style={s.card}>
          <View style={s.switchItem}>
            <View style={s.itemLeft}>
              <View style={[s.iconBox, { backgroundColor: "#EDE7F6" }]}>
                <Moon size={20} color="#7B1FA2" />
              </View>
              <View>
                <Text style={s.itemLabel}>{t.temaOscuro}</Text>
                <Text style={s.itemSub}>{t.cambiaApariencia}</Text>
              </View>
            </View>
            <Switch
              value={temaOscuro}
              onValueChange={setTemaOscuro}
              trackColor={{ false: "#ddd", true: "#A8D08D" }}
              thumbColor={temaOscuro ? "#709742" : "#f4f3f4"}
            />
          </View>
        </View>
        {/* Permisos */}
        <Text style={s.seccionTitulo}>{t.permisosApp}</Text>
        <View style={s.card}>
          <PermisoItem icono={<Camera size={20} color={tema.iconoVerde} />} label={t.camara} tipo="camara" valor={permisos.camara} />
          <View style={s.separador} />
          <PermisoItem icono={<Image size={20} color={tema.iconoVerde} />} label={t.galeria} tipo="galeria" valor={permisos.galeria} />
          <View style={s.separador} />
          <PermisoItem icono={<MapPin size={20} color={tema.iconoVerde} />} label={t.ubicacion} tipo="ubicacion" valor={permisos.ubicacion} />
        </View>

        {/* Acerca de */}
        <Text style={s.seccionTitulo}>{t.acercaDe}</Text>
        <View style={s.card}>
          <View style={s.rowItem}>
            <View style={s.itemLeft}>
              <View style={[s.iconBox, { backgroundColor: tema.fondo }]}>
                <Info size={20} color={tema.iconoVerde} />
              </View>
              <View>
                <Text style={s.itemLabel}>{t.versionApp}</Text>
                <Text style={s.itemSub}>Ruratec v1.0.0</Text>
              </View>
            </View>
          </View>
          <View style={s.separador} />
          <TouchableOpacity
            style={s.rowItem}
            onPress={() => Alert.alert("Ruratec", "Plataforma que conecta agricultores con comerciantes eliminando intermediarios.\n\n© 2025 Ruratec")}
          >
            <View style={s.itemLeft}>
              <View style={[s.iconBox, { backgroundColor: tema.fondo }]}>
                <Shield size={20} color={tema.iconoVerde} />
              </View>
              <View>
                <Text style={s.itemLabel}>{t.terminosPrivacidad}</Text>
                <Text style={s.itemSub}>{t.politicasUso}</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const estilos = (tema) => StyleSheet.create({
  container: { flex: 1, backgroundColor: tema.fondo },
  header: { backgroundColor: tema.header, padding: 20, borderBottomWidth: 1, borderBottomColor: tema.borde },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: tema.textoTitulo },
  content: { padding: 20 },
  seccionTitulo: {
    fontSize: 13, fontWeight: "700", color: tema.textoSecundario,
    textTransform: "uppercase", letterSpacing: 1,
    marginBottom: 8, marginTop: 20, marginLeft: 4,
  },
  card: {
    backgroundColor: tema.card, borderRadius: 16, paddingHorizontal: 15,
    elevation: 2, shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6,
  },
  switchItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14 },
  rowItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14 },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  itemLabel: { fontSize: 15, color: tema.texto, fontWeight: "600" },
  itemSub: { fontSize: 12, color: tema.textoSecundario, marginTop: 2 },
  separador: { height: 1, backgroundColor: tema.separador },
  permisoItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14 },
  permisoBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  permisoOk: { backgroundColor: "#709742" },
  permisoDenegado: { backgroundColor: "#e74c3c" },
  permisoText: { color: "#fff", fontSize: 12, fontWeight: "600" },
});

export default ConfiguracionScreen;