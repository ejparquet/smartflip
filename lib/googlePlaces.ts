import { Platform } from 'react-native';

export interface GooglePlaceResult {
  place_id: string;
  name: string;
  vicinity: string;
  formatted_address?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    open_now: boolean;
    weekday_text?: string[];
  };
  photos?: {
    photo_reference: string;
    height: number;
    width: number;
  }[];
  formatted_phone_number?: string;
  international_phone_number?: string;
  types?: string[];
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  opening_hours?: {
    open_now: boolean;
    weekday_text?: string[];
  };
  rating?: number;
  user_ratings_total?: number;
  photos?: {
    photo_reference: string;
    height: number;
    width: number;
  }[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  website?: string;
  url?: string;
}

export interface NearbyPoolStore {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: string;
  distanceMeters: number;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  openHours: string;
  category: "pool_supply" | "equipment" | "chemicals" | "tile_coping" | "plumbing" | "automation";
  image: string;
  latitude: number;
  longitude: number;
  placeId: string;
  website?: string;
  mapsUrl?: string;
}

const POOL_SEARCH_KEYWORDS = [
  'pool supply',
  'pool store',
  'swimming pool supply',
  'pool equipment',
  'pool chemicals',
  'spa supply',
];

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function formatDistance(meters: number): string {
  const miles = meters / 1609.34;
  if (miles < 0.1) {
    return `${Math.round(meters)} ft`;
  }
  return `${miles.toFixed(1)} mi`;
}

function categorizeStore(name: string, types?: string[]): NearbyPoolStore['category'] {
  const lowerName = name.toLowerCase();
  const typesStr = (types || []).join(' ').toLowerCase();
  
  if (lowerName.includes('chemical') || typesStr.includes('chemical')) {
    return 'chemicals';
  }
  if (lowerName.includes('tile') || lowerName.includes('coping') || lowerName.includes('pebble')) {
    return 'tile_coping';
  }
  if (lowerName.includes('plumb') || typesStr.includes('plumber')) {
    return 'plumbing';
  }
  if (lowerName.includes('automat') || lowerName.includes('smart') || lowerName.includes('control')) {
    return 'automation';
  }
  if (lowerName.includes('equip') || lowerName.includes('pump') || lowerName.includes('filter')) {
    return 'equipment';
  }
  return 'pool_supply';
}

function getPlacePhoto(photos: GooglePlaceResult['photos'], apiKey: string): string {
  if (photos && photos.length > 0) {
    const photoRef = photos[0].photo_reference;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${apiKey}`;
  }
  return 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400';
}

export async function searchNearbyPoolStores(
  latitude: number,
  longitude: number,
  apiKey: string,
  radiusMeters: number = 16093
): Promise<NearbyPoolStore[]> {
  const allResults: GooglePlaceResult[] = [];
  
  console.log(`[GooglePlaces] Searching for pool stores near ${latitude}, ${longitude}`);
  
  for (const keyword of POOL_SEARCH_KEYWORDS) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radiusMeters}&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`;
      
      console.log(`[GooglePlaces] Fetching: ${keyword}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results) {
        console.log(`[GooglePlaces] Found ${data.results.length} results for "${keyword}"`);
        allResults.push(...data.results);
      } else if (data.status === 'ZERO_RESULTS') {
        console.log(`[GooglePlaces] No results for "${keyword}"`);
      } else {
        console.log(`[GooglePlaces] API status: ${data.status}`, data.error_message || '');
      }
    } catch (error) {
      console.error(`[GooglePlaces] Error searching for "${keyword}":`, error);
    }
  }
  
  const uniqueStores = new Map<string, GooglePlaceResult>();
  allResults.forEach((result) => {
    if (!uniqueStores.has(result.place_id)) {
      uniqueStores.set(result.place_id, result);
    }
  });
  
  console.log(`[GooglePlaces] Total unique stores found: ${uniqueStores.size}`);
  
  const stores: NearbyPoolStore[] = Array.from(uniqueStores.values()).map((place) => {
    const distanceMeters = calculateDistance(
      latitude,
      longitude,
      place.geometry.location.lat,
      place.geometry.location.lng
    );
    
    return {
      id: place.place_id,
      placeId: place.place_id,
      name: place.name,
      address: place.vicinity || place.formatted_address || 'Address not available',
      phone: '',
      distance: formatDistance(distanceMeters),
      distanceMeters,
      rating: place.rating || 0,
      reviewCount: place.user_ratings_total || 0,
      isOpen: place.opening_hours?.open_now ?? true,
      openHours: place.opening_hours?.open_now ? 'Open Now' : 'Closed',
      category: categorizeStore(place.name, place.types),
      image: getPlacePhoto(place.photos, apiKey),
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
    };
  });
  
  stores.sort((a, b) => a.distanceMeters - b.distanceMeters);
  
  return stores;
}

export async function getPlaceDetails(
  placeId: string,
  apiKey: string
): Promise<PlaceDetails | null> {
  try {
    const fields = 'place_id,name,formatted_address,formatted_phone_number,international_phone_number,opening_hours,rating,user_ratings_total,photos,geometry,website,url';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;
    
    console.log(`[GooglePlaces] Fetching details for place: ${placeId}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.result) {
      console.log(`[GooglePlaces] Got details for: ${data.result.name}`);
      return data.result as PlaceDetails;
    }
    
    console.log(`[GooglePlaces] Failed to get details: ${data.status}`);
    return null;
  } catch (error) {
    console.error('[GooglePlaces] Error fetching place details:', error);
    return null;
  }
}

export function getDirectionsUrl(
  destLat: number,
  destLng: number,
  destName: string
): string {
  const destination = encodeURIComponent(`${destLat},${destLng}`);
  
  if (Platform.OS === 'ios') {
    return `maps:0,0?q=${encodeURIComponent(destName)}@${destLat},${destLng}`;
  } else if (Platform.OS === 'android') {
    return `geo:0,0?q=${destLat},${destLng}(${encodeURIComponent(destName)})`;
  }
  
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}
