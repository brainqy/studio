
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// IMPORTANT: Generate your own VAPID keys and set this environment variable
// You can use: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "YOUR_VAPID_PUBLIC_KEY_HERE_REPLACE_ME";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const [isLoading, setIsLoading] = useState(true); // To track initial SW registration and subscription check

  const isPushSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;

  const updatePermissionStatus = useCallback(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!isPushSupported) {
      console.warn('Push notifications or Service Worker not supported in this browser.');
      setIsLoading(false);
      return;
    }
    if (VAPID_PUBLIC_KEY === "YOUR_VAPID_PUBLIC_KEY_HERE_REPLACE_ME") {
        console.warn("VAPID public key is not set. Push notifications will not fully work. Please generate keys and set NEXT_PUBLIC_VAPID_PUBLIC_KEY in your .env file.");
    }

    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('Service Worker registered successfully:', reg);
        setRegistration(reg);
        updatePermissionStatus(); // Update initial permission status

        reg.pushManager.getSubscription().then(sub => {
          if (sub) {
            console.log('User IS subscribed:', sub.toJSON());
            setSubscription(sub);
            setIsSubscribed(true);
          } else {
            console.log('User IS NOT subscribed.');
            setIsSubscribed(false);
          }
          setIsLoading(false);
        }).catch(err => {
            console.error("Error getting subscription:", err);
            setIsLoading(false);
        });
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
        toast({ title: "Service Worker Error", description: "Could not register service worker for notifications.", variant: "destructive" });
        setIsLoading(false);
      });
  }, [toast, updatePermissionStatus, isPushSupported]);

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast({ title: "Notifications Not Supported", description: "This browser does not support desktop notifications.", variant: "destructive" });
      return 'denied';
    }

    const currentPermission = Notification.permission;
    // updatePermissionStatus(); // Already called by the effect, but good to be explicit if needed elsewhere
    if (currentPermission === 'granted') {
      // toast({ title: "Permission Granted", description: "Notifications are already enabled." });
      return 'granted';
    }
    if (currentPermission === 'denied') {
      toast({ title: "Permission Denied", description: "Notification permission was previously denied. Please enable it in your browser settings.", variant: "destructive" });
      return 'denied';
    }

    const permissionResult = await Notification.requestPermission();
    setPermissionStatus(permissionResult); // Update state immediately
    if (permissionResult === 'granted') {
      toast({ title: "Permission Granted!", description: "You will now receive notifications." });
    } else if (permissionResult === 'denied') {
      toast({ title: "Permission Denied", description: "You chose not to receive notifications.", variant: "default" });
    } else {
      toast({ title: "Permission Default", description: "Notification permission request dismissed.", variant: "default" });
    }
    return permissionResult;
  }, [toast]);

  const subscribeUserToPush = useCallback(async () => {
    if (!registration) {
      toast({ title: "Subscription Error", description: "Service worker not ready.", variant: "destructive" });
      return null;
    }
    if (VAPID_PUBLIC_KEY === "YOUR_VAPID_PUBLIC_KEY_HERE_REPLACE_ME") {
        toast({ title: "Setup Incomplete", description: "Push notification server keys are not configured.", variant: "destructive" });
        console.error("VAPID public key is missing. Cannot subscribe.");
        return null;
    }

    let perm = permissionStatus;
    if (perm === 'default') {
        perm = await requestNotificationPermission();
    }

    if (perm !== 'granted') {
      // requestNotificationPermission already shows a toast
      return null;
    }

    try {
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      console.log('User subscribed successfully (client):', sub.toJSON());
      setSubscription(sub);
      setIsSubscribed(true);
      toast({ title: "Subscribed!", description: "You are now subscribed to push notifications." });

      // TODO: Send this 'sub' object to your backend
      // Example:
      // fetch('/api/push/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(sub.toJSON()),
      // });

      return sub;
    } catch (error) {
      console.error('Failed to subscribe the user: ', error);
      const typedError = error as Error;
      if (typedError.name === 'NotAllowedError' || (typeof Notification !== 'undefined' && Notification.permission === 'denied')) {
        toast({ title: "Subscription Failed", description: "Permission for notifications was denied. Please enable in browser settings.", variant: "destructive" });
      } else {
        toast({ title: "Subscription Failed", description: `Could not subscribe: ${typedError.message}`, variant: "destructive" });
      }
      setIsSubscribed(false);
      setSubscription(null);
      return null;
    }
  }, [registration, toast, permissionStatus, requestNotificationPermission]);

  const unsubscribeUserFromPush = useCallback(async () => {
    const currentSub = await registration?.pushManager.getSubscription();
    if (currentSub) {
      try {
        await currentSub.unsubscribe();
        console.log('User unsubscribed successfully (client).');
        setSubscription(null);
        setIsSubscribed(false);
        toast({ title: "Unsubscribed", description: "You will no longer receive push notifications." });
        // TODO: Notify your backend to remove the subscription
        // Example:
        // fetch('/api/push/unsubscribe', { method: 'POST', body: JSON.stringify({ endpoint: currentSub.endpoint }) });
      } catch (error) {
        console.error('Failed to unsubscribe the user: ', error);
        toast({ title: "Unsubscription Failed", description: "Could not unsubscribe.", variant: "destructive" });
      }
    } else {
        toast({ title: "Not Subscribed", description: "You are not currently subscribed.", variant: "default"});
    }
  }, [registration, toast]);

  return {
    isLoading,
    isSubscribed,
    subscribeUserToPush,
    unsubscribeUserFromPush,
    requestNotificationPermission, // Expose if direct permission request is needed elsewhere
    permissionStatus,
    isPushSupported,
  };
}
