import { supabase } from './supabase';

export type UserProfile = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  access_tier?: string | null;
  contract_status?: string | null;
  contract_starts_at?: string | null;
  contract_ends_at?: string | null;
  role?: string | null;
};

export async function fetchCurrentUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, access_tier, contract_status, contract_starts_at, contract_ends_at, role')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}
