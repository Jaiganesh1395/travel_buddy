import { Place, TravelPreferences } from './types.js';

export function scorePlace(place: Place, preferences?: TravelPreferences): number {
  if (!preferences) return place.rating;
  let score = place.rating;

  const { interests, budget, travelPace } = preferences;
  if (interests.some((interest) => place.tags.includes(interest))) {
    score += 2;
  }
  if (place.priceLevel === budget) {
    score += 1.5;
  }
  if (travelPace === 'fast' && place.category === 'tour') {
    score += 0.5;
  }
  if (travelPace === 'slow' && place.category === 'park') {
    score += 0.5;
  }
  return score;
}

export function buildItinerary(places: Place[], days: number) {
  const itinerary = [] as { day: number; items: { time: string; title: string; placeId: string }[] }[];
  for (let day = 1; day <= days; day++) {
    const dayPlaces = places.slice((day - 1) * 3, day * 3);
    itinerary.push({
      day,
      items: dayPlaces.map((place, index) => ({
        time: `${10 + index * 3}:00`,
        title: place.name,
        placeId: place.id
      }))
    });
  }
  return itinerary;
}
