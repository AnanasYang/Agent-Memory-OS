/**
 * Notifications Module (Simplified)
 */

'use client';

export interface NotificationConfig {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  frequency: 'immediate' | 'hourly' | 'daily';
}

export function getNotificationConfig(): NotificationConfig {
  if (typeof window === 'undefined') {
    return { enabled: false, sound: false, desktop: false, frequency: 'immediate' };
  }
  const stored = localStorage.getItem('notification-config');
  return stored ? JSON.parse(stored) : { enabled: false, sound: false, desktop: false, frequency: 'immediate' };
}

export function saveNotificationConfig(config: NotificationConfig) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('notification-config', JSON.stringify(config));
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function hasNotificationPermission(): boolean {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;
  return Notification.permission === 'granted';
}

export function showToast(message: string, type: 'info' | 'success' | 'error' = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
}

export function startCandidateWatcher(callback: (candidates: any[]) => void) {
  return () => {};
}
