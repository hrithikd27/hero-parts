import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '../types/cart'
import type { SearchResultItem } from '../types/search'

interface CartStore {
  items: CartItem[]
  addItem: (part: SearchResultItem) => void
  removeItem: (sku: string) => void
  clearCart: () => void
  total: () => number
  copyList: () => string
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (part) =>
        set((state) => {
          const existing = state.items.find((i) => i.part.sku === part.sku)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.part.sku === part.sku ? { ...i, qty: i.qty + 1 } : i
              ),
            }
          }
          return { items: [...state.items, { part, qty: 1 }] }
        }),

      removeItem: (sku) =>
        set((state) => ({ items: state.items.filter((i) => i.part.sku !== sku) })),

      clearCart: () => set({ items: [] }),

      total: () => get().items.reduce((sum, i) => sum + i.part.price * i.qty, 0),

      copyList: () => {
        const lines = get().items.map(
          (i) => `${i.part.name} | SKU: ${i.part.sku} | Rs.${i.part.price} x${i.qty}`
        )
        lines.push(`\nTotal (estimate): Rs.${get().total()}`)
        lines.push('Verify final prices at shop.heromotocorp.com')
        return lines.join('\n')
      },
    }),
    { name: 'hero-parts-cart' }
  )
)
