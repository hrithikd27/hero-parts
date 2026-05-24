import { create } from 'zustand'

interface SearchUiStore {
  query: string
  selectedModel: string
  selectedCategoryId: number | null
  pendingVoice: boolean
  setQuery: (q: string, isVoice?: boolean) => void
  setSelectedModel: (m: string) => void
  setSelectedCategoryId: (id: number | null) => void
  consumeVoice: () => boolean
}

export const useSearchUiStore = create<SearchUiStore>()((set, get) => ({
  query: '',
  selectedModel: 'All Models',
  selectedCategoryId: null,
  pendingVoice: false,

  setQuery: (q, isVoice = false) => set({ query: q, pendingVoice: isVoice }),
  setSelectedModel: (m) => set({ selectedModel: m }),
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),

  // Call once per search trigger — returns whether it was voice, then resets the flag
  consumeVoice: () => {
    const was = get().pendingVoice
    if (was) set({ pendingVoice: false })
    return was
  },
}))
