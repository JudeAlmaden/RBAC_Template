# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-10-28

### Added
- **Starter Kit Landing Page** — Redesigned `resources/js/Pages/Welcome.jsx` into a clean, unopinionated developer starter kit homepage featuring modular capability cards and copyable terminal quickstart commands.
- **Pre-Seeded Credentials Cards** — Interactive copyable test credentials for `superadmin@example.com`, `admin@example.com`, and `user@example.com` on the homepage.
- **Unified CI & Auto-Release Pipeline** — Consolidated GitHub Actions workflows into `.github/workflows/ci.yml` with automated tag checking, changelog extraction, and release publishing on pushes to `main`.
- **Pipeline Concurrency Controls** — Added concurrency group cancellation (`ci-${{ github.ref }}`) to automatically terminate superseded workflow runs.

### Changed
- **Node.js Environment** — Upgraded GitHub Actions runners to Node 22 (LTS with npm 11) for stable dependency resolution.
- **NPM Package Configuration** — Added `"version": "1.1.0"` and `npm test` script to `package.json`.

### Removed
- **Redundant Release Workflow** — Removed `.github/workflows/release.yml` in favor of the consolidated pipeline.
- **AI Design Artifacts** — Removed artificial blurred gradients, pulsing skeleton mockups, and marketing copy from the welcome page.

### Fixed
- **Dependabot Peer Dependency Breakage** — Added ignore rules for major version bumps of `@vitejs/plugin-react` in `.github/dependabot.yml` to prevent peer dependency conflicts with Vite 6.
- **NPM Arborist Tree Solver Crashes** — Configured `legacy-peer-deps=true` in `.npmrc` to prevent `edgesOut` null reference errors during CI installations.

### Technical
- Modified: `.github/dependabot.yml`, `.github/workflows/ci.yml`, `.gitignore`, `.npmrc`, `package.json`, `resources/js/Pages/Welcome.jsx`
- New: `.agents/Agents.md`
- Deleted: `.github/workflows/release.yml`
- Tests: 71 passing (288 assertions) — lint clean

---

## [1.0.0] - 2026-09-09

### Added

#### Multi-Role RBAC & PBAC Access Control
- **Multi-Role Support** — Users can hold multiple roles simultaneously with effective permissions resolved as the union of all assigned roles.
- **Spatie Laravel Permission** — Integrated `roles` and `permissions` tables with many-to-many relationships.
- **Role Hierarchy & Caps** — Built-in roles (`super_admin` capped at 2, `admin`, `user`) and support for custom roles with optional seat limits (`max_active_users`).
- **Granular Permissions** — `manage users`, `manage admins`, `promote super admin`, `transfer super admin`, `manage roles`, `assign roles`.
- **Policy & Gate Architecture** — `UserPolicy` and `RolePolicy` enforce granular rules; `Gate::before()` enables Super Admin bypass.
- **Role View Switcher** — Sidebar component allowing users to switch active perspective without altering real database assignments. Super Admins can preview any system role (with sticky warning banner); multi-role users can switch between their own roles.
- **`RoleSwitchController`** — `POST /switch-role` and `POST /switch-role/exit` endpoints with simulated UI permissions via `HandleInertiaRequests`.

#### Accounts & Roles Administration
- **User Management** — Create, update, toggle status (activate/deactivate), and delete accounts with modal interfaces.
- **Super Admin Lifecycle** — Guarded actions for promoting, transferring, and demoting Super Admins with dedicated policies and modals.
- **Role Management** — Create, edit, toggle status, and delete custom roles with categorized permission checkboxes.
- **Protected Roles & Deletion Guard** — Built-in roles cannot be deleted or renamed (`isProtected()`). Accounts with associated relational records are protected from permanent deletion (`$relevantRelations` with on-demand check via `GET /users/{user}/deletion-check`).

#### Audit Trail & Activity Logs
- **`ActivityLog` Model & Migration** — Lightweight audit trail recording all user and role mutations (actor, subject, action, details). Retains actor and subject names even if accounts are subsequently deleted.
- **Activity History Views** — Embedded activity log tabs on Accounts and Roles pages.
- **Server-Side Pagination & Filtering** — Full server-side pagination (`->paginate(20)`) with keyword search (triggerable on Enter or Search button) and action-type filter pills (`Created`, `Updated`, `Deleted`, `Promoted`, etc.).

#### Notification System & Notification Center
- **Database Notifications** — Custom `Notification` model supporting targeted (user-specific) and broadcast notices with severity levels (`info`, `success`, `warning`, `danger`), icons, and action URLs.
- **Event Triggers** — Automatic notification dispatch on user creation, role changes, account deletion, status toggles, and Super Admin transfers/promotions/demotions.
- **Dedicated Notification Center** — Full-page feed (`/notifications`) with status tabs (`All`, `Unread`, `Read`), severity filters, keyword search, mark-as-read, dismiss, bulk "Mark all read", and "Clear read" controls with server-side pagination.
- **Quick Bell Panel** — Top-bar slide-out dropdown for quick unread reviews and "Mark all read" with direct link to the full notifications center.
- **Sidebar Integration** — Live unread counter badge on the sidebar navigation.

#### UI, UX & Design System
- **Dark / Light Mode** — Theme toggle persisted to `localStorage` with system preference detection.
- **Toast Notifications** — Context-based, auto-dismissing feedback toasts replacing inline flash alerts.
- **Avatar System** — Deterministic initials-based avatar component with color assignments.
- **Reusable Pagination** — Accessible and responsive pagination bar supporting custom item labels.

#### Security & Quality Assurance
- **Forced Password Change** — `must_change_password` flag and `ForcePasswordChange` middleware requiring newly created accounts to set a custom password on first login.
- **Login Rate Limiting** — IP-based throttle configured for authentication routes (10 attempts/minute).
- **Automated Test Suite** — Comprehensive PHPUnit feature test suite covering authentication, RBAC/PBAC policies, role switching, user capacity guards, activity logging, and notifications (71 passing tests, 288 assertions).
- **Agent & Developer Docs** — Dedicated documentation guides under `.agents/Documentation/` (`RBAC-PBAC.md`, `NOTIFICATIONS.md`, `EXTENDING.md`).
