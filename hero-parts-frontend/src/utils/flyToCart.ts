export function flyToCart(fromEl: HTMLElement): void {
  const cartEl = document.getElementById('cart-icon-target')
  if (!cartEl) return

  const from = fromEl.getBoundingClientRect()
  const to   = cartEl.getBoundingClientRect()

  const startX = from.left + from.width  / 2
  const startY = from.top  + from.height / 2
  const endX   = to.left   + to.width    / 2
  const endY   = to.top    + to.height   / 2

  const particle = document.createElement('div')
  particle.style.cssText = `
    position: fixed;
    left: ${startX - 13}px;
    top:  ${startY - 13}px;
    width: 26px; height: 26px;
    background: linear-gradient(135deg, #10b981, #059669);
    border-radius: 50%;
    z-index: 9999;
    pointer-events: none;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; color: white; font-weight: 700;
    box-shadow: 0 2px 14px rgba(16,185,129,0.55);
  `
  particle.textContent = '+'
  document.body.appendChild(particle)

  const dx = endX - startX
  const dy = endY - startY

  particle.animate(
    [
      { transform: 'translate(0px,0px) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.38}px,${dy * 0.22 - 58}px) scale(0.82)`, opacity: 0.88, offset: 0.42 },
      { transform: `translate(${dx}px,${dy}px) scale(0.08)`, opacity: 0 },
    ],
    { duration: 950, easing: 'cubic-bezier(0.2,0.8,0.4,1)', fill: 'forwards' }
  )

  setTimeout(() => {
    document.body.removeChild(particle)
    cartEl.dispatchEvent(new CustomEvent('cart-bump'))
  }, 920)
}
