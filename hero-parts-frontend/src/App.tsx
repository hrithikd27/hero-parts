import { useState, useEffect } from 'react'
import Header from './components/layout/Header'
import SearchTab from './tabs/SearchTab'
import CartTab from './tabs/CartTab'
import { useCartStore } from './store/cartStore'

function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="group fixed bottom-5 right-4 sm:bottom-6 sm:right-5 z-50 flex items-center gap-0 bg-gray-900/90 backdrop-blur-sm text-white rounded-full shadow-lg border border-white/10 hover:bg-hero-red hover:border-hero-red transition-all duration-200 px-3 py-2.5 overflow-hidden"
    >
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
      </svg>
      <span className="text-xs font-medium max-w-0 overflow-hidden group-hover:max-w-[72px] group-hover:ml-1.5 transition-all duration-250 whitespace-nowrap">
        Back to top
      </span>
    </button>
  )
}

export default function App() {
  const [showCart, setShowCart] = useState(false)
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0))

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col">
      <Header
        cartCount={cartCount}
        showCart={showCart}
        onCartToggle={() => setShowCart((v) => !v)}
        onGoToSearch={() => setShowCart(false)}
      />
      <main className="flex-1 max-w-screen-2xl w-full mx-auto">
        {showCart ? <CartTab onBack={() => setShowCart(false)} /> : <SearchTab />}
      </main>
      <BackToTop />
    </div>
  )
}
