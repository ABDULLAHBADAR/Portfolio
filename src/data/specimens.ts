/* Spec rebuilds published as static previews on GitHub Pages, one folder per
   business. Extracted from each preview's own <title> and JSON-LD, so the
   copy here stays in step with what the pages actually say. Ordered by build
   depth (hand-written HTML + CSS lines) within each market. */

export interface Specimen {
  /** folder name under the Pages root — also the preview URL segment */
  slug: string
  name: string
  /** the descriptor that follows the business name in the page <title> */
  line?: string
  city: string
  region: string
  /** count of <section> elements on the page */
  sections: number
  /** the live business site this one was rebuilt against, where recorded */
  source?: string
  video?: boolean
}

export const SPECIMEN_BASE = 'https://badar191.github.io/Live-preview'

export const specimenUrl = (s: Specimen) => `${SPECIMEN_BASE}/${s.slug}/`

/** Ontario and the GTA. */
export const ONTARIO: Specimen[] = [
  { slug: 'cu-mechanical', name: 'Cu Mechanical Inc', line: 'Hydronic Heating, Radiant & Snow Melt, Toronto & the GTA', city: 'Toronto', region: 'ON', sections: 10 },
  { slug: 'world-of-comfort', name: 'World of Comfort Ltd', line: 'HVAC Contractor Toronto, Furnaces, AC, Boilers Since 1969', city: 'Toronto', region: 'ON', sections: 9, source: 'https://worldofcomfort.ca/' },
  { slug: 'scarff-mechanical', name: 'Scarff Mechanical', line: 'Commercial HVAC & Refrigeration, VAV, VRF, Hydronic, Toronto', city: 'Toronto', region: 'ON', sections: 6 },
  { slug: 'dupont-heating', name: 'Dupont Heating & Air Conditioning Ltd', line: 'HVAC Contractor Toronto Since 1964', city: 'Toronto', region: 'ON', sections: 8, source: 'https://www.dupontheatingltd.ca/' },
  { slug: 'eco-electrical-hvac', name: 'Eco Electrical HVAC', line: 'ESA Licensed Electrical Contractor, Durham & East GTA', city: 'Durham Region', region: 'ON', sections: 12, source: 'https://ecoelectricalhvac.com/' },
  { slug: 'scarborough-heating', name: 'Scarborough Heating & Air Conditioning', line: 'Furnaces, AC & Gas Fitting, Since 1993', city: 'Scarborough', region: 'ON', sections: 9 },
  { slug: 'cool-comfort-system', name: 'Cool Comfort System', line: 'Ductwork & Air Conditioning, Scarborough & East GTA', city: 'Scarborough', region: 'ON', sections: 7 },
  { slug: 'quality-climate-control', name: 'Quality Climate Control HVAC', line: 'Air Conditioning Service & Repair, East York, Toronto', city: 'East York', region: 'ON', sections: 6 },
  { slug: 'armanch', name: 'Armanch Inc', line: 'Engineering-Led HVAC-R, Toronto, Etobicoke & the GTA', city: 'Etobicoke', region: 'ON', sections: 9 },
  { slug: 'a1-air', name: 'A1 Air Conditioning & Heating', line: 'Family-Run Since 1967, Oakville & the West GTA', city: 'Oakville', region: 'ON', sections: 8 },
  { slug: 'ricos-hvac', name: 'Rico\'s HVAC Service and Installation Inc.', line: '24/7 Furnace & AC Service, Toronto, Scarborough, North York', city: 'Toronto', region: 'ON', sections: 9 },
  { slug: 'afrusun', name: 'Afrusun Inc', line: 'Commercial, Industrial & Residential HVAC, Toronto & the GTA', city: 'Toronto', region: 'ON', sections: 9 },
  { slug: 'naz-heating', name: 'Naz Heating & Cooling Inc', line: 'Furnace & AC Repair and Installation, Toronto & the GTA', city: 'Scarborough', region: 'ON', sections: 7 },
  { slug: 'hvac-mechanical-systems', name: 'HVAC Mechanical Systems Inc', line: 'Commercial HVAC & Refrigeration, Toronto, since 1985', city: 'Toronto', region: 'ON', sections: 7 },
  { slug: 'air-rand', name: 'AIRRAND', line: 'HVAC, Gas Lines & Water Systems, Open 7 Days, 24/7', city: 'Ontario', region: 'ON', sections: 6 },
  { slug: 'lucky-air', name: 'Lucky Air Climate Control Ltd.', line: 'Commercial Kitchen Exhaust & HVAC, Toronto & the GTA', city: 'Toronto', region: 'ON', sections: 6 },
  { slug: 'hvac-contractors', name: 'HVAC Contractors Ltd', line: 'Refrigeration, Sheet Metal & Air Distribution, Thornhill, Vaughan', city: 'Thornhill', region: 'ON', sections: 8 },
  { slug: 'atomic-air', name: 'Atomic Air', line: 'Boiler, Furnace & Hot Water Experts, Toronto, Since 1984', city: 'Toronto', region: 'ON', sections: 7 },
  { slug: 'greenbelt-hvac', name: 'Greenbelt HVAC Systems', line: 'Heating & Cooling, Scarborough & East York', city: 'Toronto', region: 'ON', sections: 6 },
  { slug: 'efficient-air-care', name: 'Efficient Air Care Inc', line: 'Licensed Gas Technicians & HVAC, North York, Toronto, Woodbridge', city: 'North York', region: 'ON', sections: 6 },
  { slug: 'schomberg-sheet-metal', name: 'Schomberg Heating & Cooling', line: 'Furnace, AC & Sheet Metal, 45+ Years, GTA & South Simcoe', city: 'Schomberg', region: 'ON', sections: 6 },
]

/** Fifteen US states. */
export const UNITED_STATES: Specimen[] = [
  { slug: 'around-the-sun', name: 'Around the Sun Heating & Cooling, Inc.', line: 'HVAC in Gilbert, AZ', city: 'Gilbert', region: 'AZ', sections: 9, source: 'https://www.aroundthesunaz.com/' },
  { slug: 'glass-city-hvac', name: 'Glass City Heating & Air Conditioning', line: 'Family-Owned HVAC in Toledo Since 1997', city: 'Toledo', region: 'OH', sections: 8, source: 'https://www.glasscityhvac.com/' },
  { slug: 'ur-best-hvac', name: 'UR Best HVAC', line: 'Veteran-owned heating, cooling and boiler service, Louisville & Southern Indiana', city: 'Shepherdsville', region: 'KY', sections: 9, source: 'https://www.urbesthvac.com/' },
  { slug: 'pacific-coast-home-services', name: 'Pacific Coast Home Services', line: 'HVAC, Plumbing & Electrical in San Jose', city: 'San Jose', region: 'CA', sections: 9, source: 'https://pc-homeservices.com/' },
  { slug: 'rose-city-heating-air', name: 'Rose City Heating & Air', line: 'Portland’s Heating and Cooling Specialists', city: 'Portland', region: 'OR', sections: 9, source: 'https://rosecityheating.com/' },
  { slug: 'greentop-heating', name: 'GREENTOP Heating', line: 'Furnace, AC and Heat Pump Work in Kent, WA', city: 'Kent', region: 'WA', sections: 9, source: 'https://www.greentopheating.com', video: true },
  { slug: 'magic-mikes-heating', name: 'Magic Mike\'s Heating and Cooling Inc.', line: 'HVAC in Portland and Estacada, Oregon', city: 'Estacada', region: 'OR', sections: 8, source: 'https://www.magicmikesheating.com/' },
  { slug: 'er-services-charlotte', name: 'E.R. Services', line: 'Plumbing, Heating & Air Care in Charlotte, NC', city: 'Mint Hill', region: 'NC', sections: 9, source: 'https://www.erservicesclt.com/' },
  { slug: 'legendary-energy', name: 'Legendary Energy LLC', line: 'Phoenix HVAC Repair, Installation & Maintenance', city: 'Phoenix', region: 'AZ', sections: 9, source: 'https://www.legendaryenergyaz.com/' },
  { slug: 'cs-heat-air-electrical', name: 'C & S Heat, Air, Electrical, Inc.', line: 'Nashville Heating, Cooling & Electrical Since 1990', city: 'Nashville', region: 'TN', sections: 9, source: 'https://csheatairelectrical.com/' },
  { slug: 'jdr-engineering', name: 'JDR Engineering, Inc.', line: 'MEP Design Engineering, Madison, Wisconsin', city: 'Madison', region: 'WI', sections: 8, source: 'https://jdreng.com/' },
  { slug: 'kj-plumbing-hvac', name: 'K&J Plumbing & HVAC Services', line: 'Oklahoma City, Yukon, Edmond, Piedmont', city: 'Oklahoma City', region: 'OK', sections: 10, source: 'https://www.kandjokc.com' },
  { slug: 'cumberland-cooling', name: 'Cumberland Cooling, Inc', line: 'Heating & Air Conditioning in East Nashville and Madison, TN', city: 'East Nashville', region: 'TN', sections: 9, source: 'https://cumberlandcooling.com/' },
  { slug: 'shamy-heating', name: 'Shamy Heating & Air Conditioning', line: 'Toledo Heating, AC and Air Quality Since 1981', city: 'Toledo', region: 'OH', sections: 9, source: 'https://www.shamyheating.com/' },
  { slug: 'hero-air', name: 'Hero Air', line: 'HVAC Repair, Replacement and Installation in Chicago', city: 'Chicago', region: 'IL', sections: 8, source: 'https://www.myheroair.com/' },
  { slug: 'scottsdale-air-heating-cooling', name: 'Scottsdale Air & Plumbing', line: 'HVAC, Heating and Plumbing in Scottsdale and the Phoenix Valley', city: 'Scottsdale', region: 'AZ', sections: 9, source: 'https://scottsdaleair.com/' },
  { slug: 'supreme-heating', name: 'SUPREME Heating and Cooling, LLC', line: 'Detroit\'s boiler specialists since 1949', city: 'Detroit', region: 'MI', sections: 9, source: 'https://www.supremeheating.com/' },
  { slug: 'lm-services-memphis', name: 'L & M Services Heating and Air Conditioning', line: 'Memphis & the Mid-South', city: 'Memphis', region: 'TN', sections: 9, source: 'https://hvacservicememphis.com/' },
  { slug: 'smart-heating-cooling', name: 'Smart Heating & Cooling', line: 'HVAC in St. Petersburg, Tampa & Clearwater', city: 'Pinellas Park', region: 'FL', sections: 9, source: 'https://smartheatandcool.com/' },
  { slug: 'desert-oasis-ac', name: 'Desert Oasis AC Services', line: '24/7 AC Repair & HVAC in Chandler, AZ', city: 'Chandler', region: 'AZ', sections: 7, source: 'https://www.desertoasisacservices.com/' },
  { slug: 'modern-mechanical', name: 'Modern Mechanical', line: 'Plumbing, Heating & Cooling in Hudson County, NJ', city: 'Jersey City', region: 'NJ', sections: 6, source: 'https://www.modernmechanicalnj.com/' },
  { slug: 'elite-air-solutions', name: 'Elite Air Solutions, LLC', line: 'HVAC Service & Installation, Baltimore & Central Maryland', city: 'Baltimore', region: 'MD', sections: 8, source: 'https://www.eliteairsolutionsmd.com' },
  { slug: 'charlotte-comfort-systems', name: 'Charlotte Comfort Systems, Inc.', line: 'Heating & Air Conditioning on Tuckaseegee Road', city: 'Charlotte', region: 'NC', sections: 8, source: 'https://charlottecomfortsystems.com/' },
  { slug: 'united-appliance-repair', name: 'United Appliance Repair', line: 'Appliance & HVAC Repair Across the San Francisco Bay Area', city: 'San Francisco Bay Area', region: 'CA', sections: 8, source: 'https://unitedhvacrepair.com/' },
  { slug: 'hoffman-harpst', name: 'The Hoffman & Harpst Co., Inc.', line: 'Commercial HVAC & Sheet Metal, Toledo Ohio', city: 'Toledo', region: 'OH', sections: 7, source: 'https://www.hoffmanandharpst.com/' },
]

export const SPECIMEN_GROUPS = [
  { key: 'on', label: 'Ontario', items: ONTARIO },
  { key: 'us', label: 'United States', items: UNITED_STATES },
] as const

export const ALL_SPECIMENS: Specimen[] = [...ONTARIO, ...UNITED_STATES]

/** Opening specimen: the deepest build that is still light enough to load
    politely inside the page (716 KB against 39-54 MB for the video ones). */
export const DEFAULT_SPECIMEN = 'glass-city-hvac'
