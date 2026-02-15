// Geocoding Service - PLZ to coordinates conversion
import type { PLZCacheEntry } from '@shared/types';
import { getPLZCache, setPLZCache } from './storage';

// Static PLZ region coordinates (first 2 digits → approximate center)
// This avoids CORS issues with external APIs
const PLZ_REGIONS: Record<string, { lat: number; lng: number; city: string }> = {
  '01': { lat: 51.05, lng: 13.74, city: 'Dresden' },
  '02': { lat: 51.15, lng: 14.97, city: 'Görlitz' },
  '03': { lat: 51.76, lng: 14.33, city: 'Cottbus' },
  '04': { lat: 51.34, lng: 12.38, city: 'Leipzig' },
  '06': { lat: 51.48, lng: 11.97, city: 'Halle' },
  '07': { lat: 50.93, lng: 11.59, city: 'Jena' },
  '08': { lat: 50.72, lng: 12.49, city: 'Zwickau' },
  '09': { lat: 50.83, lng: 12.92, city: 'Chemnitz' },
  '10': { lat: 52.52, lng: 13.41, city: 'Berlin Mitte' },
  '12': { lat: 52.45, lng: 13.43, city: 'Berlin Süd' },
  '13': { lat: 52.57, lng: 13.35, city: 'Berlin Nord' },
  '14': { lat: 52.39, lng: 13.07, city: 'Potsdam' },
  '15': { lat: 52.34, lng: 14.55, city: 'Frankfurt/Oder' },
  '16': { lat: 52.98, lng: 13.79, city: 'Oranienburg' },
  '17': { lat: 53.91, lng: 13.38, city: 'Greifswald' },
  '18': { lat: 54.09, lng: 12.14, city: 'Rostock' },
  '19': { lat: 53.63, lng: 11.41, city: 'Schwerin' },
  '20': { lat: 53.55, lng: 10.00, city: 'Hamburg' },
  '21': { lat: 53.47, lng: 9.78, city: 'Hamburg Süd' },
  '22': { lat: 53.60, lng: 10.05, city: 'Hamburg Nord' },
  '23': { lat: 53.87, lng: 10.69, city: 'Lübeck' },
  '24': { lat: 54.32, lng: 10.14, city: 'Kiel' },
  '25': { lat: 53.87, lng: 9.09, city: 'Itzehoe' },
  '26': { lat: 53.14, lng: 8.22, city: 'Oldenburg' },
  '27': { lat: 53.08, lng: 8.81, city: 'Bremen Nord' },
  '28': { lat: 53.08, lng: 8.81, city: 'Bremen' },
  '29': { lat: 52.97, lng: 10.57, city: 'Celle' },
  '30': { lat: 52.37, lng: 9.74, city: 'Hannover' },
  '31': { lat: 52.23, lng: 9.52, city: 'Hannover Süd' },
  '32': { lat: 52.02, lng: 8.53, city: 'Herford' },
  '33': { lat: 51.93, lng: 8.38, city: 'Bielefeld' },
  '34': { lat: 51.31, lng: 9.50, city: 'Kassel' },
  '35': { lat: 50.56, lng: 8.67, city: 'Gießen' },
  '36': { lat: 50.55, lng: 9.68, city: 'Fulda' },
  '37': { lat: 51.53, lng: 9.93, city: 'Göttingen' },
  '38': { lat: 52.27, lng: 10.52, city: 'Braunschweig' },
  '39': { lat: 52.13, lng: 11.63, city: 'Magdeburg' },
  '40': { lat: 51.23, lng: 6.78, city: 'Düsseldorf' },
  '41': { lat: 51.19, lng: 6.44, city: 'Mönchengladbach' },
  '42': { lat: 51.26, lng: 7.15, city: 'Wuppertal' },
  '44': { lat: 51.51, lng: 7.47, city: 'Dortmund' },
  '45': { lat: 51.45, lng: 7.01, city: 'Essen' },
  '46': { lat: 51.54, lng: 6.77, city: 'Oberhausen' },
  '47': { lat: 51.43, lng: 6.76, city: 'Duisburg' },
  '48': { lat: 51.96, lng: 7.63, city: 'Münster' },
  '49': { lat: 52.28, lng: 8.05, city: 'Osnabrück' },
  '50': { lat: 50.94, lng: 6.96, city: 'Köln' },
  '51': { lat: 50.99, lng: 7.13, city: 'Köln Ost' },
  '52': { lat: 50.78, lng: 6.08, city: 'Aachen' },
  '53': { lat: 50.73, lng: 7.10, city: 'Bonn' },
  '54': { lat: 49.75, lng: 6.64, city: 'Trier' },
  '55': { lat: 50.00, lng: 8.27, city: 'Mainz' },
  '56': { lat: 50.36, lng: 7.60, city: 'Koblenz' },
  '57': { lat: 50.87, lng: 8.02, city: 'Siegen' },
  '58': { lat: 51.36, lng: 7.47, city: 'Hagen' },
  '59': { lat: 51.66, lng: 8.38, city: 'Hamm' },
  '60': { lat: 50.11, lng: 8.68, city: 'Frankfurt' },
  '61': { lat: 50.22, lng: 8.62, city: 'Frankfurt Nord' },
  '63': { lat: 50.00, lng: 8.96, city: 'Offenbach' },
  '64': { lat: 49.87, lng: 8.65, city: 'Darmstadt' },
  '65': { lat: 50.08, lng: 8.24, city: 'Wiesbaden' },
  '66': { lat: 49.24, lng: 7.00, city: 'Saarbrücken' },
  '67': { lat: 49.45, lng: 8.44, city: 'Ludwigshafen' },
  '68': { lat: 49.49, lng: 8.47, city: 'Mannheim' },
  '69': { lat: 49.41, lng: 8.69, city: 'Heidelberg' },
  '70': { lat: 48.78, lng: 9.18, city: 'Stuttgart' },
  '71': { lat: 48.73, lng: 9.11, city: 'Stuttgart Süd' },
  '72': { lat: 48.52, lng: 9.05, city: 'Tübingen' },
  '73': { lat: 48.80, lng: 9.47, city: 'Esslingen' },
  '74': { lat: 49.14, lng: 9.22, city: 'Heilbronn' },
  '75': { lat: 48.89, lng: 8.69, city: 'Pforzheim' },
  '76': { lat: 49.01, lng: 8.40, city: 'Karlsruhe' },
  '77': { lat: 48.47, lng: 7.94, city: 'Offenburg' },
  '78': { lat: 47.99, lng: 8.52, city: 'Villingen' },
  '79': { lat: 47.99, lng: 7.85, city: 'Freiburg' },
  '80': { lat: 48.14, lng: 11.58, city: 'München' },
  '81': { lat: 48.11, lng: 11.60, city: 'München Süd' },
  '82': { lat: 48.05, lng: 11.47, city: 'München West' },
  '83': { lat: 47.86, lng: 11.97, city: 'Rosenheim' },
  '84': { lat: 48.44, lng: 12.12, city: 'Landshut' },
  '85': { lat: 48.40, lng: 11.74, city: 'Freising' },
  '86': { lat: 48.37, lng: 10.90, city: 'Augsburg' },
  '87': { lat: 47.73, lng: 10.31, city: 'Kempten' },
  '88': { lat: 47.66, lng: 9.48, city: 'Friedrichshafen' },
  '89': { lat: 48.40, lng: 10.00, city: 'Ulm' },
  '90': { lat: 49.45, lng: 11.08, city: 'Nürnberg' },
  '91': { lat: 49.60, lng: 11.01, city: 'Erlangen' },
  '92': { lat: 49.02, lng: 12.10, city: 'Amberg' },
  '93': { lat: 49.02, lng: 12.10, city: 'Regensburg' },
  '94': { lat: 48.57, lng: 13.45, city: 'Passau' },
  '95': { lat: 50.06, lng: 11.78, city: 'Bayreuth' },
  '96': { lat: 50.10, lng: 10.88, city: 'Bamberg' },
  '97': { lat: 49.79, lng: 9.95, city: 'Würzburg' },
  '98': { lat: 50.68, lng: 10.93, city: 'Suhl' },
  '99': { lat: 50.98, lng: 11.03, city: 'Erfurt' },
};

// Haversine distance calculation (air distance in km)
export function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Rate limiting for API calls
let lastApiCall = 0;
const API_DELAY = 1000; // 1 second between calls

// Get coordinates for a German PLZ
// Uses Nominatim API for accurate coordinates, falls back to static region data
export async function getCoordinatesForPLZ(plz: string): Promise<PLZCacheEntry | null> {
  if (!plz || plz.length < 2) return null;

  // Normalize PLZ (ensure 5 digits)
  const normalizedPLZ = plz.replace(/\D/g, '').substring(0, 5);
  if (normalizedPLZ.length < 5) {
    // Fall back to region data for incomplete PLZ
    return getRegionFallback(normalizedPLZ);
  }

  // Check cache first
  const cached = getPLZCache(normalizedPLZ);
  if (cached) return cached;

  // Try Nominatim API (like original app)
  try {
    // Rate limiting
    const now = Date.now();
    if (now - lastApiCall < API_DELAY) {
      await new Promise(resolve => setTimeout(resolve, API_DELAY - (now - lastApiCall)));
    }
    lastApiCall = Date.now();

    console.log(`🌐 Lade PLZ ${normalizedPLZ} von OpenStreetMap...`);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&country=DE&postalcode=${normalizedPLZ}&limit=1`,
      {
        headers: {
          'User-Agent': 'SwaF Tandem Matcher v2.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result: PLZCacheEntry = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        city: data[0].display_name?.split(',')[0] || undefined
      };

      // Cache the result
      setPLZCache(normalizedPLZ, result);
      console.log(`✅ PLZ ${normalizedPLZ} gefunden:`, result);
      return result;
    }
  } catch (error) {
    console.warn(`⚠️ Nominatim API Fehler für PLZ ${normalizedPLZ}:`, error);
  }

  // Fall back to static region data
  return getRegionFallback(normalizedPLZ);
}

// Fallback using static region data
function getRegionFallback(plz: string): PLZCacheEntry | null {
  const region = plz.substring(0, 2);
  const regionData = PLZ_REGIONS[region];

  if (!regionData) return null;

  console.log(`📍 Verwende statische Regionsdaten für PLZ ${plz}`);

  const result: PLZCacheEntry = {
    lat: regionData.lat,
    lng: regionData.lng,
    city: regionData.city,
  };

  // Cache the result
  setPLZCache(plz, result);
  return result;
}

// Get distance between two PLZ codes
export async function getDistanceBetweenPLZ(plz1: string, plz2: string): Promise<number | undefined> {
  if (plz1 === plz2) return 0;

  const coords1 = await getCoordinatesForPLZ(plz1);
  const coords2 = await getCoordinatesForPLZ(plz2);

  if (!coords1 || !coords2) return undefined;

  return calculateHaversineDistance(coords1.lat, coords1.lng, coords2.lat, coords2.lng);
}

// Get routing distance using OpenRouteService (optional, requires API key)
export async function getRoutingDistance(
  plz1: string,
  plz2: string,
  apiKey?: string
): Promise<{ distance: number; duration: number } | null> {
  if (!apiKey) return null;

  const coords1 = await getCoordinatesForPLZ(plz1);
  const coords2 = await getCoordinatesForPLZ(plz2);

  if (!coords1 || !coords2) return null;

  try {
    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?start=${coords1.lng},${coords1.lat}&end=${coords2.lng},${coords2.lat}`,
      {
        headers: {
          'Authorization': apiKey,
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const segment = data.features?.[0]?.properties?.segments?.[0];

    if (!segment) return null;

    return {
      distance: segment.distance / 1000, // Convert to km
      duration: segment.duration / 60, // Convert to minutes
    };
  } catch (error) {
    console.error('Routing error:', error);
    return null;
  }
}

// Simple PLZ proximity check (for quick filtering)
export function arePLZsClose(plz1: string, plz2: string): boolean {
  if (!plz1 || !plz2) return false;
  if (plz1 === plz2) return true;

  // Same region (first 2 digits)
  if (plz1.substring(0, 2) === plz2.substring(0, 2)) return true;

  // Adjacent regions
  const region1 = parseInt(plz1.substring(0, 2));
  const region2 = parseInt(plz2.substring(0, 2));

  return Math.abs(region1 - region2) <= 1;
}

// ==========================================
// OSRM DISTANCE CALCULATION (like original app)
// ==========================================

export interface TravelTimes {
  distanceKm: number;
  drivingMinutes: number;
  transitMinutes: number;
  cyclingMinutes: number;
  walkingMinutes: number;
}

// Cache for distance calculations
const distanceCache = new Map<string, TravelTimes>();

/**
 * Calculate travel times between two PLZ codes using OSRM API
 * Returns driving distance and estimated times for all transport modes
 */
export async function calculateTravelTimes(plz1: string, plz2: string): Promise<TravelTimes | null> {
  if (!plz1 || !plz2) return null;
  if (plz1 === plz2) {
    return { distanceKm: 0, drivingMinutes: 0, transitMinutes: 0, cyclingMinutes: 0, walkingMinutes: 0 };
  }

  // Check cache
  const cacheKey = `${plz1}-${plz2}`;
  const cached = distanceCache.get(cacheKey);
  if (cached) return cached;

  // Also check reverse direction
  const reverseCacheKey = `${plz2}-${plz1}`;
  const reverseCached = distanceCache.get(reverseCacheKey);
  if (reverseCached) return reverseCached;

  // Get coordinates for both PLZs
  const coords1 = await getCoordinatesForPLZ(plz1);
  const coords2 = await getCoordinatesForPLZ(plz2);

  if (!coords1 || !coords2) return null;

  try {
    // Use OSRM public API (like original app)
    const url = `https://router.project-osrm.org/route/v1/driving/${coords1.lng},${coords1.lat};${coords2.lng},${coords2.lat}?overview=false`;

    console.log(`🚗 Berechne Entfernung ${plz1} → ${plz2}...`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const distanceKm = route.distance / 1000; // meters to km
      const drivingMinutes = Math.round(route.duration / 60); // seconds to minutes

      // Estimate other modes based on distance and driving time
      // Transit: typically 1.5-2x driving time in urban areas
      const transitMinutes = Math.round(drivingMinutes * 1.8);

      // Cycling: ~15-20 km/h average → ~4 min/km
      const cyclingMinutes = Math.round(distanceKm * 4);

      // Walking: ~5 km/h average → ~12 min/km
      const walkingMinutes = Math.round(distanceKm * 12);

      const result: TravelTimes = {
        distanceKm: Math.round(distanceKm * 10) / 10, // Round to 1 decimal
        drivingMinutes,
        transitMinutes,
        cyclingMinutes,
        walkingMinutes
      };

      // Cache the result
      distanceCache.set(cacheKey, result);
      console.log(`✅ Entfernung: ${result.distanceKm} km`);

      return result;
    }
  } catch (error) {
    console.warn(`⚠️ OSRM API Fehler:`, error);
  }

  // Fallback: Calculate air distance and estimate times
  const airDistance = calculateHaversineDistance(coords1.lat, coords1.lng, coords2.lat, coords2.lng);
  const roadFactor = 1.3; // Roads are typically ~30% longer than air distance
  const distanceKm = Math.round(airDistance * roadFactor * 10) / 10;

  const result: TravelTimes = {
    distanceKm,
    drivingMinutes: Math.round(distanceKm * 1.2), // ~50 km/h average
    transitMinutes: Math.round(distanceKm * 2.2), // ~27 km/h average
    cyclingMinutes: Math.round(distanceKm * 4),   // ~15 km/h average
    walkingMinutes: Math.round(distanceKm * 12),  // ~5 km/h average
  };

  distanceCache.set(cacheKey, result);
  return result;
}

/**
 * Format travel times as human-readable string
 */
export function formatTravelTimes(times: TravelTimes): string {
  if (times.distanceKm === 0) {
    return 'Gleiche PLZ';
  }

  const parts: string[] = [];

  parts.push(`${times.distanceKm} km Entfernung`);

  if (times.drivingMinutes <= 120) {
    parts.push(`ca. ${formatDuration(times.drivingMinutes)} mit Auto`);
  }

  if (times.transitMinutes <= 180) {
    parts.push(`ca. ${formatDuration(times.transitMinutes)} mit ÖPNV`);
  }

  // Only show if reasonably walkable
  if (times.walkingMinutes <= 45) {
    parts.push(`ca. ${formatDuration(times.walkingMinutes)} zu Fuß`);
  }

  return parts.join(', ');
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} h`;
  }
  return `${hours}:${mins.toString().padStart(2, '0')} h`;
}

/**
 * Generate map links for route planning
 */
export function generateMapsLinks(
  coords1: { lat: number; lng: number },
  coords2: { lat: number; lng: number }
): { google: string; bvg: string; mvv: string; hvv: string } {
  // Google Maps directions
  const google = `https://www.google.com/maps/dir/${coords1.lat},${coords1.lng}/${coords2.lat},${coords2.lng}`;

  // BVG (Berlin)
  const bvg = `https://www.bvg.de/de/verbindungen/verbindungssuche?start=${coords1.lat},${coords1.lng}&destination=${coords2.lat},${coords2.lng}`;

  // MVV (Munich)
  const mvv = `https://www.mvv-muenchen.de/fahrplanauskunft/index.html#routing`;

  // HVV (Hamburg)
  const hvv = `https://www.hvv.de/de/fahrplaene/abruf-fahrplaninfos/`;

  return { google, bvg, mvv, hvv };
}
