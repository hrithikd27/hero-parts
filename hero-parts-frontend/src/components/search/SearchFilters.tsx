import { HERO_MODELS } from '../../constants/models'
import type { Category } from '../../types/part'

interface Props {
  selectedModel: string
  selectedCategoryId: number | null
  categories: Category[]
  onModelChange: (m: string) => void
  onCategoryChange: (id: number | null) => void
}

export default function SearchFilters({
  selectedModel,
  selectedCategoryId,
  categories,
  onModelChange,
  onCategoryChange,
}: Props) {
  const selectCls = `
    bg-white border-2 border-gray-200 text-gray-700 text-sm rounded-xl px-3 py-2
    outline-none focus:border-hero-red hover:border-gray-300 transition-colors
    cursor-pointer shadow-none appearance-none pr-8
  `

  return (
    <div className="flex flex-wrap gap-2">
      <div className="relative">
        <select value={selectedModel} onChange={(e) => onModelChange(e.target.value)} className={selectCls}>
          {HERO_MODELS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <div className="relative">
        <select
          value={selectedCategoryId ?? ''}
          onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : null)}
          className={selectCls}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}
