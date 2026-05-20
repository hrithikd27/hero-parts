import { SYMPTOM_CHIPS } from '../../constants/categories'

interface Props {
  onSelect: (symptom: string) => void
}

export default function SymptomChips({ onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {SYMPTOM_CHIPS.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="text-xs bg-white border border-hero-border text-gray-600 px-3 py-1.5 rounded-full hover:border-hero-red hover:text-hero-red hover:bg-red-50 transition-colors shadow-sm"
        >
          {s}
        </button>
      ))}
    </div>
  )
}
