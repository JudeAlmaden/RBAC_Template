# Access Control: RBAC + PBAC Reference

This document describes the complete access control architecture for this application.
The system combines **Role-Based Access Control (RBAC)** with **Permission-Based Access Control (PBAC)**
via the [Spatie Laravel Permission](https://spatie.be/docs/laravel-permission) package.

---

## 1. How RBAC and PBAC Work Together

```
User ──► assigned one or more Roles ──► Roles hold a set of Permissions
                                                 │
                                                 ▼
                                       Controller / Policy checks
                                       $user->can('permission name')
                                       or
                                       $user->isSuperAdmin()
```

- **Roles** are labels (e.g. `admin`, `user`, custom HR role). Each user can hold **multiple** roles simultaneously.
- **Permissions** are fine-grained capability flags (e.g. `manage users`). They live on roles, not directly on users.
  The effective permission set of a user is the **union of all permissions across all their assigned roles**.
- **Policies** (`app/Policies/UserPolicy.php`) add extra contextual rules on top of permissions
  (e.g. "you cannot edit your own account status", "admins cannot touch super admins").
- Super Admin is a special role that bypasses **all** Spatie permission checks via `Gate::before()`
  — it always returns `true` for `can()` calls, **except** for policy-level restrictions.

---

## 2. Role Hierarchy

```
┌─────────────────────────────────────────────────────┐
│  Super Admin                                         │
│  • Full system authority                             │
│  • Bypasses all permission gates (Gate::before)      │
│  • Exclusive authority to create / assign Admins    │
│  • Max 2 active at once (seeded limit)               │
│  • Cannot be edited via the standard edit form       │
│  • Cannot be deleted if last remaining               │
│  • Cannot be deactivated if last active              │
│  • Can preview any role via the Role View Switcher  │
├─────────────────────────────────────────────────────┤
│  Admin                                               │
│  • Holds explicit permissions (manage users, etc.)   │
│  • Can manage standard Users and Custom Roles        │
│  • Can assign 'user' or Custom Roles (if permitted)  │
│  • CANNOT assign anyone as an Admin                  │
│  • Cannot see or touch other admins or super admins  │
├─────────────────────────────────────────────────────┤
│  Custom Roles  (created via UI or seeder)            │
│  • Any subset of available permissions               │
│  • Optional active-user capacity limit               │
│  • Deletable only when no users are assigned         │
├─────────────────────────────────────────────────────┤
│  User  (default)                                     │
│  • No special permissions                            │
│  • Standard application access only                  │
└─────────────────────────────────────────────────────┘
```

---

## 3. Built-in Roles (System / Protected)

| Role | Slug | Protected | Default Max Active | Role Assignment Authority |
|---|---|---|---|---|
| Super Admin | `super_admin` | Yes | 2 | Can assign all roles (`admin`, `user`, custom roles); promotes to `super_admin` |
| Admin | `admin` | Yes | Unlimited | Can assign standard `user` and custom roles (cannot assign `admin` or `super_admin`) |
| User | `user` | Yes | Unlimited | None |

Protected roles cannot be renamed or deleted. They can have their permissions reconfigured
(except Super Admin's essential set, which is locked in the Configure modal).

---

## 4. Multi-Role Support

Users can be assigned **more than one role** simultaneously. This is fully supported by the
underlying Spatie package and the application's UI.

### How it works
- **Effective permissions** = the union of all permissions from all assigned roles.
- **Role display**: The sidebar user card shows all assigned roles (comma-separated) when the user is
  in Unified view, or shows the active role label when a specific role is selected.
- **Role assignment** in the Create/Edit user modal presents a **multi-select** (checkboxes) for all roles
  the acting user is permitted to assign.

### Key rules
- Only **Super Admins** can assign the `admin` or `super_admin` role.
- Admins can assign `user` and any custom roles.
- When validating, all role-level guards apply to the **entire set** of selected roles
  (e.g., if the set includes `admin`, a non-super-admin will be blocked).
- Capacity limits (`max_active_users`) are checked **per role** when activating an account.

---

## 5. Role View Switcher

The **Role View Switcher** is a UI component in the sidebar (bottom section) that lets eligible
users switch the active role perspective without actually changing their assigned roles.

### Who can use it
| User Type | Behaviour |
|---|---|
| **Super Admin** | Can switch to **any** active role in the system (including roles they don't personally hold). Switching to a non-owned role enters **Preview Mode**. |
| **Multi-role user** (non-Super Admin) | Can switch between their own assigned roles only. |
| **Single-role user** | Switcher is **hidden** — no switching available. |

### Modes
| Mode | Session state | Description |
|---|---|---|
| **Unified (All Roles)** | `active_role = null`, `is_previewing = false` | Default. User sees the union of all their roles' permissions. |
| **Role Focus** | `active_role = 'role_name'`, `is_previewing = false` | Multi-role user has selected one of their own roles to focus on. UI reflects only that role's permissions. |
| **Preview Mode** | `active_role = 'role_name'`, `is_previewing = true` | Super Admin is previewing a role they don't personally hold. A prominent amber banner appears at the top of the page. |

### Backend: `RoleSwitchController`
- `POST /switch-role` — validates and stores `active_role` + `is_previewing` in session.
- `POST /switch-role/exit` — clears both session keys, returns to Unified view.

### How permissions are resolved in Preview / Focus Mode
`HandleInertiaRequests` checks `active_role` from the session. If set:
1. It fetches the **role's own permissions** (not the user's union).
2. It passes a `simulatedCan` map to the frontend so navigation and UI are gated correctly.
3. Real PHP policy and gate checks on the backend still use the **actual user's true permissions**,
   preventing privilege escalation through the switcher.

> [!IMPORTANT]
> The Role View Switcher is **display-only** for the frontend. All write operations (store, update, delete)
> continue to use the real user's permissions — Super Admins cannot downgrade their backend authority
> by switching role views.

---

## 6. Permissions Reference

### Current Permissions

| Permission | Slug | Held by (default) | What it unlocks |
|---|---|---|---|
| Manage Users | `manage users` | Super Admin, Admin | Access the Accounts page; create, edit, delete, toggle status of standard `user` and custom role accounts |
| Manage Admins | `manage admins` | Super Admin | Full visibility of all accounts including other admins; create, edit, delete, and assign `admin` accounts (Super Admin exclusive) |
| Promote Super Admin | `promote super admin` | Super Admin | Promote an admin to Super Admin (within the 2-seat limit) |
| Transfer Super Admin | `transfer super admin` | Super Admin | Transfer own Super Admin role to an admin (actor becomes admin) |
| Manage Roles | `manage roles` | Super Admin | Access the Roles & Permissions page; create, configure, delete custom roles |
| Assign Roles | `assign roles` | Super Admin, Admin | Assign standard `user` or custom roles when creating or editing accounts. **Only Super Admins can assign the `admin` role.** |

### Permission Categories (UI grouping in RoleController)

| Category | Permissions |
|---|---|
| User Management | `manage users`, `manage admins` |
| Super Admin & Ownership | `promote super admin`, `transfer super admin` |
| Roles & Permissions | `manage roles` |
| *(auto)* Other Modules | Any permission not in the above categories is placed here automatically |

---

## 7. Policy Rules (UserPolicy)

These are enforced **in addition to** permission checks. Policies run via Laravel's `Gate`.

### `update` (Edit Account)
| Actor | Target | Result |
|---|---|---|
| Anyone | Super Admin | ❌ Denied — Super Admins cannot be edited via form |
| Super Admin / `manage admins` | Admin | ✅ Allowed |
| `manage users` | User / Custom Roles | ✅ Allowed |
| Anyone | Themselves | ✅ Allowed (own profile) |


> [!NOTE]
> **Role Assignment Guard**: Only Super Admins can assign the `admin` or `super_admin` role. If an Admin with `assign roles` edits or creates a user, they can only select `user` or custom roles (e.g. Moderator, Staff). The `Administrator` option is hidden from the modal for non-super-admins and strictly blocked on the backend.

### `delete` & `toggleStatus` (Merged Account Removal Workflow)

The system unifies account deletion and deactivation to protect audit trail integrity:
- **Clean Accounts (No Dependent Records)**: If an account has no associated records across any registered relations (e.g. `activity_logs`, `notifications`), it can be **permanently deleted**.
- **Accounts with History (Audit Protected)**: If an account has performed actions or is linked to historical business records, **permanent deletion is strictly blocked**. The account can only be **deactivated** to revoke sign-in privileges while preserving audit history.

| Actor | Target | Has Records? | Result |
|---|---|---|---|
| Anyone | Themselves | Any | ❌ Denied |
| Non-Super-Admin | Super Admin | Any | ❌ Denied |
| Super Admin | Last Super Admin | Any | ❌ Denied |
| `manage admins` | Admin | No | ✅ Permanent Delete |
| `manage admins` | Admin | Yes | ⚠️ Deactivate Only (Delete blocked) |
| `manage users` | User / Custom Role | No | ✅ Permanent Delete |
| `manage users` | User / Custom Role | Yes | ⚠️ Deactivate Only (Delete blocked) |

> [!TIP]
> **On-Demand Dependency Check**: Dependency inspection runs on-demand via `GET /users/{user}/deletion-check` when the admin clicks **Remove account**, ensuring zero performance penalty on the main accounts directory page.

### `promoteSuperAdmin`
- Requires `promote super admin` permission
- Target must not already be a Super Admin
- System must have fewer than 2 active Super Admins

### `transferSuperAdmin`
- Requires `transfer super admin` permission
- Actor and target must be different users
- Target must not already be a Super Admin

### `demoteSuperAdmin`
- Actor must be a Super Admin
- Target must be a Super Admin
- At least 2 Super Admins must exist

---

## 8. What Admins Cannot Do (Quick Reference)

- ❌ **Assign anyone as an Admin (`admin` role)** — only Super Admins can assign or promote someone to Admin
- ❌ **Assign anyone as a Super Admin (`super_admin` role)** — only Super Admins can promote via dedicated action
- ❌ **Delete accounts with existing audit history** — such accounts must be deactivated instead
- ❌ See other admins or super admins in the Accounts table
- ❌ Edit or delete any admin or super admin account
- ❌ Access the Roles & Permissions page (requires `manage roles`)
- ❌ Promote or transfer Super Admin privileges
- ✅ Create, edit, deactivate, and delete standard `user` accounts and custom role accounts
- ✅ Assign `user` or custom roles to accounts (if holding `assign roles`)

---

## 9. Role Capacity Limits (`max_active_users`)

Custom roles (and Super Admin) can have a cap on the number of **active** users assigned to them.

- Stored as `max_active_users` on the `roles` table (nullable = unlimited).
- Deactivated users do **not** count toward this limit.
- Super Admin is seeded with a cap of `2`.
- The UI shows `{active}/{max} active` in the Personnel column of the Roles page.
- Capacity is enforced in `promoteSuperAdmin` policy check via `Role::hasReachedCapacity()`.
- For multi-role users, capacity is checked **per role** when toggling the account to active.

---

## 10. Activity Logs

All significant account and role actions are recorded in the `activity_logs` table.

| Field | Description |
|---|---|
| `actor_id` / `actor_name` | Who performed the action (name preserved if user is later deleted) |
| `action` | Verb: `created`, `updated`, `deleted`, `promoted`, `demoted`, `transferred`, `activated`, `deactivated` |
| `subject_type` | `User` or `Role` |
| `subject_id` / `subject_name` | What was acted on |
| `metadata` | JSON blob with extra context (e.g. old role → new role) |

Logs are visible in the **Activity History** tab on the Accounts and Roles pages, scoped to
users with `manage users` and `manage roles` permissions respectively.

---

## 11. Seeded Default State

| Entity | Value |
|---|---|
| Super Admin account | `superadmin@example.com` / `password` |
| Admin account | `admin@example.com` / `password` |
| User account | `user@example.com` / `password` |
| Super Admin permissions | All 6 permissions |
| Admin permissions | `manage users`, `assign roles` |
| User permissions | None |
| Super Admin seat limit | 2 |
