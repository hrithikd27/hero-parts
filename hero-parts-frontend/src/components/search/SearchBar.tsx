import { useState, useRef, type KeyboardEvent } from 'react'
import { useSpeechToText } from '../../hooks/useSpeechToText'
import { correctVoiceTranscript } from '../../utils/voiceCorrect'

interface Props {
  value: string
  onChange: (v: string) => void
  onSearch: (v: string) => void
  /** Called only when voice recognition produces a final result (after correction). */
  onVoiceResult?: (t: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, onSearch, onVoiceResult, placeholder }: Props) {
  const [focused, setFocused] = useState(false)
  const { status, start, stop, supported } = useSpeechToText()
  const isListening = status === 'listening'
  const isError = status === 'error'
  const inputRef = useRef<HTMLInputElement>(null)

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') onSearch(value)
  }

  function handleMic() {
    if (isListening) {
      stop()
      return
    }

    start(
      // Interim — keep the input updated so user sees words appear live
      (transcript) => onChange(transcript),

      // Final — apply corrections, then feed into voice-aware handler.
      // SearchTab's onVoiceResult sets the source='voice' flag so the search
      // log records the correct channel.  We do NOT call onSearch here to
      // avoid a double-search race with the 300 ms debounce.
      (transcript) => {
        const corrected = correctVoiceTranscript(transcript)
        if (onVoiceResult) {
          onVoiceResult(corrected)
        } else {
          onChange(corrected)
        }
      }
    )
    inputRef.current?.focus()
  }

  const borderCls = isListening
    ? 'border-hero-red shadow-md'
    : focused
    ? 'border-hero-red shadow-sm'
    : 'border-gray-200 hover:border-gray-300'

  return (
    <div className={`flex items-center gap-3 bg-white border-2 rounded-xl px-4 py-2.5 transition-all ${borderCls}`}>
      {/* Search icon */}
      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={
          isListening
            ? 'Listening… speak in Hindi or English'
            : (placeholder ?? 'Search parts — try "masala", "laal seat", "shocker", "lining"…')
        }
        className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-sm outline-none"
      />

      {/* Clear button — hidden while mic is active */}
      {value && !isListening && (
        <button
          onClick={() => { onChange(''); onSearch('') }}
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
          aria-label="Clear"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Mic button */}
      {supported && (
        <button
          onClick={handleMic}
          aria-label={isListening ? 'Stop listening' : 'Search by voice'}
          className={`relative shrink-0 flex items-center justify-center w-10 h-10 rounded-full transition-all
            focus:outline-none focus-visible:ring-2 focus-visible:ring-hero-red
            ${isListening
              ? 'bg-red-200 text-hero-red'
              : isError
              ? 'bg-amber-100 text-amber-600'
              : 'bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-hero-red'
            }`}
        >
          {/* Pulsing rings while listening */}
          {isListening && (
            <>
              <span className="absolute inset-0 rounded-full bg-hero-red opacity-30 animate-ping" />
              <span className="absolute inset-[-6px] rounded-full bg-hero-red opacity-15 animate-ping [animation-delay:200ms]" />
            </>
          )}

          {/* Icon */}
          <span className="relative z-10">
            {isListening ? (
              /* Animated soundwave bars */
              <span className="flex items-end gap-[2.5px] h-[18px]">
                <span className="w-[3px] rounded-full bg-current animate-[micbar_0.55s_ease-in-out_infinite_alternate]"                        style={{ height: '35%' }} />
                <span className="w-[3px] rounded-full bg-current animate-[micbar_0.55s_ease-in-out_infinite_alternate] [animation-delay:0.12s]" style={{ height: '100%' }} />
                <span className="w-[3px] rounded-full bg-current animate-[micbar_0.55s_ease-in-out_infinite_alternate] [animation-delay:0.25s]" style={{ height: '65%' }} />
                <span className="w-[3px] rounded-full bg-current animate-[micbar_0.55s_ease-in-out_infinite_alternate] [animation-delay:0.38s]" style={{ height: '85%' }} />
                <span className="w-[3px] rounded-full bg-current animate-[micbar_0.55s_ease-in-out_infinite_alternate] [animation-delay:0.12s]" style={{ height: '50%' }} />
              </span>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="9" y="2" width="6" height="12" rx="3" strokeWidth={2} strokeLinejoin="round" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10a7 7 0 0 0 14 0M12 19v3M9 22h6" />
              </svg>
            )}
          </span>
        </button>
      )}
    </div>
  )
}
