/**
 * optimize-posters.mjs
 * Redimensiona y comprime los PNG de los posters a 512x512 max
 */
import sharp from 'sharp'
import { readdir } from 'fs/promises'
import { join } from 'path'

const postersDir = 'public/posters'
const files = await readdir(postersDir)
const pngs = files.filter(f => f.endsWith('.png'))

for (const file of pngs) {
  const inputPath  = join(postersDir, file)
  const outputPath = join(postersDir, file) // overwrite in place

  const { width, height, size: before } = await sharp(inputPath).metadata()
  
  await sharp(inputPath)
    .resize(512, 512, { fit: 'cover', position: 'centre' })
    .png({ quality: 85, compressionLevel: 9, progressive: true })
    .toBuffer()
    .then(buf => {
      const { size: after } = { size: buf.length }
      return sharp(buf).toFile(outputPath)
    })

  const { size: after } = await sharp(outputPath).metadata()
  console.log(`✓ ${file}: ${width}x${height} → 512x512 | saved`)
}

console.log('\nAll posters optimized!')
