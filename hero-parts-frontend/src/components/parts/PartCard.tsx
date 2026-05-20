import { useCartStore } from '../../store/cartStore'
import { CATEGORY_ICONS } from '../../constants/categories'
import { trackEshopClick } from '../../api/analyticsApi'
import type { SearchResultItem } from '../../types/search'

interface Props {
  part: SearchResultItem
  matchScore?: number
}

export default function PartCard({ part, matchScore = 0 }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const cartItems = useCartStore((s) => s.items)
  const inCart = cartItems.some((i) => i.part.sku === part.sku)

  const isIndicative = !part.eshopUrl?.includes('/product/')
  const catIcon = CATEGORY_ICONS[part.categoryName] ?? '🔧'
  const eshopHref = part.eshopUrl?.startsWith('http')
    ? part.eshopUrl
    : `https://shop.heromotocorp.com${part.eshopUrl}`

  const badge =
    matchScore >= 8
      ? { label: 'Strong match', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' }
      : matchScore >= 3
        ? { label: 'Sounds like', cls: 'bg-amber-50 text-amber-700 border border-amber-200' }
        : null

  const models = part.compatibleModels
    ? part.compatibleModels.split(',').map((m) => m.trim()).filter(Boolean)
    : []

  return (
    <div className="bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-150">

      {/* Top accent + category */}
      <div className="h-1 bg-hero-red w-full" />

      <div className="flex flex-col gap-3 p-4 flex-1">

        {/* Name row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm leading-none shrink-0">{catIcon}</span>
              <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{part.name}</h3>
            </div>
            {part.hindiName && (
              <p className="text-xs text-gray-400 mt-0.5 leading-tight">{part.hindiName}</p>
            )}
          </div>

          {/* Price block */}
          <div className="text-right shrink-0 ml-2">
            <p className="text-hero-red font-bold text-base leading-tight">
              {isIndicative && <span className="text-gray-400 text-xs font-normal mr-0.5">~</span>}
              ₹{part.price.toLocaleString('en-IN')}
            </p>
            {part.mrp > 0 && part.mrp !== part.price && (
              <p className="text-gray-400 text-xs line-through leading-tight">
                ₹{part.mrp.toLocaleString('en-IN')}
              </p>
            )}
          </div>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-md">
            {part.sku}
          </span>
          <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-md">
            {part.categoryName}
          </span>
          {part.inStock === false && (
            <span className="bg-red-50 text-red-500 border border-red-200 text-xs px-2 py-0.5 rounded-md font-medium">
              Out of stock
            </span>
          )}
          {badge && (
            <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${badge.cls}`}>
              {badge.label}
            </span>
          )}
        </div>

        {/* Compatible models */}
        {models.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {models.slice(0, 3).map((m) => (
              <span
                key={m}
                className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full leading-tight"
              >
                {m}
              </span>
            ))}
            {models.length > 3 && (
              <span className="text-xs text-gray-400 self-center">+{models.length - 3}</span>
            )}
          </div>
        )}

        {/* Matched alias */}
        {part.matchedAlias && (
          <p className="text-xs text-amber-600 italic leading-tight">
            Matched: &ldquo;{part.matchedAlias}&rdquo;
          </p>
        )}
      </div>

      {/* Action buttons — pinned to bottom */}
      <div className="flex gap-2 px-4 pb-4">
        {part.eshopUrl && (
          <a
            href={eshopHref}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEshopClick(part.sku, part.name, part.eshopUrl!)}
            className="flex-1 text-center text-xs bg-hero-red hover:bg-red-700 text-white py-2 rounded-xl font-semibold transition-colors"
          >
            Buy on eShop →
          </a>
        )}
        <button
          onClick={() => addItem(part)}
          className={`flex-1 text-xs py-2 rounded-xl font-semibold transition-colors border-2
            ${
              inCart
                ? 'border-emerald-400 text-emerald-700 bg-emerald-50'
                : 'border-gray-200 text-gray-600 hover:border-hero-red hover:text-hero-red hover:bg-red-50'
            }`}
        >
          {inCart ? '✓ In List' : '+ Add to List'}
        </button>
      </div>
    </div>
  )
}
