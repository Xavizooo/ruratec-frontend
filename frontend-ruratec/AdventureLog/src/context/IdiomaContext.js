import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { traducciones } from "../i18n/traducciones";

const IdiomaContext = createContext();

export const IdiomaProvider = ({ children }) => {
  const [idioma, setIdioma] = useState("es");

  useEffect(() => {
    cargarIdioma();
  }, []);

  const cargarIdioma = async () => {
    const guardado = await AsyncStorage.getItem("idioma");
    if (guardado) setIdioma(guardado);
  };

  const cambiarIdioma = async (nuevoIdioma) => {
    setIdioma(nuevoIdioma);
    await AsyncStorage.setItem("idioma", nuevoIdioma);
  };

  const t = traducciones[idioma];

  return (
    <IdiomaContext.Provider value={{ idioma, cambiarIdioma, t }}>
      {children}
    </IdiomaContext.Provider>
  );
};

export const useIdioma = () => useContext(IdiomaContext);
