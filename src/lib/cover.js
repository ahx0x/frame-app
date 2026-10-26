export async function loadCover(url) {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = url
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = () => reject(new Error('فشل تحميل صورة الإطار'))
  })

  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0)

  const photoRect = detectTransparentRect(ctx, canvas.width, canvas.height)

  if (photoRect) {
    console.log('[cover] Detected transparent region:', photoRect)
    return {
      coverUrl: url,
      originalWidth: canvas.width,
      originalHeight: canvas.height,
      photoRect,
      hasTransparency: true
    }
  }

  // Fallback: centered 70%
  console.warn('[cover] No transparent region found, using fallback rect')
  return {
    coverUrl: url,
    originalWidth: canvas.width,
    originalHeight: canvas.height,
    photoRect: {
      x: canvas.width * 0.15,
      y: canvas.height * 0.15,
      w: canvas.width * 0.7,
      h: canvas.height * 0.7
    },
    hasTransparency: false
  }
}

function detectTransparentRect(ctx, w, h) {
  try {
    const data = ctx.getImageData(0, 0, w, h).data
    const alpha = (x, y) => data[(y * w + x) * 4 + 3]
    const cx = Math.floor(w / 2)
    const cy = Math.floor(h / 2)

    if (alpha(cx, cy) > 20) return null

    let x0 = cx
    while (x0 > 0 && alpha(x0 - 1, cy) <= 20) x0--
    let x1 = cx
    while (x1 < w - 1 && alpha(x1 + 1, cy) <= 20) x1++
    let y0 = cy
    while (y0 > 0 && alpha(cx, y0 - 1) <= 20) y0--
    let y1 = cy
    while (y1 < h - 1 && alpha(cx, y1 + 1) <= 20) y1++

    return {
      x: x0,
      y: y0,
      w: x1 - x0 + 1,
      h: y1 - y0 + 1
    }
  } catch (e) {
    console.warn('detectTransparentRect failed:', e)
    return null
  }
}