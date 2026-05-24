import { useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { searchByImage } from '../../api/searchApi'
import { useSearchUiStore } from '../../store/searchUiStore'

interface Props {
  onClose: () => void
  onGoToSearch: () => void
}

type Stage = 'idle' | 'preview' | 'analyzing' | 'identified' | 'error'

export default function ImageSearchModal({ onClose, onGoToSearch }: Props) {
  const setQuery = useSearchUiStore((s) => s.setQuery)

  const [stage, setStage] = useState<Stage>('idle')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [errorMsg, setErrorMsg] = useState('')
  const [dragging, setDragging] = useState(false)
  const [isIrrelevantImage, setIsIrrelevantImage] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  function acceptFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select an image file (JPG, PNG, or WebP).')
      setStage('error')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image must be under 10 MB.')
      setStage('error')
      return
    }
    setPreviewUrl(URL.createObjectURL(file))
    setSelectedFile(file)
    setStage('preview')
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) acceptFile(file)
    e.target.value = ''
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) acceptFile(file)
  }, [])

  async function analyze() {
    if (!selectedFile) return
    setStage('analyzing')
    try {
      const data = await searchByImage(selectedFile)
      setSuggestions(data.suggestions ?? [])
      setStage('identified')
    } catch (err: unknown) {
      const msg = (err as Error).message ?? 'Image analysis failed'
      setErrorMsg(msg)
      setIsIrrelevantImage(msg.includes('relevant part photo'))
      setStage('error')
    }
  }

  function pickSuggestion(label: string) {
    setQuery(label)
    onGoToSearch()
    onClose()
  }

  function reset() {
    setStage('idle')
    setPreviewUrl(null)
    setSelectedFile(null)
    setSuggestions([])
    setErrorMsg('')
    setIsIrrelevantImage(false)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col" style={{ maxHeight: '90dvh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-hero-red/10 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-hero-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <circle cx="12" cy="13" r="3" strokeWidth={2} />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Search by Photo</p>
              <p className="text-[11px] text-gray-400">Upload a part photo — AI identifies it</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto flex-1">

          {/* Idle: drop zone */}
          {stage === 'idle' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`
                flex flex-col items-center justify-center gap-3 py-8 sm:py-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all
                ${dragging
                  ? 'border-hero-red bg-red-50'
                  : 'border-gray-200 bg-gray-50 hover:border-hero-red hover:bg-red-50/30'}
              `}
            >
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-700 text-sm">Drop a photo here</p>
                <p className="text-xs text-gray-400 mt-0.5">or click to browse · JPG, PNG, WebP up to 10 MB</p>
              </div>
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
            </div>
          )}

          {/* Preview: confirm before analyzing */}
          {stage === 'preview' && previewUrl && (
            <div className="flex flex-col gap-4">
              <div className="relative rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center" style={{ height: '220px' }}>
                <img src={previewUrl} alt="Selected part" className="object-contain w-full h-full" />
                <button
                  onClick={reset}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <button
                onClick={analyze}
                className="w-full py-3 bg-hero-red hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Identify Part
              </button>
            </div>
          )}

          {/* Analyzing spinner */}
          {stage === 'analyzing' && (
            <div className="flex flex-col items-center justify-center gap-4 py-10">
              {previewUrl && (
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 ring-2 ring-hero-red/20">
                  <img src={previewUrl} alt="Analyzing" className="object-contain w-full h-full" />
                </div>
              )}
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-[3px] border-gray-200 border-t-hero-red rounded-full animate-spin" />
                <p className="text-sm font-medium text-gray-700">Identifying part…</p>
                <p className="text-xs text-gray-400">AI is analysing your photo…</p>
              </div>
            </div>
          )}

          {/* Identified: list of possible names */}
          {stage === 'identified' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                {previewUrl && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                    <img src={previewUrl} alt="Part" className="object-contain w-full h-full p-1" />
                  </div>
                )}
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">AI identified this as</p>
                  <p className="font-bold text-gray-900 text-base capitalize">{suggestions[0] ?? 'unknown'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Tap any name below to search</p>
                </div>
              </div>

              {suggestions.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-4">
                  Could not identify the part. Try a clearer, closer photo.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto">
                  {suggestions.map((label, i) => (
                    <button
                      key={label}
                      onClick={() => pickSuggestion(label)}
                      className={`flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-xl border transition-all hover:border-hero-red hover:bg-red-50 group
                        ${i === 0 ? 'border-hero-red/40 bg-red-50/60' : 'border-gray-100 bg-gray-50'}`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
                        ${i === 0 ? 'bg-hero-red text-white' : 'bg-gray-200 text-gray-500 group-hover:bg-hero-red group-hover:text-white'}`}>
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-800 capitalize flex-1">{label}</span>
                      <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-hero-red shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}

              <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600 transition-colors text-center">
                Try a different photo
              </button>
            </div>
          )}

          {/* Error */}
          {stage === 'error' && (
            <div className="flex flex-col items-center gap-4 py-6">
              {isIrrelevantImage ? (
                <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                  </svg>
                </div>
              ) : (
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth={2} />
                    <path d="M12 8v4M12 16h.01" strokeWidth={2} strokeLinecap="round" />
                  </svg>
                </div>
              )}
              <div className="text-center">
                <p className="font-semibold text-gray-800 text-sm">
                  {isIrrelevantImage ? 'Not a vehicle part' : 'Something went wrong'}
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">{errorMsg}</p>
              </div>
              <button
                onClick={reset}
                className="px-6 py-2 rounded-xl border-2 border-hero-red text-hero-red text-sm font-semibold hover:bg-red-50 transition-colors"
              >
                {isIrrelevantImage ? 'Try a different photo' : 'Try again'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  )
}
