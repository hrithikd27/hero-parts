interface Props {
  text: string | null
  loading: boolean
}

export default function AiAssistantPanel({ text, loading }: Props) {
  if (!loading && !text) return null

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <span>🤖</span>
        <span className="text-xs font-semibold text-purple-700">AI Assistant</span>
      </div>
      {loading ? (
        <div className="flex gap-1 py-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
      )}
    </div>
  )
}
