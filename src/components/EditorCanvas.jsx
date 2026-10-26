import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Image } from 'react-konva'
import useImage from 'use-image'
import { STAGE_PREVIEW_WIDTH } from '../lib/export'

export default function EditorCanvas({ userImage, coverData, imageRef, onTransform }) {
  const [userImg] = useImage(userImage?.src || '')
  const [coverImg] = useImage(coverData?.coverUrl || '')
  const containerRef = useRef()
  const [stageSize, setStageSize] = useState(STAGE_PREVIEW_WIDTH)
  const lastDistRef = useRef(0)

  const { photoRect, originalWidth, originalHeight } = coverData
  const previewScale = stageSize / originalWidth
  const stageHeight = Math.round(originalHeight * previewScale)

  // Responsive stage size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = Math.min(containerRef.current.offsetWidth - 32, STAGE_PREVIEW_WIDTH)
        setStageSize(Math.max(280, width))
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  useEffect(() => {
    if (userImg && imageRef.current) {
      const node = imageRef.current
      const rectAspect = photoRect.w / photoRect.h
      const imgAspect = userImg.naturalWidth / userImg.naturalHeight

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

  // Pinch zoom for mobile
  const getDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
  }

  const handleTouchStart = (e) => {
    const touches = e.evt.touches
    if (touches.length === 2) {
      const p1 = { x: touches[0].clientX, y: touches[0].clientY }
      const p2 = { x: touches[1].clientX, y: touches[1].clientY }
      lastDistRef.current = getDistance(p1, p2)
    }
  }

  const handleTouchMove = (e) => {
    const touches = e.evt.touches
    if (touches.length === 2 && imageRef.current) {
      e.evt.preventDefault()
      const p1 = { x: touches[0].clientX, y: touches[0].clientY }
      const p2 = { x: touches[1].clientX, y: touches[1].clientY }
      const dist = getDistance(p1, p2)
      
      if (lastDistRef.current > 0) {
        const scale = dist / lastDistRef.current
        const node = imageRef.current
        const oldScale = node.scaleX()
        const newScale = oldScale * scale
        node.scale({ x: newScale, y: newScale })
        node.getLayer().batchDraw()
        onTransform?.()
      }
      lastDistRef.current = dist
    }
  }

  const handleTouchEnd = () => {
    lastDistRef.current = 0
  }

  return (
    <div ref={containerRef} className="w-full">
      <Stage
        width={stageSize}
        height={stageHeight}
        className="konva-stage"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
              width={stageSize}
              height={stageHeight}
              listening={false}
            />
          )}
        </Layer>
      </Stage>
    </div>
  )
}