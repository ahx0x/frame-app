export default function UploadPlaceholder({ onUpload }) {
  return (
    <div className="flex items-center justify-center aspect-[4/3] bg-zinc-900/30 border-2 border-dashed border-zinc-700/50 rounded-2xl hover:border-yellow-500/50 transition-colors cursor-pointer group">
      <div className="text-center text-zinc-400 group-hover:text-zinc-300 transition-colors px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-zinc-800/50 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-yellow-500">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        <p className="text-base font-medium mb-1">اضغط على "اختر الصورة" للبدء</p>
        <p className="text-xs text-zinc-500">أو اسحب الصورة هنا</p>
      </div>
    </div>
  )
}