/**
 * Default homepage content — the text and images the site shipped with before the
 * admin panel existed. Used:
 *  1. as the fallback when Firestore has no document for a section yet, and
 *  2. as the seed when an admin runs "Import existing website content".
 */
import type {
  HomepageContent,
  Testimonial,
  Category,
  TagColor,
} from '../types/content';

export const DEFAULT_PHONE = '+919384854560';

export const defaultHomepage: HomepageContent = {
  hero: {
    badge: '15+ ஆண்டுகள் நம்பிக்கையான சேவை',
    headingPrefix: 'உங்கள் கனவு பயணம்',
    headingHighlight: 'இங்கே',
    headingSuffix: 'ஆரம்பிக்கிறது!',
    description: 'இந்தியா & வெளிநாட்டு சுற்றுலா – முழுமையான வசதியுடன்',
    backgroundImages: [
      { url: 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/pilgrimage.webp' },
      { url: 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/india-tour.webp' },
      { url: 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/international-tour.webp' },
      { url: 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/hero-bg.webp' },
    ],
    primaryCtaLabel: 'இப்போதே பதிவு செய்யுங்கள்',
    primaryCtaLink: '/packages',
    secondaryCtaLabel: 'Call Now',
    phone: DEFAULT_PHONE,
    stats: [
      { value: '15+', label: 'ஆண்டு அனுபவம்' },
      { value: '10K+', label: 'மகிழ்ச்சியான பயணிகள்' },
      { value: '200+', label: 'சுற்றுலா தொகுப்புகள்' },
      { value: '50+', label: 'இடங்கள்' },
    ],
  },
  featured: {
    enabled: true,
    badge: 'Popular Collections',
    title: 'Best Travel Packages',
    subtitle: 'யாத்திரை, இந்திய சுற்றுலா, வெளிநாட்டு சுற்றுலா – உங்கள் விருப்பத்தை தேர்வு செய்யுங்கள்',
    packageIds: [],
    limit: 8,
  },
  destinations: {
    enabled: false,
    badge: 'பிரபலமான இடங்கள்',
    title: 'Popular Destinations',
    subtitle: 'எங்கள் பயணிகள் அதிகம் விரும்பும் சுற்றுலா தலங்கள்',
    destinationIds: [],
  },
  banners: {
    enabled: false,
    items: [],
  },
  about: {
    badge: 'ஏன் எங்களை தேர்வு செய்ய வேண்டும்?',
    title: 'எங்கள் சிறப்பம்சங்கள்',
    subtitle: 'உங்கள் பயணத்தை மேம்படுத்தும் நான்கு காரணங்கள்',
    reasons: [
      { title: 'அனுபவம்', description: '15+ ஆண்டுகள் சுற்றுலா துறையில் சேவை. ஒவ்வொரு பயணத்திலும் நாங்கள் உங்கள் நம்பிக்கையான துணை.' },
      { title: 'பாதுகாப்பு', description: 'பாதுகாப்பான பயணமே சிறந்த பயணம். முழு கவனிப்புடன் உங்கள் பாதுகாப்பை உறுதி செய்கிறோம்.' },
      { title: 'முழு வசதி', description: 'போக்குவரத்து, தங்குமிடம், உணவு – அனைத்தும் ஒரே தொகுப்பில். நீங்கள் பயணம் மட்டும் அனுபவியுங்கள்.' },
      { title: 'நம்பிக்கை', description: 'ஆயிரக்கணக்கான மகிழ்ச்சியான பயணிகள். ISO சான்றிதழ் பெற்ற நிறுவனம்.' },
    ],
  },
  testimonials: {
    badge: 'பயணிகள் கருத்துக்கள்',
    title: 'எங்கள் பயணிகள் சொல்வது',
    subtitle: 'ஆயிரக்கணக்கான பயணிகளின் நம்பிக்கையும் மகிழ்ச்சியும்',
  },
  cta: {
    badge: 'இப்போதே தொடங்குங்கள்',
    headingPrefix: 'இப்போதே உங்கள் பயணத்தை',
    headingHighlight: 'தொடங்குங்கள்',
    description: 'உங்கள் கனவு பயணத்தை நிஜமாக்க எங்களை தொடர்பு கொள்ளுங்கள். இன்றே உங்கள் இடத்தை உறுதி செய்யுங்கள்!',
    primaryLabel: 'இப்போதே பதிவு செய்யுங்கள்',
    primaryLink: '/contact',
    secondaryLabel: 'அழைக்கவும்',
    phone: DEFAULT_PHONE,
  },
};

export const TESTIMONIAL_COLORS = [
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-500',
  'from-blue-400 to-indigo-500',
  'from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500',
];

export const defaultTestimonials: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'ராஜகுமார் செல்வம்',
    location: 'சென்னை',
    tour: 'திருப்பதி யாத்திரை',
    text: 'திருப்பதி யாத்திரை மிகவும் சிறப்பாக ஏற்பாடு செய்யப்பட்டிருந்தது. தங்குமிடம், உணவு எல்லாமே சிறப்பாக இருந்தது. ஸ்ரீநிவாசா டூர்ஸுக்கு மிக்க நன்றி!',
    rating: 5,
    color: TESTIMONIAL_COLORS[0],
    status: 'active',
    sortOrder: 0,
  },
  {
    name: 'லக்ஷ்மி தேவி',
    location: 'கோயம்புத்தூர்',
    tour: 'கேரளா சுற்றுலா',
    text: 'கேரளா சுற்றுலா எங்கள் குடும்பத்திற்கு மிகவும் மகிழ்ச்சியளித்தது. குழந்தைகள் மிகவும் அனுபவித்தனர். வழிகாட்டி மிகவும் அனுபவம் வாய்ந்தவர்.',
    rating: 5,
    color: TESTIMONIAL_COLORS[1],
    status: 'active',
    sortOrder: 1,
  },
  {
    name: 'சந்திரசேகர்',
    location: 'மதுரை',
    tour: 'சிங்கப்பூர் சுற்றுலா',
    text: 'சிங்கப்பூர் சுற்றுலா ஏற்பாடு மிகச் சிறப்பாக இருந்தது. விசா, பறப்பு, தங்குமிடம் எல்லாமே கவலையின்றி ஏற்பாடு செய்யப்பட்டது.',
    rating: 5,
    color: TESTIMONIAL_COLORS[2],
    status: 'active',
    sortOrder: 2,
  },
  {
    name: 'பாரதி ராமசாமி',
    location: 'திருச்சி',
    tour: 'ராமேஸ்வரம் யாத்திரை',
    text: 'ராமேஸ்வரம் யாத்திரை ஒரு மனம் கவரும் அனுபவம். 22 தீர்த்த ஸ்நானம், தனுஷ்கோடி பயணம் எல்லாமே சிறப்பாக ஏற்பாடு செய்யப்பட்டிருந்தது. மீண்டும் ஸ்ரீநிவாசா டூர்ஸையே தேர்வு செய்வோம்!',
    rating: 5,
    color: TESTIMONIAL_COLORS[3],
    status: 'active',
    sortOrder: 3,
  },
  {
    name: 'வெங்கட் பிரசாத்',
    location: 'சேலம்',
    tour: 'துபாய் சுற்றுலா',
    text: 'துபாய் சுற்றுலா ஒரு கனவு பயணம்! புர்ஜ் கலீபா, டெசர்ட் சபாரி, ஷாப்பிங் எல்லாமே அருமை. விசா முதல் திரும்பும் வரை முழு கவனிப்பு. நன்றி ஸ்ரீநிவாசா டூர்ஸ்!',
    rating: 5,
    color: TESTIMONIAL_COLORS[4],
    status: 'active',
    sortOrder: 4,
  },
];

/** The three categories used by the original static data, keyed by their slug. */
export const defaultCategories: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'யாத்திரை', slug: 'pilgrimage', description: 'புனித யாத்திரை தொகுப்புகள்', image: { url: 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/pilgrimage.webp' }, tagColor: 'amber', status: 'active', sortOrder: 0, displayOrder: 0 },
  { name: 'இந்தியா', slug: 'india', description: 'இந்திய சுற்றுலா தொகுப்புகள்', image: { url: 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/india-tour.webp' }, tagColor: 'emerald', status: 'active', sortOrder: 1, displayOrder: 1 },
  { name: 'வெளிநாடு', slug: 'international', description: 'வெளிநாட்டு சுற்றுலா தொகுப்புகள்', image: { url: 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/international-tour.webp' }, tagColor: 'blue', status: 'active', sortOrder: 2, displayOrder: 2 },
];

/** Badge gradient + icon colour for a package card, derived from its solid tag colour class. */
export function styleForTagColor(solidClass: string): { badge: string; icon: string } {
  const match = Object.values(TAG_COLOR_CLASSES).find((c) => c.solid === solidClass) ?? TAG_COLOR_CLASSES.emerald;
  return { badge: match.gradient, icon: match.icon };
}

/** Tailwind classes per category colour (full class names so Tailwind can detect them). */
export const TAG_COLOR_CLASSES: Record<TagColor, { solid: string; gradient: string; icon: string }> = {
  amber: { solid: 'bg-amber-500', gradient: 'from-amber-400 to-orange-500', icon: 'text-amber-500' },
  emerald: { solid: 'bg-emerald-500', gradient: 'from-emerald-400 to-teal-500', icon: 'text-emerald-500' },
  blue: { solid: 'bg-blue-500', gradient: 'from-blue-400 to-indigo-500', icon: 'text-blue-500' },
  rose: { solid: 'bg-rose-500', gradient: 'from-rose-400 to-pink-500', icon: 'text-rose-500' },
  violet: { solid: 'bg-violet-500', gradient: 'from-violet-400 to-purple-500', icon: 'text-violet-500' },
  teal: { solid: 'bg-teal-500', gradient: 'from-teal-400 to-cyan-500', icon: 'text-teal-500' },
};
