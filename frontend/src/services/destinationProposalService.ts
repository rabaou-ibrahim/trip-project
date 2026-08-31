import { apiRequest } from '@/services/apiClient';

export type DestinationProposalApi = {
  id: number;
  city: string;
  country: string;
  description: string | null;
  estimatedCost: string | null;
  createdAt: string;
  proposedBy: {
    id: number;
    username: string;
  };
};

export type CreateDestinationProposalInput = {
  city: string;
  country: string;
  description?: string;
  estimatedCost?: string | null;
};

export type CreateDestinationProposalResponse = {
  message: string;
  destinationProposal: {
    id: number;
    city: string;
    country: string;
    description: string | null;
    estimatedCost: string | null;
    proposedBy: {
      id: number;
      username: string;
    };
  };
};

export function getDestinationProposals(
  tripProjectId: number,
): Promise<DestinationProposalApi[]> {
  if (!Number.isInteger(tripProjectId) || tripProjectId <= 0) {
    return Promise.reject(
      new Error('Identifiant de projet invalide.'),
    );
  }

  return apiRequest<DestinationProposalApi[]>(
    `/api/trip-projects/${tripProjectId}/destination-proposals`,
  );
}

export function createDestinationProposal(
  tripProjectId: number,
  proposal: CreateDestinationProposalInput,
): Promise<CreateDestinationProposalResponse> {
  if (!Number.isInteger(tripProjectId) || tripProjectId <= 0) {
    return Promise.reject(
      new Error('Identifiant de projet invalide.'),
    );
  }

  return apiRequest<CreateDestinationProposalResponse>(
    `/api/trip-projects/${tripProjectId}/destination-proposals`,
    {
      method: 'POST',
      body: proposal,
    },
  );
}