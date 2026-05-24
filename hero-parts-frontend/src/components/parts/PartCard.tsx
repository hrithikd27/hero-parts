import { useRef } from 'react'
import { useCartStore } from '../../store/cartStore'
import { CATEGORY_ICONS } from '../../constants/categories'
import { trackEshopClick } from '../../api/analyticsApi'
import { flyToCart } from '../../utils/flyToCart'
import type { SearchResultItem } from '../../types/search'

interface Props {
  part: SearchResultItem
  matchScore?: number
}

export default function PartCard({ part, matchScore = 0 }: Props) {
  const addItem       = useCartStore((s) => s.addItem)
  const decrementItem = useCartStore((s) => s.decrementItem)
  const cartItems     = useCartStore((s) => s.items)
  const cartItem      = cartItems.find((i) => i.part.sku === part.sku)
  const inCart        = !!cartItem
  const addBtnRef     = useRef<HTMLButtonElement>(null)

  function handleAdd() {
    addItem(part)
    if (addBtnRef.current) flyToCart(addBtnRef.current)
  }

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
    <div className="group bg-white border border-gray-100 rounded-2xl flex flex-col overflow-hidden shadow-card hover:shadow-card-hover hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200">

      {/* Top accent bar */}
      <div className="h-[3px] bg-gradient-to-r from-hero-red to-rose-400 w-full" />

      {/* Image or placeholder */}
      <div className="relative bg-gray-50 border-b border-gray-100 flex items-center justify-center overflow-hidden" style={{ height: '140px' }}>
        {part.imageUrl ? (
          <img
            src={part.imageUrl}
            alt={part.name}
            decoding="async"
            className="object-contain w-full h-full p-3 group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none' }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 opacity-25">
            <span className="text-4xl leading-none">{catIcon}</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">{part.categoryName}</span>
          </div>
        )}

        {/* Out of stock overlay */}
        {part.inStock === false && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs font-semibold text-red-500 bg-white border border-red-200 px-2 py-0.5 rounded-full shadow-sm">
              Out of Stock
            </span>
          </div>
        )}

        {/* Match badge */}
        {badge && (
          <span className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full font-semibold ${badge.cls}`}>
            {badge.label}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-3 flex-1">

        {/* Category pill */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full leading-tight">
            {catIcon} {part.categoryName}
          </span>
          <span className="font-mono text-[10px] text-gray-400 ml-auto">{part.sku}</span>
        </div>

        {/* Part name */}
        <div>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{part.name}</h3>
          {part.hindiName && (
            <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{part.hindiName}</p>
          )}
        </div>

        {/* Compatible models */}
        {models.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {models.slice(0, 2).map((m) => (
              <span
                key={m}
                className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-full leading-tight"
              >
                {m}
              </span>
            ))}
            {models.length > 2 && (
              <span className="text-[10px] text-gray-400 self-center">+{models.length - 2}</span>
            )}
          </div>
        )}

        {/* Matched alias */}
        {part.matchedAlias && (
          <p className="text-[10px] text-amber-600 italic leading-tight">
            Matched: &ldquo;{part.matchedAlias}&rdquo;
          </p>
        )}

        <div className="flex-1" />

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-hero-red font-bold text-lg leading-none">
            {isIndicative && <span className="text-gray-400 text-xs font-normal mr-0.5">~</span>}
            ₹{part.price.toLocaleString('en-IN')}
          </span>
          {part.mrp > 0 && part.mrp !== part.price && (
            <span className="text-gray-400 text-xs line-through leading-none">
              ₹{part.mrp.toLocaleString('en-IN')}
            </span>
          )}
          {part.mrp > part.price && (
            <span className="text-emerald-600 text-[10px] font-semibold ml-auto">
              {Math.round(((part.mrp - part.price) / part.mrp) * 100)}% off
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 px-3 pb-3">
        {part.eshopUrl && (
          <a
            href={eshopHref}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEshopClick(part.sku, part.name, part.eshopUrl!)}
            className="flex-1 text-center text-xs bg-hero-red hover:bg-red-700 active:bg-red-800 text-white py-2.5 rounded-xl font-semibold transition-colors whitespace-nowrap"
          >
            <span className="hidden sm:inline">Buy on </span>eShop →
          </a>
        )}
        {inCart ? (
          <div className="flex-1 flex items-center justify-between border-2 border-emerald-400 bg-emerald-50 rounded-xl px-1.5 h-9">
            <button
              onClick={() => decrementItem(part.sku)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-lg font-bold text-emerald-600 hover:bg-emerald-100 hover:text-red-500 transition-colors leading-none"
              aria-label="Remove one"
            >
              −
            </button>
            <span className="text-sm font-bold text-emerald-700 tabular-nums select-none min-w-[20px] text-center">
              {cartItem!.qty}
            </span>
            <button
              ref={addBtnRef}
              onClick={handleAdd}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-lg font-bold text-emerald-600 hover:bg-emerald-100 hover:text-emerald-900 transition-colors leading-none"
              aria-label="Add one more"
            >
              +
            </button>
          </div>
        ) : (
          <button
            ref={addBtnRef}
            onClick={handleAdd}
            className="flex-1 text-xs py-2.5 rounded-xl font-semibold transition-all border-2 border-gray-200 text-gray-600 hover:border-hero-red hover:text-hero-red hover:bg-red-50 active:scale-95 whitespace-nowrap"
          >
            + Add<span className="hidden sm:inline"> to List</span>
          </button>
        )}
      </div>
    </div>
  )
}
