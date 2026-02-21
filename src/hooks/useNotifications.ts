import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from './useSession';
import type { Notification } from '@/types';

function mapNotification(row: Record<string, unknown>): Notification {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    title: row.title as string,
    message: row.message as string,
    type: row.type as Notification['type'],
    isRead: row.is_read as boolean,
    actionUrl: row.action_url as string | null,
    createdAt: row.created_at as string,
  };
}

async function fetchNotifications(sessionId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return (data || []).map(row => mapNotification(row as Record<string, unknown>));
}

export function useNotifications() {
  const { sessionId, isReady } = useSession();
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ['notifications', sessionId],
    queryFn: () => fetchNotifications(sessionId!),
    enabled: isReady && !!sessionId,
    staleTime: 1000 * 30, // 30 seconds
  });

  const notifications = notificationsQuery.data || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw new Error(`Failed to mark as read: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', sessionId] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('session_id', sessionId)
        .eq('is_read', false);

      if (error) throw new Error(`Failed to mark all as read: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', sessionId] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw new Error(`Failed to delete notification: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', sessionId] });
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading: notificationsQuery.isLoading,
    error: notificationsQuery.error?.message || null,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
  };
}
