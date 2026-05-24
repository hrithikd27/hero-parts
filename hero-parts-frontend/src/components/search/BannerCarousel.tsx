import { useState, useEffect, useRef } from 'react'

const BANNERS = [
  {
    headline: 'OEM Parts. Guaranteed Fit.',
    sub: 'Genuine Hero parts for every model.',
    badge: 'Hero MotoCorp',
    imageUrl: 'https://heromotos.com.ht/wp-content/uploads/2026/01/1-scaled.jpg',
    imagePosition: '60% 58%',
    gradientFrom: '#cc0000',
    gradientTo: '#7f0000',
  },
  {
    headline: 'Built to Perform.',
    sub: 'Race-proven parts. Zero compromise.',
    badge: 'Hero MotoSports',
    imageUrl: 'https://heromotos.com.ht/wp-content/uploads/2026/01/4-scaled.jpg',
    imagePosition: '15% 70%',
    gradientFrom: '#0f172a',
    gradientTo: '#1e3a5f',
  },
  {
    headline: '5,000+ Parts. In Stock.',
    sub: 'Find it. Order it. Same day.',
    badge: 'Live Stock',
    imageUrl: 'https://heromotos.com.ht/wp-content/uploads/2026/01/2.jpg',
    imagePosition: 'center 88%',
    gradientFrom: '#78350f',
    gradientTo: '#1c1917',
  },
]

const INTERVAL = 2000

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (paused) { if (timerRef.current) clearInterval(timerRef.current); return }
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % BANNERS.length), INTERVAL)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [paused])

  return (
    <div
      className="relative overflow-hidden select-none h-[200px] sm:h-[360px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * (100 / BANNERS.length)}%)`, width: `${BANNERS.length * 100}%` }}
      >
        {BANNERS.map((b, i) => (
          <div
            key={i}
            className="relative flex items-end overflow-hidden"
            style={{ width: `${100 / BANNERS.length}%` }}
          >
            {b.imageUrl && (
              <img
                src={b.imageUrl}
                alt={b.headline}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: b.imagePosition }}
              />
            )}

            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: b.imageUrl
                  ? 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.30) 52%, rgba(0,0,0,0.04) 100%)'
                  : `linear-gradient(135deg, ${b.gradientFrom}, ${b.gradientTo})`,
              }}
            />

            {/* Text — bottom-left */}
            <div className="relative z-10 w-full px-4 pb-4 sm:px-7 sm:pb-7">
              <h2
                className="font-extrabold leading-tight drop-shadow-md text-[1.05rem] sm:text-[1.45rem]"
                style={{ color: '#ffffff', textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}
              >
                {b.headline}
              </h2>
              <p
                className="mt-0.5 sm:mt-1 leading-snug max-w-[180px] sm:max-w-[240px] drop-shadow text-[0.72rem] sm:text-[0.82rem]"
                style={{ color: 'rgba(255,255,255,0.82)', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
              >
                {b.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-3.5 right-5 flex items-center gap-2">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Progress bar — no track background to avoid divider line */}
      {!paused && (
        <div className="absolute bottom-0 left-0 h-[3px] w-full">
          <div
            key={`${current}-bar`}
            className="h-full bg-white/60"
            style={{ animation: `progress ${INTERVAL}ms linear forwards` }}
          />
        </div>
      )}
    </div>
  )
}
