# 📖 Documentación Técnica y Blueprint: Galería WebXR 3D

> **Proyecto de Referencia:** *Aves de la Guajira XR*  
> **Despliegue de Producción:** [https://aves-guajira-xr.vercel.app](https://aves-guajira-xr.vercel.app)  
> **Rol / Perfil Técnico:** Lead Fullstack & WebXR Engineer  

---

## 📑 Tabla de Contenidos
1. [Resumen Ejecutivo & Alcance](#1-resumen-ejecutivo--alcance)
2. [Arquitectura y Estructura del Proyecto](#2-arquitectura-y-estructura-del-proyecto)
3. [Stack Tecnológico y Herramientas](#3-stack-tecnológico-y-herramientas)
4. [Flujo de Trabajo del Agente Autónomo (Paso a Paso)](#4-flujo-de-trabajo-del-agente-autónomo-paso-a-paso)
   - [Fase 1: Descubrimiento y Auditoría de Assets](#fase-1-descubrimiento-y-auditoría-de-assets)
   - [Fase 2: Arquitectura Web y Configuración WebXR](#fase-2-arquitectura-web-y-configuración-webxr)
   - [Fase 3: Localización y Rebranding Temático](#fase-3-localización-y-rebranding-temático)
   - [Fase 4: Optimización Extrema de Modelos 3D (-96%)](#fase-4-optimización-extrema-de-modelos-3d--96)
   - [Fase 5: Soporte AR Multiplataforma (Android & iOS Quick Look)](#fase-5-soporte-ar-multiplataforma-android--ios-quick-look)
   - [Fase 6: Procesamiento de Imágenes con IA (PNG con Transparencia)](#fase-6-procesamiento-de-imágenes-con-ia-png-con-transparencia)
   - [Fase 7: Diseño UI/UX Mobile-First y Responsive](#fase-7-diseño-uiux-mobile-first-y-responsive)
   - [Fase 8: CI/CD, Git LFS y Despliegue en Vercel](#fase-8-cicd-git-lfs-y-despliegue-en-vercel)
5. [Por qué demoraron ciertas tareas (Tiempos de Ejecución)](#5-por-qué-demoraron-ciertas-tareas-tiempos-de-ejecución)
6. [Guía Blueprint: Cómo Replicar este Proyecto desde Cero](#6-guía-blueprint-cómo-replicar-este-proyecto-desde-cero)

---

## 1. Resumen Ejecutivo & Alcance

Este proyecto consiste en una aplicación web interactiva, responsiva y de alto rendimiento diseñada para renderizar modelos tridimensionales interactivos en navegadores web de escritorio y móviles, con capacidad inmediata de **Realidad Aumentada (AR)** en:
- **Android:** Vía WebXR y Google Scene Viewer.
- **iOS (iPhone / iPad):** Vía Quick Look nativo mediante archivos `.usdz`.

### Logros Clave:
- **Reducción de peso de modelos 3D:** De **291.6 MB** a solo **12.9 MB** totales (**-96%** de reducción) mediante compresión Draco, simplificación de mallas y texturas WebP.
- **Imágenes de precarga (Posters):** Procesadas mediante visión por computadora / IA (`rembg` con red neuronal U2Net) para eliminar fondos negros y generar PNGs transparentes de ~200-300 KB.
- **Cero frameworks pesados:** Desarrollado sobre Vanilla JavaScript (ES Modules) y Vite, logrando tiempos de carga instantáneos y un bundle mínimo.
- **Despliegue Serverless:** Configurado en Vercel con reglas de caché inmutable (`max-age=31536000`) y tipos MIME específicos (`model/gltf-binary`, `model/vnd.usdz+zip`).

---

## 2. Arquitectura y Estructura del Proyecto

```
ProyectoAvesXR/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Pipeline CI/CD para GitHub Actions
├── public/
│   ├── models/                 # Modelos 3D servidos públicamente
│   │   ├── buco.glb            # (3.72 MB - Optimizado Draco/WebP)
│   │   ├── buco.usdz           # (88.9 MB - iOS Quick Look)
│   │   ├── flamenco.glb        # (3.73 MB)
│   │   ├── flamenco.usdz       # (89.5 MB)
│   │   ├── paloma.glb          # (1.08 MB)
│   │   ├── paloma.usdz         # (28.7 MB)
│   │   ├── rey_guajiro.glb     # (1.91 MB)
│   │   ├── rey_guajiro.usdz    # (53.2 MB)
│   │   ├── turpial.glb         # (2.42 MB)
│   │   └── turpial.usdz        # (56.8 MB)
│   └── posters/                # Posters / Thumbnails con fondo transparente (RGBA PNG)
│       ├── buco.png
│       ├── flamenco.png
│       ├── paloma.png
│       ├── rey_guajiro.png
│       └── turpial.png
├── scripts/
│   ├── optimize-posters.mjs    # Script en Node.js con sharp para resize
│   └── remove_bg.py            # Script Python con rembg (IA) para quitar fondo
├── src/
│   ├── main.js                 # Lógica interactiva, catálogo de datos, eventos del visor
│   └── style.css               # Estilos temáticos mobile-first con CSS clamp()
├── .gitattributes              # Configuración de Git LFS para .glb/.usdz/.gltf
├── .gitignore                  # Exclusiones de Git (node_modules, dist, temp, caches)
├── index.html                  # Shell HTML con viewport-fit y configuración <model-viewer>
├── package.json                # Dependencias, scripts npm (dev, build, preview, deploy)
├── vercel.json                 # Configuración de Vercel (cabeceras CORS, MIME types, cache)
└── vite.config.js              # Bundler config con base relativa y chunks separados
```

---

## 3. Stack Tecnológico y Herramientas

| Componente | Tecnología | Motivo de Selección |
|---|---|---|
| **Visor 3D / AR** | `@google/model-viewer` (v4.0) | Estándar de la industria para WebXR, Google Scene Viewer y Apple Quick Look. |
| **Bundler / DevServer** | `Vite` (v6) | Compilación ultrarrápida (HMR en ms, build en <3s). |
| **Optimización 3D** | `@gltf-transform/cli` | Deduplicación, soldadura de vértices, compresión Draco y texturas WebP. |
| **Procesamiento Gráfico** | `rembg` (Python) + `Pillow` | Segmentación mediante red neuronal U2Net para recorte con alpha matting. |
| **Procesamiento de Posters** | `sharp` (Node.js) | Compresión y reescalado de alta velocidad para imágenes web. |
| **Control de Versiones** | Git + `Git LFS` | Control de archivos pesados sin corromper el árbol histórico de Git. |
| **Hosting & CDN** | `Vercel` Edge Network | Entrega rápida con CDN global y soporte de encabezados HTTP personalizados. |

---

## 4. Flujo de Trabajo del Agente Autónomo (Paso a Paso)

### Fase 1: Descubrimiento y Auditoría de Assets
1. El agente inspeccionó recursivamente el árbol de carpetas con comandos de PowerShell/Terminal (`Get-ChildItem`).
2. Identificó 5 carpetas con nombres de especies conteniendo archivos `.glb` (de hasta ~82 MB cada uno) e imágenes originales de referencia.
3. Descubrió posteriormente que las carpetas raíz también contenían versiones `.usdz` para iOS.

### Fase 2: Arquitectura Web y Configuración WebXR
1. Se inicializó el proyecto con `package.json` y `vite.config.js`.
2. Se importó `@google/model-viewer`.
3. Se parametrizó el componente `<model-viewer>` con:
   ```html
   <model-viewer
     id="bird-viewer"
     src="models/buco.glb"
     ios-src="models/buco.usdz"
     poster="posters/buco.png"
     ar
     ar-modes="webxr scene-viewer quick-look"
     ar-scale="auto"
     ar-placement="floor"
     camera-controls
     auto-rotate
     shadow-intensity="1"
     environment-image="neutral">
   </model-viewer>
   ```

### Fase 3: Localización y Rebranding Temático
A solicitud del usuario, se adaptó toda la narrativa biológica y cultural:
- Se cambió el enfoque general a **Aves de la Guajira (Colombia)**.
- Se reescribieron las fichas ornitológicas con referencias territoriales:
  - *Flamenco Americano:* Salinas de Manaure y Ciénaga de la Macuira.
  - *Palomita Escamosa:* Riohacha, Uribia y Manaure.
  - *Rey Guajiro:* Serranía de Perijá y estribaciones de la Sierra Nevada.
  - *Turpial:* Alta Guajira y su significado con la comunidad Wayuu.
  - *Buco Gargantirrufo:* Bosques de galería y serranías guajiras.

### Fase 4: Optimización Extrema de Modelos 3D (-96%)
Los modelos originales pesaban ~291 MB en total, lo cual colapsaba datos móviles y tardaba decenas de segundos en cargar.
El agente ejecutó una pipeline de optimización con `@gltf-transform`:
```bash
npx gltf-transform optimize input.glb output.glb \
  --compress draco \
  --texture-compress webp \
  --texture-size 1024
```
**Operaciones realizadas internamente:**
1. `dedup`: Elimina primitivas, accesores y texturas duplicadas.
2. `weld` & `simplify`: Reduce la cantidad de polígonos innecesarios manteniendo la silueta del ave.
3. `textureCompress webp`: Convierte mapas PNG/JPEG internos de 2K/4K a WebP 1K.
4. `draco`: Comprime los búferes de geometría en binario de alta densidad.

**Resultado:**
- `buco.glb`: 81.6 MB → **3.72 MB** (-95%)
- `flamenco.glb`: 81.4 MB → **3.73 MB** (-95%)
- `paloma.glb`: 26.8 MB → **1.08 MB** (-96%)
- `rey_guajiro.glb`: 49.1 MB → **1.91 MB** (-96%)
- `turpial.glb`: 52.7 MB → **2.42 MB** (-95%)

### Fase 5: Soporte AR Multiplataforma (Android & iOS Quick Look)
- Se copiaron los archivos `.usdz` correspondientes a `public/models/`.
- En `src/main.js`, cada objeto del array `BIRDS` incluye su enlace `iosSrc: 'models/ave.usdz'`.
- Al cambiar de pestaña, el script conmuta dinámicamente tanto el `src` (GLB para Android/PC) como el `ios-src` (USDZ para Safari iOS).

### Fase 6: Procesamiento de Imágenes con IA (PNG con Transparencia)
Los posters originales tenían fondos negros sólidos que contrastaban toscamente con el diseño verde de la interfaz.
1. Se configuró un script en Python (`scripts/remove_bg.py`) utilizando la librería `rembg`.
2. Se aplicó el modelo neuronal de segmentación `u2net` con **alpha matting** habilitado para preservar plumas y patas finas.
3. Las imágenes resultantes se guardaron en formato PNG de 32 bits (RGBA) de 512×512 píxeles con transparencia total.

### Fase 7: Diseño UI/UX Mobile-First y Responsive
- **Tipografía Fluida:** Se implementó `clamp()` en títulos, nombres científicos y textos para evitar desbordamientos en pantallas pequeñas (ej. iPhones mini o Androids < 360px).
- **Zonas táctiles WCAG:** Botones con objetivo mínimo de `44px × 44px`.
- **Adaptabilidad de Viewer:** Altura calculada mediante `clamp(260px, 52vw, 480px)` en móvil y `68vh` en escritorio con barra lateral pegajosa (`sticky`).
- **Soporte de Safe Area & Notch:** `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">`.

### Fase 8: CI/CD, Git LFS y Despliegue en Vercel
1. Se configuró `.gitattributes` para que Git LFS gestione `.glb`, `.usdz` y `.gltf`.
2. Se creó `.github/workflows/deploy.yml` para soporte opcional con GitHub Pages.
3. Se creó `vercel.json` con cabeceras HTTP de alto rendimiento:
   ```json
   {
     "source": "/models/(.*).glb",
     "headers": [
       { "key": "Content-Type", "value": "model/gltf-binary" },
       { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
     ]
   }
   ```
4. Se desplegó automáticamente en producción con Vercel CLI.

---

## 5. Por qué demoraron ciertas tareas (Tiempos de Ejecución)

Si notaste pausas durante la ejecución, se debió a tres procesos computacionales pesados que corrieron directamente en la máquina local:

1. **Descarga del modelo de IA U2Net (`~1.02 GB`):**
   - Cuando se ejecutó `rembg` por primera vez, descargó los pesos pre-entrenados de la red neuronal de segmentación desde GitHub/PyPI. Esto tomó ~2-3 minutos según el ancho de banda. *(Es un paso que solo se hace una única vez).*
2. **Inferencia de segmentación en CPU:**
   - La máquina ejecutó la red neuronal sobre los 5 pósteres en modo CPU (onnxruntime), calculando máscaras de canal alfa pixel por pixel con refinamiento de bordes (*alpha matting*).
3. **Compresión geométrica y de texturas 3D:**
   - El proceso de `gltf-transform` desarmó mallas de cientos de miles de polígonos, ejecutó algoritmos de simplificación cuadrática, recodificó texturas a WebP y corrió el compresor Draco para cada ave.
4. **Subida inicial a Vercel:**
   - Antes de optimizar, se intentó subir un paquete que incluía los modelos originales no optimizados (~890 MB). Una vez optimizados, los siguientes despliegues tardaron **menos de 15 segundos**.

---

## 6. Guía Blueprint: Cómo Replicar este Proyecto desde Cero

Para usar este proyecto como plantilla en otro desarrollo (ej. catálogo de fauna, calzado, muebles, esculturas, etc.), sigue estos pasos:

### Paso 1: Clonar o Inicializar la Estructura
```bash
mkdir mi-galeria-xr
cd mi-galeria-xr
npm init -y
npm install @google/model-viewer
npm install -D vite gh-pages @gltf-transform/cli sharp
```

### Paso 2: Preparar Carpetas de Assets
```bash
mkdir -p public/models public/posters src scripts
```

### Paso 3: Optimizar los Modelos GLB
Coloca tus modelos `.glb` en una carpeta temporal y optimízalos:
```bash
npx gltf-transform optimize input.glb public/models/modelo.glb \
  --compress draco \
  --texture-compress webp \
  --texture-size 1024
```

### Paso 4: Agregar Soporte iOS (`.usdz`)
Coloca los archivos `.usdz` con el mismo nombre base en `public/models/modelo.usdz`.

### Paso 5: Generar Posters con Fondo Transparente
Instala Python y rembg:
```bash
pip install rembg Pillow
python scripts/remove_bg.py
```

### Paso 6: Configurar `main.js` y el Catálogo
Define el arreglo de elementos:
```javascript
const ITEMS = [
  {
    id: 'item1',
    name: 'Nombre del Objeto',
    model: 'models/item1.glb',
    iosSrc: 'models/item1.usdz',
    poster: 'posters/item1.png',
    description: 'Descripción detallada...'
  }
];
```

### Paso 7: Probar en Local
```bash
npm run dev -- --host
```
*Abre la IP de red local (ej. `http://192.168.x.x:5173`) desde tu teléfono móvil conectado al mismo WiFi para probar AR.*

### Paso 8: Desplegar a Producción
```bash
npx vercel --prod --yes
```

---
**Documento generado y validado con éxito para el proyecto Aves de la Guajira XR.**
