# 🦜 Aves XR — Galería de Realidad Aumentada de La Guajira

Plataforma interactiva WebXR y AR basada en marcadores de imagen para **5 aves emblemáticas de La Guajira colombiana**. Combina una galería 3D para web con un escáner de Realidad Aumentada que proyecta los modelos 3D con **5 etiquetas holográficas flotantes y pines anatómicos** directamente sobre tarjetas físicas.

---

## 📋 Aves del Proyecto

| # | Especie | Nombre científico | Modelo Limpio (Web) | Modelo Anotado (AR) |
|---|---|---|---|---|
| 1 | **Buco Gargantirrufo** | *Malacoptila rufa* | `models/buco.glb` | `models/annotated/buco_con_infografia.glb` |
| 2 | **Flamenco Americano** | *Phoenicopterus ruber* | `models/flamenco.glb` | `models/annotated/flamenco_con_infografia.glb` |
| 3 | **Palomita Escamosa** | *Columbina squammata* | `models/paloma.glb` | `models/annotated/paloma_con_infografia.glb` |
| 4 | **Rey Guajiro (Tigana)** | *Eurypyga helias* | `models/rey_guajiro.glb` | `models/annotated/rey_guajiro_con_infografia.glb` |
| 5 | **Turpial de La Guajira** | *Icterus icterus* | `models/turpial.glb` | `models/annotated/turpial_con_infografia.glb` |

---

## 🌟 Experiencias del Proyecto

### 1. Visor de Catálogo 3D Web (`index.html`)
- Visualización interactiva 3D limpia con rotación, zoom y controles de cámara (`model-viewer`).
- Ficha técnica completa por ave (orden, familia, tamaño, dieta, estado y hábitat).
- Botón WebXR para proyectar el ave en el suelo en dispositivos móviles compatibles.

### 2. Escáner AR con Tarjetas Físicas (`public/scanner.html`)
- Reconocimiento y seguimiento de imágenes en tiempo real mediante **MindAR 1.2.5** y **A-Frame 1.4.2**.
- Al apuntar a la tarjeta de cualquier ave, proyecta en tiempo real el modelo 3D con sus **5 etiquetas infográficas integradas**, las cuales se mueven y rotan de forma sólida junto con la tarjeta:
  - **Identificación:** Nombre común y científico.
  - **Biometría:** Medida de longitud/altura y peso promedio.
  - **Pico y alimentación:** Adaptación anatómica de la especie.
  - **Plumaje y coloración:** Características diagnósticas del plumaje.
  - **Extremidades / Vuelo:** Adaptación de alas, zancas o cola.

### 3. Centro de Tarjetas Coleccionables (`public/cards.html`)
- Página lista para visualizar o imprimir en hoja carta/A4 las 5 tarjetas con diseño de alta calidad y contraste, optimizadas para el tracking del escáner AR.

---

## 🛠️ Pipeline Automatizado 3D (Blender CLI & Pillow)

El proyecto incluye un pipeline completo en Python que automatiza la generación de modelos infográficos:

```bash
# 1. Generar las 25 texturas de etiquetas en alta resolución
python generate_labels.py --all

# 2. Inyectar etiquetas 3D con doble cara y líneas guía en Blender
blender --background --python inject_infographics.py -- --all
```

- **Materiales auto-iluminados:** `Principled BSDF` con `Emission Strength = 1.3` en tarjetas y `3.0` en guías, garantizando lectura nítida bajo cualquier iluminación en AR.
- **Lectura en 360°:** Planos dobles con UV invertido en la cara posterior para lectura normal desde cualquier ángulo.
- **Cálculo de despeje:** Ajuste automático de distancia según el Bounding Box de cada especie (desde 18 cm hasta 1.45 m).

---

## 🚀 Inicio Rápido (Local)

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
# → Abre http://localhost:5173
```

Para probar en el teléfono conectado a la misma red WiFi:
```bash
npx vite --host
```

---

## 📦 Compilación para Producción

```bash
npm run build
# Genera los archivos estáticos en dist/
```

Despliegue compatible con **Vercel**, **Netlify** o **GitHub Pages**.
