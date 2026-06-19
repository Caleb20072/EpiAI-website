import { useState, useEffect, useCallback } from 'react';

interface InviteRole {
  id: string;
  name: { en: string; fr: string };
  level: number;
}

interface AdminInviteStatus {
  needsFirstAdmin: boolean;
  inviteableRoles: InviteRole[];
  presidentRole: InviteRole;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAdminInvite(): AdminInviteStatus {
  const [needsFirstAdmin, setNeedsFirstAdmin] = useState(true);
  const [inviteableRoles, setInviteableRoles] = useState<InviteRole[]>([]);
  const [presidentRole, setPresidentRole] = useState<InviteRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/invite');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch admin status');
      }

      setNeedsFirstAdmin(data.needsFirstAdmin);
      setInviteableRoles(data.inviteableRoles);
      setPresidentRole(data.presidentRole);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    needsFirstAdmin,
    inviteableRoles,
    presidentRole: presidentRole!,
    isLoading,
    error,
    refetch,
  };
}
