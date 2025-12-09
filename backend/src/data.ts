import { Itinerary, Place, User } from './types.js';
import { v4 as uuid } from 'uuid';

export const users: User[] = [
  {
    id: uuid(),
    email: 'demo@tripplanner.ai',
    name: 'Demo User',
    password: 'password',
    preferences: {
      interests: ['food', 'history', 'outdoors'],
      budget: 'medium',
      travelPace: 'moderate',
      dietaryRestrictions: ['vegetarian']
    },
    createdAt: new Date()
  }
];

export const places: Place[] = [
  {
    id: uuid(),
    name: 'Old Town Walking Tour',
    category: 'tour',
    destination: 'Barcelona',
    location: { lat: 41.3851, lng: 2.1734 },
    openingHours: '09:00-18:00',
    rating: 4.7,
    priceLevel: 'medium',
    tags: ['history', 'culture']
  },
  {
    id: uuid(),
    name: 'Tapas Corner',
    category: 'restaurant',
    destination: 'Barcelona',
    location: { lat: 41.3874, lng: 2.1686 },
    openingHours: '12:00-23:00',
    rating: 4.5,
    priceLevel: 'medium',
    tags: ['food', 'local']
  },
  {
    id: uuid(),
    name: 'Park Güell',
    category: 'park',
    destination: 'Barcelona',
    location: { lat: 41.4145, lng: 2.1527 },
    openingHours: '08:00-21:30',
    rating: 4.8,
    priceLevel: 'low',
    tags: ['outdoors', 'architecture']
  }
];

export const itineraries: Itinerary[] = [
  {
    id: uuid(),
    userId: users[0].id,
    destination: 'Barcelona',
    startDate: '2024-08-01',
    endDate: '2024-08-04',
    status: 'confirmed',
    createdAt: new Date(),
    activities: [
      {
        day: 1,
        items: [
          { time: '10:00', title: 'Old Town Walking Tour', placeId: places[0].id },
          { time: '13:00', title: 'Lunch at Tapas Corner', placeId: places[1].id }
        ]
      },
      {
        day: 2,
        items: [
          { time: '09:00', title: 'Park Güell exploration', placeId: places[2].id }
        ]
      }
    ]
  }
];

export function createUser(email: string, name: string, password: string): User {
  const newUser: User = {
    id: uuid(),
    email,
    name,
    password,
    createdAt: new Date()
  };
  users.push(newUser);
  return newUser;
}

export function createItinerary(
  userId: string,
  destination: string,
  startDate: string,
  endDate: string,
  activities = []
): Itinerary {
  const itinerary: Itinerary = {
    id: uuid(),
    userId,
    destination,
    startDate,
    endDate,
    activities,
    status: 'draft',
    createdAt: new Date()
  };
  itineraries.push(itinerary);
  return itinerary;
}

export function shareItinerary(id: string): string | undefined {
  const itinerary = itineraries.find((it) => it.id === id);
  if (!itinerary) return undefined;
  itinerary.sharedId = itinerary.sharedId ?? uuid();
  return itinerary.sharedId;
}
