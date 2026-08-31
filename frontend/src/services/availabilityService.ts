import { apiRequest } from '@/services/apiClient';

export type Availability = {
  id: number;
  userId: number;
  isCurrentUser: boolean;
  username: string;
  firstname: string;
  lastname: string;
  startDate: string;
  endDate: string;
};

export type CreateAvailabilityInput = {
  startDate: string;
  endDate: string;
};

export type CreateAvailabilityResponse = {
  message: string;
  availability: {
    id: number;
    startDate: string;
    endDate: string;
  };
};

export type UpdateAvailabilityInput = {
  startDate?: string;
  endDate?: string;
};

export type UpdateAvailabilityResponse = {
  message: string;
  availability: {
    id: number;
    startDate: string;
    endDate: string;
  };
};

export type CommonAvailabilityPeriod = {
  startDate: string;
  endDate: string;
};

export type CommonAvailabilityResponse = {
  message?: string;
  commonPeriods: CommonAvailabilityPeriod[];
};

export function getAvailabilities(
  tripProjectId: number,
): Promise<Availability[]> {
  if (!Number.isInteger(tripProjectId) || tripProjectId <= 0) {
    return Promise.reject(
      new Error('Identifiant de projet invalide.'),
    );
  }

  return apiRequest<Availability[]>(
    `/api/trip-projects/${tripProjectId}/availabilities`,
  );
}

export function createAvailability(
  tripProjectId: number,
  availability: CreateAvailabilityInput,
): Promise<CreateAvailabilityResponse> {
  if (!Number.isInteger(tripProjectId) || tripProjectId <= 0) {
    return Promise.reject(
      new Error('Identifiant de projet invalide.'),
    );
  }

  return apiRequest<CreateAvailabilityResponse>(
    `/api/trip-projects/${tripProjectId}/availabilities`,
    {
      method: 'POST',
      body: availability,
    },
  );
}

export function updateAvailability(
  availabilityId: number,
  availability: UpdateAvailabilityInput,
): Promise<UpdateAvailabilityResponse> {
  if (!Number.isInteger(availabilityId) || availabilityId <= 0) {
    return Promise.reject(
      new Error('Identifiant de disponibilité invalide.'),
    );
  }

  return apiRequest<UpdateAvailabilityResponse>(
    `/api/availabilities/${availabilityId}`,
    {
      method: 'PATCH',
      body: availability,
    },
  );
}

export function deleteAvailability(
  availabilityId: number,
): Promise<void> {
  if (!Number.isInteger(availabilityId) || availabilityId <= 0) {
    return Promise.reject(
      new Error('Identifiant de disponibilité invalide.'),
    );
  }

  return apiRequest<void>(
    `/api/availabilities/${availabilityId}`,
    {
      method: 'DELETE',
    },
  );
}

export function getCommonAvailabilities(
  tripProjectId: number,
): Promise<CommonAvailabilityResponse> {
  if (!Number.isInteger(tripProjectId) || tripProjectId <= 0) {
    return Promise.reject(
      new Error('Identifiant de projet invalide.'),
    );
  }

  return apiRequest<CommonAvailabilityResponse>(
    `/api/trip-projects/${tripProjectId}/common-availability`,
  );
}