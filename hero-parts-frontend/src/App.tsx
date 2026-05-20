import { useState } from 'react'
import Header from './components/layout/Header'
import TabBar, { type TabId } from './components/layout/TabBar'
import SearchTab from './tabs/SearchTab'
import DiagnoseTab from './tabs/DiagnoseTab'
import ServiceTab from './tabs/ServiceTab'
import CartTab from './tabs/CartTab'
import { useCartStore } from './store/cartStore'

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('search')
  const cartCount = useCartStore((s) => s.items.length)

  return (
    <div className="min-h-screen bg-hero-bg flex flex-col">
      <div className="sticky top-0 z-50">
        <Header />
        <TabBar active={activeTab} cartCount={cartCount} onChange={setActiveTab} />
      </div>
      <main className="flex-1 max-w-screen-2xl w-full mx-auto">
        {activeTab === 'search' && <SearchTab />}
        {activeTab === 'diagnose' && <DiagnoseTab />}
        {activeTab === 'service' && <ServiceTab />}
        {activeTab === 'cart' && <CartTab />}
      </main>
    </div>
  )
}
