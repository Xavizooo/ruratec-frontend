import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Switch, Alert, Modal,
} from "react-native";
import {
  Bell, Moon, Info, ChevronRight, Shield,
} from "lucide-react-native";
import { useIdioma } from "../context/IdiomaContext";
import { useTema } from "../context/ThemeContext";

const TERMINOS_TEXTO = `TÉRMINOS Y CONDICIONES DE USO DE LA PLATAFORMA "RURATEC"
Última actualización: Julio de 2026

El presente documento establece los Términos y Condiciones que regulan el acceso y uso de la aplicación móvil Ruratec (en adelante, "la Plataforma"). Al registrarse y utilizar la Plataforma, el usuario (en adelante, "el Usuario", que incluye a Agricultores, Comerciantes y/o Transportistas) acepta de manera expresa, voluntaria e irrevocable la totalidad de las cláusulas aquí descritas.

1. NATURALEZA DE LA PLATAFORMA (¿Qué es Ruratec?)
Ruratec es una plataforma tecnológica de intermediación comercial y optimización logística. La Plataforma no es dueña, no comercializa, no produce ni transporta directamente ningún producto agrícola. Su función se limita a conectar a productores agrícolas (Agricultores) con compradores mayoristas (Comerciantes) y facilitar la coordinación del traslado de mercancías.

2. ROLES Y REGISTRO DE USUARIOS
Para operar en Ruratec, los usuarios deben registrarse bajo uno de los siguientes perfiles, garantizando que la información suministrada es verídica y actualizada:

Agricultor (Vendedor): Persona natural o jurídica que oferta productos del campo, obligándose a describir con exactitud la calidad, cantidad, empaque y condiciones logísticas de su cosecha.

Comerciante (Comprador): Persona natural o jurídica que adquiere los productos y se compromete al pago oportuno según los términos pactados en la Plataforma.

Transportista (Tercero Colaborador, si aplica): Persona que ofrece servicios de carga pesada o mediana para el traslado de los productos.

3. DECLARACIÓN DE RESPONSABILIDAD LOGÍSTICA Y TRANSPORTE
Dado que la logística es un factor crítico en la cadena de suministro, las partes aceptan las siguientes reglas al momento de publicar y pactar una compraventa:

Veracidad en los Datos de Acceso: El Agricultor es el único responsable de especificar correctamente en el formulario de publicación las condiciones de recolección (Retiro en finca, Entrega en cabecera municipal o Transporte propio), así como el estado real de las vías de acceso (Trocha, Destapada o Pavimentada).

Exclusión de Responsabilidad por Pérdida de Carga: Ruratec no se hace responsable por el deterioro, pérdida, hurto, retrasos por factores climáticos, paros viales o daños que sufran los productos agrícolas durante el trayecto de transporte. Dicha responsabilidad recae exclusivamente en el transportista contratado o en la parte que asumió la obligación logística según la modalidad elegida en la publicación.

Capacidad del Vehículo: Es responsabilidad del Comerciante (o del Transportista asignado) verificar que el vehículo enviado cumpla con las especificaciones técnicas requeridas para el tipo de vía reportado por el Agricultor y el volumen de carga.

4. MODELO ECONÓMICO Y COMISIONES
Tarifa por Uso del Servicio: El uso de la Plataforma y la publicación de productos es gratuito. Sin embargo, Ruratec percibirá una tarifa de gestión/comisión del [Insertar % o tarifa fija por transacción, ej: 1% o cobro fijo por flete coordinado] sobre el valor total de cada transacción exitosa, destinada al mantenimiento técnico, geolocalización y soporte de la app.

Independencia de Precios: Los precios de los productos agrícolas son fijados libremente por el Agricultor. Los costos de envío y fletes se calcularán de mutuo acuerdo o mediante las herramientas de estimación de la app, y se desglosarán de forma independiente al valor del producto.

5. CALIDAD DE LOS PRODUCTOS Y DERECHO DE RETRACTO
Naturaleza Perecedera: De conformidad con el artículo 47 de la Ley 1480 de 2011 (Estatuto del Consumidor de Colombia), los bienes perecederos (frutas, verduras, tubérculos, etc.) están exceptuados del derecho de retracto una vez hayan salido del punto de acopio o finca, debido a su rápida descomposición.

Inspección en el Punto de Entrega: El Comerciante (o el Transportista en su representación) tiene la obligación de inspeccionar la calidad y cantidad del producto en el momento exacto de la recolección. Una vez el producto sea cargado en el vehículo, se entenderá por aceptado a satisfacción, y no se admitirán reclamaciones posteriores por daños estéticos o maduración natural.

6. PROPIEDAD INTELECTUAL
El diseño, código fuente, logotipos, bases de datos y la marca Ruratec son propiedad exclusiva de sus desarrolladores. Queda prohibida la reproducción total o parcial, ingeniería inversa o explotación comercial del software sin autorización previa y por escrito.

7. TRATAMIENTO DE DATOS PERSONALES (Habeas Data)
En cumplimiento de la Ley 1581 de 2012 de Colombia, Ruratec recolecta y almacena los datos personales de los usuarios (nombres, teléfonos, ubicaciones GPS, datos de facturación) únicamente con fines de operación de la plataforma, validación de seguridad y conexión entre las partes para la entrega de pedidos. Los datos jamás serán vendidos a terceros.

8. LEY APLICABLE Y JURISDICCIÓN
Estos Términos y Condiciones se rigen bajo las leyes de la República de Colombia. Cualquier disputa derivada del uso de la plataforma que no pueda ser conciliada directamente de forma amistosa, será sometida a los centros de conciliación autorizados o a la Superintendencia de Industria y Comercio (SIC).`;

const ConfiguracionScreen = ({ navigation }) => {
  const { t } = useIdioma();
  const { temaOscuro, setTemaOscuro, tema } = useTema();
  const [notificaciones, setNotificaciones] = useState(true);
  const [showTerminos, setShowTerminos] = useState(false);

  const s = estilos(tema);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle={tema.statusBar} />
      
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
            onPress={() => setShowTerminos(true)}
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

      {/* Modal con términos y condiciones completos */}
      <Modal visible={showTerminos} transparent animationType="slide">
        <View style={s.modalBackdrop}>
          {/* ✅ FIX: se agregó flex: 0.85 (mismo patrón que ya funciona en
              RegistroScreen). Un View dentro de un Modal con solo
              maxHeight en porcentaje puede colapsar a altura 0 en
              Android antes de medir el contenido, dejando el
              ScrollView de adentro sin espacio real para pintar texto.
              Con flex + maxHeight combinados, el modal sí toma una
              altura concreta desde el primer render. */}
          <View style={[s.modalContent, { flex: 0.85 }]}>
            <Text style={s.modalTitle}>Términos y condiciones</Text>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <Text style={s.terminosContenido}>{TERMINOS_TEXTO}</Text>
            </ScrollView>
            <TouchableOpacity
              style={s.modalCerrarBtn}
              onPress={() => setShowTerminos(false)}
            >
              <Text style={s.modalCerrarText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  modalBackdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff", width: "90%", maxHeight: "80%",
    borderRadius: 16, padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#1B3A1B", marginBottom: 14 },
  terminosContenido: { fontSize: 14, color: "#555", lineHeight: 22 },
  modalCerrarBtn: {
    backgroundColor: "#709742", borderRadius: 12,
    paddingVertical: 12, alignItems: "center", marginTop: 16,
  },
  modalCerrarText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});

export default ConfiguracionScreen;