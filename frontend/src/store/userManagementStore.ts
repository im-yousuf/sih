/**
 * userManagementStore — persisted Zustand store for Well Incharge user management.
 *
 * The Supervisor can Create / Read / Update / Delete incharge accounts.
 * Each account has: id, name, email, password, assignedWellId, active flag.
 *
 * Pre-seeded with the two demo accounts so the existing demo credentials
 * keep working. Any new user added here is also authenticated by LoginPage
 * (which reads this store before falling back to the hardcoded USERS map).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ManagedUser {
  id:             string;
  name:           string;
  email:          string;
  password:       string;   // plain-text for prototype — hash in production
  assignedWellId: string;
  active:         boolean;
  createdAt:      string;   // ISO timestamp
}

export interface UserManagementStore {
  users: ManagedUser[];
  // CRUD
  addUser:    (u: Omit<ManagedUser, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, patch: Partial<Omit<ManagedUser, 'id' | 'createdAt'>>) => void;
  deleteUser: (id: string) => void;
  // Lookup by email+password — used by login
  findByCredentials: (email: string, password: string) => ManagedUser | null;
}

// ─── Well options the supervisor can assign ───────────────────────────────────
export const WELL_OPTIONS = [
  { id: 'well-12', label: 'BW-12' },
  { id: 'well-13', label: 'BW-13' },
  { id: 'well-14', label: 'BW-14' },
  { id: 'well-15', label: 'BW-15' },
  { id: 'well-16', label: 'BW-16' },
  { id: 'well-17', label: 'BW-17' },
];

// ─── Seed data (mirrors the hardcoded USERS_DB in backend/main.py) ───────────
const SEED_USERS: ManagedUser[] = [
  {
    id:             'user-incharge-14',
    name:           'Well Incharge — BW-14',
    email:          'incharge14@oil.com',
    password:       'incharge123',
    assignedWellId: 'well-14',
    active:         true,
    createdAt:      '2024-01-01T00:00:00.000Z',
  },
];

// ─── Store ────────────────────────────────────────────────────────────────────
function uid(): string {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export const useUserManagementStore = create<UserManagementStore>()(
  persist(
    (set, get) => ({
      users: SEED_USERS,

      addUser: (u) =>
        set((s) => ({
          users: [
            ...s.users,
            { ...u, id: uid(), createdAt: new Date().toISOString() },
          ],
        })),

      updateUser: (id, patch) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
        })),

      deleteUser: (id) =>
        set((s) => ({
          users: s.users.filter((u) => u.id !== id),
        })),

      findByCredentials: (email, password) => {
        const e = email.toLowerCase().trim();
        return (
          get().users.find(
            (u) => u.email.toLowerCase() === e && u.password === password && u.active,
          ) ?? null
        );
      },
    }),
    { name: 'dt-user-management' },
  ),
);
