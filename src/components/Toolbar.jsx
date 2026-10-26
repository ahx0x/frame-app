import { useState, useEffect } from 'react'
import { config } from '../lib/config'
import { STAGE_PREVIEW_WIDTH } from '../lib/export'

export default function Toolbar({ imageRef, coverData, onTransform, onReset }) {
  const [factor, setFactor] = useState(1)
  const [baseScale, setBaseScale] = useState(1)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    if (imageRef.current) {
      const s = imageRef.current.scaleX()
      setBaseScale(s)
      setFactor(1)
      setRotation(0)
    }
  }, [imageRef.current?.image?.()])

  const applyFactor = (newFactor) => {
    if (!imageRef.current) return
    const clamped = Math.max(config.zoom.min, Math.min(config.zoom.max, newFactor))
    const newScale = baseScale * clamped
    imageRef.current.scale({ x: newScale, y: newScale })
    imageRef.current.getLayer().batchDraw()
    setFactor(clamped)
    onTransform?.()
  }

  const rotate = () => {
    if (!imageRef.current) return
    const newRot = imageRef.current.rotation() + 90
    imageRef.current.rotation(newRot)
    imageRef.current.getLayer().batchDraw()
    setRotation(newRot)
    onTransform?.()
  }

  const center = () => {
    if (!imageRef.current) return
    const { photoRect, originalWidth } = coverData
    const previewScale = STAGE_PREVIEW_WIDTH / originalWidth
    imageRef.current.position({
      x: photoRect.x * previewScale + (photoRect.w * previewScale) / 2,
      y: photoRect.y * previewScale + (photoRect.h * previewScale) / 2
    })
    imageRef.current.getLayer().batchDraw()
    onTransform?.()
  }

  return (
    <div className="bg-zinc-900 rounded-xl p-4 space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-zinc-400">التكبير</label>
          <span className="text-xs text-yellow-500 font-semibold">{Math.round(factor * 100)}%</span>
        </div>
        <input
          type="range"
          min={config.zoom.min}
          max={config.zoom.max}
          step={config.zoom.step}
          value={factor}
          onChange={(e) => applyFactor(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <ToolButton onClick={rotate}>
          <RotateIcon />
          <span>تدوير</span>
        </ToolButton>
        <ToolButton onClick={center}>
          <CenterIcon />
          <span>توسيط</span>
        </ToolButton>
        <ToolButton onClick={onReset} variant="danger">
          <ResetIcon />
          <span>إعادة</span>
        </ToolButton>
      </div>

      <div className="text-xs text-zinc-500 text-center pt-2 border-t border-zinc-800">
        اسحب الصورة لتحريكها • استخدم إصبعين أو عجلة الماوس للتكبير
      </div>
    </div>
  )
}

function ToolButton({ onClick, children, variant }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg transition-colors text-xs font-medium ${
        variant === 'danger'
          ? 'bg-zinc-800 hover:bg-red-950 text-zinc-300'
          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
      }`}
    >
      {children}
    </button>
  )
}

function RotateIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}

function CenterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </svg>
  )
}

function ResetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}