interface Props {
  suggestions: string[]
  onSelect: (s: string) => void
}

export default function PhoneticSuggestions({ suggestions, onSelect }: Props) {
  if (suggestions.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-gray-500">🔊 Sounds like:</span>
      {suggestions.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full hover:bg-amber-100 transition-colors"
        >
          {s}
        </button>
      ))}
    </div>
  )
}
