import { useState } from 'react'
import SymptomChips from '../components/diagnose/SymptomChips'
import DiagnosisResult from '../components/diagnose/DiagnosisResult'
import { useSearch } from '../hooks/useSearch'
import { useDiagnosis } from '../hooks/useDiagnosis'
import { HERO_MODELS } from '../constants/models'
import PartCard from '../components/parts/PartCard'

export default function DiagnoseTab() {
  const [symptom, setSymptom] = useState('')
  const [model, setModel] = useState('All Models')

  const { lines, loading, error, diagnose } = useDiagnosis()
  const { results: partResults, search: searchParts } = useSearch()

  async function handleDiagnose(text = symptom) {
    if (!text.trim()) return
    setSymptom(text)
    await diagnose(text, model)
    searchParts(text)
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h2 className="text-gray-900 font-semibold mb-1">Symptom Diagnosis</h2>
        <p className="text-xs text-gray-500">
          Describe what&apos;s wrong with the bike — AI will suggest the most likely faulty parts.
        </p>
      </div>

      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="bg-white border border-hero-border text-gray-700 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-hero-red shadow-sm w-fit"
      >
        {HERO_MODELS.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <div className="flex gap-2">
        <textarea
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
          placeholder="e.g. Bike not starting, battery dead… / gear nahi lag raha"
          rows={3}
          className="flex-1 bg-white border border-hero-border rounded-xl px-4 py-2 text-gray-900 text-sm placeholder-gray-400 outline-none focus:border-hero-red shadow-sm resize-none"
        />
      </div>

      <button
        onClick={() => handleDiagnose()}
        disabled={loading || !symptom.trim()}
        className="bg-hero-red hover:bg-red-700 disabled:opacity-50 text-white text-sm px-6 py-2 rounded-xl font-medium transition-colors self-start shadow-sm"
      >
        {loading ? 'Diagnosing…' : 'Diagnose'}
      </button>

      <div>
        <p className="text-xs text-gray-500 mb-2">Common symptoms:</p>
        <SymptomChips onSelect={(s) => handleDiagnose(s)} />
      </div>

      <DiagnosisResult lines={lines} loading={loading} error={error} />

      {partResults.length > 0 && lines.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-3">Related parts in catalog:</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {partResults.slice(0, 6).map((part) => (
              <PartCard key={part.sku} part={part} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
