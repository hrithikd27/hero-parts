import { useRef, type KeyboardEvent } from 'react'
import { useSpeechToText } from '../../hooks/useSpeechToText'
import { correctVoiceTranscript } from '../../utils/voiceCorrect'
import { translateQuery } from '../../utils/translation'

interface Props {
  value: string
  onChange: (v: string) => void
  onSearch: (v: string) => void
  onVoiceResult?: (t: string) => void
  onCameraClick?: () => void
  placeholder?: string
  glassy?: boolean
}

export default function SearchBar({ value, onChange, onSearch, onVoiceResult, onCameraClick, placeholder, glassy }: Props) {
  const { status, start, stop, supported } = useSpeechToText()
  const isListening = status === 'listening'
  const isError     = status === 'error'
  const inputRef    = useRef<HTMLInputElement>(null)

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') onSearch(value)
  }

  function handleMic() {
    if (isListening) { stop(); return }
    start(
      (transcript) => onChange(transcript),
      (transcript, alternatives) => {
        // Pick the alternative whose corrected form matches the slang/regional dict.
        // This handles cases where Chrome's top guess is wrong (e.g. "Canada" for
        // Tamil "kannadi") but a lower-ranked alternative is correct.
        const corrected = alternatives
          .map((alt) => correctVoiceTranscript(alt))
          .find((alt) => translateQuery(alt).wasTranslated)
          ?? correctVoiceTranscript(transcript)

        if (onVoiceResult) onVoiceResult(corrected)
        else onChange(corrected)
      }
    )
    inputRef.current?.focus()
  }

  const borderCls = isListening
    ? 'border-hero-red shadow-md'
    : glassy
    ? 'border-white/40 hover:border-white/70 focus-within:border-white/80'
    : 'border-gray-200 hover:border-gray-300 focus-within:border-hero-red focus-within:shadow-sm'

  const containerBase = glassy
    ? 'bg-white/15 backdrop-blur-sm border'
    : 'bg-white border-2'

  const iconCls  = glassy ? 'text-white/50' : 'text-gray-400'
  const inputCls = glassy ? 'text-white placeholder-white/45' : 'text-gray-900 placeholder-gray-400'
  const btnCls   = (active?: boolean) => `shrink-0 flex items-center justify-center w-6 h-6 rounded-full transition-all ${
    active
      ? 'bg-hero-red/25 text-hero-red'
      : glassy
      ? 'text-white/55 hover:text-white hover:bg-white/20'
      : 'text-gray-400 hover:text-hero-red hover:bg-red-50'
  }`

  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 overflow-hidden transition-all h-[38px] ${containerBase} ${borderCls}`}>
      {/* Search icon */}
      <svg className={`w-3.5 h-3.5 shrink-0 ${iconCls}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={isListening ? 'Listening…' : (placeholder ?? 'Search parts…')}
        className={`flex-1 min-w-0 bg-transparent text-sm outline-none ${inputCls}`}
      />

      {/* Clear */}
      {value && !isListening && (
        <button
          onClick={() => { onChange(''); onSearch('') }}
          className={`shrink-0 transition-colors ${glassy ? 'text-white/40 hover:text-white/80' : 'text-gray-400 hover:text-gray-600'}`}
          aria-label="Clear"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Mic */}
      {supported && (
        <button
          onClick={handleMic}
          aria-label={isListening ? 'Stop' : 'Voice search'}
          className={`relative ${btnCls(isListening)} ${isError ? (glassy ? '!text-amber-300' : '!text-amber-500') : ''}`}
        >
          {isListening && (
            <span className="absolute inset-0 rounded-full bg-hero-red/30 animate-ping" />
          )}
          <span className="relative z-10">
            {isListening ? (
              <span className="flex items-end gap-[2px] h-[14px]">
                <span className="w-[2.5px] rounded-full bg-current animate-[micbar_0.55s_ease-in-out_infinite_alternate]"                        style={{ height: '35%' }} />
                <span className="w-[2.5px] rounded-full bg-current animate-[micbar_0.55s_ease-in-out_infinite_alternate] [animation-delay:0.12s]" style={{ height: '100%' }} />
                <span className="w-[2.5px] rounded-full bg-current animate-[micbar_0.55s_ease-in-out_infinite_alternate] [animation-delay:0.25s]" style={{ height: '65%' }} />
                <span className="w-[2.5px] rounded-full bg-current animate-[micbar_0.55s_ease-in-out_infinite_alternate] [animation-delay:0.38s]" style={{ height: '85%' }} />
                <span className="w-[2.5px] rounded-full bg-current animate-[micbar_0.55s_ease-in-out_infinite_alternate] [animation-delay:0.12s]" style={{ height: '50%' }} />
              </span>
            ) : (
              <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="9" y="2" width="6" height="12" rx="3" strokeWidth={2} strokeLinejoin="round" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10a7 7 0 0 0 14 0M12 19v3M9 22h6" />
              </svg>
            )}
          </span>
        </button>
      )}

      {/* Camera */}
      {onCameraClick && (
        <button
          onClick={onCameraClick}
          aria-label="Search by photo"
          className={btnCls()}
        >
          <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <circle cx="12" cy="13" r="3" strokeWidth={2} />
          </svg>
        </button>
      )}
    </div>
  )
}
