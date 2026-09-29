/**
 * Auth store — persists to localStorage so a page refresh keeps the session.
 *
 * Roles:
 *   'supervisor' → routed to /supervisor
 *   'incharge'   → routed to /well/<assignedWellId>/overview
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'supervisor' | 'incharge';

export interface AuthUser {
  email: string;
  name: string;
  role: UserRole;
  assignedWellId: string;   // incharge: "well-14" | supervisor: "" (all wells)
  token: string;
}

interface AuthStore {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      login:  (user) => set({ user }),
      logout: ()     => set({ user: null }),
    }),
    { name: 'dt-auth' },   // localStorage key
  ),
);
