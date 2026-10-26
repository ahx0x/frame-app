import { useState, useEffect } from 'react'
import { config } from '../lib/config'
import { STAGE_PREVIEW_WIDTH } from '../lib/export'

export default function Toolbar({ imageRef, coverData, onTransform, onReset }) {
  const [factor, setFactor] = useState(1)
  const [baseScale, setBaseScale] = useState(1)

  useEffect(() => {
    if (imageRef.current) {
      setBaseScale(imageRef.current.scaleX())
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
    imageRef.current.rotation(imageRef.current.rotation() + 90)
    imageRef.current.getLayer().batchDraw()
    onTransform?.()
  }

  const center = () => {
    const node = imageRef.current
    if (!node) return
    // الإصلاح: الحساب من عرض المسرح الفعلي وليس من ثابت
    const stage = node.getStage()
    const stageWidth = stage ? stage.width() : STAGE_PREVIEW_WIDTH
    const previewScale = stageWidth / coverData.originalWidth
    node.position({
      x: photoCenterX(coverData, previewScale),
      y: photoCenterY(coverData, previewScale)
    })
    node.getLayer().batchDraw()
    onTransform?.()
  }

  return (
    <div className="glass rounded-2xl p-4 md:p-5 space-y-5">
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

      <div className="grid grid-cols-3 gap-2">
        <ToolButton onClick={rotate} icon={<RotateIcon />} label="تدوير" />
        <ToolButton onClick={center} icon={<CenterIcon />} label="توسيط" />
        <ToolButton onClick={onReset} icon={<ResetIcon />} label="إعادة" variant="danger" />
      </div>

      <div className="pt-4 border-t border-zinc-800/50">
        <p className="text-xs text-zinc-500 text-center leading-relaxed">
          💡 اسحب الصورة لتحريكها<br />
          استخدم إصبعين أو عجلة الماوس للتكبير
        </p>
      </div>
    </div>
  )
}

function photoCenterX(coverData, previewScale) {
  return coverData.photoRect.x * previewScale + (coverData.photoRect.w * previewScale) / 2
}
function photoCenterY(coverData, previewScale) {
  return coverData.photoRect.y * previewScale + (coverData.photoRect.h * previewScale) / 2
}

function ToolButton({ onClick, icon, label, variant }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all text-xs font-medium border ${
        variant === 'danger'
          ? 'bg-zinc-800/50 hover:bg-red-950/50 text-zinc-300 hover:text-red-300 border-zinc-700/50'
          : 'bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-200 border-zinc-700/50'
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
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" />
    </svg>
  )
}
function CenterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </svg>
  )
}
function ResetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" />
    </svg>
  )
}