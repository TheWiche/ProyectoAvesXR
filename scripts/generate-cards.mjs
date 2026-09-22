import sharp from 'sharp';
import fs from 'fs/promises';
import QRCode from 'qrcode';

const SITE_BASE_URL = process.env.SITE_URL || 'https://aves-guajira-xr.vercel.app';

const BIRDS_CARDS = [
  {
    id: 'buco',
    index: 0,
    number: '01 / 05',
    name: 'BUCO GARGANTIRRUFO',
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
    const birdTargetUrl = `${SITE_BASE_URL}/ar.html?bird=${bird.id}`;
    console.log(`Generating card with QR code for: ${bird.name} (${birdTargetUrl})...`);

    // 1. Generate QR Code Buffer
    const QR_SIZE = 148;
    const qrBuffer = await QRCode.toBuffer(birdTargetUrl, {
      width: QR_SIZE,
      margin: 1,
      color: {
        dark: '#081208',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });

    // 2. Load transparent bird PNG and resize nicely
    const birdImgBuffer = await sharp(bird.imageFile)
      .resize(520, 500, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    // 3. SVG Frame with dedicated QR Code zone on bottom right
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

      <!-- Radial glow behind bird -->
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

      <!-- Center Frame for 3D Bird Display -->
      <rect x="64" y="112" width="${CARD_WIDTH - 128}" height="560" rx="16" fill="rgba(8,16,8,0.7)" stroke="${bird.color}" stroke-opacity="0.35" stroke-width="2"/>

      <!-- Reticle circles in center -->
      <circle cx="400" cy="392" r="170" fill="none" stroke="${bird.color}" stroke-opacity="0.14" stroke-width="1.5" stroke-dasharray="8,8"/>
      <circle cx="400" cy="392" r="80" fill="none" stroke="${bird.color}" stroke-opacity="0.2" stroke-width="1.5"/>

      <!-- Bottom Card Information Box -->
      <rect x="64" y="692" width="${CARD_WIDTH - 128}" height="295" rx="14" fill="#132413" stroke="${bird.color}" stroke-width="2"/>

      <!-- Left Column: Bird Info -->
      <text x="92" y="738" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="26" fill="#ffffff" letter-spacing="0.5">${bird.name}</text>
      <text x="92" y="768" font-family="Georgia, serif" font-style="italic" font-size="18.5" fill="${bird.color}">${bird.scientific}</text>

      <!-- Row 1: Taxonomy Badges -->
      <g transform="translate(92, 790)">
        <rect x="0" y="0" width="195" height="32" rx="6" fill="#1c341c" stroke="#3d663d" stroke-width="1.5"/>
        <text x="97" y="21" font-family="'Segoe UI', Arial, sans-serif" font-weight="700" font-size="11.5" fill="#d2e4d2" text-anchor="middle">ORDEN: ${bird.order}</text>

        <rect x="208" y="0" width="195" height="32" rx="6" fill="#1c341c" stroke="#3d663d" stroke-width="1.5"/>
        <text x="305" y="21" font-family="'Segoe UI', Arial, sans-serif" font-weight="700" font-size="11.5" fill="#d2e4d2" text-anchor="middle">FAMILIA: ${bird.family}</text>
      </g>

      <!-- Row 2: Region Badge -->
      <g transform="translate(92, 834)">
        <rect x="0" y="0" width="403" height="32" rx="6" fill="#1f321d" stroke="${bird.color}" stroke-opacity="0.45" stroke-width="1.5"/>
        <text x="201" y="21" font-family="'Segoe UI', Arial, sans-serif" font-weight="700" font-size="11.5" fill="${bird.color}" text-anchor="middle">📍 HÁBITAT: ${bird.region.toUpperCase()}</text>
      </g>

      <!-- Row 3: Explanatory Call to Action -->
      <g transform="translate(92, 880)">
        <rect x="0" y="0" width="403" height="84" rx="8" fill="#0d180d" stroke="${bird.color}" stroke-opacity="0.35" stroke-width="1"/>
        <text x="201" y="28" font-family="'Segoe UI', Arial, sans-serif" font-weight="800" font-size="11.5" fill="#d4a843" text-anchor="middle" letter-spacing="1">
          ✦ ESCANEA EL CÓDIGO QR ✦
        </text>
        <text x="201" y="50" font-family="'Segoe UI', Arial, sans-serif" font-weight="600" font-size="11" fill="#c0d4c0" text-anchor="middle">
          Abre la cámara de tu celular para ver este
        </text>
        <text x="201" y="68" font-family="'Segoe UI', Arial, sans-serif" font-weight="700" font-size="11" fill="${bird.color}" text-anchor="middle">
          ave en 3D y Realidad Aumentada (AR)
        </text>
      </g>

      <!-- Right Column: QR Code Box Frame -->
      <g transform="translate(528, 712)">
        <!-- Outer Box -->
        <rect x="0" y="0" width="180" height="252" rx="10" fill="#0b160b" stroke="${bird.color}" stroke-width="2"/>
        
        <!-- QR Title Header -->
        <text x="90" y="24" font-family="'Segoe UI', Arial, sans-serif" font-weight="800" font-size="11" fill="${bird.color}" text-anchor="middle" letter-spacing="1.5">
          ESCANEAR AR
        </text>
        
        <!-- White backing plate for optimal QR reading -->
        <rect x="12" y="34" width="156" height="156" rx="6" fill="#ffffff"/>
        
        <!-- Subtitle below QR -->
        <text x="90" y="212" font-family="'Segoe UI', Arial, sans-serif" font-weight="700" font-size="10.5" fill="#ffffff" text-anchor="middle">
          VER EN TU ESPACIO
        </text>
        <text x="90" y="230" font-family="'Segoe UI', Arial, sans-serif" font-weight="600" font-size="9.5" fill="#9aaa8a" text-anchor="middle">
          WebXR · 3D Anotado
        </text>
      </g>
    </svg>
    `;

    // Composite transparent bird AND QR code over frame
    // QR position: x = 528 + 16 = 544, y = 712 + 38 = 750
    await sharp(Buffer.from(svgFrame))
      .composite([
        {
          input: birdImgBuffer,
          top: 142,
          left: Math.round((CARD_WIDTH - 520) / 2)
        },
        {
          input: qrBuffer,
          top: 750,
          left: 544
        }
      ])
      .png()
      .toFile(`public/targets/card-${bird.id}.png`);

    console.log(`✓ Card with QR code created: public/targets/card-${bird.id}.png`);
  }

  console.log('✅ All 5 cards generated successfully with embedded QR codes!');
}

generateCards().catch(console.error);
