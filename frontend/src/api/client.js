const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }

  return response.json();
}

export const api = {
  login: (email) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  listDestinations: (search) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return request(`/destinations${query}`);
  },
  listItineraries: () => request('/itineraries'),
  createItinerary: (payload) =>
    request('/itineraries', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
