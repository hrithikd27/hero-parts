-- ============================================================
--  Hero Parts Platform — Seed Data
-- ============================================================

-- Categories
INSERT IGNORE INTO categories (id, name, description, parent_id) VALUES
(1,  'Engine',             'Engine and internal components',         NULL),
(2,  'Brakes',             'Brake system components',                NULL),
(3,  'Suspension',         'Front and rear suspension parts',        NULL),
(4,  'Electrical',         'Electrical and lighting parts',          NULL),
(5,  'Body & Frame',       'Body panels, frame, and chassis parts',  NULL),
(6,  'Fuel System',        'Carburettor, fuel tank, and filters',    NULL),
(7,  'Transmission',       'Clutch, gearbox, and chain drive',       NULL),
(8,  'Tyres & Wheels',     'Tyres, rims, tubes, and spokes',         NULL),
(9,  'Filters',            'Oil, air, and fuel filters',             1),
(10, 'Gaskets & Seals',    'Engine gaskets and oil seals',           1);

-- Parts
INSERT IGNORE INTO parts (id, sku, name, hindi_name, description, category_id, price, mrp, unit, compatible_models, eshop_url, in_stock, stock_qty) VALUES
(1,  'HH-ENG-001', 'Engine Oil Filter',              'इंजन ऑयल फिल्टर',   'Genuine Hero engine oil filter, spin-on type',                         9,  85.00,  90.00,  'PCS', 'Splendor Plus, Splendor iSmart, Passion Pro, HF Deluxe',   '/parts/HH-ENG-001', TRUE,  150),
(2,  'HH-ENG-002', 'Air Filter Element',             'एयर फिल्टर',         'Foam & paper combo air filter for Hero 100-125cc bikes',                9,  120.00, 130.00, 'PCS', 'Splendor Plus, CD Dawn, HF Deluxe',                        '/parts/HH-ENG-002', TRUE,  200),
(3,  'HH-ENG-003', 'Piston Ring Set',                'पिस्टन रिंग',        'Standard bore piston ring set (3-ring)',                                1,  280.00, 310.00, 'SET', 'Splendor Plus, Splendor iSmart',                           '/parts/HH-ENG-003', TRUE,  60),
(4,  'HH-ENG-004', 'Piston Assembly',                'पिस्टन असेंबली',     'Complete piston with pin and circlips, 52.4 mm std bore',               1,  650.00, 700.00, 'SET', 'Splendor Plus, HF Deluxe',                                 '/parts/HH-ENG-004', TRUE,  40),
(5,  'HH-ENG-005', 'Cylinder Head Gasket',           'हेड गास्केट',        'Cylinder head gasket – engine rebuild kit component',                   10, 90.00,  100.00, 'PCS', 'Splendor Plus, Passion Pro, HF Deluxe',                   '/parts/HH-ENG-005', TRUE,  120),
(6,  'HH-ENG-006', 'Crankshaft Bearing',             'क्रैंकशाफ्ट बियरिंग', 'Main crankshaft bearing – left and right pair',                        1,  350.00, 380.00, 'PAIR','Splendor Plus, Splendor iSmart, Passion Pro',             '/parts/HH-ENG-006', TRUE,  80),
(7,  'HH-BRK-001', 'Front Brake Shoe Set',           'फ्रंट ब्रेक शू',     'Organic compound front drum brake shoe pair',                           2,  180.00, 200.00, 'PAIR','Splendor Plus, HF Deluxe, CD Dawn',                      '/parts/HH-BRK-001', TRUE,  300),
(8,  'HH-BRK-002', 'Rear Brake Shoe Set',            'रियर ब्रेक शू',      'Organic compound rear drum brake shoe pair',                            2,  190.00, 210.00, 'PAIR','Splendor Plus, Passion Pro, HF Deluxe',                  '/parts/HH-BRK-002', TRUE,  280),
(9,  'HH-BRK-003', 'Brake Cable Front',              'ब्रेक तार आगे',      'Stainless steel lined front brake cable',                               2,  95.00,  105.00, 'PCS', 'Splendor Plus, CD Dawn',                                   '/parts/HH-BRK-003', TRUE,  400),
(10, 'HH-BRK-004', 'Brake Cable Rear',               'ब्रेक तार पीछे',     'Stainless steel lined rear brake cable',                                2,  95.00,  105.00, 'PCS', 'Splendor Plus, Passion Pro',                               '/parts/HH-BRK-004', TRUE,  420),
(11, 'HH-SUS-001', 'Front Fork Oil Seal',            'फोर्क सील',          'Rubber oil seal for front telescopic fork – set of 2',                  3,  160.00, 180.00, 'SET', 'Splendor Plus, Passion Pro, Glamour',                      '/parts/HH-SUS-001', TRUE,  200),
(12, 'HH-SUS-002', 'Rear Shock Absorber',            'शॉकर',               'Gas-charged rear mono shock absorber',                                  3,  900.00, 990.00, 'PCS', 'Splendor Plus, HF Deluxe',                                 '/parts/HH-SUS-002', TRUE,  50),
(13, 'HH-SUS-003', 'Front Fork Assembly',            'आगे का कांटा',       'Complete front fork leg assembly with spring',                          3,  1800.00,2000.00,'PCS', 'Splendor Plus',                                             '/parts/HH-SUS-003', FALSE, 0),
(14, 'HH-ELC-001', 'Headlight Bulb 35W',             'हेडलाइट बल्ब',       'HS1 35/35W halogen headlight bulb',                                     4,  65.00,  75.00,  'PCS', 'Splendor Plus, HF Deluxe, CD Dawn, Passion Pro',           '/parts/HH-ELC-001', TRUE,  500),
(15, 'HH-ELC-002', 'Indicator Bulb Amber 10W',       'इंडिकेटर बल्ब',      'BA9s 10W amber indicator bulb',                                         4,  20.00,  25.00,  'PCS', 'All Hero models',                                          '/parts/HH-ELC-002', TRUE,  1000),
(16, 'HH-ELC-003', 'Battery 12V 9Ah MF',             'बैटरी',              'Maintenance-free sealed lead-acid battery 12V 9Ah',                     4,  1200.00,1350.00,'PCS', 'Splendor iSmart, Glamour, Xtreme',                          '/parts/HH-ELC-003', TRUE,  75),
(17, 'HH-ELC-004', 'CDI Unit',                       'सीडीआई यूनिट',       'Capacitor Discharge Ignition module',                                   4,  750.00, 820.00, 'PCS', 'Splendor Plus, HF Deluxe',                                 '/parts/HH-ELC-004', TRUE,  30),
(18, 'HH-ELC-005', 'Spark Plug NGK CR7HSA',          'स्पार्क प्लग',       'NGK CR7HSA genuine replacement spark plug',                             4,  90.00,  100.00, 'PCS', 'Splendor Plus, Passion Pro, HF Deluxe, Glamour',           '/parts/HH-ELC-005', TRUE,  800),
(19, 'HH-BOD-001', 'Saree Guard LH',                 'साड़ी गार्ड बायां',  'Left side painted saree/leg guard panel',                               5,  350.00, 390.00, 'PCS', 'Splendor Plus',                                             '/parts/HH-BOD-001', TRUE,  100),
(20, 'HH-BOD-002', 'Saree Guard RH',                 'साड़ी गार्ड दायां',  'Right side painted saree/leg guard panel',                              5,  350.00, 390.00, 'PCS', 'Splendor Plus',                                             '/parts/HH-BOD-002', TRUE,  100),
(21, 'HH-BOD-003', 'Side Panel LH Black',            'साइड पैनल बायां काला','Left side body panel – gloss black finish',                            5,  420.00, 460.00, 'PCS', 'Splendor Plus, Splendor iSmart',                           '/parts/HH-BOD-003', TRUE,  80),
(22, 'HH-BOD-004', 'Front Mudguard Red',             'आगे का मडगार्ड लाल', 'Front fender / mudguard – hero red colour',                             5,  280.00, 310.00, 'PCS', 'Splendor Plus',                                             '/parts/HH-BOD-004', FALSE, 0),
(23, 'HH-BOD-005', 'Rear Mudguard Black',            'पीछे का मडगार्ड',    'Rear fender mudguard with reflector bracket',                           5,  320.00, 350.00, 'PCS', 'Splendor Plus, HF Deluxe',                                 '/parts/HH-BOD-005', TRUE,  90),
(24, 'HH-FUL-001', 'Carburettor Assembly',           'कार्बोरेटर',         'CV type carburettor assembly with jets',                                 6,  1100.00,1200.00,'PCS', 'Splendor Plus 97cc, HF Deluxe',                            '/parts/HH-FUL-001', TRUE,  35),
(25, 'HH-FUL-002', 'Fuel Tank Cap',                  'टंकी का ढक्कन',      'Chrome fuel tank cap with lock',                                        6,  180.00, 200.00, 'PCS', 'Splendor Plus, Splendor iSmart',                           '/parts/HH-FUL-002', TRUE,  150),
(26, 'HH-FUL-003', 'Fuel Petcock Assembly',          'पेट्रोल कॉक',        'Fuel petcock valve – reserve and main position',                        6,  220.00, 250.00, 'PCS', 'Splendor Plus, Passion Pro, HF Deluxe',                   '/parts/HH-FUL-003', TRUE,  120),
(27, 'HH-TRN-001', 'Clutch Plate Set',               'क्लच प्लेट सेट',     'Fibre and steel clutch plate kit – 5 fibre + 5 steel',                  7,  450.00, 500.00, 'SET', 'Splendor Plus, Passion Pro',                               '/parts/HH-TRN-001', TRUE,  100),
(28, 'HH-TRN-002', 'Drive Chain 428H x 102L',        'चेन',                'Heavy-duty 428H pitch drive chain – 102 links',                         7,  350.00, 390.00, 'PCS', 'Splendor Plus, HF Deluxe, Passion Pro',                   '/parts/HH-TRN-002', TRUE,  200),
(29, 'HH-TRN-003', 'Clutch Cable',                   'क्लच तार',           'Stainless steel lined clutch cable with adjuster',                      7,  110.00, 125.00, 'PCS', 'Splendor Plus, Passion Pro',                               '/parts/HH-TRN-003', TRUE,  300),
(30, 'HH-TYR-001', 'Front Tyre 2.75-18 Tube-Type',  'आगे का टायर',        'MRF Nylogrip Zapper-FX front tyre 2.75-18 42P TT',                      8,  750.00, 820.00, 'PCS', 'Splendor Plus, HF Deluxe, CD Dawn',                       '/parts/HH-TYR-001', TRUE,  80),
(31, 'HH-TYR-002', 'Rear Tyre 3.00-18 Tube-Type',   'पीछे का टायर',       'MRF Nylogrip Zapper-R rear tyre 3.00-18 47P TT',                        8,  900.00, 980.00, 'PCS', 'Splendor Plus, HF Deluxe',                                 '/parts/HH-TYR-002', TRUE,  70),
(32, 'HH-TYR-003', 'Inner Tube Front 2.75-18',       'आगे की ट्यूब',       'Natural rubber inner tube for front tyre',                              8,  120.00, 135.00, 'PCS', 'Splendor Plus, HF Deluxe, CD Dawn',                       '/parts/HH-TYR-003', TRUE,  200),
(33, 'HH-TYR-004', 'Inner Tube Rear 3.00-18',        'पीछे की ट्यूब',      'Natural rubber inner tube for rear tyre',                               8,  130.00, 145.00, 'PCS', 'Splendor Plus, HF Deluxe',                                 '/parts/HH-TYR-004', TRUE,  190),
(34, 'HH-ENG-007', 'Engine Oil 10W-30 1L',           'इंजन ऑयल',           'Hero Genuine 4-stroke engine oil 10W-30 – 1 Litre',                     1,  280.00, 300.00, 'BTL', 'All Hero 4-stroke models',                                  '/parts/HH-ENG-007', TRUE,  500),
(35, 'HH-ENG-008', 'Camshaft',                       'कैमशाफ्ट',           'Single overhead camshaft – OEM specification',                          1,  1400.00,1550.00,'PCS', 'Splendor Plus, Splendor iSmart',                           '/parts/HH-ENG-008', TRUE,  20);

-- Search Aliases (Hindi names, slang, phonetic, symptoms, colour)
INSERT IGNORE INTO search_aliases (part_id, alias, alias_type, language) VALUES
-- Engine Oil Filter
(1, 'tel filter',       'SLANG',    'hi'),
(1, 'oil fliter',       'PHONETIC', 'hi'),
(1, 'tel ka filter',    'HINDI',    'hi'),
(1, 'oil chalni',       'SLANG',    'hi'),
(1, 'engine filter',    'SLANG',    'en'),
-- Air Filter
(2, 'hawa filter',      'HINDI',    'hi'),
(2, 'air fliter',       'PHONETIC', 'en'),
(2, 'air philthar',     'PHONETIC', 'hi'),
(2, 'saans filter',     'SLANG',    'hi'),
(2, 'foam filter',      'SLANG',    'en'),
-- Piston Ring Set
(3, 'piston ring',      'SLANG',    'en'),
(3, 'ring set',         'SLANG',    'en'),
(3, 'pistn ring',       'PHONETIC', 'hi'),
(3, 'engine ring',      'SLANG',    'en'),
-- Piston Assembly
(4, 'piston',           'SLANG',    'en'),
(4, 'pistn',            'PHONETIC', 'hi'),
(4, 'dhakkan engine',   'SLANG',    'hi'),
-- Cylinder Head Gasket
(5, 'head gasket',      'SLANG',    'en'),
(5, 'hed gasket',       'PHONETIC', 'en'),
(5, 'sar gasket',       'SLANG',    'hi'),
(5, 'head joint',       'SLANG',    'en'),
(5, 'top gasket',       'SLANG',    'en'),
(5, 'engine leak repair', 'SYMPTOM', 'en'),
-- Crankshaft Bearing
(6, 'crank bearing',    'SLANG',    'en'),
(6, 'main bearing',     'SLANG',    'en'),
(6, 'crank beering',    'PHONETIC', 'en'),
(6, 'engine biyring',   'PHONETIC', 'hi'),
-- Front Brake Shoe
(7, 'brake shoe',       'SLANG',    'en'),
(7, 'brek shoe',        'PHONETIC', 'hi'),
(7, 'agla brake shoe',  'HINDI',    'hi'),
(7, 'brake pads',       'SLANG',    'en'),
(7, 'brake nahi lag raha', 'SYMPTOM', 'hi'),
-- Rear Brake Shoe
(8, 'rear brake',       'SLANG',    'en'),
(8, 'pichla brake',     'HINDI',    'hi'),
(8, 'pichle brake shoe', 'HINDI',   'hi'),
(8, 'brek pads rear',   'PHONETIC', 'en'),
-- Front Brake Cable
(9, 'brake wire front', 'SLANG',    'en'),
(9, 'agla brake taar',  'HINDI',    'hi'),
(9, 'brake cable',      'SLANG',    'en'),
-- Rear Brake Cable
(10,'brake wire rear',  'SLANG',    'en'),
(10,'pichla brake taar','HINDI',    'hi'),
-- Front Fork Oil Seal
(11,'fork seal',        'SLANG',    'en'),
(11,'tel seal fork',    'HINDI',    'hi'),
(11,'fork oil seel',    'PHONETIC', 'en'),
(11,'fork leak',        'SYMPTOM',  'en'),
(11,'aage se tel tapakna','SYMPTOM','hi'),
-- Rear Shock Absorber
(12,'shocker',          'SLANG',    'en'),
(12,'shock absorber',   'SLANG',    'en'),
(12,'shokr',            'PHONETIC', 'hi'),
(12,'rear shocker',     'SLANG',    'en'),
(12,'jhakka aata hai',  'SYMPTOM',  'hi'),
(12,'rear suspension',  'SLANG',    'en'),
-- Front Fork Assembly
(13,'front fork',       'SLANG',    'en'),
(13,'agla kanta',       'HINDI',    'hi'),
(13,'front suspension', 'SLANG',    'en'),
(13,'fork assembly',    'SLANG',    'en'),
-- Headlight Bulb
(14,'headlight',        'SLANG',    'en'),
(14,'head light bulb',  'SLANG',    'en'),
(14,'headlayt bulb',    'PHONETIC', 'hi'),
(14,'batti aage',       'HINDI',    'hi'),
(14,'light nahi jal rahi', 'SYMPTOM', 'hi'),
-- Indicator Bulb
(15,'indicator bulb',   'SLANG',    'en'),
(15,'indicator batti',  'HINDI',    'hi'),
(15,'blinker bulb',     'SLANG',    'en'),
(15,'dikhavni batti',   'SLANG',    'hi'),
-- Battery
(16,'battery',          'SLANG',    'en'),
(16,'batri',            'PHONETIC', 'hi'),
(16,'self start nahi',  'SYMPTOM',  'hi'),
(16,'battery down',     'SYMPTOM',  'en'),
(16,'12v battery',      'SLANG',    'en'),
-- CDI Unit
(17,'cdi',              'SLANG',    'en'),
(17,'ignition module',  'SLANG',    'en'),
(17,'start nahi hona',  'SYMPTOM',  'hi'),
(17,'cdi box',          'SLANG',    'en'),
-- Spark Plug
(18,'spark plug',       'SLANG',    'en'),
(18,'sparkplug',        'SLANG',    'en'),
(18,'spark plg',        'PHONETIC', 'en'),
(18,'sparking nahi',    'SYMPTOM',  'hi'),
(18,'plug',             'SLANG',    'en'),
(18,'NGK plug',         'SLANG',    'en'),
-- Saree Guard LH
(19,'saree guard',      'SLANG',    'en'),
(19,'sari guard',       'PHONETIC', 'hi'),
(19,'leg guard left',   'SLANG',    'en'),
(19,'ladies guard',     'SLANG',    'en'),
-- Saree Guard RH
(20,'saree guard right','SLANG',    'en'),
(20,'sari guard daaya', 'HINDI',    'hi'),
-- Side Panel Black
(21,'side panel',       'SLANG',    'en'),
(21,'sayd panel',       'PHONETIC', 'hi'),
(21,'side cover',       'SLANG',    'en'),
(21,'kaala side panel', 'COLOR',    'hi'),
-- Front Mudguard Red
(22,'mudguard red',     'COLOR',    'en'),
(22,'lal mudguard',     'COLOR',    'hi'),
(22,'front fender',     'SLANG',    'en'),
(22,'aage ka mudgard',  'HINDI',    'hi'),
(22,'red fender',       'COLOR',    'en'),
-- Rear Mudguard Black
(23,'rear mudguard',    'SLANG',    'en'),
(23,'piche ka mudguard','HINDI',    'hi'),
(23,'rear fender',      'SLANG',    'en'),
-- Carburettor
(24,'carburettor',      'SLANG',    'en'),
(24,'carburetor',       'SLANG',    'en'),
(24,'carbi',            'SLANG',    'en'),
(24,'carburetter',      'PHONETIC', 'en'),
(24,'carbrate',         'PHONETIC', 'hi'),
(24,'petrol nahi aa raha','SYMPTOM','hi'),
(24,'mileage kharab',   'SYMPTOM',  'hi'),
-- Fuel Tank Cap
(25,'tank cap',         'SLANG',    'en'),
(25,'petrol tank dhakkan','HINDI',  'hi'),
(25,'fuel cap',         'SLANG',    'en'),
-- Petcock
(26,'petcock',          'SLANG',    'en'),
(26,'petrol cock',      'SLANG',    'en'),
(26,'tap',              'SLANG',    'hi'),
(26,'fuel valve',       'SLANG',    'en'),
(26,'petrol band karne wala','HINDI','hi'),
-- Clutch Plate Set
(27,'clutch plate',     'SLANG',    'en'),
(27,'cluch plate',      'PHONETIC', 'hi'),
(27,'clutch kit',       'SLANG',    'en'),
(27,'clutch slip',      'SYMPTOM',  'en'),
(27,'clutch phisalta hai','SYMPTOM','hi'),
-- Drive Chain
(28,'chain',            'SLANG',    'en'),
(28,'drive chain',      'SLANG',    'en'),
(28,'chein',            'PHONETIC', 'hi'),
(28,'428 chain',        'SLANG',    'en'),
-- Clutch Cable
(29,'clutch wire',      'SLANG',    'en'),
(29,'clutch taar',      'HINDI',    'hi'),
(29,'cluch cable',      'PHONETIC', 'hi'),
-- Front Tyre
(30,'front tyre',       'SLANG',    'en'),
(30,'aage ka tyre',     'HINDI',    'hi'),
(30,'2.75 tyre',        'SLANG',    'en'),
(30,'agla tyre',        'HINDI',    'hi'),
-- Rear Tyre
(31,'rear tyre',        'SLANG',    'en'),
(31,'pichla tyre',      'HINDI',    'hi'),
(31,'3.00 tyre',        'SLANG',    'en'),
-- Front Tube
(32,'front tube',       'SLANG',    'en'),
(32,'agla tube',        'HINDI',    'hi'),
(32,'inner tube front', 'SLANG',    'en'),
-- Rear Tube
(33,'rear tube',        'SLANG',    'en'),
(33,'pichla tube',      'HINDI',    'hi'),
-- Engine Oil
(34,'engine oil',       'SLANG',    'en'),
(34,'mobil',            'SLANG',    'en'),
(34,'tel',              'HINDI',    'hi'),
(34,'10w30',            'SLANG',    'en'),
(34,'motor oil',        'SLANG',    'en'),
-- Camshaft
(35,'cam shaft',        'SLANG',    'en'),
(35,'camshaft',         'SLANG',    'en'),
(35,'kamshaft',         'PHONETIC', 'hi'),
(35,'valve timing',     'SLANG',    'en'),
-- Spark Plug — North/South India slang
(18,'masala',           'SLANG',    'hi'),
(18,'masale',           'SLANG',    'hi'),
(18,'bujji',            'SLANG',    'hi'),
(18,'denso',            'SLANG',    'en'),
-- Brake Shoe — slang
(7, 'lining',           'SLANG',    'en'),
(7, 'brake lining',     'SLANG',    'en'),
(8, 'lining',           'SLANG',    'en'),
(8, 'brake lining',     'SLANG',    'en'),
-- Engine Oil — brand slang
(34,'servo',            'SLANG',    'en'),
(34,'castrol',          'SLANG',    'en'),
(34,'tabbdil',          'SLANG',    'hi'),
-- Battery — brand slang
(16,'amaron',           'SLANG',    'en'),
(16,'exide',            'SLANG',    'en'),
-- Clutch Plate — slang/symptom
(27,'fiber',            'SLANG',    'en'),
(27,'fibre',            'SLANG',    'en'),
(27,'gear nahi lag raha','SYMPTOM', 'hi'),
(27,'gear nahi',        'SYMPTOM',  'hi'),
-- Air Filter — slang
(2, 'jali',             'SLANG',    'hi'),
-- Drive Chain — slang
(28,'zanjeer',          'SLANG',    'hi'),
(28,'chakri',           'SLANG',    'hi'),
(28,'chakradant',       'SLANG',    'hi'),
(28,'tara',             'SLANG',    'hi'),
(28,'star sprocket',    'SLANG',    'en');

-- Dealers
INSERT IGNORE INTO dealers (id, dealer_code, name, contact_name, phone, email, city, state, pincode, active) VALUES
(1, 'DL-DEL-001', 'Hero Motors Delhi Central',      'Ramesh Gupta',   '9810001001', 'delhi.central@hero.com',   'New Delhi',    'Delhi',          '110001', TRUE),
(2, 'DL-MUM-001', 'Hero MotoCorp Mumbai West',      'Suresh Patil',   '9820001002', 'mumbai.west@hero.com',     'Mumbai',       'Maharashtra',    '400001', TRUE),
(3, 'DL-BLR-001', 'Hero Service Bengaluru South',   'Anil Kumar',     '9830001003', 'blr.south@hero.com',       'Bengaluru',    'Karnataka',      '560001', TRUE),
(4, 'DL-HYD-001', 'Hero MotoCorp Hyderabad',        'Prasad Rao',     '9840001004', 'hyd.main@hero.com',        'Hyderabad',    'Telangana',      '500001', TRUE),
(5, 'DL-CHE-001', 'Hero Parts Chennai North',       'Murugan S',      '9850001005', 'che.north@hero.com',       'Chennai',      'Tamil Nadu',     '600001', TRUE),
(6, 'DL-KOL-001', 'Hero MotoCorp Kolkata East',     'Bikash Dey',     '9860001006', 'kol.east@hero.com',        'Kolkata',      'West Bengal',    '700001', TRUE),
(7, 'DL-JPR-001', 'Hero Service Jaipur',            'Mohan Sharma',   '9870001007', 'jpr.main@hero.com',        'Jaipur',       'Rajasthan',      '302001', TRUE),
(8, 'DL-LKO-001', 'Hero MotoCorp Lucknow',          'Sanjay Verma',   '9880001008', 'lko.main@hero.com',        'Lucknow',      'Uttar Pradesh',  '226001', TRUE);
