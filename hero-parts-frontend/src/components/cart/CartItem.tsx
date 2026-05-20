import { useCartStore } from '../../store/cartStore'
import { trackEshopClick } from '../../api/analyticsApi'
import type { CartItem as CartItemType } from '../../types/cart'

interface Props {
  item: CartItemType
}

export default function CartItem({ item }: Props) {
  const removeItem = useCartStore((s) => s.removeItem)
  const isIndicative = !item.part.eshopUrl?.includes('/product/')

  return (
    <div className="bg-white border border-hero-border rounded-xl p-4 flex items-center gap-3 shadow-card">
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 text-sm font-medium truncate">{item.part.name}</p>
        <p className="text-gray-400 text-xs font-mono">{item.part.sku}</p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-hero-red text-sm font-semibold">
          {isIndicative && <span className="text-gray-400 text-xs mr-0.5">~</span>}
          Rs.{(item.part.price * item.qty).toLocaleString('en-IN')}
        </p>
        <p className="text-gray-400 text-xs">
          Rs.{item.part.price.toLocaleString('en-IN')} × {item.qty}
        </p>
      </div>

      <div className="flex gap-2 shrink-0">
        {item.part.eshopUrl && (
          <a
            href={item.part.eshopUrl?.startsWith('http') ? item.part.eshopUrl : `https://shop.heromotocorp.com${item.part.eshopUrl}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEshopClick(item.part.sku, item.part.name, item.part.eshopUrl!)}
            className="text-xs bg-hero-red hover:bg-red-700 text-white px-2.5 py-1 rounded-lg transition-colors"
          >
            Buy
          </a>
        )}
        <button
          onClick={() => removeItem(item.part.sku)}
          className="text-xs text-gray-400 hover:text-red-500 px-2.5 py-1 rounded-lg border border-hero-border hover:border-red-300 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  )
}
