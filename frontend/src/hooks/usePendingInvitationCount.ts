import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { getReceivedInvitations } from '@/services/tripProjectService';

export function usePendingInvitationCount() {
  const [invitationCount, setInvitationCount] = useState(0);

  const refreshInvitationCount = useCallback(async () => {
    try {
      const invitations = await getReceivedInvitations();
      setInvitationCount(invitations.length);
    } catch {
      setInvitationCount(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshInvitationCount();
    }, [refreshInvitationCount]),
  );

  return invitationCount;
}