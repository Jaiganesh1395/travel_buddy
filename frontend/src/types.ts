export type TravelPreferences = {
  interests: string[];
  budget: 'low' | 'medium' | 'high';
  travelPace: 'slow' | 'moderate' | 'fast';
  dietaryRestrictions: string[];
};

export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  preferences?: TravelPreferences;
};

export type DayPlan = {
  day: number;
  items: Activity[];
};

export type Activity = {
  time: string;
  title: string;
  placeId?: string;
  notes?: string;
};

export type Itinerary = {
  id: string;
  userId: string;
  destination: string;
  startDate: string;
  endDate: string;
  activities: DayPlan[];
  status: 'draft' | 'confirmed';
  sharedId?: string;
};

export type Place = {
  id: string;
  name: string;
  category: string;
  destination: string;
  location: { lat: number; lng: number };
  openingHours: string;
  rating: number;
  priceLevel: 'low' | 'medium' | 'high';
  tags: string[];
};

export type RecommendationResponse = {
  destination: string;
  days: number;
  itinerary: DayPlan[];
};
