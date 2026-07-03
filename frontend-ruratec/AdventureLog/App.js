import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";



// Importación de pantallas
import VerificarDocumentoScreen from "./src/screens/VerificarDocumentoScreen";
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import CameraScreen from "./src/screens/CameraScreen";
import PhotoDetailScreen from "./src/screens/PhotoDetailScreen";
import RegistroScreen from "./src/screens/RegistroScreen";
import HomeComercianteScreen from "./src/screens/HomeComercianteScreen";
import DetallePublicacionComerciante from "./src/screens/DetallePublicacionComerciante";
import VisitasScreen from "./src/screens/VisitasScreen";
import NegociacionScreen from "./src/screens/NegociacionScreen";
import PagoScreen from "./src/screens/PagoScreen";
import PerfilScreen from "./src/screens/PerfilScreen";
import FavoritosScreen from "./src/screens/FavoritosScreen";
import ConfiguracionScreen from "./src/screens/ConfiguracionScreen";
import { IdiomaProvider } from "./src/context/IdiomaContext";
import CanastaPreciosScreen from "./src/screens/CanastaPreciosScreen";
import EditarPublicacionScreen from "./src/screens/EditarPublicacionScreen";
import NotificacionesScreen from "./src/screens/NotificacionesScreen";
import NegociacionesAgricultorScreen from "./src/screens/NegociacionesAgricultorScreen";
import EsperandoPagoScreen from "./src/screens/EsperandoPagoScreen";
import { ThemeProvider } from "./src/context/ThemeContext";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <IdiomaProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen name="Registro" component={RegistroScreen} />

              <Stack.Screen
                name="HomeAgricultor"
                component={HomeScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="Camera"
                component={CameraScreen}
                options={{ title: "Capturar Producto" }}
              />

              <Stack.Screen
                name="PhotoDetail"
                component={PhotoDetailScreen}
                options={{ title: "Detalle Del producto" }}
              />

              <Stack.Screen
                name="HomeComerciante"
                component={HomeComercianteScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="DetallePublicacion"
                component={DetallePublicacionComerciante}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="Visitas"
                component={VisitasScreen}
                options={{ title: "Interesados" }}
              />

              <Stack.Screen
                name="Negociacion"
                component={NegociacionScreen}
                options={{ title: "Negociar Compra" }}
              />

              <Stack.Screen
                name="Pago"
                component={PagoScreen}
                options={{ title: "Resumen de Pago" }}
              />

              <Stack.Screen
                name="Perfil"
                component={PerfilScreen}
                options={{ title: "Mi Perfil" }}
              />

              <Stack.Screen
                name="Favoritos"
                component={FavoritosScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="Configuracion"
                component={ConfiguracionScreen}
                options={{ title: "Configuración" }}
              />
              <Stack.Screen
                name="CanastaPreciosScreen"
                component={CanastaPreciosScreen}
                options={{ title: "Precios Canasta Familiar" }}
              />
              <Stack.Screen
                name="EditarPublicacion"
                component={EditarPublicacionScreen}
                options={{ title: "Editar Publicación" }}
              />
              <Stack.Screen
                name="Notificaciones"
                component={NotificacionesScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="NegociacionesAgricultor"
                component={NegociacionesAgricultorScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="EsperandoPago"
                component={EsperandoPagoScreen}
              />
              <Stack.Screen
                name="VerificarDocumento"
                component={VerificarDocumentoScreen}
                options={{ headerShown: false }}
              />

            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </IdiomaProvider>
    </ThemeProvider>
  );
}