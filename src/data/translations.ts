/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TranslationDict {
  appName: string;
  tagline: string;
  realSolarSystem: string;
  customSystems: string;
  createUniverse: string;
  createPlanet: string;
  generateRandomSystem: string;
  searchPlaceholder: string;
  simulationControls: string;
  play: string;
  pause: string;
  speed: string;
  resetCamera: string;
  toggleOrbits: string;
  toggleLabels: string;
  focusStar: string;
  focusBody: string;
  unfocus: string;
  followPlanet: string;
  following: string;
  editPlanet: string;
  deletePlanet: string;
  renameSystem: string;
  deleteSystem: string;
  confirmDeleteSystem: string;
  confirmDeletePlanet: string;
  storageNotice: string;
  scaleDisclaimer: string;
  noPlanetsFound: string;
  selectedBody: string;
  bodyType: string;
  diameter: string;
  distanceFromStar: string;
  orbitalPeriod: string;
  dayLength: string;
  surfaceTemp: string;
  atmosphere: string;
  moonsCount: string;
  hasRings: string;
  yes: string;
  no: string;
  close: string;
  cancel: string;
  save: string;
  create: string;
  planetName: string;
  planetType: string;
  planetColor: string;
  planetSize: string;
  orbitalDistance: string;
  orbitalSpeed: string;
  numberOfMoons: string;
  ringsToggle: string;
  systemName: string;
  starName: string;
  starType: string;
  starColor: string;
  starSize: string;
  systemCreatedSuccess: string;
  planetCreatedSuccess: string;
  validationError: string;
  nameRequired: string;
  distanceConflict: string;
  typeRocky: string;
  typeGasGiant: string;
  typeIceGiant: string;
  typeFictional: string;
  typeStar: string;
  typeMoon: string;
  starYellowDwarf: string;
  starRedGiant: string;
  starBlueSupergiant: string;
  starWhiteDwarf: string;
  starNeutronStar: string;
  funFact: string;
  quickInfo: string;
  stats: string;
  planetsTotal: string;
}

export const TRANSLATIONS: Record<'en' | 'ar', TranslationDict> = {
  en: {
    appName: 'Infinora',
    tagline: '3D Solar System & Universe Builder',
    realSolarSystem: 'Real Solar System',
    customSystems: 'Custom Systems',
    createUniverse: 'Create Universe',
    createPlanet: 'Create Planet',
    generateRandomSystem: 'Generate Random System',
    searchPlaceholder: 'Search celestial body...',
    simulationControls: 'Simulation Controls',
    play: 'Play',
    pause: 'Pause',
    speed: 'Speed',
    resetCamera: 'Reset View',
    toggleOrbits: 'Orbits',
    toggleLabels: 'Labels',
    focusStar: 'Focus Star',
    focusBody: 'Focus Camera',
    unfocus: 'Exit Focus',
    followPlanet: 'Follow Orbit',
    following: 'Tracking',
    editPlanet: 'Edit Planet',
    deletePlanet: 'Delete Planet',
    renameSystem: 'Rename System',
    deleteSystem: 'Delete System',
    confirmDeleteSystem: 'Are you sure you want to delete this custom star system? This cannot be undone.',
    confirmDeletePlanet: 'Are you sure you want to delete this planet?',
    storageNotice: 'Systems and planet customizations are stored locally in your browser (localStorage).',
    scaleDisclaimer: 'Planetary distances and sizes are visually scaled for 3D navigation and screen legibility.',
    noPlanetsFound: 'No celestial bodies matching your search.',
    selectedBody: 'Celestial Inspector',
    bodyType: 'Classification',
    diameter: 'Equatorial Diameter',
    distanceFromStar: 'Orbital Distance',
    orbitalPeriod: 'Orbital Period',
    dayLength: 'Rotation Period',
    surfaceTemp: 'Mean Surface Temp',
    atmosphere: 'Atmosphere Composition',
    moonsCount: 'Natural Satellites',
    hasRings: 'Ring System',
    yes: 'Present',
    no: 'None',
    close: 'Close',
    cancel: 'Cancel',
    save: 'Save Changes',
    create: 'Create',
    planetName: 'Planet Name',
    planetType: 'Planet Archetype',
    planetColor: 'Surface Color',
    planetSize: 'Physical Radius',
    orbitalDistance: 'Distance from Star',
    orbitalSpeed: 'Orbital Velocity',
    numberOfMoons: 'Moons (Max 5)',
    ringsToggle: 'Planetary Ring System',
    systemName: 'Universe / Star System Name',
    starName: 'Central Star Name',
    starType: 'Spectral Classification',
    starColor: 'Star Color',
    starSize: 'Star Radius',
    systemCreatedSuccess: 'Star system created successfully.',
    planetCreatedSuccess: 'Celestial body added to the orbit disk.',
    validationError: 'Please check your inputs.',
    nameRequired: 'Name is required (minimum 2 characters).',
    distanceConflict: 'Orbital distance overlaps too closely with an existing orbit.',
    typeRocky: 'Rocky / Terrestrial',
    typeGasGiant: 'Gas Giant',
    typeIceGiant: 'Ice Giant',
    typeFictional: 'Fictional / Exotic',
    typeStar: 'Stellar Body (Star)',
    typeMoon: 'Natural Satellite',
    starYellowDwarf: 'G-Type Yellow Dwarf (e.g. Sun)',
    starRedGiant: 'M-Type Red Giant (e.g. Betelgeuse)',
    starBlueSupergiant: 'O/B-Type Blue Supergiant (e.g. Rigel)',
    starWhiteDwarf: 'D-Type White Dwarf (e.g. Sirius B)',
    starNeutronStar: 'Neutron Star / Pulsar',
    funFact: 'Astronomical Insight',
    quickInfo: 'Overview',
    stats: 'Telemetry & Physics',
    planetsTotal: 'Planets in Orbit',
  },
  ar: {
    appName: 'إنفينورا (Infinora)',
    tagline: 'مستكشف النظام الشمسي وصانع الأكوان ثلاثي الأبعاد',
    realSolarSystem: 'النظام الشمسي الحقيقي',
    customSystems: 'الأنظمة المخصصة',
    createUniverse: 'إنشاء كون جديد',
    createPlanet: 'إنشاء كوكب',
    generateRandomSystem: 'توليد نظام عشوائي',
    searchPlaceholder: 'ابحث عن كوكب أو جرم...',
    simulationControls: 'أدوات المحاكاة',
    play: 'تشغيل',
    pause: 'إيقاف مؤقت',
    speed: 'السرعة',
    resetCamera: 'إعادة ضبط الكاميرا',
    toggleOrbits: 'المدارات',
    toggleLabels: 'التسميات',
    focusStar: 'التركيز على النجم',
    focusBody: 'توجيه الكاميرا',
    unfocus: 'إلغاء التركيز',
    followPlanet: 'تتبع المدار',
    following: 'قيد التتبع',
    editPlanet: 'تعديل الكوكب',
    deletePlanet: 'حذف الكوكب',
    renameSystem: 'تسمية النظام',
    deleteSystem: 'حذف النظام',
    confirmDeleteSystem: 'هل أنت متأكد من حذف هذا النظام النجمي المخصص؟ لا يمكن التراجع عن هذا الإجراء.',
    confirmDeletePlanet: 'هل أنت متأكد من حذف هذا الكوكب؟',
    storageNotice: 'يتم حفظ الأنظمة والكواكب محلياً في متصفحك (localStorage).',
    scaleDisclaimer: 'تم تقريب المسافات والأحجام بصرياً لتسهيل الاستكشاف ثلاثي الأبعاد.',
    noPlanetsFound: 'لم يتم العثور على أجرام سماوية مطابقة للبحث.',
    selectedBody: 'مسبار الأجرام الفلكية',
    bodyType: 'التصنيف الفلكي',
    diameter: 'القطر الاستوائي',
    distanceFromStar: 'المسافة عن النجم',
    orbitalPeriod: 'الفترة المدارية',
    dayLength: 'مدة اليوم (الدوران)',
    surfaceTemp: 'متوسط درجة الحرارة',
    atmosphere: 'تركيب الغلاف الجوي',
    moonsCount: 'الأقمار التابعة',
    hasRings: 'نظام الحلقات',
    yes: 'موجود',
    no: 'غير موجود',
    close: 'إغلاق',
    cancel: 'إلغاء',
    save: 'حفظ التعديلات',
    create: 'إنشاء',
    planetName: 'اسم الكوكب',
    planetType: 'نوع الكوكب',
    planetColor: 'لون السطح',
    planetSize: 'نصف القطر النسبي',
    orbitalDistance: 'المسافة المدارية',
    orbitalSpeed: 'سرعة المدار',
    numberOfMoons: 'عدد الأقمار (الحد الأقصى 5)',
    ringsToggle: 'حلقات كوكبية',
    systemName: 'اسم الكون / النظام النجمي',
    starName: 'اسم النجم المركزي',
    starType: 'التصنيف الطيفي',
    starColor: 'لون النجم',
    starSize: 'حجم النجم',
    systemCreatedSuccess: 'تم إنشاء النظام النجمي بنجاح.',
    planetCreatedSuccess: 'تمت إضافة الكوكب إلى المدار بنجاح.',
    validationError: 'يرجى مراجعة الحقول المدخلة.',
    nameRequired: 'الاسم مطلوب (حرفان كحد أدنى).',
    distanceConflict: 'المسافة المدارية قريبة جداً من مدار كوكب آخر.',
    typeRocky: 'صخري / أرضي',
    typeGasGiant: 'عملاق غازي',
    typeIceGiant: 'عملاق جليدي',
    typeFictional: 'خيالي / غريب',
    typeStar: 'نجم مركزي',
    typeMoon: 'قمر تابع',
    starYellowDwarf: 'قزم أصفر (مثل الشمس)',
    starRedGiant: 'عملاق أحمر (مثل منكب الجوزاء)',
    starBlueSupergiant: 'عملاق أزرق فائق (مثل رِجل الجبار)',
    starWhiteDwarf: 'قزم أبيض (مثل الشعرى اليمانية ب)',
    starNeutronStar: 'نجم نيوتروني / نابض',
    funFact: 'معلومة فلكية',
    quickInfo: 'نظرة عامة',
    stats: 'البيانات الفيزيائية والمدارية',
    planetsTotal: 'عدد الكواكب المدارية',
  },
};
