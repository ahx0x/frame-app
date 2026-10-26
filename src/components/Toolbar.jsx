import { useEffect } from 'react'
import { STAGE_PREVIEW_WIDTH } from '../lib/export'

export default function Toolbar({ imageRef, coverData, onTransform, onReset, zoom, onFactor }) {
  const pct = Math.round(zoom.factor * 100)
  const fill = ((zoom.factor - zoom.min) / (zoom.max - zoom.min)) * 100

  const rotate = () => {
    if (!imageRef.current) return
    imageRef.current.rotation(imageRef.current.rotation() + 90)
    imageRef.current.getLayer().batchDraw()
    onTransform?.()
  }

  const center = () => {
    const node = imageRef.current
    if (!node) return
    const stage = node.getStage()
    const stageWidth = stage ? stage.width() : STAGE_PREVIEW_WIDTH
    const previewScale = stageWidth / coverData.originalWidth
    node.position({
      x: coverData.photoRect.x * previewScale + (coverData.photoRect.w * previewScale) / 2,
      y: coverData.photoRect.y * previewScale + (coverData.photoRect.h * previewScale) / 2
    })
    node.getLayer().batchDraw()
    onTransform?.()
  }

  return (
    <div className="glass rounded-2xl p-4 md:p-5 space-y-5">
      {/* ===== مؤشر التكبير الاحترافي ===== */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm text-zinc-300 font-medium">التكبير</label>
          <button
            onClick={() => onFactor(1)}
            title="اضغط للعودة إلى 100%"
            className="text-xs bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full font-bold tabular-nums transition-colors"
          >
            {pct}%
          </button>
        </div>

        <div className="flex items-center gap-2" dir="ltr">
          <ZoomStepBtn onClick={() => onFactor(zoom.factor / 1.15)} label="−" />
          <input
            type="range"
            min={zoom.min}
            max={zoom.max}
            step={0.01}
            value={zoom.factor}
            onChange={(e) => onFactor(parseFloat(e.target.value))}
            className="flex-1"
            style={{
              background: `linear-gradient(to right, #eab308 ${fill}%, #3f3f46 ${fill}%)`
            }}
            dir="ltr"
          />
          <ZoomStepBtn onClick={() => onFactor(zoom.factor * 1.15)} label="+" />
        </div>

        <div className="flex items-center justify-between mt-2 text-[10px] text-zinc-500 tabular-nums">
          <span>{Math.round(zoom.min * 100)}%</span>
          <QualityBadge sharpness={zoom.sharpness} />
          <span>{Math.round(zoom.max * 100)}%</span>
        </div>
      </div>

      {/* ===== أزرار الإجراءات ===== */}
      <div className="grid grid-cols-3 gap-2">
        <ToolButton onClick={rotate} icon={<RotateIcon />} label="تدوير" />
        <ToolButton onClick={center} icon={<CenterIcon />} label="توسيط" />
        <ToolButton onClick={onReset} icon={<ResetIcon />} label="إعادة" variant="danger" />
      </div>

      <div className="pt-4 border-t border-zinc-800/50">
        <p className="text-xs text-zinc-500 text-center leading-relaxed">
          💡 اسحب الصورة لتحريكها • استخدم إصبعين أو عجلة الماوس للتكبير
        </p>
      </div>
    </div>
  )
}

function ZoomStepBtn({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="w-9 h-9 shrink-0 rounded-xl bg-zinc-800/60 hover:bg-zinc-700/60 border border-zinc-700/50 text-zinc-200 text-lg font-bold leading-none transition-all hover:scale-105 active:scale-95"
    >
      {label}
    </button>
  )
}

function QualityBadge({ sharpness }) {
  const level =
    sharpness >= 1.5
      ? { t: 'دقة ممتازة', c: 'text-emerald-400', d: 'bg-emerald-400' }
      : sharpness >= 1
      ? { t: 'دقة جيدة', c: 'text-yellow-400', d: 'bg-yellow-400' }
      : { t: 'دقة منخفضة', c: 'text-red-400', d: 'bg-red-400' }
  return (
    <span className={`flex items-center gap-1.5 font-medium ${level.c}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${level.d} animate-pulse`} />
      {level.t}
    </span>
  )
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