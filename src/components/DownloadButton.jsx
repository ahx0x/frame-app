import { useState } from 'react'
import { exportImage } from '../lib/export'
import { config } from '../lib/config'

export default function DownloadButton({ imageRef, coverData, userImage }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [format, setFormat] = useState('png')

  const handleDownload = async () => {
    if (!imageRef.current) return
    setLoading(true)
    try {
      const userImg = imageRef.current.image()
      const coverImg = await loadImage(coverData.coverUrl)
      const blob = await exportImage({
        userImg,
        coverImg,
        node: imageRef.current,
        coverData,
        format
      })
      const ext = format === 'png' ? 'png' : 'jpg'
      const base = config.downloadName.replace(/\.(png|jpe?g)$/i, '')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${base}.${ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 1000)

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error(err)
      alert('حدث خطأ أثناء التصدير')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* مفتاح اختيار صيغة الحفظ */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-800/60 rounded-xl border border-zinc-700/50">
        <FormatButton active={format === 'png'} onClick={() => setFormat('png')}>
          PNG
          <span className="block text-[10px] font-normal opacity-70">جودة أعلى</span>
        </FormatButton>
        <FormatButton active={format === 'jpeg'} onClick={() => setFormat('jpeg')}>
          JPG
          <span className="block text-[10px] font-normal opacity-70">حجم أصغر</span>
        </FormatButton>
      </div>

      <button
        onClick={handleDownload}
        disabled={loading}
        className={`w-full py-4 font-semibold rounded-2xl transition-all shadow-lg text-white disabled:opacity-50 disabled:cursor-not-allowed ${
          success
            ? 'bg-gradient-to-l from-emerald-600 to-emerald-500'
            : 'bg-gradient-to-l from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98]'
        }`}
      >
        <span className="flex items-center justify-center gap-2 text-base">
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              جارٍ التجهيز...
            </>
          ) : success ? (
            <>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              تم التحميل بنجاح!
            </>
          ) : (
            <>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              تحميل الصورة النهائية
            </>
          )}
        </span>
      </button>
    </div>
  )
}

function FormatButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
        active
          ? 'bg-yellow-500 text-zinc-950 shadow-md shadow-yellow-500/20'
          : 'text-zinc-400 hover:text-zinc-200'
      }`}
    >
      {children}
    </button>
  )
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}