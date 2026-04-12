import { supabase } from './supabase';

export type EventRole = 'owner' | 'manager' | 'checkin_staff' | 'media_moderator' | 'viewer' | null;

export async function getEventRole(eventId: string): Promise<EventRole> {
  const { data, error } = await supabase.rpc('get_event_role', { target_event_id: eventId });
  if (error) throw error;
  return (data as EventRole) ?? null;
}

export function canCheckInWithRole(role: EventRole) {
  return role === 'owner' || role === 'manager' || role === 'checkin_staff';
}

export function canManageWithRole(role: EventRole) {
  return role === 'owner' || role === 'manager';
}

export function canModerateMediaWithRole(role: EventRole) {
  return role === 'owner' || role === 'manager' || role === 'media_moderator';
}
