export const STAGE_PREVIEW_WIDTH = 500

export async function exportImage({
  userImg,
  coverImg,
  node,
  coverData,
  format = 'png',
  quality = 0.92
}) {
  // الإصلاح: نأخذ عرض المسرح الفعلي لحظة التصدير (جوال أو ديسكتوب)
  const stage = node.getStage()
  const stageWidth = stage ? stage.width() : STAGE_PREVIEW_WIDTH
  const factor = coverData.originalWidth / stageWidth

  const x = node.x() * factor
  const y = node.y() * factor
  const scale = node.scaleX() * factor
  const rotation = (node.rotation() * Math.PI) / 180

  const canvas = document.createElement('canvas')
  canvas.width = coverData.originalWidth
  canvas.height = coverData.originalHeight
  const ctx = canvas.getContext('2d')

  // خلفية داكنة احتياطية لصيغة JPG (لأن JPG لا يدعم الشفافية)
  if (format === 'jpeg') {
    ctx.fillStyle = '#0e0e0e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  // طبقة صورة المستخدم بتحويلاتها الصحيحة
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.scale(scale, scale)
  ctx.drawImage(
    userImg,
    -userImg.naturalWidth / 2,
    -userImg.naturalHeight / 2,
    userImg.naturalWidth,
    userImg.naturalHeight
  )
  ctx.restore()

  // طبقة الكفر فوقها
  ctx.drawImage(coverImg, 0, 0, canvas.width, canvas.height)

  const mime = format === 'png' ? 'image/png' : 'image/jpeg'
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('فشل إنشاء الصورة'))),
      mime,
      quality
    )
  })
}