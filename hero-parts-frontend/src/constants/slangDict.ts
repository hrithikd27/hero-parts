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
  pahiya:                 'tyre',          // Hindi/Marathi for wheel — only tyres in DB
  pahiye:                 'tyre',
  chakka:                 'tyre',
  tiar:                   'tyre',
  tirr:                   'tyre',
  tube:                   'inner tube',
  'front tube':           'inner tube front',
  'rear tube':            'inner tube rear',

  // ── Body / frame ──────────────────────────────────────────────────
  mudgard:                'mudguard',
  fender:                 'mudguard',
  'front fender':         'front mudguard',
  'rear fender':          'rear mudguard',
  'saree guard':          'saree guard',
  'sari guard':           'saree guard',
  'ladies guard':         'saree guard',
  'leg guard':            'saree guard',
  'side cover':           'side panel',
  'sayd panel':           'side panel',

  // ── Fuel system (petcock / tank cap) ─────────────────────────────
  petcock:                'fuel petcock',
  'petrol cock':          'fuel petcock',
  tap:                    'fuel petcock',
  'fuel valve':           'fuel petcock',
  'tank cap':             'fuel tank cap',
  'fuel cap':             'fuel tank cap',

  // ── Engine internals ─────────────────────────────────────────────
  'cam shaft':            'camshaft',
  kamshaft:               'camshaft',
  'valve timing':         'camshaft',
  cdi:                    'CDI unit',
  'cdi box':              'CDI unit',
  'ignition module':      'CDI unit',

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

  // ── Hindi symptom phrases ─────────────────────────────────────────
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

  // ══════════════════════════════════════════════════════════════════
  // MARATHI (Maharashtra)
  // ══════════════════════════════════════════════════════════════════

  // Parts — native script
  'आरसा':               'mirror',
  'साखळी':             'chain',
  'दिवा':               'headlight',
  'चाक':                'tyre',
  'ब्रेक':              'brake shoe',
  'क्लच':               'clutch plate',
  'किक':                'kick starter',
  'हँडल':               'handlebar',
  'गद्दी':              'seat',
  'मडगार्ड':            'mudguard',
  'सायलेन्सर':          'silencer',
  'शॉकर':               'shock absorber',
  'इंडिकेटर':           'indicator',
  'बॅटरी':              'battery',
  'तेल फिल्टर':         'oil filter',

  // Parts — romanized Marathi
  arse:                 'mirror',
  arsa:                 'mirror',
  aarse:                'mirror',
  sakhali:              'chain',
  saakhali:             'chain',
  diva:                 'headlight',
  diwa:                 'headlight',
  chaak:                'tyre',
  klach:                'clutch plate',
  'brake lining marathi': 'brake shoe',

  // Marathi symptom phrases
  'gadi suru hot nahi':       'battery',
  'bike chhalu hot nahi':     'battery',
  'braik lagat nahi':         'brake shoe',
  'break lag naahi':          'brake shoe',
  'diva lagat nahi':          'headlight',
  'light lagat nahi':         'headlight',
  'tel galaw':                'fork seal',
  'tel tapat':                'fork seal',
  'horn vaajat nahi':         'horn',
  'mileage kami':             'carburettor',
  'gear lagat nahi':          'clutch plate',
  'indicator lagat nahi':     'indicator',

  // ══════════════════════════════════════════════════════════════════
  // BENGALI (West Bengal)
  // ══════════════════════════════════════════════════════════════════

  // Parts — native script
  'আয়না':              'mirror',
  'শিকল':               'chain',
  'আলো':                'headlight',
  'চাকা':               'tyre',
  'ব্রেক':              'brake shoe',
  'ক্লাচ':              'clutch plate',
  'ব্যাটারি':           'battery',
  'গদি':                'seat',
  'মাডগার্ড':           'mudguard',
  'সাইলেন্সার':         'silencer',

  // Parts — romanized Bengali
  ayna:                 'mirror',
  aina:                 'mirror',
  aino:                 'mirror',
  shikal:               'chain',
  shikol:               'chain',
  alo:                  'headlight',
  aalo:                 'headlight',
  chaka:                'tyre',
  godi:                 'seat',

  // Bengali symptom phrases
  'gari start hocche na':   'battery',
  'bike chole na':          'battery',
  'brake lagche na':        'brake shoe',
  'brake kaj korcche na':   'brake shoe',
  'aalo jalche na':         'headlight',
  'light jalche na':        'headlight',
  'tel porche':             'fork seal',
  'horn bajche na':         'horn',
  'gear lagche na':         'clutch plate',
  'indicator jalche na':    'indicator',

  // ══════════════════════════════════════════════════════════════════
  // TAMIL (Tamil Nadu)
  // ══════════════════════════════════════════════════════════════════

  // Parts — native script
  'கண்ணாடி':            'mirror',
  'சங்கிலி':            'chain',
  'விளக்கு':            'headlight',
  'டயர்':               'tyre',
  'பிரேக்':             'brake shoe',
  'க்ளட்ச்':            'clutch plate',
  'பேட்டரி':            'battery',
  'எண்ணெய்':            'engine oil',
  'மாட்கார்டு':         'mudguard',

  // Parts — romanized Tamil
  kannadi:              'mirror',
  kannaadi:             'mirror',
  sangiliy:             'chain',
  sangili:              'chain',
  vilakku:              'headlight',
  vilakk:               'headlight',
  ennai:                'engine oil',
  ennei:                'engine oil',

  // Tamil symptom phrases
  'bike start aagalai':         'battery',
  'bike start aavathillai':     'battery',
  'brake pidikalai':            'brake shoe',
  'brake pudikala':             'brake shoe',
  'light ezhalai':              'headlight',
  'light ezhavathillai':        'headlight',
  'horn adicha sound illai':    'horn',
  'gear poda mudiyalai':        'clutch plate',
  'oil leak aaguthu':           'fork seal',

  // ══════════════════════════════════════════════════════════════════
  // KANNADA (Karnataka)
  // ══════════════════════════════════════════════════════════════════

  // Parts — native script
  'ಕನ್ನಡಿ':             'mirror',
  'ಚೈನು':               'chain',
  'ದೀಪ':                'headlight',
  'ಟಯರ್':               'tyre',
  'ಬ್ರೇಕ್':             'brake shoe',
  'ಕ್ಲಚ್':              'clutch plate',
  'ಬ್ಯಾಟರಿ':            'battery',
  'ಎಣ್ಣೆ':              'engine oil',
  'ಶಾಕರ್':              'shock absorber',

  // Parts — romanized Kannada
  kannadiy:             'mirror',
  chainu:               'chain',
  deepa:                'headlight',
  enne:                 'engine oil',

  // Kannada symptom phrases
  'gaadi start aagutilla':    'battery',
  'bike suru aagalla':        'battery',
  'brake haakalla':           'brake shoe',
  'brake work aagalla':       'brake shoe',
  'light baralla':            'headlight',
  'batti baralla':            'headlight',
  'horn hothilla':            'horn',
  'gear haakalla':            'clutch plate',
  'oil sorthide':             'fork seal',
  'tel sorthide':             'fork seal',

  // ══════════════════════════════════════════════════════════════════
  // TELUGU (Andhra Pradesh / Telangana)
  // ══════════════════════════════════════════════════════════════════

  // Parts — native script
  'అద్దం':              'mirror',
  'గొలుసు':             'chain',
  'హెడ్‌లైట్':          'headlight',
  'టైరు':               'tyre',
  'బ్రేక్':             'brake shoe',
  'క్లచ్':              'clutch plate',
  'బ్యాటరీ':            'battery',
  'నూనె':               'engine oil',
  'షాకర్':              'shock absorber',

  // Parts — romanized Telugu
  addam:                'mirror',
  golusu:               'chain',
  golussu:              'chain',
  nune:                 'engine oil',

  // Telugu symptom phrases
  'gaadi start avvadam ledu':     'battery',
  'bike pani cheyyatledu':        'battery',
  'brake paddham ledu':           'brake shoe',
  'brake work avvadam ledu':      'brake shoe',
  'light ravadam ledu':           'headlight',
  'light veliyatledu':            'headlight',
  'horn vokkadam ledu':           'horn',
  'gear padadam ledu':            'clutch plate',
  'oil karisthundi':              'fork seal',
  'tel karisthundi':              'fork seal',
}
