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
    .select('id, action, details, created_at, admin_user_id, target_user_id, target_event_id')
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) throw error;
  return data || [];
}
