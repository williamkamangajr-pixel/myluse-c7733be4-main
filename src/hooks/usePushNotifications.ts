import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      setIsSubscribed(Notification.permission === 'granted');
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in this browser');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setIsSubscribed(result === 'granted');

      if (result === 'granted') {
        toast.success('Push notifications enabled!');
        // Show a test notification
        new Notification('Money Acumen Advisory', {
          body: 'You will now receive price alerts and trade updates',
          icon: '/favicon.ico',
        });
        return true;
      } else if (result === 'denied') {
        toast.error('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to enable notifications');
      return false;
    }

    return false;
  }, [isSupported]);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!isSubscribed) return;

      try {
        new Notification(title, {
          icon: '/favicon.ico',
          ...options,
        });
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    },
    [isSubscribed]
  );

  return {
    isSupported,
    isSubscribed,
    permission,
    requestPermission,
    sendNotification,
  };
}
