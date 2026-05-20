// Layer 2 — slang → English part name injection
export const SLANG_DICT: Record<string, string> = {

  // ── Ignition / spark ──────────────────────────────────────────────
  masala:                 'spark plug',
  masale:                 'spark plug',
  bujji:                  'spark plug',   // South India
  ngk:                    'spark plug',
  denso:                  'spark plug',
  'plug cap':             'spark plug cap',
  'ht wire':              'spark plug wire',
  'coil wire':            'spark plug wire',
  'ignition coil':        'coil',
  'ht coil':              'coil',

  // ── Engine oil & filters ──────────────────────────────────────────
  tabbdil:                'engine oil',
  mobil:                  'engine oil',
  servo:                  'engine oil',
  castrol:                'engine oil',
  'tel filter':           'oil filter',
  'oil chalni':           'oil filter',
  jali:                   'air filter',
  'hawa filter':          'air filter',

  // ── Brake ─────────────────────────────────────────────────────────
  lining:                 'brake shoe',
  'brake lining':         'brake shoe',
  liner:                  'brake shoe',
  disk:                   'disc brake',
  disc:                   'disc brake',
  rotar:                  'brake disc',
  rotor:                  'brake disc',
  caliper:                'brake caliper',
  'brake pump':           'master cylinder',
  'master cylinder':      'master cylinder',

  // ── Clutch ────────────────────────────────────────────────────────
  fiber:                  'clutch plate',
  fibre:                  'clutch plate',

  // ── Chain / sprocket ──────────────────────────────────────────────
  zanjeer:                'chain',
  patta:                  'chain',         // common in South India
  chakri:                 'chain sprocket',
  chakradant:             'sprocket',
  dant:                   'sprocket',
  tara:                   'sprocket',
  star:                   'sprocket',
  'chain kit':            'chain sprocket',

  // ── Battery & electrical ──────────────────────────────────────────
  batri:                  'battery',
  amaron:                 'battery',
  exide:                  'battery',
  dynamo:                 'alternator',
  stator:                 'stator',
  regulator:              'rectifier regulator',
  rectifar:               'rectifier',
  fuse:                   'fuse',
  relay:                  'relay',
  'kill switch':          'ignition switch',

  // ── Shock / suspension ────────────────────────────────────────────
  shocker:                'shock absorber',
  shokr:                  'shock absorber',
  'fork seal':            'oil seal fork',
  bush:                   'rubber bush',

  // ── Fuel system ───────────────────────────────────────────────────
  carbi:                  'carburettor',
  carburator:             'carburettor',
  'petrol pipe':          'fuel pipe',
  nali:                   'fuel pipe',
  'gas taar':             'throttle cable',
  'accelerator cable':    'throttle cable',
  'gas cable':            'throttle cable',
  acelerator:             'accelerator',

  // ── Silencer / exhaust ────────────────────────────────────────────
  pot:                    'silencer',
  silancer:               'silencer',
  exhost:                 'exhaust',
  muffler:                'silencer',

  // ── Lights ────────────────────────────────────────────────────────
  pilot:                  'tail light',
  batti:                  'headlight',
  disco:                  'indicator',     // South India slang for blinker

  // ── Wheels & tyres ────────────────────────────────────────────────
  rim:                    'wheel rim',
  chakka:                 'wheel',
  taana:                  'spoke',         // spoke in Hindi
  spoke:                  'spoke',
  valve:                  'tyre valve',

  // ── Body / frame ──────────────────────────────────────────────────
  gaddi:                  'seat',
  aaina:                  'mirror',
  saida:                  'mirror',
  handal:                 'handlebar',
  grip:                   'handle grip',
  'rubber grip':          'handle grip',
  footer:                 'footrest',
  'foot peg':             'footrest',
  footpeg:                'footrest',
  'main stand':           'center stand',
  'side stand':           'stand',
  'chain guard':          'chain cover',
  'number plate':         'number plate',
  'seat cover':           'seat',

  // ── Kick starter ─────────────────────────────────────────────────
  kick:                   'kick starter',
  'kick lever':           'kick starter',
  'starter lever':        'kick starter',

  // ── Speedometer ───────────────────────────────────────────────────
  meter:                  'speedometer',
  speedo:                 'speedometer',
  'meter cable':          'speedometer cable',
  'speedo cable':         'speedometer cable',

  // ── Symptom phrases ───────────────────────────────────────────────
  'self nahi aa raha':    'battery',
  'self nahi':            'battery',
  'self start nahi':      'battery',
  'dhuan aa raha':        'silencer',
  'gear nahi lag raha':   'clutch plate',
  'gear nahi':            'clutch plate',
  'sparking nahi':        'spark plug',
  'mileage kharab':       'carburettor',
  'petrol nahi aa raha':  'carburettor',
  'brake nahi lag raha':  'brake shoe',
  'jhakka aata hai':      'shock absorber',
  'tel tapak raha':       'fork seal',
  'aage se tel':          'fork seal',
  'charging nahi':        'rectifier',
  'light nahi':           'headlight',
  'horn nahi':            'horn',
  'meter nahi chalta':    'speedometer',
  'indicator nahi':       'indicator',
  'start nahi hoti':      'battery',
  'miss fire':            'spark plug',
  'misfire':              'spark plug',
}
