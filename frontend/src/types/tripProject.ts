import { apiRequest } from '@/services/apiClient';

export type TripProjectRole = 'OWNER' | 'MEMBER' | string;

export type SelectedDestination = {
  id: number;
  city: string;
  country: string;
};

export type TripProjectParticipantPreview = {
  id: number;
  userId: number;
  firstname: string;
  username: string;
  avatar: string | null;
  role: TripProjectRole;
  isCurrentUser: boolean;
};

export type TripProjectPendingInvitation = {
  id: number;
  userId: number;
  email: string;
  firstname: string;
  username: string;
  status: string;
  createdAt: string;
};

export type TripProjectListItem = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  estimatedBudget: string | null;
  role: TripProjectRole;
  participantCount: number;
  selectedDestination: SelectedDestination | null;
  createdAt: string;
  updatedAt: string | null;
  participantsPreview: TripProjectParticipantPreview[];
  participantsStepCompleted: boolean;
  availabilitiesStepCompleted: boolean;
};

export type TripProjectDetail = TripProjectListItem & {
  pendingInvitations: TripProjectPendingInvitation[];
};

export type ReceivedInvitation = {
  id: number;
  status: string;
  createdAt: string;
  tripProject: {
    id: number;
    title: string;
  };
};

export function getReceivedInvitations(): Promise<ReceivedInvitation[]> {
  return apiRequest<ReceivedInvitation[]>('/api/invitations');
}