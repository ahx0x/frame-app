import { useState, useEffect } from 'react'
import { config } from '../lib/config'
import { STAGE_PREVIEW_WIDTH } from '../lib/export'

export default function Toolbar({ imageRef, coverData, onTransform, onReset }) {
  const [factor, setFactor] = useState(1)
  const [baseScale, setBaseScale] = useState(1)

  useEffect(() => {
    if (imageRef.current) {
      const s = imageRef.current.scaleX()
      setBaseScale(s)
      setFactor(1)
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
    <div className="glass rounded-2xl p-4 md:p-5 space-y-5">
      {/* Zoom slider */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm text-zinc-300 font-medium">التكبير</label>
          <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2.5 py-1 rounded-full font-semibold">
            {Math.round(factor * 100)}%
          </span>
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
        <div className="flex justify-between text-xs text-zinc-500 mt-1.5">
          <span>30%</span>
          <span>300%</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-2">
        <ToolButton onClick={rotate} icon={<RotateIcon />} label="تدوير" />
        <ToolButton onClick={center} icon={<CenterIcon />} label="توسيط" />
        <ToolButton onClick={onReset} icon={<ResetIcon />} label="إعادة" variant="danger" />
      </div>

      {/* Help text */}
      <div className="pt-4 border-t border-zinc-800/50">
        <p className="text-xs text-zinc-500 text-center leading-relaxed">
          💡 اسحب الصورة لتحريكها<br />
          استخدم إصبعين أو عجلة الماوس للتكبير
        </p>
      </div>
    </div>
  )
}

function ToolButton({ onClick, icon, label, variant }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all text-xs font-medium ${
        variant === 'danger'
          ? 'bg-zinc-800/50 hover:bg-red-950/50 text-zinc-300 hover:text-red-300 border border-zinc-700/50'
          : 'bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-200 border border-zinc-700/50'
      } hover:scale-105 active:scale-95`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

function RotateIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}

function CenterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </svg>
  )
}

function ResetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}