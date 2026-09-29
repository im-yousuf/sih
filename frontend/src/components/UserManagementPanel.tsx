/**
 * UserManagementPanel — Supervisor CRUD interface for Well Incharge accounts.
 *
 * Features:
 *  • Table listing all incharge users (name, email, well, status)
 *  • "Add Incharge" button → Create modal
 *  • Edit (pencil) button per row → Edit modal (pre-filled)
 *  • Delete (trash) button per row → Confirm modal
 *  • Toggle active/inactive per row
 *  • Password shown as dots with a reveal toggle in the modal
 */

import { useState } from 'react';
import {
  UserPlus, Pencil, Trash2, Eye, EyeOff,
  CheckCircle, XCircle, X, AlertTriangle,
} from 'lucide-react';
import {
  useUserManagementStore,
  ManagedUser,
  WELL_OPTIONS,
} from '../store/userManagementStore';

// ─── Shared input style ───────────────────────────────────────────────────────
const INPUT = `
  w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5
  text-sm text-stone-900 placeholder-stone-400
  focus:outline-none focus:border-[#8b5a2b]/60 focus:ring-2 focus:ring-[#8b5a2b]/10
  transition-colors
`;
const LABEL = 'block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide';

// ─── Empty form state ─────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name:           '',
  email:          '',
  password:       '',
  assignedWellId: 'well-14',
  active:         true,
};

type FormState = typeof EMPTY_FORM;

// ─── Field-level validation ───────────────────────────────────────────────────
function validate(form: FormState, isNew: boolean): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (!form.name.trim())                     errors.name     = 'Name is required';
  if (!form.email.trim())                    errors.email    = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email   = 'Enter a valid email';
  if (isNew && form.password.length < 6)     errors.password = 'Password must be at least 6 characters';
  if (!form.assignedWellId)                  errors.assignedWellId = 'Assign a well';
  return errors;
}

// ─── Modal backdrop ───────────────────────────────────────────────────────────
function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(28,25,23,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white border border-stone-200 rounded-2xl shadow-2xl w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

// ─── Add / Edit form modal ────────────────────────────────────────────────────
function UserFormModal({
  initial,
  isEdit,
  existingEmails,
  onSave,
  onClose,
}: {
  initial:        FormState;
  isEdit:         boolean;
  existingEmails: string[];
  onSave:         (f: FormState) => void;
  onClose:        () => void;
}) {
  const [form,        setForm]        = useState<FormState>(initial);
  const [errors,      setErrors]      = useState<Partial<Record<keyof FormState, string>>>({});
  const [showPass,    setShowPass]    = useState(false);
  const [submitted,   setSubmitted]   = useState(false);

  const set = (k: keyof FormState, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    setSubmitted(true);
    const errs = validate(form, !isEdit);
    // Duplicate email check (excluding self when editing)
    if (
      existingEmails
        .map((e) => e.toLowerCase())
        .includes(form.email.toLowerCase().trim())
    ) {
      errs.email = 'Email already in use';
    }
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSave(form);
  };

  const field = (k: keyof FormState) => ({
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      set(k, e.target.value),
    className: `${INPUT} ${submitted && errors[k] ? 'border-red-400' : ''}`,
  });

  return (
    <Modal onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
        <h2 className="text-base font-bold text-stone-900">
          {isEdit ? 'Edit Incharge' : 'Add New Incharge'}
        </h2>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-700 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-4">
        {/* Name */}
        <div>
          <label className={LABEL}>Full Name</label>
          <input
            type="text"
            value={form.name}
            placeholder="e.g. Ramesh Kumar"
            {...field('name')}
          />
          {submitted && errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className={LABEL}>Email</label>
          <input
            type="email"
            value={form.email}
            placeholder="incharge@oil.com"
            {...field('email')}
          />
          {submitted && errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className={LABEL}>
            Password {isEdit && <span className="normal-case font-normal text-stone-400">(leave blank to keep current)</span>}
          </label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={form.password}
              placeholder={isEdit ? '••••••••' : 'min. 6 characters'}
              onChange={(e) => set('password', e.target.value)}
              className={`${INPUT} pr-10 ${submitted && errors.password ? 'border-red-400' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {submitted && errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password}</p>
          )}
        </div>

        {/* Assigned Well */}
        <div>
          <label className={LABEL}>Assigned Well</label>
          <select value={form.assignedWellId} {...field('assignedWellId')}>
            {WELL_OPTIONS.map((w) => (
              <option key={w.id} value={w.id}>{w.label} ({w.id})</option>
            ))}
          </select>
          {submitted && errors.assignedWellId && (
            <p className="text-xs text-red-500 mt-1">{errors.assignedWellId}</p>
          )}
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-xs font-semibold text-stone-700 uppercase tracking-wide">Account Status</p>
            <p className="text-xs text-stone-400 mt-0.5">{form.active ? 'User can log in' : 'Login disabled'}</p>
          </div>
          <button
            type="button"
            onClick={() => set('active', !form.active)}
            className={`
              relative w-10 h-6 rounded-full transition-colors
              ${form.active ? 'bg-[#8b5a2b]' : 'bg-stone-300'}
            `}
          >
            <span
              className={`
                absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all
                ${form.active ? 'left-5' : 'left-1'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-100">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-5 py-2 text-sm font-bold text-white rounded-xl transition-colors"
          style={{ backgroundColor: '#8b5a2b' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7a4f26')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#8b5a2b')}
        >
          {isEdit ? 'Save Changes' : 'Create Incharge'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────
function DeleteModal({ user, onConfirm, onClose }: {
  user:      ManagedUser;
  onConfirm: () => void;
  onClose:   () => void;
}) {
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 mb-1">Delete Incharge Account</h2>
            <p className="text-sm text-stone-500">
              This will permanently delete <strong className="text-stone-800">{user.name}</strong>'s
              account (<span className="font-mono">{user.email}</span>). They will immediately
              lose access to <strong className="text-stone-800">
                {WELL_OPTIONS.find((w) => w.id === user.assignedWellId)?.label ?? user.assignedWellId}
              </strong>.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────
export default function UserManagementPanel() {
  const { users, addUser, updateUser, deleteUser } = useUserManagementStore();

  const [modal, setModal] = useState<
    | { type: 'add' }
    | { type: 'edit'; user: ManagedUser }
    | { type: 'delete'; user: ManagedUser }
    | null
  >(null);

  const close = () => setModal(null);

  // Emails to check for duplicates — exclude the user being edited
  const existingEmails = (modal?.type === 'edit')
    ? users.filter((u) => u.id !== modal.user.id).map((u) => u.email)
    : users.map((u) => u.email);

  const handleSave = (form: FormState, editId?: string) => {
    if (editId) {
      // If password field left blank on edit, keep old password
      const patch: Partial<ManagedUser> = {
        name:           form.name.trim(),
        email:          form.email.toLowerCase().trim(),
        assignedWellId: form.assignedWellId,
        active:         form.active,
      };
      if (form.password.trim()) patch.password = form.password;
      updateUser(editId, patch);
    } else {
      addUser({
        name:           form.name.trim(),
        email:          form.email.toLowerCase().trim(),
        password:       form.password,
        assignedWellId: form.assignedWellId,
        active:         form.active,
      });
    }
    close();
  };

  return (
    <div className="space-y-4">

      {/* Panel header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold tracking-widest uppercase" style={{ color: '#8b5a2b' }}>
            Well Incharge Accounts
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            {users.length} account{users.length !== 1 ? 's' : ''} · {users.filter((u) => u.active).length} active
          </p>
        </div>
        <button
          onClick={() => setModal({ type: 'add' })}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-xl transition-colors shadow-sm"
          style={{ backgroundColor: '#8b5a2b' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7a4f26')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#8b5a2b')}
        >
          <UserPlus className="w-4 h-4" />
          Add Incharge
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_1.4fr_1fr_0.7fr_0.8fr] gap-4 px-5 py-3 bg-stone-50 border-b border-stone-200">
          {['Name', 'Email', 'Assigned Well', 'Status', 'Actions'].map((h) => (
            <span key={h} className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-stone-400">
            <UserPlus className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">No incharge accounts yet</p>
            <p className="text-xs mt-1">Click "Add Incharge" to create the first one</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {users.map((u) => {
              const wellLabel = WELL_OPTIONS.find((w) => w.id === u.assignedWellId)?.label ?? u.assignedWellId;
              return (
                <div
                  key={u.id}
                  className={`grid grid-cols-[1fr_1.4fr_1fr_0.7fr_0.8fr] gap-4 px-5 py-3.5 items-center
                    hover:bg-stone-50 transition-colors
                    ${!u.active ? 'opacity-50' : ''}`}
                >
                  {/* Name */}
                  <div>
                    <p className="text-sm font-semibold text-stone-900 truncate">{u.name}</p>
                    <p className="text-[10px] text-stone-400 font-mono">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Email */}
                  <p className="text-xs text-stone-600 font-mono truncate">{u.email}</p>

                  {/* Well */}
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border w-fit"
                    style={{ backgroundColor: 'rgba(139,90,43,0.08)', borderColor: 'rgba(139,90,43,0.25)', color: '#8b5a2b' }}>
                    {wellLabel}
                  </span>

                  {/* Status badge */}
                  <button
                    title={u.active ? 'Click to deactivate' : 'Click to activate'}
                    onClick={() => updateUser(u.id, { active: !u.active })}
                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors w-fit"
                    style={u.active
                      ? { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }
                      : { backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' }}
                  >
                    {u.active
                      ? <><CheckCircle className="w-3 h-3" />Active</>
                      : <><XCircle    className="w-3 h-3" />Inactive</>}
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      title="Edit"
                      onClick={() => setModal({ type: 'edit', user: u })}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-[#8b5a2b] hover:bg-[#8b5a2b]/8 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => setModal({ type: 'delete', user: u })}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal?.type === 'add' && (
        <UserFormModal
          initial={EMPTY_FORM}
          isEdit={false}
          existingEmails={existingEmails}
          onSave={(f) => handleSave(f)}
          onClose={close}
        />
      )}

      {modal?.type === 'edit' && (
        <UserFormModal
          initial={{
            name:           modal.user.name,
            email:          modal.user.email,
            password:       '',           // blank = keep existing
            assignedWellId: modal.user.assignedWellId,
            active:         modal.user.active,
          }}
          isEdit={true}
          existingEmails={existingEmails}
          onSave={(f) => handleSave(f, modal.user.id)}
          onClose={close}
        />
      )}

      {modal?.type === 'delete' && (
        <DeleteModal
          user={modal.user}
          onConfirm={() => { deleteUser(modal.user.id); close(); }}
          onClose={close}
        />
      )}
    </div>
  );
}
