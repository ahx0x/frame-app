import { useEffect } from 'react'
import { Stage, Layer, Image } from 'react-konva'
import useImage from 'use-image'
import { STAGE_PREVIEW_WIDTH } from '../lib/export'

export default function EditorCanvas({ userImage, coverData, imageRef, onTransform }) {
  const [userImg] = useImage(userImage?.src || '')
  const [coverImg] = useImage(coverData?.coverUrl || '')

  const { photoRect, originalWidth } = coverData
  const previewScale = STAGE_PREVIEW_WIDTH / originalWidth
  const stageWidth = STAGE_PREVIEW_WIDTH
  const stageHeight = Math.round(coverData.originalHeight * previewScale)

  useEffect(() => {
    if (userImg && imageRef.current) {
      const node = imageRef.current
      const rectAspect = photoRect.w / photoRect.h
      const imgAspect = userImg.naturalWidth / userImg.naturalHeight

      // Cover fit: fill the photoRect
      let scale
      if (imgAspect > rectAspect) {
        scale = (photoRect.h * previewScale) / userImg.naturalHeight
      } else {
        scale = (photoRect.w * previewScale) / userImg.naturalWidth
      }

      node.scale({ x: scale, y: scale })
      node.position({
        x: photoRect.x * previewScale + (photoRect.w * previewScale) / 2,
        y: photoRect.y * previewScale + (photoRect.h * previewScale) / 2
      })
      node.rotation(0)
      node.offsetX(userImg.naturalWidth / 2)
      node.offsetY(userImg.naturalHeight / 2)
      node.getLayer()?.batchDraw()
      onTransform?.()
    }
  }, [userImg])

  const handleWheel = (e) => {
    e.evt.preventDefault()
    const node = imageRef.current
    if (!node) return
    const scaleBy = 1.08
    const oldScale = node.scaleX()
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy
    node.scale({ x: newScale, y: newScale })
    node.getLayer().batchDraw()
    onTransform?.()
  }

  return (
    <Stage
      width={stageWidth}
      height={stageHeight}
      className="konva-stage"
      onWheel={handleWheel}
    >
      <Layer>
        {userImg && (
          <Image
            ref={imageRef}
            image={userImg}
            draggable
            onDragMove={onTransform}
            onTransform={onTransform}
          />
        )}
        {coverImg && (
          <Image
            image={coverImg}
            x={0}
            y={0}
            width={stageWidth}
            height={stageHeight}
            listening={false}
          />
        )}
      </Layer>
    </Stage>
  )
}