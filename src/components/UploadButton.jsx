import { useRef } from 'react'

export default function UploadButton({ onUpload, hasImage }) {
  const inputRef = useRef()

  const handleChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('الرجاء اختيار ملف صورة')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => onUpload({ src: ev.target.result, width: img.width, height: img.height })
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        className={`w-full py-4 font-semibold rounded-2xl transition-all shadow-lg ${
          hasImage
            ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700'
            : 'bg-gradient-to-l from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-zinc-950 shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-[1.02] active:scale-[0.98]'
        }`}
      >
        <span className="flex items-center justify-center gap-2 text-base">
          {hasImage ? (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              تغيير الصورة
            </>
          ) : (
            <>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              اختر الصورة
            </>
          )}
        </span>
      </button>
    </>
  )
}