import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Stage, Layer, Image } from 'react-konva'
import useImage from 'use-image'
import { STAGE_PREVIEW_WIDTH } from '../lib/export'

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

export default function EditorCanvas({
  userImage,
  coverData,
  imageRef,
  onTransform,
  onZoomChange,
  bridge
}) {
  const [userImg] = useImage(userImage?.src || '')
  const [coverImg] = useImage(coverData?.coverUrl || '')
  const containerRef = useRef(null)
  const userImgRef = useRef(null)
  const fitScaleRef = useRef(1)
  const [stageSize, setStageSize] = useState(0)
  const lastDistRef = useRef(0)
  const prevPreviewRef = useRef(null)

  const { photoRect, originalWidth, originalHeight } = coverData
  const previewScale = (stageSize || 1) / originalWidth
  const stageHeight = Math.round(originalHeight * previewScale)

  useEffect(() => {
    userImgRef.current = userImg
  }, [userImg])

  // ✅ بث حالة التكبير + الحدة + الحدود الديناميكية للأعلى
  const emitZoom = () => {
    const node = imageRef.current
    const img = userImgRef.current
    if (!node || !img || !onZoomChange) return
    const stage = node.getStage()
    const stageWidth = stage ? stage.width() : STAGE_PREVIEW_WIDTH
    const factor = node.scaleX() / fitScaleRef.current
    const exportScale = node.scaleX() * (originalWidth / stageWidth)
    const sharpness = (img.naturalWidth * exportScale) / photoRect.w
    onZoomChange((prev) => ({ ...prev, factor, sharpness }))
  }

  // ✅ تسجيل أوامر المؤشر (يستدعيها Toolbar عبر bridge)
  useEffect(() => {
    if (!bridge) return
    bridge.current.setFactor = (f) => {
      const node = imageRef.current
      if (!node) return
      const s = fitScaleRef.current * clamp(f, 0.5, 64)
      node.scale({ x: s, y: s })
      node.getLayer().batchDraw()
      emitZoom()
      onTransform?.()
    }
    bridge.current.zoomBy = (mult) => {
      const node = imageRef.current
      if (!node) return
      const s = node.scaleX() * mult
      node.scale({ x: s, y: s })
      node.getLayer().batchDraw()
      emitZoom()
      onTransform?.()
    }
  })

  // القياس قبل الرسم
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => {
      const safe = Math.min(
        el.clientWidth || window.innerWidth - 72,
        window.innerWidth - 72,
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

  // إعادة التحجيم عند تغيّر حجم المسرح (مع تحديث fitScale حتى لا تنحرف النسبة)
  useEffect(() => {
    const ps = stageSize / originalWidth
    const prev = prevPreviewRef.current
    prevPreviewRef.current = ps
    if (prev && prev !== ps && stageSize > 0) {
      const ratio = ps / prev
      fitScaleRef.current *= ratio
      const node = imageRef.current
      if (node && node.image()) {
        node.scale({ x: node.scaleX() * ratio, y: node.scaleY() * ratio })
        node.position({ x: node.x() * ratio, y: node.y() * ratio })
        node.getLayer()?.batchDraw()
        onTransform?.()
      }
      emitZoom()
    }
  }, [stageSize, originalWidth])

  // الضبط الأولي + حساب الحدود الديناميكية من دقة الصورة
  useEffect(() => {
    if (userImg && imageRef.current && stageSize > 0) {
      const node = imageRef.current
      const stageWidth = stageSize
      const rectAspect = photoRect.w / photoRect.h
      const imgAspect = userImg.naturalWidth / userImg.naturalHeight

      let scale
      if (imgAspect > rectAspect) {
        scale = (photoRect.h * previewScale) / userImg.naturalHeight
      } else {
        scale = (photoRect.w * previewScale) / userImg.naturalWidth
      }

      fitScaleRef.current = scale
      node.scale({ x: scale, y: scale })
      node.position({
        x: photoRect.x * previewScale + (photoRect.w * previewScale) / 2,
        y: photoRect.y * previewScale + (photoRect.h * previewScale) / 2
      })
      node.rotation(0)
      node.offsetX(userImg.naturalWidth / 2)
      node.offsetY(userImg.naturalHeight / 2)
      node.getLayer()?.batchDraw()

      // ✅ الحد الأقصى الديناميكي: كم يكبّر قبل أن تبدأ الصورة تفقد دقتها؟
      const fitExportScale = scale * (originalWidth / stageWidth)
      const maxByQuality = 1 / fitExportScale
      const max = clamp(Math.round(maxByQuality * 10) / 10, 1.5, 8)
      onZoomChange?.((prev) => ({ ...prev, factor: 1, min: 0.5, max, sharpness: (userImg.naturalWidth * fitExportScale) / photoRect.w }))

      onTransform?.()
    }
  }, [userImg, stageSize])

  const handleWheel = (e) => {
    e.evt.preventDefault()
    bridge?.current.zoomBy?.(e.evt.deltaY > 0 ? 1 / 1.08 : 1.08)
  }

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
        bridge?.current.zoomBy?.(dist / lastDistRef.current)
      }
      lastDistRef.current = dist
    }
  }

  const handleTouchEnd = () => {
    lastDistRef.current = 0
  }

  return (
    <div ref={containerRef} className="w-full min-w-0">
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