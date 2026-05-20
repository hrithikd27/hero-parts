export const HERO_MODELS = [
  'All Models',
  'Splendor Plus',
  'Splendor+',
  'Super Splendor',
  'HF Deluxe',
  'Passion Pro',
  'Glamour',
  'Glamour Fi',
  'Xtreme 160R',
  'Xtreme 200S',
  'XPulse 200',
  'XPulse 200T',
  'Destini 125',
  'Maestro Edge 125',
  'Pleasure+',
  'Karizma XMR',
  'Mavrick 440',
  'Vida V1',
] as const

export type HeroModel = (typeof HERO_MODELS)[number]
