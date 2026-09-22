# 🦜 Aves XR — Galería de Realidad Aumentada

Galería web interactiva con modelos 3D de **5 aves venezolanas**, soporte completo de **Realidad Aumentada** (WebXR en Android, Scene Viewer en Android, Quick Look en iOS) y un diseño naturalista responsivo.

---

## 📋 Aves incluidas

| # | Nombre común | Nombre científico | Archivo |
|---|---|---|---|
| 1 | Buco Gargantirrufo | *Malacoptila rufa* | `buco.glb` (81.6 MB) |
| 2 | Flamenco Americano | *Phoenicopterus ruber* | `flamenco.glb` (81.4 MB) |
| 3 | Palomita Escamosa | *Columbina squammata* | `paloma.glb` (26.8 MB) |
| 4 | Rey Guajiro | *Eurypyga helias* | `rey_guajiro.glb` (49.1 MB) |
| 5 | Turpial Venezolano | *Icterus icterus* | `turpial.glb` (52.7 MB) |

---

## 🚀 Inicio rápido (local)

```bash
# 1. Instalar dependencias
npm install

# 2. Servidor de desarrollo con hot-reload
npm run dev
# → Abre http://localhost:5173
```

---

## 🏗️ Estructura del proyecto

```
ProyectoAvesXR/
├── public/
│   ├── models/          ← Modelos 3D (.glb)
│   │   ├── buco.glb
│   │   ├── flamenco.glb
│   │   ├── paloma.glb
│   │   ├── rey_guajiro.glb
│   │   └── turpial.glb
│   └── posters/         ← Imágenes de carga/thumbnails
│       ├── buco.png
│       ├── flamenco.png
│       ├── paloma.png
│       ├── rey_guajiro.png
│       └── turpial.png
├── src/
│   ├── main.js          ← Lógica principal + datos de aves
│   └── style.css        ← Estilos (paleta naturalista)
├── .github/
│   └── workflows/
│       └── deploy.yml   ← GitHub Actions → Pages
├── index.html           ← Entrada principal
├── vite.config.js       ← Configuración Vite
├── .gitattributes       ← Git LFS para archivos .glb > 50 MB
└── package.json
```

---

## 📦 Build de producción

```bash
npm run build
# Genera la carpeta dist/ lista para servir
```

---

## 🌐 Despliegue

### Opción A — GitHub Pages (recomendado, gratuito)

1. Crea un repositorio en GitHub: `github.com/TU_USUARIO/aves-xr-gallery`

2. Conecta y sube:
```bash
git remote add origin https://github.com/TU_USUARIO/aves-xr-gallery.git
git branch -M main
git push -u origin main
```

3. En GitHub → **Settings → Pages** → Source: **GitHub Actions**

4. El workflow `.github/workflows/deploy.yml` construye y despliega automáticamente en cada push a `main`.

5. Tu galería estará en: `https://TU_USUARIO.github.io/aves-xr-gallery/`

> **Nota sobre el `base` en `vite.config.js`:** Si el repositorio se llama diferente a `aves-xr-gallery`, cambia el comentario de `base` en `vite.config.js`:
> ```js
> base: '/nombre-de-tu-repo/',
> ```

### Opción B — Vercel (un clic)

```bash
npx vercel --prod
```

### Opción C — Netlify

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

---

## ⚠️ Git LFS (archivos grandes)

Los modelos `.glb` se rastrean con **Git LFS**. Para clonar con los modelos:

```bash
git lfs install    # Solo la primera vez
git clone https://github.com/TU_USUARIO/aves-xr-gallery.git
```

Para agregar soporte LFS a un repositorio existente:
```bash
git lfs install
git lfs track "*.glb" "*.usdz"
git add .gitattributes
git commit -m "chore: configure Git LFS for 3D models"
```

---

## 📱 Realidad Aumentada

| Plataforma | Modo AR | Requisito |
|---|---|---|
| Android (Chrome) | **WebXR** | ARCore instalado |
| Android (Samsung/etc) | **Scene Viewer** | Google Play Services |
| iOS (Safari) | **Quick Look** | iOS 12+ / iPadOS |

Para habilitar AR en iOS se necesitan archivos `.usdz`. Agrega la ruta en `src/main.js` → campo `iosSrc` de cada ave.

---

## 🛠️ Tecnologías

- [Vite 6](https://vitejs.dev/) — bundler ultrarrápido
- [@google/model-viewer 4](https://modelviewer.dev/) — visor 3D + AR
- Vanilla JS (ES modules) — sin framework, máximo rendimiento

---

## 📜 Licencia

MIT — Uso educativo y cultural.
