interface Props {
  wasTranslated: boolean
  translatedAs: string | null
}

export default function TranslationBanner({ wasTranslated, translatedAs }: Props) {
  if (!wasTranslated || !translatedAs) return null

  return (
    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-700">
      <span>🇮🇳</span>
      <span>
        Hindi / slang detected — searching as:{' '}
        <span className="font-semibold text-blue-900">{translatedAs}</span>
      </span>
    </div>
  )
}
