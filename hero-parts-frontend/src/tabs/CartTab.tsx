import { useState } from 'react'
import CartItemComponent from '../components/cart/CartItem'
import { useCartStore } from '../store/cartStore'

interface Props {
  onBack?: () => void
}

export default function CartTab({ onBack }: Props) {
  const items     = useCartStore((s) => s.items)
  const total     = useCartStore((s) => s.total)
  const clearCart = useCartStore((s) => s.clearCart)
  const copyList  = useCartStore((s) => s.copyList)
  const [copied, setCopied]   = useState(false)

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
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-9 h-9 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
            />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-700">Your parts list is empty</p>
          <p className="text-sm text-gray-400 mt-1">Add parts from the search screen.</p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-2 px-6 py-2.5 bg-hero-red text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors"
          >
            Search Parts
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900 font-bold text-base">Parts List <span className="text-gray-400 font-normal text-sm">({items.length})</span></h2>
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

      <div className="bg-white border border-gray-100 rounded-2xl p-5 mt-2 space-y-4 shadow-card">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 text-sm font-medium">Estimated total</span>
          <span className="text-hero-red font-bold text-xl">
            ₹{total().toLocaleString('en-IN')}
          </span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          Prices are indicative. Verify the final price on Hero eShop before placing an order.
        </p>
        <button
          onClick={handleCopy}
          className="w-full bg-gray-50 border-2 border-gray-200 hover:border-hero-red text-gray-700 hover:text-hero-red text-sm py-2.5 rounded-xl font-semibold transition-colors"
        >
          {copied ? '✓ Copied to clipboard!' : 'Copy parts list'}
        </button>
      </div>
    </div>
  )
}
