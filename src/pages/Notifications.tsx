import { PremiumLayout } from '@/components/layout';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  return (
    <PremiumLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Button size="sm" variant="outline" onClick={() => markAllAsRead()}>
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-2 stagger-children">
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={cn(
                  'rounded-xl border p-4 transition-all animate-fade-in',
                  notification.isRead 
                    ? 'border-border/50 bg-card/50' 
                    : 'border-primary/30 bg-card'
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                      <h3 className="font-medium">{notification.title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border py-16 text-center">
            <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h2 className="text-lg font-semibold">No notifications</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You're all caught up! We'll notify you of important updates.
            </p>
          </div>
        )}
      </div>
    </PremiumLayout>
  );
};

export default NotificationsPage;
