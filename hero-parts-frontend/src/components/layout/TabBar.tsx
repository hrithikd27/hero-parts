export type TabId = 'search' | 'diagnose' | 'service' | 'cart'

interface Tab {
  id: TabId
  label: string
  icon: string
}

interface Props {
  active: TabId
  cartCount: number
  onChange: (id: TabId) => void
}

const TABS: Tab[] = [
  { id: 'search',   label: 'Search',     icon: '🔍' },
  { id: 'diagnose', label: 'Diagnose',   icon: '🩺' },
  { id: 'service',  label: 'Service',    icon: '🛠️' },
  { id: 'cart',     label: 'Parts List', icon: '📋' },
]

export default function TabBar({ active, cartCount, onChange }: Props) {
  return (
    <nav className="flex bg-white border-b border-gray-200">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors
            ${
              active === tab.id
                ? 'text-hero-red border-b-2 border-hero-red -mb-px'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 border-b-2 border-transparent -mb-px'
            }`}
        >
          <span className="text-base leading-none">{tab.icon}</span>
          {tab.label}
          {tab.id === 'cart' && cartCount > 0 && (
            <span className="bg-hero-red text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none font-bold">
              {cartCount}
            </span>
          )}
        </button>
      ))}
    </nav>
  )
}
