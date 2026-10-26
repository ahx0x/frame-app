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
        className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-zinc-950 font-semibold rounded-xl transition-colors shadow-lg shadow-yellow-500/20"
      >
        {hasImage ? '🔄 تغيير الصورة' : '📷 اختر صورتك'}
      </button>
    </>
  )
}