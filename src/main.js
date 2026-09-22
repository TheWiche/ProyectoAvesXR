/**
 * main.js — Aves XR Gallery
 * Maneja el selector de aves, transitions y controles del model-viewer
 */

// Import model-viewer as a side-effect (registers the custom element)
import '@google/model-viewer'

// ──────────────────────────────────────────────────────────
// DATA: Catálogo de aves
// ──────────────────────────────────────────────────────────
const BIRDS = [
  {
    id:          'buco',
    commonName:  'Buco Gargantirrufo',
    sciName:     'Malacoptila rufa',
    order:       'Piciformes',
    family:      'Bucconidae',
    size:        '~19 cm',
    status:      'Preocupación menor',
    description: 'Ave de tamaño mediano perteneciente a la familia Bucconidae. Habita los bosques húmedos tropicales y subtropicales del norte de Sudamérica, incluyendo Venezuela. Su plumaje es pardo-rojizo con marcas oscuras características y su nombre alude a su garganta de tono rufo intenso.',
    tags:        ['🌿 Bosque húmedo', '🇻🇪 Venezuela', '🌳 Subtropical'],
    model:       'models/buco.glb',
    poster:      'posters/buco.png',
    iosSrc:      null, // Set to 'models/buco.usdz' if available
  },
  {
    id:          'flamenco',
    commonName:  'Flamenco Americano',
    sciName:     'Phoenicopterus ruber',
    order:       'Phoenicopteriformes',
    family:      'Phoenicopteridae',
    size:        '100–145 cm',
    status:      'Preocupación menor',
    description: 'El flamenco americano es la especie de flamenco de coloración más intensa, con plumaje rosa-carmesí brillante. Habita lagunas costeras, salinas y estuarios del norte de Venezuela, las Antillas y el Caribe. Se alimenta filtrando agua con su peculiar pico curvado.',
    tags:        ['🏖️ Costas y lagunas', '🇻🇪 Venezuela', '🦩 Zancuda'],
    model:       'models/flamenco.glb',
    poster:      'posters/flamenco.png',
    iosSrc:      null,
  },
  {
    id:          'paloma',
    commonName:  'Palomita Escamosa',
    sciName:     'Columbina squammata',
    order:       'Columbiformes',
    family:      'Columbidae',
    size:        '~16 cm',
    status:      'Preocupación menor',
    description: 'Pequeña paloma de tierra con un intrincado patrón de escamas negras sobre el pecho y la cabeza que le dan su nombre. Es una especie muy común en zonas áridas, sabanas y bordes de bosque de Venezuela, Colombia y Brasil. Forrajea en el suelo en bandadas.',
    tags:        ['🌵 Zonas áridas', '🇻🇪 Venezuela', '🕊️ Paloma terrestre'],
    model:       'models/paloma.glb',
    poster:      'posters/paloma.png',
    iosSrc:      null,
  },
  {
    id:          'rey_guajiro',
    commonName:  'Rey Guajiro',
    sciName:     'Eurypyga helias',
    order:       'Eurypygiformes',
    family:      'Eurypygidae',
    size:        '~43 cm',
    status:      'Preocupación menor',
    description: 'Ave inconfundible y única en su familia, el Rey Guajiro o Garceta Sol despliega un deslumbrante patrón de colores en sus alas cuando se extienden completamente. Habita bordes de ríos y quebradas en bosques húmedos. Es solitaria, discreta y de vuelo lento y silencioso.',
    tags:        ['🏞️ Ríos y quebradas', '🇻🇪 Venezuela', '✨ Especie única'],
    model:       'models/rey_guajiro.glb',
    poster:      'posters/rey_guajiro.png',
    iosSrc:      null,
  },
  {
    id:          'turpial',
    commonName:  'Turpial Venezolano',
    sciName:     'Icterus icterus',
    order:       'Passeriformes',
    family:      'Icteridae',
    size:        '~22 cm',
    status:      'Preocupación menor',
    description: 'Ave nacional de Venezuela. El Turpial Venezolano es célebre por su impactante plumaje naranja-amarillo vivo combinado con negro y blanco. Su canto melodioso y fuerte lo hace reconocible en toda su área de distribución. Habita desde zonas áridas costeras hasta sabanas y jardines.',
    tags:        ['🌟 Ave Nacional', '🇻🇪 Venezuela', '🎵 Gran cantor'],
    model:       'models/turpial.glb',
    poster:      'posters/turpial.png',
    iosSrc:      null,
  },
]

// ──────────────────────────────────────────────────────────
// DOM REFERENCES
// ──────────────────────────────────────────────────────────
const viewer        = document.getElementById('bird-viewer')
const loadingOverlay = document.getElementById('loading-overlay')
const tabs          = document.querySelectorAll('.bird-tab')
const btnRotate     = document.getElementById('btn-rotate')
const btnReset      = document.getElementById('btn-reset')
const btnFullscreen = document.getElementById('btn-fullscreen')

// Info panel fields
const infoOrder      = document.getElementById('info-order')
const infoCommonName = document.getElementById('info-common-name')
const infoSciName    = document.getElementById('info-sci-name')
const infoDescription= document.getElementById('info-description')
const infoTags       = document.getElementById('info-tags')
const statFamily     = document.getElementById('stat-family')
const statSize       = document.getElementById('stat-size')
const statStatus     = document.getElementById('stat-status')
const infoCard       = document.getElementById('bird-info-card')

// ──────────────────────────────────────────────────────────
// STATE
// ──────────────────────────────────────────────────────────
let currentIndex   = 0
let isAutoRotating = true
let isTransitioning = false

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
  // Animate out
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

    // Animate in
    infoCard.classList.remove('transitioning')
  }, 180)
}

/** Switch to a bird by index */
async function selectBird (index) {
  if (index === currentIndex || isTransitioning) return
  isTransitioning = true

  // Update tabs UI
  tabs.forEach((tab, i) => {
    tab.classList.toggle('active', i === index)
    tab.setAttribute('aria-pressed', String(i === index))
  })

  const bird = BIRDS[index]
  currentIndex = index

  // Show loading
  showLoading()

  // Update model-viewer attributes
  viewer.setAttribute('src', bird.model)
  viewer.setAttribute('poster', bird.poster)
  viewer.setAttribute('alt', `${bird.commonName} - modelo 3D interactivo`)

  if (bird.iosSrc) {
    viewer.setAttribute('ios-src', bird.iosSrc)
  } else {
    viewer.removeAttribute('ios-src')
  }

  // Update info panel concurrently
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

/** Reset camera to default position */
function resetCamera () {
  viewer.cameraOrbit  = 'auto auto auto'
  viewer.cameraTarget = 'auto auto auto'
  viewer.fieldOfView  = 'auto'
  // Brief visual feedback
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
btnFullscreen.addEventListener('click', toggleFullscreen)

// Keyboard nav for tabs
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') selectBird((currentIndex + 1) % BIRDS.length)
  if (e.key === 'ArrowLeft')  selectBird((currentIndex - 1 + BIRDS.length) % BIRDS.length)
})

// ──────────────────────────────────────────────────────────
// INIT — load first bird (already set in HTML, just wait for load)
// ──────────────────────────────────────────────────────────
viewer.addEventListener('load', () => {}, { once: true })

// Handle case where model-viewer is already done by DOMContentLoaded
if (viewer.loaded) {
  hideLoading()
} else {
  showLoading()
}

console.info('🦜 Aves XR Gallery — iniciado')
console.table(BIRDS.map(b => ({ ave: b.commonName, modelo: b.model })))
