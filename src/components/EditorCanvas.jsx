import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Stage, Layer, Image } from 'react-konva'
import useImage from 'use-image'
import { STAGE_PREVIEW_WIDTH } from '../lib/export'

export default function EditorCanvas({ userImage, coverData, imageRef, onTransform }) {
  const [userImg] = useImage(userImage?.src || '')
  const [coverImg] = useImage(coverData?.coverUrl || '')
  const containerRef = useRef(null)
  const [stageSize, setStageSize] = useState(0) // 0 = لا ترسم شيئًا بعد
  const lastDistRef = useRef(0)
  const prevPreviewRef = useRef(null)

  const { photoRect, originalWidth, originalHeight } = coverData
  const previewScale = (stageSize || 1) / originalWidth
  const stageHeight = Math.round(originalHeight * previewScale)

  // ✅ القياس الصحيح قبل أول رسم + مراقبة أي تغيّر في الحجم
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    const measure = () => {
      const safe = Math.min(
        el.clientWidth || window.innerWidth - 72,
        window.innerWidth - 72,          // ✅ سقف: لا يتجاوز شاشة الجوال أبدًا
        STAGE_PREVIEW_WIDTH
      )
      setStageSize(Math.max(240, safe))
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('orientationchange', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('orientationchange', measure)
    }
  }, [])

  // عند تغيّر حجم المسرح: إعادة تحجيم تعديلات المستخدم بنفس النسبة
  useEffect(() => {
    const ps = stageSize / originalWidth
    const prev = prevPreviewRef.current
    prevPreviewRef.current = ps
    if (prev && prev !== ps && stageSize > 0) {
      const node = imageRef.current
      if (node && node.image()) {
        const ratio = ps / prev
        node.scale({ x: node.scaleX() * ratio, y: node.scaleY() * ratio })
        node.position({ x: node.x() * ratio, y: node.y() * ratio })
        node.getLayer()?.batchDraw()
        onTransform?.()
      }
    }
  }, [stageSize, originalWidth])

  // الضبط الأولي: ملء منطقة الصورة (Cover Fit)
  useEffect(() => {
    if (userImg && imageRef.current && stageSize > 0) {
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
  }, [userImg, stageSize])

  // تكبير بعجلة الماوس
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

  // تكبير بإصبعين للجوال
  const getDistance = (p1, p2) =>
    Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))

  const handleTouchStart = (e) => {
    const t = e.evt.touches
    if (t.length === 2) {
      lastDistRef.current = getDistance(
        { x: t[0].clientX, y: t[0].clientY },
        { x: t[1].clientX, y: t[1].clientY }
      )
    }
  }

  const handleTouchMove = (e) => {
    const t = e.evt.touches
    if (t.length === 2 && imageRef.current) {
      e.evt.preventDefault()
      const dist = getDistance(
        { x: t[0].clientX, y: t[0].clientY },
        { x: t[1].clientX, y: t[1].clientY }
      )
      if (lastDistRef.current > 0) {
        const node = imageRef.current
        node.scale({
          x: node.scaleX() * (dist / lastDistRef.current),
          y: node.scaleY() * (dist / lastDistRef.current)
        })
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
    <div ref={containerRef} className="w-full min-w-0">
      {/* ✅ لا نرسم المسرح قبل معرفة المقاس الصحيح */}
      {stageSize > 0 && (
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
      )}
    </div>
  )
}