import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { useSession } from '@/lib/useSession';
import type { Profile } from '@/types/database';

export function useProfile() {
  const { session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!session) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    setProfile(data);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { profile, loading, refresh };
}
