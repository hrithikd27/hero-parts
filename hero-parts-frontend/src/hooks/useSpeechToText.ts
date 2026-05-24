import { useState, useRef, useCallback } from 'react'

type Status = 'idle' | 'listening' | 'error'

interface UseSpeechToText {
  status: Status
  start: (onInterim: (t: string) => void, onFinal: (t: string, alternatives: string[]) => void) => void
  stop: () => void
  supported: boolean
}

export function useSpeechToText(): UseSpeechToText {
  const [status, setStatus] = useState<Status>('idle')
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const supported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null
      recognitionRef.current.onerror = null
      recognitionRef.current.abort()
      recognitionRef.current = null
    }
    setStatus('idle')
  }, [])

  const start = useCallback(
    (onInterim: (t: string) => void, onFinal: (t: string) => void) => {
      if (!supported) return

      // Abort any previous session cleanly before starting a new one
      if (recognitionRef.current) {
        recognitionRef.current.onend = null
        recognitionRef.current.onerror = null
        recognitionRef.current.abort()
        recognitionRef.current = null
      }

      const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition
      const rec = new SR()

      rec.lang = 'en-IN'
      rec.continuous = false
      rec.interimResults = true
      rec.maxAlternatives = 3

      rec.onstart = () => setStatus('listening')

      rec.onresult = (e) => {
        const results = Array.from(e.results)
        // Full transcript so far (all segments joined)
        const transcript = results.map((r) => r[0].transcript).join('')
        const lastResult = results[results.length - 1]

        onInterim(transcript)

        if (lastResult.isFinal) {
          // Collect all alternatives so the caller can pick the best one
          const alternatives: string[] = []
          for (let i = 0; i < lastResult.length; i++) {
            alternatives.push(lastResult[i].transcript)
          }
          onFinal(transcript, alternatives)
        }
      }

      rec.onerror = (e) => {
        recognitionRef.current = null
        // 'aborted' and 'no-speech' are normal — don't flash an error badge
        if (e.error === 'aborted' || e.error === 'no-speech') {
          setStatus('idle')
        } else {
          setStatus('error')
          setTimeout(() => setStatus('idle'), 2000)
        }
      }

      rec.onend = () => {
        recognitionRef.current = null
        setStatus('idle')
      }

      recognitionRef.current = rec
      rec.start()
    },
    [supported]
  )

  return { status, start, stop, supported }
}
