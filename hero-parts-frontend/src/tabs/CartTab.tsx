import { useState } from 'react'
import CartItemComponent from '../components/cart/CartItem'
import { useCartStore } from '../store/cartStore'

export default function CartTab() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total)
  const clearCart = useCartStore((s) => s.clearCart)
  const copyList = useCartStore((s) => s.copyList)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(copyList())
    } catch {
      const el = document.createElement('textarea')
      el.value = copyList()
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
        <span className="text-4xl">📋</span>
        <p className="text-sm">Parts list is empty.</p>
        <p className="text-xs text-gray-300">Add parts from the Search tab.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900 font-semibold">Parts List ({items.length})</h2>
        <button
          onClick={clearCart}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <CartItemComponent key={item.part.sku} item={item} />
        ))}
      </div>

      <div className="bg-white border border-hero-border rounded-xl p-4 mt-2 space-y-3 shadow-card">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 text-sm">Estimated total</span>
          <span className="text-hero-red font-bold text-base">
            ~Rs.{total().toLocaleString('en-IN')}
          </span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          Prices are indicative and may vary. Always verify the final price on Hero eShop before purchase.
        </p>
        <button
          onClick={handleCopy}
          className="w-full bg-gray-50 border border-hero-border hover:border-hero-red text-gray-700 hover:text-hero-red text-sm py-2 rounded-xl font-medium transition-colors"
        >
          {copied ? '✓ Copied to clipboard!' : '📋 Copy parts list'}
        </button>
      </div>
    </div>
  )
}
