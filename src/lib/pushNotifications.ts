'use client';

import { supabase } from './supabase';

export class PushNotificationService {
  /**
   * Request permission for push notifications
   */
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notification');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Subscribe user to web push
   */
  static async subscribeToPush(): Promise<PushSubscription | null> {
    try {
      if (!('serviceWorker' in navigator)) return null;
      
      const registration = await navigator.serviceWorker.ready;
      if (!registration) return null;

      // Replace with your VAPID public key
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) return null;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      // Send subscription to our backend via Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
         await supabase.from('user_push_subscriptions').upsert({
            user_id: user.id,
            subscription: subscription.toJSON(),
            updated_at: new Date().toISOString()
         });
      }

      return subscription;
    } catch (err) {
      console.error('Failed to subscribe to push notifications', err);
      return null;
    }
  }

  /**
   * Utility to convert VAPID key
   */
  private static urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
