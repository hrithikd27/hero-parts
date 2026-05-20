import HeroLogo from './HeroLogo'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 shadow-sm">
      <HeroLogo />
      <div className="h-6 w-px bg-gray-200" />
      <div>
        <p className="text-sm font-semibold text-gray-800 leading-tight">Parts Finder</p>
        <p className="text-xs text-gray-400 leading-tight">Dealer Portal</p>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs font-medium text-white bg-hero-red px-3 py-1 rounded-full">
          B2B
        </span>
      </div>
    </header>
  )
}
