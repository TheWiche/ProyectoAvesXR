import sharp from 'sharp';
import fs from 'fs/promises';

const BIRDS_CARDS = [
  {
    id: 'buco',
    index: 0,
    number: '01 / 05',
    name: 'BUCO GARGANTRIRRUFO',
    scientific: 'Malacoptila rufa',
    order: 'PICIFORMES',
    family: 'Bucconidae',
    region: 'Serranías de La Guajira',
    color: '#d4a843',
    bgColor: '#102210',
    imageFile: 'public/posters/buco.png'
  },
  {
    id: 'flamenco',
    index: 1,
    number: '02 / 05',
    name: 'FLAMENCO AMERICANO',
    scientific: 'Phoenicopterus ruber',
    order: 'PHOENICOPTERIFORMES',
    family: 'Phoenicopteridae',
    region: 'Salinas de Manaure',
    color: '#e56b6f',
    bgColor: '#16221d',
    imageFile: 'public/posters/flamenco.png'
  },
  {
    id: 'paloma',
    index: 2,
    number: '03 / 05',
    name: 'PALOMITA ESCAMOSA',
    scientific: 'Columbina squammata',
    order: 'COLUMBIFORMES',
    family: 'Columbidae',
    region: 'Desierto de Riohacha y Uribia',
    color: '#c5a059',
    bgColor: '#1d2016',
    imageFile: 'public/posters/paloma.png'
  },
  {
    id: 'rey_guajiro',
    index: 3,
    number: '04 / 05',
    name: 'REY GUAJIRO',
    scientific: 'Eurypyga helias',
    order: 'EURYPYGIFORMES',
    family: 'Eurypygidae',
    region: 'Serranía de Perijá',
    color: '#e07a5f',
    bgColor: '#221714',
    imageFile: 'public/posters/rey_guajiro.png'
  },
  {
    id: 'turpial',
    index: 4,
    number: '05 / 05',
    name: 'TURPIAL DE LA GUAJIRA',
    scientific: 'Icterus icterus',
    order: 'PASSERIFORMES',
    family: 'Icteridae',
    region: 'Alta Guajira - Territorio Wayuu',
    color: '#f4a261',
    bgColor: '#1e1c12',
    imageFile: 'public/posters/turpial.png'
  }
];

async function generateCards() {
  await fs.mkdir('public/targets', { recursive: true });

  const CARD_WIDTH = 800;
  const CARD_HEIGHT = 1050;

  for (const bird of BIRDS_CARDS) {
    console.log(`Generating card with transparent PNG for: ${bird.name}...`);

    // Load transparent bird PNG and resize nicely
    const birdImgBuffer = await sharp(bird.imageFile)
      .resize(520, 500, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    // Create perfectly measured, balanced SVG frame
    const svgFrame = `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bird.bgColor}"/>
          <stop offset="50%" stop-color="#0c170c"/>
          <stop offset="100%" stop-color="#060c06"/>
        </linearGradient>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.035)" stroke-width="1"/>
        </pattern>
        <radialGradient id="halo" cx="50%" cy="38%" r="40%">
          <stop offset="0%" stop-color="${bird.color}" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="${bird.color}" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <!-- Background -->
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#bgGrad)"/>
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#grid)"/>

      <!-- Radial glow behind bird to make the transparent cutout pop -->
      <circle cx="400" cy="390" r="260" fill="url(#halo)"/>

      <!-- Tracking Target Outer Borders -->
      <rect x="24" y="24" width="${CARD_WIDTH - 48}" height="${CARD_HEIGHT - 48}" rx="18" fill="none" stroke="${bird.color}" stroke-width="4"/>
      <rect x="36" y="36" width="${CARD_WIDTH - 72}" height="${CARD_HEIGHT - 72}" rx="14" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="1.5"/>
      <rect x="44" y="44" width="${CARD_WIDTH - 88}" height="${CARD_HEIGHT - 88}" rx="10" fill="none" stroke="${bird.color}" stroke-opacity="0.5" stroke-width="2" stroke-dasharray="10,6"/>

      <!-- Corner Brackets -->
      <path d="M 24 90 L 24 24 L 90 24" fill="none" stroke="${bird.color}" stroke-width="8"/>
      <path d="M ${CARD_WIDTH - 90} 24 L ${CARD_WIDTH - 24} 24 L ${CARD_WIDTH - 24} 90" fill="none" stroke="${bird.color}" stroke-width="8"/>
      <path d="M 24 ${CARD_HEIGHT - 90} L 24 ${CARD_HEIGHT - 24} L 90 ${CARD_HEIGHT - 24}" fill="none" stroke="${bird.color}" stroke-width="8"/>
      <path d="M ${CARD_WIDTH - 90} ${CARD_HEIGHT - 24} L ${CARD_WIDTH - 24} ${CARD_HEIGHT - 24} L ${CARD_WIDTH - 24} ${CARD_HEIGHT - 90}" fill="none" stroke="${bird.color}" stroke-width="8"/>

      <!-- Corner Crosshairs -->
      <circle cx="64" cy="64" r="14" fill="none" stroke="${bird.color}" stroke-width="2"/>
      <line x1="64" y1="45" x2="64" y2="83" stroke="${bird.color}" stroke-width="2"/>
      <line x1="45" y1="64" x2="83" y2="64" stroke="${bird.color}" stroke-width="2"/>

      <circle cx="${CARD_WIDTH - 64}" cy="64" r="14" fill="none" stroke="${bird.color}" stroke-width="2"/>
      <line x1="${CARD_WIDTH - 64}" y1="45" x2="${CARD_WIDTH - 64}" y2="83" stroke="${bird.color}" stroke-width="2"/>
      <line x1="${CARD_WIDTH - 83}" y1="64" x2="${CARD_WIDTH - 45}" y2="64" stroke="${bird.color}" stroke-width="2"/>

      <!-- Header -->
      <text x="96" y="69" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="16" fill="${bird.color}" letter-spacing="3">AVES DE LA GUAJIRA XR</text>
      <text x="${CARD_WIDTH - 96}" y="69" font-family="'Segoe UI', Arial, sans-serif" font-weight="bold" font-size="16" fill="#e8e0d0" text-anchor="end" letter-spacing="2">FICHA ${bird.number}</text>

      <line x1="60" y1="92" x2="${CARD_WIDTH - 60}" y2="92" stroke="${bird.color}" stroke-opacity="0.35" stroke-width="2"/>

      <!-- Center Frame for 3D Target Display -->
      <rect x="64" y="112" width="${CARD_WIDTH - 128}" height="560" rx="16" fill="rgba(8,16,8,0.7)" stroke="${bird.color}" stroke-opacity="0.35" stroke-width="2"/>

      <!-- Decorative subtle reticle circles in center -->
      <circle cx="400" cy="392" r="170" fill="none" stroke="${bird.color}" stroke-opacity="0.14" stroke-width="1.5" stroke-dasharray="8,8"/>
      <circle cx="400" cy="392" r="80" fill="none" stroke="${bird.color}" stroke-opacity="0.2" stroke-width="1.5"/>

      <!-- Bottom Card Information Box -->
      <rect x="64" y="692" width="${CARD_WIDTH - 128}" height="295" rx="14" fill="#132413" stroke="${bird.color}" stroke-width="2"/>

      <!-- Bird Name & Scientific Name -->
      <text x="92" y="738" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="27" fill="#ffffff" letter-spacing="0.5">${bird.name}</text>
      <text x="92" y="770" font-family="Georgia, serif" font-style="italic" font-size="19" fill="${bird.color}">${bird.scientific}</text>

      <!-- Row 1: Taxonomy Badges (Orden, Familia) -->
      <g transform="translate(92, 792)">
        <!-- Badge 1: Orden -->
        <rect x="0" y="0" width="200" height="34" rx="7" fill="#1c341c" stroke="#3d663d" stroke-width="1.5"/>
        <text x="100" y="22" font-family="'Segoe UI', Arial, sans-serif" font-weight="700" font-size="12" fill="#d2e4d2" text-anchor="middle">ORDEN: ${bird.order}</text>

        <!-- Badge 2: Familia -->
        <rect x="214" y="0" width="200" height="34" rx="7" fill="#1c341c" stroke="#3d663d" stroke-width="1.5"/>
        <text x="314" y="22" font-family="'Segoe UI', Arial, sans-serif" font-weight="700" font-size="12" fill="#d2e4d2" text-anchor="middle">FAMILIA: ${bird.family}</text>
      </g>

      <!-- Row 2: Region Badge (Full Width) -->
      <g transform="translate(92, 838)">
        <rect x="0" y="0" width="616" height="34" rx="7" fill="#1f321d" stroke="${bird.color}" stroke-opacity="0.45" stroke-width="1.5"/>
        <text x="308" y="22" font-family="'Segoe UI', Arial, sans-serif" font-weight="700" font-size="12.5" fill="${bird.color}" text-anchor="middle">📍 HÁBITAT: ${bird.region.toUpperCase()}</text>
      </g>

      <!-- Row 3: AR Instructions Box (Fitted and Centered) -->
      <g transform="translate(92, 888)">
        <rect x="0" y="0" width="616" height="68" rx="8" fill="#0d180d" stroke="${bird.color}" stroke-opacity="0.35" stroke-width="1"/>
        <text x="308" y="28" font-family="'Segoe UI', Arial, sans-serif" font-weight="800" font-size="12" fill="#d4a843" text-anchor="middle" letter-spacing="1">
          ✦ REALIDAD AUMENTADA INTERACTIVA ✦
        </text>
        <text x="308" y="49" font-family="'Segoe UI', Arial, sans-serif" font-weight="600" font-size="11.5" fill="#a4baa4" text-anchor="middle">
          Enfoca esta tarjeta con la cámara del Escáner AR para proyectar el ave
        </text>
      </g>
    </svg>
    `;

    // Composite transparent bird over frame
    await sharp(Buffer.from(svgFrame))
      .composite([
        {
          input: birdImgBuffer,
          top: 142,
          left: Math.round((CARD_WIDTH - 520) / 2)
        }
      ])
      .png()
      .toFile(`public/targets/card-${bird.id}.png`);

    // Also generate resized compiler image (480x630) for MindAR tracking compiler
    await sharp(`public/targets/card-${bird.id}.png`)
      .resize(480, 630)
      .png({ quality: 90 })
      .toFile(`public/targets/compiler-${bird.id}.png`);

    console.log(`✓ Card & compiler target created: card-${bird.id}.png`);
  }

  console.log('✅ All 5 cards generated with transparent PNG birds and fitted typography!');
}

generateCards().catch(console.error);
