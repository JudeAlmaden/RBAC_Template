# Template — Laravel + React + Inertia Starter

A production-grade monolith starter with a full authentication system, multi-role RBAC/PBAC, activity audit trail, and a polished React UI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 12 / PHP 8.4+ |
| Frontend | React 19 + Inertia.js v2 |
| Routing | Ziggy.js (named Laravel routes in JS) |
| Styling | Tailwind CSS v4 + custom design tokens |
| Build | Vite 8 with HMR |
| Auth | Laravel Breeze (extended) |
| Permissions | Spatie Laravel Permission |
| Database | SQLite (default) · MySQL · PostgreSQL |

---

## Quick Start

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
```

Then run both servers concurrently (separate terminals):

```bash
php artisan serve   # http://localhost:8000
npm run dev         # Vite HMR
```

---

## Seeded Accounts

| Role | Email | Password |
|---|---|---|
| Super Admin | `superadmin@example.com` | `password` |
| Admin | `admin@example.com` | `password` |
| User | `user@example.com` | `password` |

> **Change all passwords after first login.**

---

## Features

### Authentication & Authorization
- Email + password login with rate limiting (10 attempts / min / IP)
- `must_change_password` flag — admin-created accounts are forced to change password on first login
- Multi-role RBAC via **Spatie Laravel Permission** (users can hold multiple roles simultaneously)
- Fine-grained PBAC with six built-in permissions
- Laravel Policy layer (`UserPolicy`) for contextual access rules
- Super Admin bypass via `Gate::before()`

### Role System
| Role | Slug | Notes |
|---|---|---|
| Super Admin | `super_admin` | Full authority; max 2 seats; bypasses all permission checks |
| Admin | `admin` | Manages users and custom roles; cannot assign/promote Admins |
| User | `user` | Default role; no special permissions |
| Custom | any | Created via UI; any permission subset; optional seat cap |

See `.agents/Documentation/RBAC-PBAC.md` for the full reference.

### Role View Switcher
Sidebar component that lets eligible users switch their active role perspective:
- **Super Admin** — can preview *any* active role in the system (Preview Mode shows an amber banner)
- **Multi-role users** — can switch between their own assigned roles
- **Single-role users** — switcher is hidden

### Account Management
- Create, edit, deactivate, and permanently delete user accounts
- Audit-protected deletion: accounts with activity history can only be deactivated
- On-demand deletion eligibility check (no performance cost on the list page)
- Promote / demote / transfer Super Admin with policy guards

### Roles & Permissions Page
- Create and configure custom roles with per-permission toggles
- Optional active-user seat cap per role
- Lock essential permissions per role in the UI

### Activity Audit Log
- All account and role actions are recorded in `activity_logs`
- Visible in **Activity History** tab on Accounts and Roles pages
- Server-side paginated (20/page) with **search** (actor, subject) and **action-type filter**
- Preserved actor/subject names survive user deletion

### Notification System
- Custom database-backed notification system (not Laravel's built-in)
- Broadcast (all users) and targeted (per-user) notifications
- Severity levels: `info`, `success`, `warning`, `danger`
- Bell icon in the top bar with unread badge; dismissible panel

### UI / UX
- Polished sidebar layout with dark/light mode (persisted to `localStorage`)
- Toast notification system (success / error / warning)
- Avatar initials component with deterministic colors
- Responsive — mobile sidebar with overlay

---

## Project Structure (Key Files)

```
Template/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── UserController.php          # Account CRUD + promote/demote/transfer
│   │   │   ├── RoleController.php          # Role & permission management
│   │   │   ├── RoleSwitchController.php    # Role view switcher (session)
│   │   │   └── NotificationController.php  # Notification feed API
│   │   ├── Middleware/
│   │   │   ├── HandleInertiaRequests.php   # Shared props, roleContext, simulatedCan
│   │   │   └── ForcePasswordChange.php     # Redirect if must_change_password
│   │   └── Requests/
│   │       ├── StoreUserRequest.php
│   │       └── UpdateUserRequest.php
│   ├── Models/
│   │   ├── User.php                        # HasRoles, helper methods, $relevantRelations
│   │   ├── Role.php                        # Extended Spatie Role with capacity + isProtected()
│   │   ├── ActivityLog.php                 # Audit trail (record() factory method)
│   │   └── Notification.php               # Custom notification model
│   └── Policies/
│       └── UserPolicy.php                  # update, delete, toggleStatus, promote, transfer
├── resources/js/
│   ├── Components/
│   │   ├── ActivityLogTable.jsx            # Server-paginated log table with search/filter
│   │   ├── NotificationPanel.jsx           # Bell dropdown, polling
│   │   ├── RoleSwitcher.jsx                # Role view switcher dropdown
│   │   ├── RolePreviewBanner.jsx           # Amber preview mode banner
│   │   ├── Avatar.jsx                      # Deterministic initials avatar
│   │   └── Toast.jsx                       # Context-based toast system
│   ├── Layouts/
│   │   └── AuthenticatedLayout.jsx         # Sidebar, top bar, dark mode, toast provider
│   └── Pages/
│       ├── Dashboard.jsx
│       ├── Users/Index.jsx                 # Account management + activity history
│       └── Roles/Index.jsx                 # Roles, permissions, activity history
├── database/
│   └── seeders/DatabaseSeeder.php          # Roles, permissions, and 3 default accounts
├── routes/
│   ├── web.php                             # All authenticated routes
│   └── auth.php                            # Login, register, password routes
└── .agents/Documentation/                  # Agent-readable reference docs
    ├── RBAC-PBAC.md                        # Full access control reference
    ├── NOTIFICATIONS.md                    # Notification system reference
    └── EXTENDING.md                        # Guide for adding new modules/permissions
```

---

## Customisation

### App Name
Update in three places:
```env
# .env
APP_NAME=YourApp
VITE_APP_NAME="${APP_NAME}"
```
The sidebar brand name in `AuthenticatedLayout.jsx` (line ~217) also reads a hardcoded `"Template"` — update that to match.

### Logo
Edit `resources/js/Components/ApplicationLogo.jsx` and replace the SVG.

### Adding a New Module (Page + Permission)
See `.agents/Documentation/EXTENDING.md` for a full walkthrough covering:
- Seeding new permissions
- Controller + route setup
- Activity log integration
- Sidebar nav link
- Deletion guard wiring

### Adding Notification Types
See `.agents/Documentation/NOTIFICATIONS.md`. Types are free-form strings — no migration needed.

---

## Agent Documentation

Structured reference docs for AI coding agents are in `.agents/Documentation/`:

| File | Contents |
|---|---|
| `RBAC-PBAC.md` | Role hierarchy, permissions, policies, multi-role & role switcher |
| `NOTIFICATIONS.md` | Notification schema, `send()` API, severity levels, frontend panel |
| `EXTENDING.md` | Step-by-step guide for adding permissions, pages, policies, deletion guards |
