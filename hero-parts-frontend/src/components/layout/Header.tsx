import { useRef, useEffect, useState } from 'react'
import HeroLogo from './HeroLogo'
import SearchBar from '../search/SearchBar'
import ImageSearchModal from '../search/ImageSearchModal'
import { useSearchUiStore } from '../../store/searchUiStore'
import { useCategories } from '../../hooks/useCategories'
import { HERO_MODELS } from '../../constants/models'

interface Props {
  cartCount: number
  showCart: boolean
  onCartToggle: () => void
  onGoToSearch: () => void
}

// Options need explicit dark text so the OS-rendered dropdown list is readable
const optionStyle: React.CSSProperties = { color: '#111827', background: '#ffffff' }

const selectCls = `
  h-[38px] bg-white/15 border border-white/25 text-white text-sm rounded-xl px-3
  outline-none focus:border-hero-red hover:bg-white/25 transition-all
  cursor-pointer appearance-none pr-7
`

const mobileSelectCls = `
  h-[34px] bg-white/15 border border-white/25 text-white text-xs rounded-xl px-2
  outline-none focus:border-hero-red hover:bg-white/25 transition-all
  cursor-pointer appearance-none pr-5
`

export default function Header({ cartCount, showCart, onCartToggle, onGoToSearch }: Props) {
  const { query, selectedModel, selectedCategoryId, setQuery, setSelectedModel, setSelectedCategoryId } = useSearchUiStore()
  const { categories } = useCategories()
  const cartBtnRef = useRef<HTMLButtonElement>(null)
  const [imageModalOpen, setImageModalOpen] = useState(false)

  useEffect(() => {
    const el = cartBtnRef.current
    if (!el) return
    const bump = () => {
      el.animate(
        [
          { transform: 'scale(1) rotate(0deg)' },
          { transform: 'scale(1.4) rotate(-14deg)' },
          { transform: 'scale(1.18) rotate(7deg)' },
          { transform: 'scale(1.05) rotate(-3deg)' },
          { transform: 'scale(1) rotate(0deg)' },
        ],
        { duration: 500, easing: 'ease-out' }
      )
    }
    el.addEventListener('cart-bump', bump)
    return () => el.removeEventListener('cart-bump', bump)
  }, [])

  const searchBarProps = {
    value: query,
    onChange: (v: string) => setQuery(v),
    onSearch: (v: string) => setQuery(v),
    onVoiceResult: (t: string) => setQuery(t, true),
    onCameraClick: () => setImageModalOpen(true),
    placeholder: 'Search parts',
    glassy: true as const,
  }

  const mobileChevron = (
    <svg className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
    </svg>
  )

  // ── Layout: flex-wrap with CSS order ───────────────────────────────────────
  //
  // Mobile  Row 1:  Logo(1) · Spacer(2) · [Dropdowns(3)]
  //         Break:  full-width order-4 div forces row 2
  //         Row 2:  [SearchBar(5)] · Cart(6)
  //
  // Desktop Row 1:  Logo(1) · Spacer(2) · [SearchBar+Dropdowns(3)] · Cart(sm:order-4)
  //         (break div & mobile search are sm:hidden → not in layout)

  return (
    <header
      className="sticky top-0 z-50 px-4 sm:px-5 flex flex-wrap items-center gap-x-3"
      style={{
        background: 'rgba(5, 5, 8, 0.82)',
        backdropFilter: 'blur(28px) saturate(200%)',
        WebkitBackdropFilter: 'blur(28px) saturate(200%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
        boxShadow: '0 1px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* ── order-1: Back button (when in cart view) ── */}
      {showCart && (
        <button
          onClick={onCartToggle}
          className="order-1 py-2.5 flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Back</span>
        </button>
      )}

      {/* ── order-1: Logo + title ── */}
      <div className="order-1 py-2.5 flex items-center gap-2.5 shrink-0">
        <HeroLogo />
        <div className="hidden md:block h-6 w-px bg-white/25" />
        <div className="hidden md:block">
          <p className="text-[13px] font-bold text-white leading-tight tracking-tight">
            {showCart ? 'Parts List' : 'Parts Finder'}
          </p>
          <p className="text-[9px] text-white/50 leading-tight uppercase tracking-widest">Dealer Portal</p>
        </div>
      </div>

      {/* ── order-2: flex-1 spacer (pushes order-3+ to the right on row 1) ── */}
      <div className="order-2 flex-1 py-2.5" />

      {/* ── order-1: Mobile — model + category dropdowns (row 1, beside logo) ── */}
      {!showCart && (
        <div className="sm:hidden order-1 py-2.5 ml-1 flex items-center gap-2">
          <div className="relative shrink-0">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className={mobileSelectCls}
              style={{ minWidth: '80px' }}
            >
              {HERO_MODELS.map((m) => (
                <option key={m} value={m} style={optionStyle}>{m}</option>
              ))}
            </select>
            {mobileChevron}
          </div>
          <div className="relative shrink-0">
            <select
              value={selectedCategoryId ?? ''}
              onChange={(e) => setSelectedCategoryId(e.target.value ? Number(e.target.value) : null)}
              className={mobileSelectCls}
              style={{ minWidth: '95px' }}
            >
              <option value="" style={optionStyle}>All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} style={optionStyle}>{c.name}</option>
              ))}
            </select>
            {mobileChevron}
          </div>
        </div>
      )}

      {/* ── order-3: Desktop — search bar + model + category (row 1) ── */}
      {!showCart && (
        <div className="hidden sm:flex order-3 py-2 items-center gap-2">
          <div className="w-[280px] shrink-0">
            <SearchBar {...searchBarProps} />
          </div>

          <div className="h-5 w-px bg-white/20 mx-1" />

          <div className="relative shrink-0">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className={selectCls}
              style={{ minWidth: '134px' }}
            >
              {HERO_MODELS.map((m) => (
                <option key={m} value={m} style={optionStyle}>{m}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <div className="relative shrink-0">
            <select
              value={selectedCategoryId ?? ''}
              onChange={(e) => setSelectedCategoryId(e.target.value ? Number(e.target.value) : null)}
              className={selectCls}
              style={{ minWidth: '144px' }}
            >
              <option value="" style={optionStyle}>All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} style={optionStyle}>{c.name}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      )}

      {/* ── order-4: Row 2 break — full-width invisible div, mobile only ── */}
      {!showCart && <div className="sm:hidden order-4 w-full" />}

      {/* ── order-5: Mobile — search bar (row 2 left) ── */}
      {!showCart && (
        <div className="sm:hidden order-5 flex-1 min-w-0 pb-2.5">
          <SearchBar {...searchBarProps} />
        </div>
      )}

      {/* ── order-6 (mobile row 2) / sm:order-4 (desktop row 1) — Cart icon ── */}
      <button
        ref={cartBtnRef}
        id="cart-icon-target"
        onClick={onCartToggle}
        className="order-6 sm:order-4 pb-2.5 sm:py-2 sm:ml-3 shrink-0 relative flex items-center justify-center w-11 h-11 rounded-xl hover:bg-white/20 transition-all"
        aria-label="Parts list"
      >
        <svg className="w-[26px] h-[26px] text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
          />
        </svg>
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-hero-red text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none shadow-sm">
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
      </button>

      {imageModalOpen && (
        <ImageSearchModal
          onClose={() => setImageModalOpen(false)}
          onGoToSearch={onGoToSearch}
        />
      )}
    </header>
  )
}
