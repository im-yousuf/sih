/**
 * Notification / alert store.
 *
 * Separate from digitalTwinStore so it persists across page navigations
 * and can be subscribed to independently.
 *
 * RBAC filtering is done at the consumer side via the
 * `useFilteredNotifications` hook defined at the bottom of this file.
 *
 * Alert type mirrors the backend Alert shape but adds:
 *   id        – stable client-side UUID
 *   wellId    – which well fired this alert
 *   isRead    – read/unread state
 *   type      – 'critical' | 'warning' | 'info'  (maps from severity)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { useParams } from 'react-router-dom';

// ─── Public types ────────────────────────────────────────────────────────────

export type NotifType = 'critical' | 'warning' | 'info';

export interface AppAlert {
  id:        string;
  wellId:    string;
  type:      NotifType;
  message:   string;
  parameter: string;
  timestamp: string;   // ISO string — JSON-serialisable
  isRead:    boolean;
}

// Map backend severity strings → internal type
export function severityToType(severity: string): NotifType {
  const s = severity.toUpperCase();
  if (s === 'CRITICAL') return 'critical';
  if (s === 'HIGH')     return 'warning';
  return 'info';
}

// ─── Store shape ─────────────────────────────────────────────────────────────

interface NotificationStore {
  alerts: AppAlert[];
  addAlert:        (alert: Omit<AppAlert, 'id' | 'isRead'>) => void;
  markAsRead:      (id: string) => void;
  markAllAsRead:   (wellId?: string) => void;  // undefined = mark everything
  clearAll:        () => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      alerts: [],

      addAlert: (alert) =>
        set((s) => ({
          alerts: [
            { ...alert, id: crypto.randomUUID(), isRead: false },
            ...s.alerts,
          ].slice(0, 200),   // cap at 200 so localStorage doesn't bloat
        })),

      markAsRead: (id) =>
        set((s) => ({
          alerts: s.alerts.map((a) =>
            a.id === id ? { ...a, isRead: true } : a,
          ),
        })),

      markAllAsRead: (wellId) =>
        set((s) => ({
          alerts: s.alerts.map((a) =>
            wellId === undefined || a.wellId === wellId
              ? { ...a, isRead: true }
              : a,
          ),
        })),

      clearAll: () => set({ alerts: [] }),
    }),
    { name: 'dt-notifications' },
  ),
);

// ─── RBAC filtering hook ──────────────────────────────────────────────────────
/**
 * Returns the subset of alerts the current user is allowed to see:
 *   supervisor  → all alerts across all wells
 *   incharge    → only alerts where wellId matches their assigned well
 *                 (and the wellId in the current URL, as a safety belt)
 *
 * Also returns:
 *   unreadCount   filtered unread count  (for the badge)
 *   markAllRead   convenience wrapper that scopes the call correctly
 */
export function useFilteredNotifications() {
  const user    = useAuthStore((s) => s.user);
  const params  = useParams<{ wellId?: string }>();
  const alerts  = useNotificationStore((s) => s.alerts);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const markAsRead    = useNotificationStore((s) => s.markAsRead);
  const addAlert      = useNotificationStore((s) => s.addAlert);

  // The well scope: prefer URL param, fall back to user's assigned well
  const scopeWellId = params.wellId ?? user?.assignedWellId ?? '';

  const filtered =
    user?.role === 'supervisor'
      ? alerts                                           // see everything
      : alerts.filter((a) => a.wellId === scopeWellId); // own well only

  const unreadCount = filtered.filter((a) => !a.isRead).length;

  const markAllRead = () =>
    user?.role === 'supervisor'
      ? markAllAsRead(undefined)
      : markAllAsRead(scopeWellId);

  return { filtered, unreadCount, markAllRead, markAsRead, addAlert, scopeWellId };
}
