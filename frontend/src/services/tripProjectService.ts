import { apiRequest } from '@/services/apiClient';
import type {
  TripProjectDetail,
  TripProjectListItem,
} from '@/types/tripProject';

export type CreateTripProjectInput = {
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  estimatedBudget?: string;
};

export type CreateTripProjectResponse = {
  message: string;
  tripProject: {
    id: number;
    title: string;
    description: string | null;
    status: string;
  };
};

export type UpdateTripProjectInput = {
  title?: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  estimatedBudget?: string | null;
  status?: string;
};

export function getTripProjects(): Promise<TripProjectListItem[]> {
  return apiRequest<TripProjectListItem[]>('/api/trip-projects');
}

export function getTripProject(id: number): Promise<TripProjectDetail> {
  if (!Number.isInteger(id) || id <= 0) {
    return Promise.reject(new Error('Identifiant de projet invalide.'));
  }

  return apiRequest<TripProjectDetail>(`/api/trip-projects/${id}`);
}

export function createTripProject(
  tripProject: CreateTripProjectInput,
): Promise<CreateTripProjectResponse> {
  return apiRequest<CreateTripProjectResponse>('/api/trip-projects', {
    method: 'POST',
    body: tripProject,
  });
}

export function updateTripProject(
  id: number,
  tripProject: UpdateTripProjectInput,
): Promise<unknown> {
  if (!Number.isInteger(id) || id <= 0) {
    return Promise.reject(new Error('Identifiant de projet invalide.'));
  }

  return apiRequest('/api/trip-projects/' + id, {
    method: 'PATCH',
    body: tripProject,
  });
}

export function deleteTripProject(id: number): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) {
    return Promise.reject(new Error('Identifiant de projet invalide.'));
  }

  return apiRequest<void>(`/api/trip-projects/${id}`, {
    method: 'DELETE',
  });
}

export function completeParticipantsStep(
  id: number,
): Promise<{ participantsStepCompleted: boolean }> {
  if (!Number.isInteger(id) || id <= 0) {
    return Promise.reject(
      new Error('Identifiant de projet invalide.'),
    );
  }

  return apiRequest<{ participantsStepCompleted: boolean }>(
    `/api/trip-projects/${id}/participants/complete`,
    {
      method: 'PATCH',
    },
  );
}

export type InviteTripParticipantResponse = {
  message: string;
  invitation: {
    id: number;
    userId: number;
    email: string;
    firstname: string;
    username: string;
    status: string;
    createdAt: string;
  };
};

export function inviteTripParticipant(
  projectId: number,
  email: string,
): Promise<InviteTripParticipantResponse> {
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return Promise.reject(
      new Error('Identifiant de projet invalide.'),
    );
  }

  const normalizedEmail = email.trim();

  if (normalizedEmail === '') {
    return Promise.reject(
      new Error('L’adresse e-mail est obligatoire.'),
    );
  }

  return apiRequest<InviteTripParticipantResponse>(
    `/api/trip-projects/${projectId}/participants/invite`,
    {
      method: 'POST',
      body: {
        email: normalizedEmail,
      },
    },
  );
}

export type ReceivedInvitation = {
  participantId: number;
  tripProjectId: number;
  title: string;
  description: string | null;
  createdAt: string;
  tripProject: {
    id: number,
    title: number,
  }
  role: string;
  status: string;
};

export function getReceivedInvitations(): Promise<ReceivedInvitation[]> {
  return apiRequest<ReceivedInvitation[]>('/api/invitations');
}

export type AcceptInvitationResponse = {
  message: string;
  status: 'ACCEPTED';
  tripProjectId: number;
};

export type DeclineInvitationResponse = {
  message: string;
  status: 'DECLINED';
};

export function acceptInvitation(
  invitationId: number,
): Promise<AcceptInvitationResponse> {
  return apiRequest<AcceptInvitationResponse>(
    `/api/invitations/${invitationId}/accept`,
    {
      method: 'PATCH',
    },
  );
}

export function declineInvitation(
  invitationId: number,
): Promise<DeclineInvitationResponse> {
  return apiRequest<DeclineInvitationResponse>(
    `/api/invitations/${invitationId}/decline`,
    {
      method: 'PATCH',
    },
  );
}