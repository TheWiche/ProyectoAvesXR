/**
 * main.js — Aves XR Gallery
 * Maneja el selector de aves, transitions, controles y carga del modelo anotado en AR
 */

// Import model-viewer as a side-effect (registers the custom element)
import '@google/model-viewer'
import QRCode from 'qrcode'

// ──────────────────────────────────────────────────────────
// DATA: Catálogo de aves con modelos limpios y modelos anotados para AR
// ──────────────────────────────────────────────────────────
const BIRDS = [
  {
    id:             'buco',
    commonName:     'Buco Gargantirrufo',
    sciName:        'Malacoptila rufa',
    order:          'Piciformes',
    family:         'Bucconidae',
    size:           '~19 cm',
    status:         'Preocupación menor',
    description:    'Ave registrada en los bosques de galería y matorrales húmedos de la serranía de La Guajira colombiana. Su llamativo plumaje pardo-rojizo con la garganta de tono rufo intenso lo hace inconfundible entre la vegetación densa. Se le puede observar posado quieto en ramas bajas, aguardando insectos con paciencia característica de los bucos.',
    tags:           ['🌿 Bosque de galería', '🇨🇴 La Guajira', '🌳 Serranía'],
    model:          'models/buco.glb',
    annotatedModel: 'models/annotated/buco_con_infografia.glb',
    poster:         'posters/buco.png',
    iosSrc:         'models/buco.usdz',
  },
  {
    id:             'flamenco',
    commonName:     'Flamenco Americano',
    sciName:        'Phoenicopterus ruber',
    order:          'Phoenicopteriformes',
    family:         'Phoenicopteridae',
    size:           '100–145 cm',
    status:         'Preocupación menor',
    description:    'Icono indiscutible de La Guajira colombiana. Grandes colonias de flamencos americanos habitan la Laguna Grande de la Ciénaga de la Macuira y los playones de Manaure y Bahía Portete, donde se alimentan de algas y crustáceos en las salinas. Su intenso plumaje rosa-carmesí contrasta espectacularmente con el paisaje árido guajiro.',
    tags:           ['🏖️ Salinas de Manaure', '🇨🇴 La Guajira', '🦩 Especie emblema'],
    model:          'models/flamenco.glb',
    annotatedModel: 'models/annotated/flamenco_con_infografia.glb',
    poster:         'posters/flamenco.png',
    iosSrc:         'models/flamenco.usdz',
  },
  {
    id:             'paloma',
    commonName:     'Palomita Escamosa',
    sciName:        'Columbina squammata',
    order:          'Columbiformes',
    family:         'Columbidae',
    size:           '~16 cm',
    status:         'Preocupación menor',
    description:    'Una de las aves más comunes y fáciles de avistar en los pueblos, rancherías y caminos de La Guajira. Su patrón de escamas negras sobre el pecho y la cabeza es inconfundible. Forrajea en grupos sobre suelos secos y arenosos típicos del desierto guajiro, especialmente en los alrededores de Riohacha, Uribia y Manaure.',
    tags:           ['🌵 Desierto guajiro', '🇨🇴 La Guajira', '🕊️ Ave de caminos'],
    model:          'models/paloma.glb',
    annotatedModel: 'models/annotated/paloma_con_infografia.glb',
    poster:         'posters/paloma.png',
    iosSrc:         'models/paloma.usdz',
  },
  {
    id:             'rey_guajiro',
    commonName:     'Rey Guajiro',
    sciName:        'Eurypyga helias',
    order:          'Eurypygiformes',
    family:         'Eurypygidae',
    size:           '~43 cm',
    status:         'Preocupación menor',
    description:    'Conocido popularmente como "Rey Guajiro", esta majestuosa ave habita las quebradas y riachuelos de la Serranía de Perijá y la Sierra Nevada de Santa Marta, en los límites con La Guajira. Al desplegar sus alas revela un espectacular mosaico de colores. Es discreta y solitaria; su presencia indica ecosistemas acuáticos bien conservados.',
    tags:           ['🏞️ Quebradas serranas', '🇨🇴 La Guajira', '✨ Ave insignia'],
    model:          'models/rey_guajiro.glb',
    annotatedModel: 'models/annotated/rey_guajiro_con_infografia.glb',
    poster:         'posters/rey_guajiro.png',
    iosSrc:         'models/rey_guajiro.usdz',
  },
  {
    id:             'turpial',
    commonName:     'Turpial de La Guajira',
    sciName:        'Icterus icterus',
    order:          'Passeriformes',
    family:         'Icteridae',
    size:           '~22 cm',
    status:         'Preocupación menor',
    description:    'El Turpial cruza el paisaje y se avista con frecuencia en la Alta Guajira colombiana, especialmente en zonas de matorral espinoso, cactáceas y cercas vivas. Su poderoso canto y su deslumbrante plumaje amarillo oro con negro lo convierten en un ave muy reconocida por las comunidades de la región.',
    tags:           ['🌵 Alta Guajira', '🇨🇴 La Guajira', '🎵 Canto caribeño'],
    model:          'models/turpial.glb',
    annotatedModel: 'models/annotated/turpial_con_infografia.glb',
    poster:         'posters/turpial.png',
    iosSrc:         'models/turpial.usdz',
  },
]

// ──────────────────────────────────────────────────────────
// DOM REFERENCES
// ──────────────────────────────────────────────────────────
const viewer          = document.getElementById('bird-viewer')
const loadingOverlay   = document.getElementById('loading-overlay')
const tabs            = document.querySelectorAll('.bird-tab')
const btnRotate       = document.getElementById('btn-rotate')
const btnReset        = document.getElementById('btn-reset')
const btnToggleLabels = document.getElementById('btn-toggle-labels')
const labelToggleText = document.getElementById('label-toggle-text')
const btnFullscreen   = document.getElementById('btn-fullscreen')
const arButton        = document.getElementById('ar-button')

// Info panel fields
const infoOrder       = document.getElementById('info-order')
const infoCommonName  = document.getElementById('info-common-name')
const infoSciName     = document.getElementById('info-sci-name')
const infoDescription = document.getElementById('info-description')
const infoTags        = document.getElementById('info-tags')
const statFamily      = document.getElementById('stat-family')
const statSize        = document.getElementById('stat-size')
const statStatus      = document.getElementById('stat-status')
const infoCard        = document.getElementById('bird-info-card')

// AR Modal fields
const arModalOverlay  = document.getElementById('ar-modal-overlay')
const modalCloseBtn   = document.getElementById('modal-close-btn')
const modalBirdName   = document.getElementById('modal-bird-name')
const modalQrImg      = document.getElementById('modal-qr-img')
const modalDirectLink = document.getElementById('modal-direct-link')
const modalCopyBtn    = document.getElementById('modal-copy-btn')
const copyBtnText     = document.getElementById('copy-btn-text')

// ──────────────────────────────────────────────────────────
// STATE
// ──────────────────────────────────────────────────────────
let currentIndex        = 0
let isAutoRotating      = true
let isTransitioning     = false
let isShowingAnnotated  = false

// ──────────────────────────────────────────────────────────
// FUNCTIONS
// ──────────────────────────────────────────────────────────

/** Show the loading overlay */
function showLoading () {
  loadingOverlay.classList.remove('hidden')
}

/** Hide the loading overlay */
function hideLoading () {
  loadingOverlay.classList.add('hidden')
}

/** Update info panel with bird data */
function updateInfoPanel (bird) {
  infoCard.classList.add('transitioning')

  setTimeout(() => {
    infoOrder.textContent       = bird.order
    infoCommonName.textContent  = bird.commonName
    infoSciName.innerHTML       = `<em>${bird.sciName}</em>`
    infoDescription.textContent = bird.description

    // Tags
    infoTags.innerHTML = bird.tags.map(t => `<span class="tag">${t}</span>`).join('')

    statFamily.textContent = bird.family
    statSize.textContent   = bird.size
    statStatus.textContent = bird.status

    infoCard.classList.remove('transitioning')
  }, 180)
}

/** Switch to a bird by index */
async function selectBird (index) {
  if (index === currentIndex && !isTransitioning) return
  isTransitioning = true

  // Update tabs UI
  tabs.forEach((tab, i) => {
    tab.classList.toggle('active', i === index)
    tab.setAttribute('aria-pressed', String(i === index))
  })

  const bird = BIRDS[index]
  currentIndex = index

  showLoading()

  // Use clean model by default on web, or annotated if toggled on
  const modelToLoad = isShowingAnnotated ? bird.annotatedModel : bird.model
  viewer.setAttribute('src', modelToLoad)
  viewer.setAttribute('poster', bird.poster)
  viewer.setAttribute('alt', `${bird.commonName} - modelo 3D interactivo`)

  if (bird.iosSrc) {
    viewer.setAttribute('ios-src', bird.iosSrc)
  } else {
    viewer.removeAttribute('ios-src')
  }

  updateInfoPanel(bird)
}

/** Toggle auto-rotate */
function toggleRotate () {
  isAutoRotating = !isAutoRotating

  if (isAutoRotating) {
    viewer.setAttribute('auto-rotate', '')
    btnRotate.classList.remove('active')
    btnRotate.querySelector('svg').innerHTML = '<path d="M10 9v6m4-6v6"/>'
    btnRotate.querySelector('span').textContent = 'Pausar rotación'
  } else {
    viewer.removeAttribute('auto-rotate')
    btnRotate.classList.add('active')
    btnRotate.querySelector('svg').innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>'
    btnRotate.querySelector('span').textContent = 'Reanudar rotación'
  }
}

/** Toggle annotated 3D labels on the web viewer */
function toggleAnnotatedLabels () {
  isShowingAnnotated = !isShowingAnnotated
  const bird = BIRDS[currentIndex]

  showLoading()
  if (isShowingAnnotated) {
    viewer.setAttribute('src', bird.annotatedModel)
    btnToggleLabels.classList.add('active')
    if (labelToggleText) labelToggleText.textContent = 'Ocultar etiquetas'
  } else {
    viewer.setAttribute('src', bird.model)
    btnToggleLabels.classList.remove('active')
    if (labelToggleText) labelToggleText.textContent = 'Ver con etiquetas'
  }
}

/** Reset camera to default position */
function resetCamera () {
  viewer.cameraOrbit  = 'auto auto auto'
  viewer.cameraTarget = 'auto auto auto'
  viewer.fieldOfView  = 'auto'
  btnReset.style.color = 'var(--clr-accent)'
  setTimeout(() => { btnReset.style.color = '' }, 600)
}

/** Toggle fullscreen on the viewer section */
function toggleFullscreen () {
  const section = viewer.closest('.viewer-section')
  if (!document.fullscreenElement) {
    section.requestFullscreen().catch(err => {
      console.warn('Fullscreen unavailable:', err)
    })
  } else {
    document.exitFullscreen()
  }
}

// ──────────────────────────────────────────────────────────
// AR LAUNCHER & MODAL SYSTEM
// ──────────────────────────────────────────────────────────

/** Open Desktop QR Modal for current bird */
async function openARModal (bird) {
  if (!arModalOverlay) return
  if (modalBirdName) modalBirdName.textContent = bird.commonName

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  const siteUrl = isLocal ? 'https://aves-guajira-xr.vercel.app' : window.location.origin
  const arUrl = `${siteUrl}/ar.html?bird=${bird.id}`

  try {
    const qrDataUrl = await QRCode.toDataURL(arUrl, {
      width: 220,
      margin: 1,
      color: { dark: '#081408', light: '#ffffff' }
    })
    if (modalQrImg) modalQrImg.src = qrDataUrl
  } catch (err) {
    console.error('Error generating QR code:', err)
  }

  if (modalDirectLink) modalDirectLink.href = arUrl
  arModalOverlay.classList.remove('hidden')
}

/** Close AR Modal */
function closeARModal () {
  if (arModalOverlay) arModalOverlay.classList.add('hidden')
}

// Modal event handlers
if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', closeARModal)
}
if (arModalOverlay) {
  arModalOverlay.addEventListener('click', (e) => {
    if (e.target === arModalOverlay) closeARModal()
  })
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && arModalOverlay && !arModalOverlay.classList.contains('hidden')) {
    closeARModal()
  }
})

if (modalCopyBtn) {
  modalCopyBtn.addEventListener('click', async () => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const siteUrl = isLocal ? 'https://aves-guajira-xr.vercel.app' : window.location.origin
    const arUrl = `${siteUrl}/ar.html?bird=${BIRDS[currentIndex].id}`
    try {
      await navigator.clipboard.writeText(arUrl)
      if (copyBtnText) copyBtnText.textContent = '¡Copiado!'
      setTimeout(() => { if (copyBtnText) copyBtnText.textContent = 'Copiar enlace AR' }, 2200)
    } catch (e) {
      console.warn('Clipboard write failed:', e)
    }
  })
}

/** Launch AR Experience (Direct Camera on Mobile, Modal on Desktop) */
function launchAR () {
  const bird = BIRDS[currentIndex]
  if (!bird) return

  const isAndroid = /android/i.test(navigator.userAgent)
  const isIOS = (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) && !window.MSStream

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  const siteUrl = isLocal ? 'https://aves-guajira-xr.vercel.app' : window.location.origin

  const modelFullUrl = `${siteUrl}/${bird.annotatedModel}`
  const fallbackWebUrl = `${siteUrl}/?bird=${bird.id}`

  console.info(`[AR] Launching AR for ${bird.commonName} (Android: ${isAndroid}, iOS: ${isIOS})`)

  if (isAndroid) {
    // Direct launch into Google ARCore Scene Viewer camera mode:
    // mode=ar_only opens the camera feed directly!
    const sceneViewerIntent = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(modelFullUrl)}&mode=ar_only&title=${encodeURIComponent(bird.commonName)}#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(fallbackWebUrl)};end;`
    window.location.href = sceneViewerIntent
  } else if (isIOS) {
    // iOS Safari Quick Look:
    // 1. Try model-viewer's native activateAR()
    if (viewer && typeof viewer.activateAR === 'function') {
      try {
        viewer.activateAR()
        return
      } catch (err) {
        console.warn('[AR] viewer.activateAR failed, fallback to native anchor:', err)
      }
    }

    // 2. Direct Apple Quick Look anchor (must include valid img child)
    const usdzUrl = `${siteUrl}/${bird.iosSrc}`
    const a = document.createElement('a')
    a.setAttribute('rel', 'ar')
    a.setAttribute('href', usdzUrl)
    const img = document.createElement('img')
    img.setAttribute('src', `${siteUrl}/${bird.poster}`)
    a.appendChild(img)
    document.body.appendChild(a)
    a.click()
    setTimeout(() => a.remove(), 1000)
  } else {
    // Desktop: Show QR Code Modal for mobile scan
    openARModal(bird)
  }
}

if (arButton) {
  arButton.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    launchAR()
  })
}

// ──────────────────────────────────────────────────────────
// EVENT LISTENERS
// ──────────────────────────────────────────────────────────

// Tab clicks
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectBird(index))
})

// model-viewer events
viewer.addEventListener('load', () => {
  hideLoading()
  isTransitioning = false
})

viewer.addEventListener('error', (e) => {
  console.error('model-viewer error:', e)
  hideLoading()
  isTransitioning = false
  loadingOverlay.querySelector('.loading-text').textContent = '⚠️ Error al cargar el modelo'
  loadingOverlay.classList.remove('hidden')
  setTimeout(hideLoading, 3000)
})

// Progress tracking
viewer.addEventListener('progress', (e) => {
  const bar = viewer.querySelector('.update-bar')
  if (bar) {
    bar.style.width = `${e.detail.totalProgress * 100}%`
    if (e.detail.totalProgress >= 1) {
      setTimeout(() => { bar.style.width = '0%' }, 300)
    }
  }
})

// Controls
btnRotate.addEventListener('click', toggleRotate)
btnReset.addEventListener('click', resetCamera)
if (btnToggleLabels) btnToggleLabels.addEventListener('click', toggleAnnotatedLabels)
btnFullscreen.addEventListener('click', toggleFullscreen)

// Keyboard nav for tabs
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') selectBird((currentIndex + 1) % BIRDS.length)
  if (e.key === 'ArrowLeft')  selectBird((currentIndex - 1 + BIRDS.length) % BIRDS.length)
})

// ──────────────────────────────────────────────────────────
// INIT & URL PARAMETER PARSING
// ──────────────────────────────────────────────────────────
const urlParams = new URLSearchParams(window.location.search)
const birdParam = urlParams.get('bird') || urlParams.get('ave') || urlParams.get('id')

if (birdParam) {
  const targetIdx = BIRDS.findIndex(b => b.id.toLowerCase() === birdParam.toLowerCase())
  if (targetIdx !== -1) {
    console.info(`[URL] Opening specified bird: ${birdParam} (index ${targetIdx})`)
    selectBird(targetIdx)
  }
}

if (viewer.loaded) {
  hideLoading()
} else {
  showLoading()
}

console.info('🦜 Aves de la Guajira XR Gallery — iniciado')
