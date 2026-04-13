import { supabase } from './supabase';

export async function writeAdminAuditLog(payload: {
  adminUserId: string;
  action: string;
  targetUserId?: string | null;
  targetEventId?: string | null;
  details?: Record<string, any> | null;
}) {
  const { error } = await supabase.from('admin_audit_logs').insert({
    admin_user_id: payload.adminUserId,
    target_user_id: payload.targetUserId || null,
    target_event_id: payload.targetEventId || null,
    action: payload.action,
    details: payload.details || null,
  });

  if (error) throw error;
}

export async function fetchAdminAuditLogs() {
  const { data, error } = await supabase
    .from('admin_audit_logs')
    .select(`
      id,
      action,
      details,
      created_at,
      admin_user_id,
      target_user_id,
      target_event_id,
      admin_profile:profiles!admin_audit_logs_admin_user_id_fkey(id, full_name, email),
      target_profile:profiles!admin_audit_logs_target_user_id_fkey(id, full_name, email),
      target_event:events!admin_audit_logs_target_event_id_fkey(id, title, status)
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data || [];
}

export function getAuditActionLabel(action: string) {
  const labels: Record<string, string> = {
    'profile.updated': 'Profile updated',
    'contract.updated': 'Contract updated',
    'event.status_updated': 'Event status updated',
  };

  return labels[action] || action.replace(/\./g, ' ');
}
