import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

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
    bgColor: '#122212',
    imageFile: 'public/targets/raw/buco.png',
    annotations: [
      { label: 'Pico robusto con vibrisas', x: '28%', y: '35%' },
      { label: 'Garganta rufo-rojiza', x: '35%', y: '48%' },
      { label: 'Plumaje dorsal críptico', x: '65%', y: '55%' }
    ]
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
    bgColor: '#16221f',
    imageFile: 'public/targets/raw/flamenco.png',
    annotations: [
      { label: 'Pico filtrador curvo', x: '65%', y: '25%' },
      { label: 'Plumaje carmesí intenso', x: '45%', y: '38%' },
      { label: 'Patas zancudas palmeadas', x: '38%', y: '75%' }
    ]
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
    bgColor: '#1f2018',
    imageFile: 'public/targets/raw/paloma.png',
    annotations: [
      { label: 'Patrón de escamas dorsales', x: '55%', y: '45%' },
      { label: 'Ojo con anillo orbital', x: '28%', y: '32%' },
      { label: 'Cola escalonada blanca', x: '78%', y: '65%' }
    ]
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
    bgColor: '#221815',
    imageFile: 'public/targets/raw/rey_guajiro.png',
    annotations: [
      { label: 'Corona carmesí crestada', x: '38%', y: '22%' },
      { label: 'Ocelos alares solares', x: '65%', y: '50%' },
      { label: 'Pico largo y afilado', x: '24%', y: '26%' }
    ]
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
    bgColor: '#1c1c14',
    imageFile: 'public/targets/raw/turpial.png',
    annotations: [
      { label: 'Capucha negra azabache', x: '68%', y: '28%' },
      { label: 'Pecho amarillo oro vivo', x: '50%', y: '45%' },
      { label: 'Banda alar blanca brillante', x: '55%', y: '38%' }
    ]
  }
];

async function generateCards() {
  await fs.mkdir('public/targets', { recursive: true });

  const CARD_WIDTH = 800;
  const CARD_HEIGHT = 1000;

  for (const bird of BIRDS_CARDS) {
    console.log(`Generating collector target card for: ${bird.name}...`);

    // Resize bird image for the center
    const birdImgBuffer = await sharp(bird.imageFile)
      .resize(580, 520, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    // Create rich geometric target frame with high contrast for AR tracker
    const svgFrame = `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bird.bgColor}"/>
          <stop offset="50%" stop-color="#0d180d"/>
          <stop offset="100%" stop-color="#050a05"/>
        </linearGradient>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
        </pattern>
        <pattern id="chevron" width="40" height="20" patternUnits="userSpaceOnUse">
          <path d="M 0 10 L 20 0 L 40 10 L 20 20 Z" fill="none" stroke="${bird.color}" stroke-opacity="0.15" stroke-width="1.5"/>
        </pattern>
      </defs>

      <!-- Background -->
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#bgGrad)"/>
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#grid)"/>

      <!-- Tracking Target Borders - Triple nested high contrast -->
      <rect x="24" y="24" width="${CARD_WIDTH - 48}" height="${CARD_HEIGHT - 48}" rx="16" fill="none" stroke="${bird.color}" stroke-width="4"/>
      <rect x="36" y="36" width="${CARD_WIDTH - 72}" height="${CARD_HEIGHT - 72}" rx="12" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="1.5"/>
      <rect x="44" y="44" width="${CARD_WIDTH - 88}" height="${CARD_HEIGHT - 88}" rx="8" fill="none" stroke="${bird.color}" stroke-opacity="0.5" stroke-width="2" stroke-dasharray="12,6"/>

      <!-- Ornamental Corner Brackets (Feature Anchors) -->
      <path d="M 24 90 L 24 24 L 90 24" fill="none" stroke="${bird.color}" stroke-width="8"/>
      <path d="M ${CARD_WIDTH - 90} 24 L ${CARD_WIDTH - 24} 24 L ${CARD_WIDTH - 24} 90" fill="none" stroke="${bird.color}" stroke-width="8"/>
      <path d="M 24 ${CARD_HEIGHT - 90} L 24 ${CARD_HEIGHT - 24} L 90 ${CARD_HEIGHT - 24}" fill="none" stroke="${bird.color}" stroke-width="8"/>
      <path d="M ${CARD_WIDTH - 90} ${CARD_HEIGHT - 24} L ${CARD_WIDTH - 24} ${CARD_HEIGHT - 24} L ${CARD_WIDTH - 24} ${CARD_HEIGHT - 90}" fill="none" stroke="${bird.color}" stroke-width="8"/>

      <!-- Corner Fiducial Target Crosshairs -->
      <circle cx="64" cy="64" r="16" fill="none" stroke="${bird.color}" stroke-width="2"/>
      <line x1="64" y1="42" x2="64" y2="86" stroke="${bird.color}" stroke-width="2"/>
      <line x1="42" y1="64" x2="86" y2="64" stroke="${bird.color}" stroke-width="2"/>

      <circle cx="${CARD_WIDTH - 64}" cy="64" r="16" fill="none" stroke="${bird.color}" stroke-width="2"/>
      <line x1="${CARD_WIDTH - 64}" y1="42" x2="${CARD_WIDTH - 64}" y2="86" stroke="${bird.color}" stroke-width="2"/>
      <line x1="${CARD_WIDTH - 86}" y1="64" x2="${CARD_WIDTH - 42}" y2="64" stroke="${bird.color}" stroke-width="2"/>

      <!-- Card Top Header -->
      <text x="100" y="68" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="16" fill="${bird.color}" letter-spacing="4">AVES DE LA GUAJIRA XR</text>
      <text x="${CARD_WIDTH - 100}" y="68" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="16" fill="#e8e0d0" text-anchor="end" letter-spacing="2">FICHA ${bird.number}</text>

      <!-- Subheader divider -->
      <line x1="60" y1="90" x2="${CARD_WIDTH - 60}" y2="90" stroke="${bird.color}" stroke-opacity="0.4" stroke-width="2"/>

      <!-- Center Frame for 3D Target Display -->
      <rect x="70" y="110" width="${CARD_WIDTH - 140}" height="560" rx="14" fill="#0b140b" stroke="${bird.color}" stroke-opacity="0.3" stroke-width="2"/>
      <rect x="70" y="110" width="${CARD_WIDTH - 140}" height="560" fill="url(#chevron)"/>

      <!-- Inner Target Reticle (Center anchor for 3D bird origin) -->
      <circle cx="${CARD_WIDTH / 2}" cy="390" r="180" fill="none" stroke="${bird.color}" stroke-opacity="0.15" stroke-width="2" stroke-dasharray="8,8"/>
      <circle cx="${CARD_WIDTH / 2}" cy="390" r="80" fill="none" stroke="${bird.color}" stroke-opacity="0.2" stroke-width="1.5"/>

      <!-- Bottom Card Metadata & Taxonomy -->
      <rect x="60" y="695" width="${CARD_WIDTH - 120}" height="235" rx="12" fill="#142614" stroke="${bird.color}" stroke-width="2"/>

      <!-- Species Name & Scientific Name -->
      <text x="88" y="742" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="28" fill="#ffffff" letter-spacing="1">${bird.name}</text>
      <text x="88" y="774" font-family="Georgia, serif" font-style="italic" font-size="20" fill="${bird.color}">${bird.scientific}</text>

      <!-- Badges / Metadata Row -->
      <g transform="translate(88, 795)">
        <!-- Badge 1 -->
        <rect x="0" y="0" width="160" height="34" rx="6" fill="#203820" stroke="#365836" stroke-width="1"/>
        <text x="80" y="22" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#c0d0c0" text-anchor="middle">ORDEN: ${bird.order}</text>

        <!-- Badge 2 -->
        <rect x="172" y="0" width="160" height="34" rx="6" fill="#203820" stroke="#365836" stroke-width="1"/>
        <text x="252" y="22" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#c0d0c0" text-anchor="middle">FAMILIA: ${bird.family}</text>

        <!-- Badge 3 -->
        <rect x="344" y="0" width="280" height="34" rx="6" fill="#253520" stroke="${bird.color}" stroke-opacity="0.4" stroke-width="1"/>
        <text x="484" y="22" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="${bird.color}" text-anchor="middle">📍 ${bird.region}</text>
      </g>

      <!-- Bottom Interactive Instructions & AR Scanner Target Hint -->
      <g transform="translate(88, 855)">
        <rect x="0" y="0" width="${CARD_WIDTH - 176}" height="55" rx="8" fill="#0d1a0d" stroke="${bird.color}" stroke-opacity="0.3" stroke-width="1"/>
        <text x="20" y="33" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#a0b8a0">
          📱 APUNTA LA CÁMARA A ESTA TARJETA PARA PROYECTAR EL AVE 3D CON ANATOMÍA INTERACTIVA
        </text>
      </g>
    </svg>
    `;

    // Composite card frame with bird image
    const cardBuffer = await sharp(Buffer.from(svgFrame))
      .composite([
        {
          input: birdImgBuffer,
          top: 130,
          left: Math.round((CARD_WIDTH - 580) / 2)
        }
      ])
      .png()
      .toFile(`public/targets/card-${bird.id}.png`);

    console.log(`✓ Card created: public/targets/card-${bird.id}.png`);
  }

  // Save metadata JSON
  await fs.writeFile(
    'public/targets/targets-metadata.json',
    JSON.stringify(BIRDS_CARDS, null, 2),
    'utf-8'
  );
  console.log('✅ All 5 target cards generated successfully!');
}

generateCards().catch(console.error);
