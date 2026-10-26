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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-zinc-700 border-t-yellow-500"></div>
          <p className="text-zinc-400 mt-4">جارٍ تحميل الإطار...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-red-950 border border-red-800 rounded-xl p-6 max-w-md text-center">
          <p className="text-red-200">⚠️ {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <header className="text-center mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-3 bg-gradient-to-l from-yellow-500 to-amber-400 bg-clip-text text-transparent">
            {config.title}
          </h1>
          <p className="text-zinc-400 text-sm md:text-base">{config.subtitle}</p>
        </header>

        <div className="grid md:grid-cols-[1fr,300px] gap-6 items-start">
          <div className="bg-zinc-900/50 p-3 md:p-5 rounded-2xl border border-zinc-800">
            {userImage ? (
              <EditorCanvas
                userImage={userImage}
                coverData={coverData}
                imageRef={imageRef}
                onTransform={() => {}}
              />
            ) : (
              <UploadPlaceholder onUpload={setUserImage} />
            )}
          </div>

          <div className="space-y-4">
            <UploadButton onUpload={setUserImage} hasImage={!!userImage} />
            {userImage && (
              <Toolbar
                imageRef={imageRef}
                coverData={coverData}
                onReset={handleReset}
              />
            )}
            {userImage && (
              <DownloadButton
                imageRef={imageRef}
                coverData={coverData}
                userImage={userImage}
              />
            )}
          </div>
        </div>

        <footer className="text-center text-xs text-zinc-500 mt-12 pt-6 border-t border-zinc-900">
          <p>{config.privacyNote}</p>
          <p className="mt-2 text-zinc-600">© {new Date().getFullYear()} الامام الهادي</p>
        </footer>
      </div>
    </div>
  )
}