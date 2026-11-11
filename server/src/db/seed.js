import db from './index.js';

console.log('Seeding database with hardware components and 20 heavy games...');

// 1. Categories
const categories = [
  { slug: 'case', name_ru: 'Корпуса', name_en: 'Cases', icon: 'Box', sort_order: 1 },
  { slug: 'cpu', name_ru: 'Процессоры', name_en: 'Processors', icon: 'Cpu', sort_order: 2 },
  { slug: 'motherboard', name_ru: 'Материнские платы', name_en: 'Motherboards', icon: 'Layers', sort_order: 3 },
  { slug: 'cooler', name_ru: 'Кулеры и СЖО', name_en: 'Coolers & AIO', icon: 'Fan', sort_order: 4 },
  { slug: 'ram', name_ru: 'Оперативная память', name_en: 'RAM Memory', icon: 'MemoryStick', sort_order: 5 },
  { slug: 'gpu', name_ru: 'Видеокарты', name_en: 'Graphics Cards', icon: 'Tv', sort_order: 6 },
  { slug: 'storage', name_ru: 'Накопители (SSD/HDD)', name_en: 'Storage (SSD/HDD)', icon: 'HardDrive', sort_order: 7 },
  { slug: 'psu', name_ru: 'Блоки питания', name_en: 'Power Supplies', icon: 'Zap', sort_order: 8 }
];

const insertCategory = db.prepare(`
  INSERT OR REPLACE INTO categories (slug, name_ru, name_en, icon, sort_order)
  VALUES (@slug, @name_ru, @name_en, @icon, @sort_order)
`);

categories.forEach(cat => insertCategory.run(cat));

// 2. Hardware Products
// Prices in Uzbekistani Som (UZS): 1 USD ~ 12,850 UZS
const products = [
  // --- CASES ---
  {
    category_slug: 'case',
    name_ru: 'Lian Li O11 Dynamic EVO RGB Black',
    name_en: 'Lian Li O11 Dynamic EVO RGB Black',
    brand: 'Lian Li',
    model: 'O11D EVO RGB',
    price_uzs: 2650000,
    in_stock: 8,
    image_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Премиальный двухкамерный корпус с закаленным стеклом и настраиваемой подсветкой ARGB. Вмещает видеокарты до 455 мм и СЖО до 420 мм.',
    description_en: 'Premium dual-chamber chassis with tempered glass and customizable ARGB lighting. Fits GPUs up to 455mm and AIO up to 420mm.',
    form_factor: 'ATX',
    length_mm: 455, // max GPU length
    height_mm: 167, // max cooler height
    specs_json: JSON.stringify({ form_factors: ['ATX', 'Micro-ATX', 'Mini-ITX'], max_gpu: 455, max_cooler: 167, glass: true, rgb: true })
  },
  {
    category_slug: 'case',
    name_ru: 'Montech Sky Two Dual Glass Black',
    name_en: 'Montech Sky Two Dual Glass Black',
    brand: 'Montech',
    model: 'Sky Two',
    price_uzs: 1350000,
    in_stock: 14,
    image_url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Панорамный аквариумный корпус с 4 предустановленными ARGB PWM вентиляторами и отличным охлаждением.',
    description_en: 'Panoramic aquarium chassis with 4 pre-installed ARGB PWM fans and superior cooling flow.',
    form_factor: 'ATX',
    length_mm: 400,
    height_mm: 168,
    specs_json: JSON.stringify({ form_factors: ['ATX', 'Micro-ATX', 'Mini-ITX'], max_gpu: 400, max_cooler: 168, glass: true, rgb: true })
  },
  {
    category_slug: 'case',
    name_ru: 'NZXT H5 Flow Compact White',
    name_en: 'NZXT H5 Flow Compact White',
    brand: 'NZXT',
    model: 'H5 Flow',
    price_uzs: 1550000,
    in_stock: 6,
    image_url: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Минималистичный корпус с перфорированной фронтальной панелью и специальным вентилятором прямого обдува видеокарты.',
    description_en: 'Minimalist mid-tower case featuring perforated front airflow and dedicated bottom GPU cooling fan.',
    form_factor: 'ATX',
    length_mm: 365,
    height_mm: 165,
    specs_json: JSON.stringify({ form_factors: ['ATX', 'Micro-ATX', 'Mini-ITX'], max_gpu: 365, max_cooler: 165, glass: true, rgb: false })
  },

  // --- PROCESSORS (CPU) ---
  {
    category_slug: 'cpu',
    name_ru: 'AMD Ryzen 7 7800X3D (8C/16T, up to 5.0GHz)',
    name_en: 'AMD Ryzen 7 7800X3D (8C/16T, up to 5.0GHz)',
    brand: 'AMD',
    model: 'Ryzen 7 7800X3D',
    price_uzs: 5800000,
    in_stock: 10,
    image_url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Лучший в мире игровой процессор с 96МБ 3D V-Cache. Непревзойденная частота кадров и стабильный фреймрейт во всех тяжелых играх.',
    description_en: 'World-renowned top tier gaming processor with 96MB 3D V-Cache. Unmatched 1% low FPS in heavy games.',
    socket: 'AM5',
    tdp: 120,
    memory_type: 'DDR5',
    benchmark_score: 34500,
    specs_json: JSON.stringify({ cores: 8, threads: 16, base_clock: '4.2 GHz', boost_clock: '5.0 GHz', cache: '96MB L3', pcie: 'PCIe 5.0' })
  },
  {
    category_slug: 'cpu',
    name_ru: 'Intel Core i7-14700K (20C/28T, up to 5.6GHz)',
    name_en: 'Intel Core i7-14700K (20C/28T, up to 5.6GHz)',
    brand: 'Intel',
    model: 'Core i7-14700K',
    price_uzs: 5400000,
    in_stock: 7,
    image_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Мощный гибридный 20-ядерный процессор для хардкорного гейминга, стриминга и рендеринга 4K видео.',
    description_en: 'Powerhouse 20-core processor designed for elite gaming, seamless 4K streaming and heavy content creation.',
    socket: 'LGA1700',
    tdp: 253,
    memory_type: 'DDR5',
    benchmark_score: 53500,
    specs_json: JSON.stringify({ cores: 20, threads: 28, base_clock: '3.4 GHz', boost_clock: '5.6 GHz', cache: '33MB Intel Smart Cache' })
  },
  {
    category_slug: 'cpu',
    name_ru: 'AMD Ryzen 5 7600 (6C/12T, up to 5.1GHz)',
    name_en: 'AMD Ryzen 5 7600 (6C/12T, up to 5.1GHz)',
    brand: 'AMD',
    model: 'Ryzen 5 7600',
    price_uzs: 2600000,
    in_stock: 15,
    image_url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Идеальный народный процессор на актуальной платформе AM5 с энергоэффективным TDP 65 Вт.',
    description_en: 'The sweet-spot value king processor for Socket AM5 with ultra-efficient 65W TDP.',
    socket: 'AM5',
    tdp: 65,
    memory_type: 'DDR5',
    benchmark_score: 27500,
    specs_json: JSON.stringify({ cores: 6, threads: 12, base_clock: '3.8 GHz', boost_clock: '5.1 GHz', cache: '32MB L3' })
  },
  {
    category_slug: 'cpu',
    name_ru: 'Intel Core i5-13400F (10C/16T, up to 4.6GHz)',
    name_en: 'Intel Core i5-13400F (10C/16T, up to 4.6GHz)',
    brand: 'Intel',
    model: 'Core i5-13400F',
    price_uzs: 2200000,
    in_stock: 20,
    image_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80',
    description_ru: '10-ядерный сбалансированный чип с отличным соотношением цена/производительность для бюджетных и средних сборок.',
    description_en: '10-core balanced powerhouse offering tremendous value for entry and mid-tier builds.',
    socket: 'LGA1700',
    tdp: 65,
    memory_type: 'DDR4',
    benchmark_score: 25000,
    specs_json: JSON.stringify({ cores: 10, threads: 16, base_clock: '2.5 GHz', boost_clock: '4.6 GHz' })
  },
  {
    category_slug: 'cpu',
    name_ru: 'Intel Core i9-14900KS (24C/32T, up to 6.2GHz Special Edition)',
    name_en: 'Intel Core i9-14900KS (24C/32T, up to 6.2GHz Special Edition)',
    brand: 'Intel',
    model: 'Core i9-14900KS',
    price_uzs: 8900000,
    in_stock: 4,
    image_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Флагманский процессор с рекордной тактовой частотой 6.2 ГГц из коробки. Максимум вычислительной мощности.',
    description_en: 'Flagship record-breaking CPU running at blistering 6.2 GHz right out of the box.',
    socket: 'LGA1700',
    tdp: 320,
    memory_type: 'DDR5',
    benchmark_score: 64000,
    specs_json: JSON.stringify({ cores: 24, threads: 32, boost_clock: '6.2 GHz' })
  },

  // --- MOTHERBOARDS ---
  {
    category_slug: 'motherboard',
    name_ru: 'ASUS ROG STRIX B650E-F GAMING WIFI',
    name_en: 'ASUS ROG STRIX B650E-F GAMING WIFI',
    brand: 'ASUS',
    model: 'ROG STRIX B650E-F',
    price_uzs: 3600000,
    in_stock: 9,
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Надежная игровая плата AM5 с поддержкой PCIe 5.0, массивным охлаждением VRM, Wi-Fi 6E и 4 слотами DDR5.',
    description_en: 'Robust Socket AM5 board with PCIe 5.0, massive VRM heatsinks, Wi-Fi 6E and 4x DDR5 slots.',
    socket: 'AM5',
    form_factor: 'ATX',
    memory_type: 'DDR5',
    memory_slots: 4,
    specs_json: JSON.stringify({ pcie_slots: ['PCIe 5.0 x16'], m2_slots: 3, wifi: 'Wi-Fi 6E + BT 5.2', lan: 'Intel 2.5Gb' })
  },
  {
    category_slug: 'motherboard',
    name_ru: 'MSI MAG B760 TOMAHAWK WIFI DDR5',
    name_en: 'MSI MAG B760 TOMAHAWK WIFI DDR5',
    brand: 'MSI',
    model: 'MAG B760 TOMAHAWK',
    price_uzs: 2950000,
    in_stock: 12,
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Популярная плата для процессоров Intel 12, 13 и 14 поколений с усиленной системой питания 12+1+1 фаз.',
    description_en: 'Popular high-demand motherboard for Intel 12/13/14th Gen CPUs with robust 12+1+1 power phases.',
    socket: 'LGA1700',
    form_factor: 'ATX',
    memory_type: 'DDR5',
    memory_slots: 4,
    specs_json: JSON.stringify({ m2_slots: 3, wifi: 'Wi-Fi 6E', max_ram: '192GB DDR5' })
  },
  {
    category_slug: 'motherboard',
    name_ru: 'Gigabyte B760M DS3H DDR4',
    name_en: 'Gigabyte B760M DS3H DDR4',
    brand: 'Gigabyte',
    model: 'B760M DS3H DDR4',
    price_uzs: 1450000,
    in_stock: 18,
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Доступная и надежная Micro-ATX материнская плата под сокет LGA1700 с поддержкой памяти DDR4.',
    description_en: 'Affordable and reliable Micro-ATX LGA1700 motherboard supporting cost-effective DDR4 memory.',
    socket: 'LGA1700',
    form_factor: 'Micro-ATX',
    memory_type: 'DDR4',
    memory_slots: 4,
    specs_json: JSON.stringify({ m2_slots: 2, lan: 'Realtek 2.5Gb' })
  },
  {
    category_slug: 'motherboard',
    name_ru: 'ASUS TUF GAMING X670E-PLUS WIFI',
    name_en: 'ASUS TUF GAMING X670E-PLUS WIFI',
    brand: 'ASUS',
    model: 'TUF X670E-PLUS',
    price_uzs: 4300000,
    in_stock: 5,
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Топовый чипсет X670E с военной надежностью компонентов TUF, 16 фазами питания и 4 портами M.2.',
    description_en: 'Top-tier X670E chipset with military-grade TUF components, 16 power stages, and 4 M.2 slots.',
    socket: 'AM5',
    form_factor: 'ATX',
    memory_type: 'DDR5',
    memory_slots: 4,
    specs_json: JSON.stringify({ m2_slots: 4, pcie_5: true })
  },

  // --- COOLERS & AIO ---
  {
    category_slug: 'cooler',
    name_ru: 'DeepCool LT720 360mm ARGB Liquid Cooler',
    name_en: 'DeepCool LT720 360mm ARGB Liquid Cooler',
    brand: 'DeepCool',
    model: 'LT720',
    price_uzs: 1650000,
    in_stock: 11,
    image_url: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Высокопроизводительная 3-секционная система жидкостного охлаждения с помпой 4-го поколения и зеркальной ARGB подсветкой.',
    description_en: 'High-performance 360mm AIO with 4th-gen water pump and multi-dimensional infinity mirror ARGB block.',
    height_mm: 52, // pump block height
    tdp: 300,
    specs_json: JSON.stringify({ type: 'AIO Liquid 360mm', fans: '3x 120mm PWM FK120', tdp_rating: 300, rgb: true })
  },
  {
    category_slug: 'cooler',
    name_ru: 'Thermalright Peerless Assassin 120 SE ARGB',
    name_en: 'Thermalright Peerless Assassin 120 SE ARGB',
    brand: 'Thermalright',
    model: 'Peerless Assassin 120 SE',
    price_uzs: 550000,
    in_stock: 25,
    image_url: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Легендарный двухбашенный воздушный суперкулер с 6 тепловыми трубками, превосходящий многие СЖО по цене/охлаждению.',
    description_en: 'Legendary dual-tower air cooler with 6 heatpipes offering unmatched price-to-thermal performance.',
    height_mm: 155,
    tdp: 245,
    specs_json: JSON.stringify({ type: 'Dual Tower Air', fans: '2x 120mm PWM TL-C12C-S', height_mm: 155, rgb: true })
  },
  {
    category_slug: 'cooler',
    name_ru: 'NZXT Kraken Elite 360 RGB LCD Display',
    name_en: 'NZXT Kraken Elite 360 RGB LCD Display',
    brand: 'NZXT',
    model: 'Kraken Elite 360 RGB',
    price_uzs: 3950000,
    in_stock: 4,
    image_url: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Флагманская СЖО с кристально четким 2.36" LCD экраном для вывода GIF-анимаций и температур в реальном времени.',
    description_en: 'Flagship 360mm AIO featuring a wide-angle 2.36-inch LCD screen displaying GIFs and live hardware stats.',
    height_mm: 55,
    tdp: 350,
    specs_json: JSON.stringify({ type: 'AIO Liquid 360mm', screen: '2.36" 640x640 60Hz LCD', rgb: true })
  },

  // --- RAM ---
  {
    category_slug: 'ram',
    name_ru: 'Kingston Fury Beast RGB DDR5-6000 32GB (2x16GB)',
    name_en: 'Kingston Fury Beast RGB DDR5-6000 32GB (2x16GB)',
    brand: 'Kingston',
    model: 'Fury Beast RGB',
    price_uzs: 1850000,
    in_stock: 22,
    image_url: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Скоростной комплект DDR5 с профилями Intel XMP 3.0 и AMD EXPO, низкой латентностью CL30 и плавной подсветкой Infrared Sync.',
    description_en: 'Fast 6000MHz CL30 DDR5 kit with Intel XMP 3.0 & AMD EXPO profiles and vibrant RGB lighting.',
    memory_type: 'DDR5',
    capacity_gb: 32,
    specs_json: JSON.stringify({ kit: '2x16GB', speed_mhz: 6000, timings: 'CL30-36-36', rgb: true })
  },
  {
    category_slug: 'ram',
    name_ru: 'G.Skill Trident Z5 RGB DDR5-6400 64GB (2x32GB)',
    name_en: 'G.Skill Trident Z5 RGB DDR5-6400 64GB (2x32GB)',
    brand: 'G.Skill',
    model: 'Trident Z5 RGB',
    price_uzs: 3400000,
    in_stock: 8,
    image_url: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Элитная оперативная память объемом 64 ГБ с агрессивным алюминиевым радиатором и максимальной пропускной способностью.',
    description_en: 'Elite 64GB DDR5 memory kit with sleek brushed-aluminum heatspreaders for demanding workloads and maxed gaming.',
    memory_type: 'DDR5',
    capacity_gb: 64,
    specs_json: JSON.stringify({ kit: '2x32GB', speed_mhz: 6400, timings: 'CL32-39-39', rgb: true })
  },
  {
    category_slug: 'ram',
    name_ru: 'Kingston Fury Beast Black DDR4-3200 16GB (2x8GB)',
    name_en: 'Kingston Fury Beast Black DDR4-3200 16GB (2x8GB)',
    brand: 'Kingston',
    model: 'Fury Beast Black DDR4',
    price_uzs: 620000,
    in_stock: 30,
    image_url: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Надежный комплект памяти стандарта DDR4 с частотой 3200 МГц для бюджетных сборок.',
    description_en: 'Rock-solid DDR4-3200 dual channel memory kit for budget gaming builds.',
    memory_type: 'DDR4',
    capacity_gb: 16,
    specs_json: JSON.stringify({ kit: '2x8GB', speed_mhz: 3200, timings: 'CL16-18-18', rgb: false })
  },

  // --- GRAPHICS CARDS (GPU) ---
  {
    category_slug: 'gpu',
    name_ru: 'NVIDIA GeForce RTX 4090 24GB ASUS ROG STRIX OC',
    name_en: 'NVIDIA GeForce RTX 4090 24GB ASUS ROG STRIX OC',
    brand: 'ASUS',
    model: 'ROG STRIX RTX 4090 OC',
    price_uzs: 27500000,
    in_stock: 3,
    image_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Абсолютный царь игровой графики. 24 ГБ памяти GDDR6X, DLSS 3.5 Frame Generation и трассировка пути в 4K Ultra без компромиссов.',
    description_en: 'The unrivaled king of gaming GPUs. 24GB GDDR6X, DLSS 3.5 Frame Gen, and uncompromising 4K Path Tracing.',
    length_mm: 357,
    tdp: 450,
    vram_gb: 24,
    benchmark_score: 39000,
    specs_json: JSON.stringify({ vram: '24GB GDDR6X', bus: '384-bit', psu_rec: 1000, slots: 3.5, dlss: 'DLSS 3.5' })
  },
  {
    category_slug: 'gpu',
    name_ru: 'Palit GeForce RTX 4070 Ti SUPER GamingPro 16GB',
    name_en: 'Palit GeForce RTX 4070 Ti SUPER GamingPro 16GB',
    brand: 'Palit',
    model: 'RTX 4070 Ti SUPER GamingPro',
    price_uzs: 11900000,
    in_stock: 9,
    image_url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Идеальная видеокарта для 2K и 4K гейминга с 16 ГБ VRAM, 256-битной шиной и полной поддержкой рейтрейсинга.',
    description_en: 'The sweet spot for 1440p and 4K gaming with 16GB VRAM, 256-bit memory bus, and stellar ray tracing.',
    length_mm: 328,
    tdp: 285,
    vram_gb: 16,
    benchmark_score: 31500,
    specs_json: JSON.stringify({ vram: '16GB GDDR6X', bus: '256-bit', psu_rec: 750, slots: 3.1 })
  },
  {
    category_slug: 'gpu',
    name_ru: 'MSI GeForce RTX 4070 SUPER 12GB VENTUS 2X OC',
    name_en: 'MSI GeForce RTX 4070 SUPER 12GB VENTUS 2X OC',
    brand: 'MSI',
    model: 'RTX 4070 SUPER VENTUS 2X',
    price_uzs: 8400000,
    in_stock: 14,
    image_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Компактная и невероятно энергоэффективная видеокарта. Легко тянет все новинки в 1440p с высоким FPS.',
    description_en: 'Ultra-efficient and compact GPU delivering exceptional 1440p high frame rate gaming.',
    length_mm: 242,
    tdp: 220,
    vram_gb: 12,
    benchmark_score: 29000,
    specs_json: JSON.stringify({ vram: '12GB GDDR6X', bus: '192-bit', psu_rec: 650, slots: 2.0 })
  },
  {
    category_slug: 'gpu',
    name_ru: 'Gigabyte GeForce RTX 4060 EAGLE OC 8GB',
    name_en: 'Gigabyte GeForce RTX 4060 EAGLE OC 8GB',
    brand: 'Gigabyte',
    model: 'RTX 4060 EAGLE OC',
    price_uzs: 4300000,
    in_stock: 25,
    image_url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Самая доступная видеокарта семейства Ada Lovelace с поддержкой генерации кадров DLSS 3 для 1080p гейминга.',
    description_en: 'Most accessible Ada Lovelace GPU with DLSS 3 Frame Gen for seamless 1080p gaming.',
    length_mm: 272,
    tdp: 115,
    vram_gb: 8,
    benchmark_score: 19500,
    specs_json: JSON.stringify({ vram: '8GB GDDR6', bus: '128-bit', psu_rec: 450, slots: 2.0 })
  },
  {
    category_slug: 'gpu',
    name_ru: 'Sapphire AMD Radeon RX 7800 XT PULSE 16GB',
    name_en: 'Sapphire AMD Radeon RX 7800 XT PULSE 16GB',
    brand: 'Sapphire',
    model: 'Radeon RX 7800 XT PULSE',
    price_uzs: 7300000,
    in_stock: 10,
    image_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Мощнейшая чистая растровая производительность в 1440p с щедрыми 16 ГБ видеопамяти по отличной цене.',
    description_en: 'Incredible pure rasterization muscle in 1440p backed by generous 16GB VRAM.',
    length_mm: 280,
    tdp: 263,
    vram_gb: 16,
    benchmark_score: 28500,
    specs_json: JSON.stringify({ vram: '16GB GDDR6', bus: '256-bit', psu_rec: 700 })
  },

  // --- STORAGE ---
  {
    category_slug: 'storage',
    name_ru: 'Samsung 990 PRO 2TB NVMe M.2 SSD PCIe 4.0',
    name_en: 'Samsung 990 PRO 2TB NVMe M.2 SSD PCIe 4.0',
    brand: 'Samsung',
    model: '990 PRO 2TB',
    price_uzs: 2650000,
    in_stock: 18,
    image_url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Флагманский твердотельный накопитель со скоростью чтения до 7450 МБ/с и записи до 6900 МБ/с.',
    description_en: 'Flagship lightning-speed NVMe SSD with read speeds up to 7450 MB/s and write speeds up to 6900 MB/s.',
    capacity_gb: 2000,
    specs_json: JSON.stringify({ read_mb: 7450, write_mb: 6900, form_factor: 'M.2 2280', pcie: 'Gen 4x4' })
  },
  {
    category_slug: 'storage',
    name_ru: 'Kingston KC3000 1TB NVMe M.2 SSD PCIe 4.0',
    name_en: 'Kingston KC3000 1TB NVMe M.2 SSD PCIe 4.0',
    brand: 'Kingston',
    model: 'KC3000 1TB',
    price_uzs: 1350000,
    in_stock: 25,
    image_url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Быстрый и долговечный накопитель с графеновым радиатором и скоростью до 7000 МБ/с.',
    description_en: 'High endurance Gen 4x4 NVMe SSD with graphene heat spreader up to 7000 MB/s.',
    capacity_gb: 1000,
    specs_json: JSON.stringify({ read_mb: 7000, write_mb: 6000, form_factor: 'M.2 2280' })
  },

  // --- POWER SUPPLIES (PSU) ---
  {
    category_slug: 'psu',
    name_ru: 'Corsair RM850e 850W 80+ Gold Fully Modular ATX 3.0',
    name_en: 'Corsair RM850e 850W 80+ Gold Fully Modular ATX 3.0',
    brand: 'Corsair',
    model: 'RM850e',
    price_uzs: 1950000,
    in_stock: 14,
    image_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Надежный модульный блок питания стандарта ATX 3.0 с выделенным кабелем 12VHPWR PCIe 5.0 для видеокарт RTX 40-серии.',
    description_en: 'Reliable ATX 3.0 fully modular power supply with native 12VHPWR PCIe 5.0 cable for RTX 40 GPUs.',
    wattage: 850,
    efficiency_rating: '80+ Gold',
    specs_json: JSON.stringify({ wattage: 850, rating: '80 PLUS Gold', modular: 'Fully', atx_version: 'ATX 3.0', pcie5_cable: true })
  },
  {
    category_slug: 'psu',
    name_ru: 'Seasonic Focus GX-1000 1000W 80+ Gold ATX 3.0',
    name_en: 'Seasonic Focus GX-1000 1000W 80+ Gold ATX 3.0',
    brand: 'Seasonic',
    model: 'Focus GX-1000',
    price_uzs: 2850000,
    in_stock: 7,
    image_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Премиальный киловаттный блок питания с японскими конденсаторами 105°C и 10-летней гарантией надежности.',
    description_en: 'Premium 1000W power supply equipped with 105°C Japanese capacitors and 10-year warranty.',
    wattage: 1000,
    efficiency_rating: '80+ Gold',
    specs_json: JSON.stringify({ wattage: 1000, rating: '80 PLUS Gold', modular: 'Fully', pcie5_cable: true })
  },
  {
    category_slug: 'psu',
    name_ru: 'DeepCool PK650D 650W 80+ Bronze',
    name_en: 'DeepCool PK650D 650W 80+ Bronze',
    brand: 'DeepCool',
    model: 'PK650D',
    price_uzs: 750000,
    in_stock: 20,
    image_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Надежный блок питания мощностью 650 Вт с сертификатом 80 PLUS Bronze для сборок начального и среднего уровня.',
    description_en: 'Dependable 650W power supply with 80 PLUS Bronze certification for entry and mid-tier gaming setups.',
    wattage: 650,
    efficiency_rating: '80+ Bronze',
    specs_json: JSON.stringify({ wattage: 650, rating: '80 PLUS Bronze' })
  }
];

const insertProduct = db.prepare(`
  INSERT INTO products (
    category_slug, name_ru, name_en, brand, model, price_uzs, in_stock, image_url,
    description_ru, description_en, socket, form_factor, tdp, memory_type, memory_slots,
    capacity_gb, vram_gb, length_mm, height_mm, wattage, efficiency_rating,
    benchmark_score, specs_json
  ) VALUES (
    @category_slug, @name_ru, @name_en, @brand, @model, @price_uzs, @in_stock, @image_url,
    @description_ru, @description_en, @socket, @form_factor, @tdp, @memory_type, @memory_slots,
    @capacity_gb, @vram_gb, @length_mm, @height_mm, @wattage, @efficiency_rating,
    @benchmark_score, @specs_json
  )
`);

// Clear existing products and reinsert
db.prepare('DELETE FROM products').run();
products.forEach(p => {
  const item = {
    socket: null,
    form_factor: null,
    tdp: 0,
    memory_type: null,
    memory_slots: null,
    capacity_gb: null,
    vram_gb: null,
    length_mm: null,
    height_mm: null,
    wattage: null,
    efficiency_rating: null,
    benchmark_score: 0,
    specs_json: '{}',
    ...p
  };
  insertProduct.run(item);
});

// 3. Database of 20 Heavy Games
const games = [
  {
    title: 'Cyberpunk 2077: Phantom Liberty',
    slug: 'cyberpunk-2077',
    genre: 'Action RPG / Sci-Fi',
    release_year: 2023,
    cover_image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Графический бенчмарк индустрии с поддержкой полной трассировки пути (Full Path Tracing), DLSS Ray Reconstruction и детальным открытым миром Найт-Сити.',
    description_en: 'The graphical benchmark of the gaming industry with full Path Tracing, DLSS Ray Reconstruction, and dense open-world Night City.',
    base_gpu_requirement: 22000,
    base_cpu_requirement: 26000,
    min_vram_gb: 8,
    rec_vram_gb: 12,
    min_ram_gb: 16,
    preset_multipliers: JSON.stringify({ low: 1.85, med: 1.35, high: 1.0, ultra: 0.65 }),
    res_multipliers: JSON.stringify({ "1080p": 1.0, "1440p": 0.70, "4k": 0.42 })
  },
  {
    title: 'Black Myth: Wukong',
    slug: 'black-myth-wukong',
    genre: 'Action RPG / Soulslike',
    release_year: 2024,
    cover_image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Хит на движке Unreal Engine 5 с технологиями Nanite и Lumen, требующий максимальной мощности видеокарты и процессора.',
    description_en: 'Unreal Engine 5 masterpiece with Nanite geometric detail and Lumen illumination pushing modern hardware to its limits.',
    base_gpu_requirement: 23500,
    base_cpu_requirement: 25000,
    min_vram_gb: 8,
    rec_vram_gb: 16,
    min_ram_gb: 16,
    preset_multipliers: JSON.stringify({ low: 1.75, med: 1.30, high: 1.0, ultra: 0.68 }),
    res_multipliers: JSON.stringify({ "1080p": 1.0, "1440p": 0.68, "4k": 0.39 })
  },
  {
    title: 'Alan Wake 2',
    slug: 'alan-wake-2',
    genre: 'Survival Horror',
    release_year: 2023,
    cover_image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Один из самых тяжелых тайтлов с трассировкой пути, меш-шейдерами и фотореалистичным освещением движка Northlight.',
    description_en: 'One of the most graphically demanding games ever built featuring full path tracing and Northlight mesh shaders.',
    base_gpu_requirement: 24000,
    base_cpu_requirement: 24000,
    min_vram_gb: 8,
    rec_vram_gb: 16,
    min_ram_gb: 16,
    preset_multipliers: JSON.stringify({ low: 1.70, med: 1.30, high: 1.0, ultra: 0.60 }),
    res_multipliers: JSON.stringify({ "1080p": 1.0, "1440p": 0.67, "4k": 0.38 })
  },
  {
    title: 'S.T.A.L.K.E.R. 2: Heart of Chornobyl',
    slug: 'stalker-2',
    genre: 'Open World FPS / Survival',
    release_year: 2024,
    cover_image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Огромная бесшовная Зона отчуждения на движке UE5 с симуляцией жизни A-Life 2.0 и объемным освещением.',
    description_en: 'Huge seamless Chornobyl Exclusion Zone on UE5 with unscripted A-Life 2.0 ecosystem and volumetric atmosphere.',
    base_gpu_requirement: 21500,
    base_cpu_requirement: 27000,
    min_vram_gb: 8,
    rec_vram_gb: 12,
    min_ram_gb: 32,
    preset_multipliers: JSON.stringify({ low: 1.80, med: 1.32, high: 1.0, ultra: 0.66 }),
    res_multipliers: JSON.stringify({ "1080p": 1.0, "1440p": 0.69, "4k": 0.41 })
  },
  {
    title: 'Red Dead Redemption 2',
    slug: 'rdr2',
    genre: 'Open World Western',
    release_year: 2019,
    cover_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Шедевр от Rockstar Games с непревзойденной физикой частиц, объемным туманом, дальностью прорисовки и водными поверхностями.',
    description_en: 'Rockstar Games cinematic masterpiece with unmatched volumetric clouds, particle physics, and drawing distances.',
    base_gpu_requirement: 17000,
    base_cpu_requirement: 18000,
    min_vram_gb: 6,
    rec_vram_gb: 8,
    min_ram_gb: 16,
    preset_multipliers: JSON.stringify({ low: 1.90, med: 1.40, high: 1.0, ultra: 0.72 }),
    res_multipliers: JSON.stringify({ "1080p": 1.0, "1440p": 0.73, "4k": 0.46 })
  },
  {
    title: 'Starfield',
    slug: 'starfield',
    genre: 'Sci-Fi RPG',
    release_year: 2023,
    cover_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Космическая RPG с тысячами планет и высокой процессорной нагрузкой в городах (Новая Атлантида, Акила-Сити).',
    description_en: 'Expansive space RPG featuring heavy CPU demands in major metropolitan cities like New Atlantis and Akila City.',
    base_gpu_requirement: 19500,
    base_cpu_requirement: 28000,
    min_vram_gb: 8,
    rec_vram_gb: 12,
    min_ram_gb: 16,
    preset_multipliers: JSON.stringify({ low: 1.82, med: 1.34, high: 1.0, ultra: 0.71 }),
    res_multipliers: JSON.stringify({ "1080p": 1.0, "1440p": 0.71, "4k": 0.43 })
  },
  {
    title: 'The Last of Us Part I',
    slug: 'the-last-of-us-part-1',
    genre: 'Cinematic Action Adventure',
    release_year: 2023,
    cover_image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Культовая история, переработанная с ультра-детализированными текстурами, шейдингом кожи и плотной растительностью.',
    description_en: 'Iconic cinematic experience rebuilt with ultra-dense vegetation, micro-shading, and intense VRAM consumption.',
    base_gpu_requirement: 19000,
    base_cpu_requirement: 24000,
    min_vram_gb: 8,
    rec_vram_gb: 12,
    min_ram_gb: 16,
    preset_multipliers: JSON.stringify({ low: 1.85, med: 1.36, high: 1.0, ultra: 0.70 }),
    res_multipliers: JSON.stringify({ "1080p": 1.0, "1440p": 0.72, "4k": 0.44 })
  },
  {
    title: 'Hogwarts Legacy',
    slug: 'hogwarts-legacy',
    genre: 'Action RPG / Fantasy',
    release_year: 2023,
    cover_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Детализированный замок Хогвартс и окрестности с трассировкой лучей для отражений и теней.',
    description_en: 'Immersive wizarding world and massive Hogwarts castle with extensive ray-traced reflections and shadows.',
    base_gpu_requirement: 18500,
    base_cpu_requirement: 22000,
    min_vram_gb: 8,
    rec_vram_gb: 12,
    min_ram_gb: 16,
    preset_multipliers: JSON.stringify({ low: 1.80, med: 1.35, high: 1.0, ultra: 0.72 }),
    res_multipliers: JSON.stringify({ "1080p": 1.0, "1440p": 0.72, "4k": 0.45 })
  },
  {
    title: "Dragon's Dogma 2",
    slug: 'dragons-dogma-2',
    genre: 'Action RPG',
    release_year: 2024,
    cover_image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Эпическое приключение на движке RE Engine с глубокой симуляцией сотен NPC, создающее колоссальную нагрузку на процессор.',
    description_en: 'Epic adventure on RE Engine simulating hundreds of independent NPCs creating extreme CPU load in towns.',
    base_gpu_requirement: 19000,
    base_cpu_requirement: 30000,
    min_vram_gb: 8,
    rec_vram_gb: 12,
    min_ram_gb: 16,
    preset_multipliers: JSON.stringify({ low: 1.70, med: 1.30, high: 1.0, ultra: 0.74 }),
    res_multipliers: JSON.stringify({ "1080p": 1.0, "1440p": 0.74, "4k": 0.46 })
  },
  {
    title: 'Microsoft Flight Simulator 2024',
    slug: 'msfs-2024',
    genre: 'Aviation Simulation',
    release_year: 2024,
    cover_image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Самый амбициозный симулятор в истории с фотограмметрией всей планеты Земля, объемными облаками и динамической погодой.',
    description_en: 'The most photorealistic Earth flight simulator with live atmospheric physics, dynamic clouds and digital twin modeling.',
    base_gpu_requirement: 22000,
    base_cpu_requirement: 32000,
    min_vram_gb: 8,
    rec_vram_gb: 16,
    min_ram_gb: 32,
    preset_multipliers: JSON.stringify({ low: 1.90, med: 1.38, high: 1.0, ultra: 0.63 }),
    res_multipliers: JSON.stringify({ "1080p": 1.0, "1440p": 0.68, "4k": 0.40 })
  },
  {
    title: "Senua's Saga: Hellblade II",
    slug: 'hellblade-2',
    genre: 'Cinematic Narrative',
    release_year: 2024,
    cover_image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Кинематографичный триллер на Unreal Engine 5 с технологиями Metahuman, микрополигональной геометрией и кинематографическим светом.',
    description_en: 'Unreal Engine 5 graphical showcase featuring Metahuman facial fidelity and Nanite rock formations in rugged Iceland.',
    base_gpu_requirement: 23000,
    base_cpu_requirement: 22000,
    min_vram_gb: 8,
    rec_vram_gb: 12,
    min_ram_gb: 16,
    preset_multipliers: JSON.stringify({ low: 1.70, med: 1.30, high: 1.0, ultra: 0.67 }),
    res_multipliers: JSON.stringify({ "1080p": 1.0, "1440p": 0.68, "4k": 0.39 })
  },
  {
    title: 'Avatar: Frontiers of Pandora',
    slug: 'avatar-frontiers-of-pandora',
    genre: 'Open World Action / Adventure',
    release_year: 2023,
    cover_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Буйная флора Пандоры на движке Snowdrop с аппаратным рейтрейсингом глобального освещения по умолчанию.',
    description_en: 'Lush alien ecosystems on the Snowdrop engine with mandatory hardware ray-traced global illumination.',
    base_gpu_requirement: 21000,
    base_cpu_requirement: 23000,
    min_vram_gb: 8,
    rec_vram_gb: 12,
    min_ram_gb: 16,
    preset_multipliers: JSON.stringify({ low: 1.82, med: 1.35, high: 1.0, ultra: 0.69 }),
    res_multipliers: JSON.stringify({ "1080p": 1.0, "1440p": 0.70, "4k": 0.42 })
  },
  {
    title: 'Resident Evil 4 Remake',
    slug: 're4-remake',
    genre: 'Action Survival Horror',
    release_year: 2023,
    cover_image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Культовый хоррор на движке RE Engine с эффектами волос кукол, динамическим освещением и текстурами высокого разрешения.',
    description_en: 'Survival horror classic reimagined with high-fidelity strand hair rendering, atmospheric fog and intense action.',
    base_gpu_requirement: 16500,
    base_cpu_requirement: 18000,
    min_vram_gb: 8,
    rec_vram_gb: 12,
    min_ram_gb: 16,
    preset_multipliers: JSON.stringify({ low: 1.95, med: 1.45, high: 1.0, ultra: 0.75 }),
    res_multipliers: JSON.stringify({ "1080p": 1.0, "1440p": 0.75, "4k": 0.49 })
  },
  {
    title: 'A Plague Tale: Requiem',
    slug: 'plague-tale-requiem',
    genre: 'Stealth Action Adventure',
    release_year: 2022,
    cover_image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Визуальное пиршество с одновременным рендерингом до 300 000 крыс на экране и фотореалистичной средневековой Францией.',
    description_en: 'Visual feast rendering up to 300,000 rat swarm simulations simultaneously along photorealistic medieval landscapes.',
    base_gpu_requirement: 20000,
    base_cpu_requirement: 22000,
    min_vram_gb: 8,
    rec_vram_gb: 12,
    min_ram_gb: 16,
    preset_multipliers: JSON.stringify({ low: 1.85, med: 1.38, high: 1.0, ultra: 0.68 }),
    res_multipliers: JSON.stringify({ "1080p": 1.0, "1440p": 0.71, "4k": 0.43 })
  },
  {
    title: 'The Witcher 3: Wild Hunt (Next-Gen)',
    slug: 'witcher-3-nextgen',
    genre: 'Open World RPG',
    release_year: 2022,
    cover_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Обновленная версия великой саги с трассировкой глобального освещения (RTXGI), теней и улучшенными текстурами 4K.',
    description_en: 'Enhanced edition of the legendary RPG featuring full ray-traced global illumination (RTXGI) and ambient occlusion.',
    base_gpu_requirement: 19000,
    base_cpu_requirement: 21000,
    min_vram_gb: 8,
    rec_vram_gb: 12,
    min_ram_gb: 16,
    preset_multipliers: JSON.stringify({ low: 1.88, med: 1.37, high: 1.0, ultra: 0.69 }),
    res_multipliers: JSON.stringify({ "1080p": 1.0, "1440p": 0.72, "4k": 0.45 })
  },
  {
    title: 'God of War Ragnarök',
    slug: 'gow-ragnarok',
    genre: 'Action Adventure',
    release_year: 2024,
    cover_image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Скандинавское приключение Кратоса и Атрея с детализированными девятью мирами и плавной анимацией в высоком фреймрейте.',
    description_en: 'Norse epic of Kratos and Atreus showcasing lavish realms, particle destruction, and high-framerate PC features.',
    base_gpu_requirement: 17500,
    base_cpu_requirement: 20000,
    min_vram_gb: 6,
    rec_vram_gb: 8,
    min_ram_gb: 16,
    preset_multipliers: JSON.stringify({ low: 1.90, med: 1.40, high: 1.0, ultra: 0.73 }),
    res_multipliers: JSON.stringify({ "1080p": 1.0, "1440p": 0.74, "4k": 0.48 })
  },
  {
    title: 'Dying Light 2: Stay Human',
    slug: 'dying-light-2',
    genre: 'Action Parkour / Zombie Survival',
    release_year: 2022,
    cover_image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Динамичный паркур в постапокалиптическом Городе с полноценным аппаратным освещением трассировкой лучей.',
    description_en: 'High-speed parkour zombie world with heavy RT shadows, reflections and ambient illumination.',
    base_gpu_requirement: 17000,
    base_cpu_requirement: 19000,
    min_vram_gb: 6,
    rec_vram_gb: 8,
    min_ram_gb: 16,
    preset_multipliers: JSON.stringify({ low: 1.90, med: 1.40, high: 1.0, ultra: 0.72 }),
    res_multipliers: JSON.stringify({ "1080p": 1.0, "1440p": 0.73, "4k": 0.47 })
  },
  {
    title: 'Returnal',
    slug: 'returnal',
    genre: 'Third-Person Roguelike Shooter',
    release_year: 2023,
    cover_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Быстрый bullet-hell шутер с тысячами светящихся частиц, объемным туманом и высокими требованиями к скорости ОЗУ.',
    description_en: 'Lightning-fast sci-fi roguelike demanding massive particle computation and fast memory bandwidth.',
    base_gpu_requirement: 18000,
    base_cpu_requirement: 22000,
    min_vram_gb: 8,
    rec_vram_gb: 12,
    min_ram_gb: 16,
    preset_multipliers: JSON.stringify({ low: 1.85, med: 1.38, high: 1.0, ultra: 0.71 }),
    res_multipliers: JSON.stringify({ "1080p": 1.0, "1440p": 0.73, "4k": 0.46 })
  },
  {
    title: 'Forza Horizon 5',
    slug: 'forza-horizon-5',
    genre: 'Open World Racing',
    release_year: 2021,
    cover_image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Красочная Мексика с невероятной детализацией автомобилей, сменой погодных условий и трассировкой лучей в ForzaVista.',
    description_en: 'Stunning rendition of vibrant Mexico featuring photorealistic car materials, dust storms and ray tracing.',
    base_gpu_requirement: 16000,
    base_cpu_requirement: 17000,
    min_vram_gb: 6,
    rec_vram_gb: 8,
    min_ram_gb: 16,
    preset_multipliers: JSON.stringify({ low: 2.10, med: 1.50, high: 1.0, ultra: 0.74 }),
    res_multipliers: JSON.stringify({ "1080p": 1.0, "1440p": 0.76, "4k": 0.50 })
  },
  {
    title: "Assassin's Creed Mirage",
    slug: 'ac-mirage',
    genre: 'Stealth Action Adventure',
    release_year: 2023,
    cover_image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    description_ru: 'Атмосферный Багдад 9 века с густыми толпами жителей, песчаными бурями и богатой восточной архитектурой.',
    description_en: 'Vibrant 9th-century Baghdad with dense crowd simulations, sandstorms and intricate Islamic architecture.',
    base_gpu_requirement: 16500,
    base_cpu_requirement: 19000,
    min_vram_gb: 6,
    rec_vram_gb: 8,
    min_ram_gb: 16,
    preset_multipliers: JSON.stringify({ low: 1.92, med: 1.42, high: 1.0, ultra: 0.73 }),
    res_multipliers: JSON.stringify({ "1080p": 1.0, "1440p": 0.74, "4k": 0.48 })
  }
];

const insertGame = db.prepare(`
  INSERT OR REPLACE INTO games (
    title, slug, cover_image, genre, release_year, description_ru, description_en,
    base_gpu_requirement, base_cpu_requirement, preset_multipliers, res_multipliers,
    min_vram_gb, rec_vram_gb, min_ram_gb
  ) VALUES (
    @title, @slug, @cover_image, @genre, @release_year, @description_ru, @description_en,
    @base_gpu_requirement, @base_cpu_requirement, @preset_multipliers, @res_multipliers,
    @min_vram_gb, @rec_vram_gb, @min_ram_gb
  )
`);

db.prepare('DELETE FROM games').run();
games.forEach(g => insertGame.run(g));

// 4. Default settings
const defaultSettings = [
  { key: 'admin_password', value: 'admin123' },
  { key: 'secret_admin_path', value: 'vault-admin-99' },
  { key: 'tg_bot_token', value: '' }, // placeholder
  { key: 'tg_owner_chat_id', value: '' }, // placeholder
  { key: 'exchange_rate_usd_uzs', value: '12850' },
  { key: 'store_phone', value: '+998 (90) 123-45-67' },
  { key: 'store_address', value: 'Tashkent, Uzbekistan' }
];

const insertSetting = db.prepare(`
  INSERT OR REPLACE INTO settings (key, value) VALUES (@key, @value)
`);

defaultSettings.forEach(s => insertSetting.run(s));

console.log('Database seeded successfully: 8 categories, 21 hardware products, 20 heavy games!');
