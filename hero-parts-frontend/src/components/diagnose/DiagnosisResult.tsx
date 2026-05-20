import type { DiagnosisLine } from '../../api/claudeApi'

interface Props {
  lines: DiagnosisLine[]
  loading: boolean
  error: string | null
}

export default function DiagnosisResult({ lines, loading, error }: Props) {
  if (loading) {
    return (
      <div className="bg-white border border-hero-border rounded-xl p-6 text-center shadow-card">
        <div className="flex justify-center gap-1 mb-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-hero-red animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-sm text-gray-500">Diagnosing…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
        {error}
      </div>
    )
  }

  if (lines.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700">Likely causes (in order):</h3>
      {lines.map((line, idx) => (
        <div
          key={idx}
          className="bg-white border border-hero-border rounded-xl px-4 py-3 flex gap-3 shadow-card"
        >
          <span className="text-hero-red font-bold text-sm shrink-0">#{idx + 1}</span>
          <div>
            <p className="text-gray-900 font-medium text-sm">{line.partName}</p>
            <p className="text-gray-500 text-xs mt-0.5">{line.reason}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
