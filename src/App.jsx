import { useState, useRef, useEffect } from 'react'
import EditorCanvas from './components/EditorCanvas'
import Toolbar from './components/Toolbar'
import UploadButton from './components/UploadButton'
import DownloadButton from './components/DownloadButton'
import UploadPlaceholder from './components/UploadPlaceholder'
import { loadCover } from './lib/cover'
import { config } from './lib/config'

export default function App() {
  const [userImage, setUserImage] = useState(null)
  const [coverData, setCoverData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const imageRef = useRef()

  useEffect(() => {
    loadCover(config.coverUrl)
      .then(setCoverData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleReset = () => {
    if (imageRef.current && userImage) {
      setUserImage({ ...userImage })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4">
        <div className="text-center fade-in">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-zinc-800 border-t-yellow-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 bg-yellow-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-zinc-400 mt-6 text-lg font-medium">جارٍ تحميل الإطار...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 max-w-md text-center fade-in">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-300 text-lg font-medium">{error}</p>
          <p className="text-zinc-500 mt-2 text-sm">الرجاء التأكد من وجود صورة الإطار</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12 fade-in">
          <div className="inline-block mb-4">
            <div className="flex items-center justify-center gap-3 px-4 py-2 glass rounded-full">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-zinc-400 font-medium">{config.eventName}</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 gradient-text leading-tight">
            {config.title}
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
            {config.subtitle}
          </p>
        </header>

        {/* Main content */}
        <div className="grid lg:grid-cols-[1fr,360px] gap-6 lg:gap-8 items-start">
          {/* Canvas area */}
          <div className="glass rounded-2xl p-3 sm:p-4 md:p-6 fade-in">
            {userImage ? (
              <div className="fade-in">
                <EditorCanvas
                  userImage={userImage}
                  coverData={coverData}
                  imageRef={imageRef}
                  onTransform={() => {}}
                />
              </div>
            ) : (
              <UploadPlaceholder onUpload={setUserImage} />
            )}
          </div>

          {/* Controls panel */}
          <div className="space-y-4 fade-in">
            {/* Upload button - prominent on mobile */}
            <div className="lg:hidden">
              <UploadButton onUpload={setUserImage} hasImage={!!userImage} />
            </div>

            {/* Toolbar */}
            {userImage && (
              <div className="fade-in">
                <Toolbar
                  imageRef={imageRef}
                  coverData={coverData}
                  onReset={handleReset}
                />
              </div>
            )}

            {/* Desktop upload + download */}
            <div className="hidden lg:block space-y-4">
              <UploadButton onUpload={setUserImage} hasImage={!!userImage} />
              {userImage && (
                <DownloadButton
                  imageRef={imageRef}
                  coverData={coverData}
                  userImage={userImage}
                />
              )}
            </div>

            {/* Mobile download */}
            {userImage && (
              <div className="lg:hidden fade-in">
                <DownloadButton
                  imageRef={imageRef}
                  coverData={coverData}
                  userImage={userImage}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 md:mt-16 pt-6 border-t border-zinc-800/50 fade-in">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <span className="text-sm text-zinc-400 font-medium">{config.eventName}</span>
          </div>
          <p className="text-xs text-zinc-500 mb-2 max-w-md mx-auto">
            {config.privacyNote}
          </p>
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} frame.kids-mag.com
          </p>
        </footer>
      </div>
    </div>
  )
}