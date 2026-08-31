import { apiRequest } from '@/services/apiClient';

export type DestinationSearchResult = {
  id: number;
  city: string;
  country: string | null;
  countryCode: string | null;
  latitude: number;
  longitude: number;
  timezone: string | null;
  admin1: string | null;
};

export function searchDestinations(
  query: string,
): Promise<DestinationSearchResult[]> {
  return apiRequest(
    `/api/destinations/search?q=${encodeURIComponent(query)}`,
  );
}

export type DestinationPhoto = {
  imageUrl: string | null;
  photographer: string | null;
  pexelsUrl: string | null;
};

export function getDestinationPhoto(
  city: string,
  country: string,
): Promise<DestinationPhoto> {
  return apiRequest(
    `/api/destinations/photo?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`,
  );
}