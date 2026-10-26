export default function UploadPlaceholder({ onUpload }) {
  return (
    <div className="flex items-center justify-center aspect-square md:aspect-[4/3] bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-xl">
      <div className="text-center text-zinc-500">
        <div className="text-5xl mb-3">🖼️</div>
        <p className="text-sm">اضغط على "اختر صورتك" للبدء</p>
      </div>
    </div>
  )
}