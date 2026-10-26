export async function exportImage({ userImg, coverImg, node, coverData }) {
  const factor = coverData.originalWidth / STAGE_PREVIEW_WIDTH

  const transforms = {
    x: node.x() * factor,
    y: node.y() * factor,
    scale: node.scaleX() * factor,
    rotation: (node.rotation() * Math.PI) / 180,
    imgWidth: userImg.naturalWidth,
    imgHeight: userImg.naturalHeight
  }

  const canvas = document.createElement('canvas')
  canvas.width = coverData.originalWidth
  canvas.height = coverData.originalHeight
  const ctx = canvas.getContext('2d')

  ctx.save()
  ctx.translate(transforms.x, transforms.y)
  ctx.rotate(transforms.rotation)
  ctx.scale(transforms.scale, transforms.scale)
  ctx.drawImage(
    userImg,
    -transforms.imgWidth / 2,
    -transforms.imgHeight / 2,
    transforms.imgWidth,
    transforms.imgHeight
  )
  ctx.restore()

  ctx.drawImage(coverImg, 0, 0, canvas.width, canvas.height)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('فشل إنشاء الصورة'))),
      'image/png',
      1.0
    )
  })
}

export const STAGE_PREVIEW_WIDTH = 500