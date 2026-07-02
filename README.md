Aquí tienes la información de tu archivo README organizada bajo la estructura que solicitaste para el proyecto **RURATEC**:

# 🌱 RURATEC — Frontend

## Descripción

Ruratec es una plataforma diseñada para eliminar intermediarios innecesarios en la cadena de suministro agrícola, conectando directamente a **agricultores con comerciantes**. Permite que los agricultores publiquen sus productos y que los comerciantes los contacten vía WhatsApp para negociar, integrando además un sistema de pagos seguro dentro de la aplicación que gestiona automáticamente una comisión del 4%.

## Integrantes

* Luis Danilo Martinez Cañon
* Andres Felipe Diaz Barbosa
* Hector Ivan Amado Betancur
* Javier Andres Torres Sanchez
* Juan David Ducuara Santa

## Tecnologías utilizadas

* **Lenguaje:** JavaScript (ES6+)
* **Framework:** React
* **Base de datos:** PostgreSQL (Gestionada desde el Backend)
* **Librerías principales:**
* **React Router:** Para la navegación entre vistas.
* **Axios:** Para el consumo de la API REST.
* **Tailwind CSS / CSS Modules:** Para el diseño de la interfaz.



## Requisitos previos

Para ejecutar este frontend, es necesario contar con:

* **Node.js** (Versión 18.x o superior)
* **npm** o **yarn**
* El **Backend de Ruratec** configurado y en ejecución local.

## Instalación

Sigue estos pasos para preparar el entorno:

1. **Clonar el repositorio:**
```bash
git clone https://github.com/Xavizooo/frontend-proyecto.git
cd frontend-proyecto

```


2. **Instalar dependencias:**
```bash
npm install

```



## Ejecución local

Para iniciar el servidor de desarrollo:

```bash
npm start

```

La aplicación estará disponible por defecto en: `http://localhost:3000`.

## Base de datos

La gestión de la base de datos se realiza a través del **Backend**. Asegúrate de haber seguido las instrucciones del [repositorio del Backend](https://github.com/Xavizooo/Backend) para realizar las migraciones en **PostgreSQL** y tener el servicio activo en el puerto `8000`.

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con los siguientes parámetros:

* `REACT_APP_API_URL`: URL base de la API (ej. `http://localhost:8000/api`).
* `REACT_APP_WHATSAPP_BASE_URL`: URL base para redirección a chat (ej. `[https://wa.me/](https://wa.me/)`).

## Usuario de prueba

*Por el momento, el acceso se realiza mediante el flujo de registro e inicio de sesión con JWT implementado en la plataforma.*

* **Login:** `/login`
* **Registro:** `/register`

## Despliegue

El proyecto está preparado para generar un build de producción mediante el comando:

```bash
npm run build

```

GitHub

## Evidencias

El sistema cuenta con las siguientes vistas principales funcionando:

* **Home:** Landing page del proyecto.
* **Products:** Catálogo donde los comerciantes exploran ofertas.
* **Dashboard:** Panel de control para que el agricultor gestione sus publicaciones.
* **Pago:** Interfaz de procesamiento de pagos con el 4% de comisión.

```

```
