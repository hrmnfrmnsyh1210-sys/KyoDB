import sharp from 'sharp'

async function processLogo() {
  const input = sharp('public/images/logo.webp')
  const { data, info } = await input.raw().toBuffer({ resolveWithObject: true })

  const { width, height, channels } = info
  // Output RGBA (4 channels)
  const outBuffer = Buffer.alloc(width * height * 4)
  const outBufferDark = Buffer.alloc(width * height * 4)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * channels
      const dstIdx = (y * width + x) * 4

      const r = data[srcIdx]
      const g = data[srcIdx + 1]
      const b = data[srcIdx + 2]

      // Detect white or near-white background
      const isWhiteBg = r > 230 && g > 230 && b > 230

      if (isWhiteBg) {
        // Transparent
        outBuffer[dstIdx] = 0
        outBuffer[dstIdx + 1] = 0
        outBuffer[dstIdx + 2] = 0
        outBuffer[dstIdx + 3] = 0

        outBufferDark[dstIdx] = 0
        outBufferDark[dstIdx + 1] = 0
        outBufferDark[dstIdx + 2] = 0
        outBufferDark[dstIdx + 3] = 0
      } else {
        // Antialiasing feathering for edge pixels
        const maxVal = Math.max(r, g, b)
        const alpha = maxVal > 220 ? Math.round(((255 - maxVal) / 35) * 255) : 255

        // Normal transparent version
        outBuffer[dstIdx] = r
        outBuffer[dstIdx + 1] = g
        outBuffer[dstIdx + 2] = b
        outBuffer[dstIdx + 3] = alpha

        // Dark mode version:
        // If it's the dark "Kyo" letters (r < 75, g < 75, b < 75)
        const isDarkText = r < 75 && g < 75 && b < 75
        if (isDarkText) {
          outBufferDark[dstIdx] = 255
          outBufferDark[dstIdx + 1] = 255
          outBufferDark[dstIdx + 2] = 255
          outBufferDark[dstIdx + 3] = alpha
        } else {
          outBufferDark[dstIdx] = r
          outBufferDark[dstIdx + 1] = g
          outBufferDark[dstIdx + 2] = b
          outBufferDark[dstIdx + 3] = alpha
        }
      }
    }
  }

  // Save transparent PNG and WebP
  await sharp(outBuffer, { raw: { width, height, channels: 4 } })
    .png()
    .toFile('public/images/logo-transparent.png')

  await sharp(outBuffer, { raw: { width, height, channels: 4 } })
    .webp({ quality: 95 })
    .toFile('public/images/logo-transparent.webp')

  // Save dark mode transparent version (with white 'Kyo' text)
  await sharp(outBufferDark, { raw: { width, height, channels: 4 } })
    .png()
    .toFile('public/images/logo-dark.png')

  await sharp(outBufferDark, { raw: { width, height, channels: 4 } })
    .webp({ quality: 95 })
    .toFile('public/images/logo-dark.webp')

  console.log('✓ Successfully generated transparent logo assets!')
}

processLogo().catch(console.error)
