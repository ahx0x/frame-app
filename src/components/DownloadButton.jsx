import { useState } from 'react'
import { exportImage } from '../lib/export'
import { config } from '../lib/config'

export default function DownloadButton({ imageRef, coverData, userImage }) {
  const [loading, setLoading] = useState(false)

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
        coverData
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = config.downloadName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (err) {
      console.error(err)
      alert('حدث خطأ أثناء التصدير')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="w-full py-3.5 bg-gradient-to-l from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner /> جارٍ التجهيز...
        </span>
      ) : (
        '⬇️ تحميل الصورة النهائية'
      )}
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

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}