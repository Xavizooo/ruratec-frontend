import React, { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

export const colores = {
  light: {
    fondo: "#F8F9FA",
    card: "#ffffff",
    texto: "#333333",
    textoSecundario: "#999999",
    textoTitulo: "#1B3A1B",
    borde: "#eeeeee",
    separador: "#f0f0f0",
    header: "#ffffff",
    iconoVerde: "#709742",
    statusBar: "dark-content",
  },
  dark: {
    fondo: "#121212",
    card: "#1E1E1E",
    texto: "#E0E0E0",
    textoSecundario: "#888888",
    textoTitulo: "#A8D08D",
    borde: "#2C2C2C",
    separador: "#2C2C2C",
    header: "#1A1A1A",
    iconoVerde: "#A8D08D",
    statusBar: "light-content",
  },
};

export const ThemeProvider = ({ children }) => {
  const [temaOscuro, setTemaOscuro] = useState(false);
  const tema = temaOscuro ? colores.dark : colores.light;

  return (
    <ThemeContext.Provider value={{ temaOscuro, setTemaOscuro, tema }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTema = () => useContext(ThemeContext);