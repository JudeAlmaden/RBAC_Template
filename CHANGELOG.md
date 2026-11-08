# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] - 2026-11-08

Everything here is new: onboarding and password recovery were rebuilt around signed setup links, the stage screen became the authoring workspace, learners got their own reading surface, access moved from role names to permissions, and the whole interface now themes from one set of semantic colour tokens.

Nothing in this file has been released. The project is still on the `1.0.0` template baseline, and a version number is assigned only when a release is actually cut.

### Added
- **Signed Setup-Link Onboarding** — New accounts are created without a password; the invitee receives a signed, 72-hour link to `onboarding.show`, chooses their own password and is signed in. `OnboardingController`, `SetupLink` and the `Onboarding/Show` page back the flow, and administrators can re-issue the link from the account page.
- **Admin Password Resets** — `UserController` can send the same signed setup link to any account, so an administrator can force a reset without knowing or setting a password.
- **Shared Password Policy** — `PasswordPolicy`, plus `PasswordField`, `PasswordRequirements` and `SetupProgress`, apply the minimum-length and confirmation rules consistently across onboarding, reset and profile screens.
- **Inertia-Aware Rate Limiting** — `RateLimitRequests` wraps Laravel's throttle middleware so Inertia requests get a flash toast and `Retry-After` instead of a 429 error modal; `login`, `password-reset`, `onboarding` and `web` limiters are wired in `bootstrap/app.php`.
- **Force Password Change** — Accounts flagged `must_change_password` are routed to profile settings with a persistent banner until they set a new password.
- **Single-Page Stage Editor** — The stage screen (`/topics/{topic}/stages/{stage}`) is now the authoring workspace itself: slide rail, layout canvas and inspector share one surface, with Preview, Discard, Save and a `⋯` delete action living in the stage header.
- **Slide Builder** — Slides (container pages) can be added, duplicated, reordered and deleted, each with its own title, layout (`single_column`, `split_two_column`, `cinema_focus`, `tabbed_stepper`) and per-layout droppable slots.
- **Component Palette** — Text, Media, Code and Embed presets (heading, paragraph, note/warning callout, objectives, checklist, steps, accordion, table, image, video, audio, code, terminal, download, embed) that map onto existing `content_blocks` rows and their display variants; components are dropped into a slot and edited in the inspector.
- **Bulk Component Operations** — Multi-select in the canvas or inspector to duplicate, move or delete several components at once, including across slides.
- **Stage Settings Inspector** — Title, section type, instructions and the required/published flags edit inline and are submitted together with the slides in a single save.
- **Learner Reading Experience** — `LearnerTopicLayout` with a stages-only rail, stage intro heading and themed reading surface, plus new learner course, module and topic pages with progress, prerequisites and prev/next stage navigation.
- **Granular Content Permissions** — `manage courses`, `manage curriculum` and `view admin dashboard` are seeded and assignable; the course, module, topic, stage, page and admin dashboard controllers gate on them instead of hardcoded admin roles, and they are shared to the frontend as `can.manageCourses`, `can.manageCurriculum` and `can.viewAdminDashboard`.
- **Collapsible Sidebar** — Top-bar toggle with `localStorage` persistence; the stage editor passes `startCollapsed` so the editor opens at full width.
- **Grouped Sidebar Navigation** — Dashboard, LEARN, MANAGE (permission-gated) and ACCOUNT groups; notifications left the sidebar and remain available from the top-bar bell.

### Changed
- **Semantic Theme Tokens** — Every surface, line, text, accent and scrollbar colour is now a CSS variable in `resources/css/app.css` for light and dark, exposed through `tailwind.config.js` as `bg-surface`, `border-line`, `text-muted`, `text-accent`, `bg-sidebar` and friends, with opacity modifiers preserved.
- **Theme-Token Migration** — All components, layouts and pages use those semantic classes instead of literal hex values and paired `dark:` overrides; the duplicated `useDarkMode`/`useColorMode` hooks inside the authenticated and guest layouts are replaced by the shared `useTheme`.
- **Global UI Density** — `html { font-size: 87.5% }` sets a 14px base so rem-based spacing and type densify the interface like browser zoom without overflowing the viewport, and themed scrollbars replace the OS grey on both axes.
- **Top Bar Alignment** — The top bar is `h-16`, matching the sidebar brand strip so their bottom borders meet.
- **Stage Authoring Unified** — The separate `/stages/{stage}/builder` page is folded into the stage page, so stage metadata and its slides are edited and saved in one place.
- **Module Accordions Collapsed by Default** — The course curriculum screen no longer expands every module when it loads.
- **Sidebar Scrolls Independently** — The navigation scrolls within the sidebar with a thin themed scrollbar instead of scrolling with the page.

### Removed
- `stages.builder.show` route, `StageBuilderController@show()` and `resources/js/Pages/Courses/Stages/Builder/Index.jsx`.
- `StagePagesList.jsx` and `StagePageModal.jsx`, superseded by the slide rail and inspector.

### Fixed
- Dark mode no longer flashes the light canvas on reload or first navigation, because the stored colour mode is applied before first paint.
- Scrollbars follow the active theme instead of staying dark grey in light mode.
- Repaired 93 `.jsx` files damaged by a search-and-replace that removed every lowercase `d`, restoring the build and pages.
- Sidebar navigation no longer drags the page scroll with it.
- Breadcrumb and stage header no longer duplicate the stage title now that the header edits it in place.

### Technical
- New: `app/Http/Controllers/StageBuilderController.php`; `resources/js/Pages/Courses/Stages/Builder/` (`registry.js`, `operations.js`, `Canvas`, `SlideRail`, `Inspector`, `BlockPalette`, `BlockCanvasItem`, `LayoutRenderer`, `blockEditors`, `blockRenderers`, `StageBuilder`); `resources/js/Layouts/LearnerTopicLayout.jsx`; `resources/js/Pages/Learner/{Courses,Modules,Topics}/Show.jsx`; `.agents/Documentation/COURSE_MAKER_PLAN.md`
- New: `resources/js/theme.js`; `app/Support/SetupLink.php`, `PasswordPolicy.php`; `app/Http/Controllers/OnboardingController.php`; `app/Http/Middleware/RateLimitRequests.php`; `app/Notifications/AccountInvitation.php`; `resources/js/Pages/Onboarding/Show.jsx`; `resources/js/Components/SetupLinkNotice.jsx`, `Components/Auth/{PasswordField,PasswordRequirements,SetupProgress}.jsx`
- Modified: `routes/web.php`, `routes/auth.php`, `bootstrap/app.php`, `TopicSectionController`, `TopicController`, `ModuleController`, `CourseController`, `SectionPageController`, `AdminDashboardController`, `DashboardController`, `RoleController`, `HandleInertiaRequests`, `User`, `ContentBlock`, `DatabaseSeeder`, `app.blade.php`, `app.css`, `tailwind.config.js`, `theme.js`, `package.json`, `package-lock.json`
- Modified: 4 layouts, 24 shared components and 55 pages migrated to the semantic theme classes (`AuthenticatedLayout`, `GuestLayout`, `SetupLayout`, `LearnerTopicLayout`, `Users/*`, `Courses/*`, `Learner/*`, `Auth/*`, `Dashboard`, `Welcome`)
- Deleted: `resources/js/Pages/Courses/Stages/Builder/Index.jsx`, `resources/js/Pages/Courses/Stages/Partials/StagePagesList.jsx`, `resources/js/Pages/Courses/Stages/Partials/StagePageModal.jsx`
- Tests: 123 passing / 571 assertions; Pint clean (116 files); `npm run build` clean

---

## 2026-11-05 — Curriculum authoring (unreleased)

### Added
- **Dedicated Stage View** — Each learning stage in the pipeline now has its own full page (`/topics/{topic}/stages/{stage}`). Features breadcrumb trail (Courses → Course → Module → Topic → Stage), Prev/Next stage pager, hero card with section-type badge + colored metadata, 4-stat grid (Content Blocks, Activities, Layout, Required), and inline Edit Stage modal.
- **Multi-Stage / Grouped Pipeline Display** — The Pedagogical Learning Pipeline now auto-groups consecutive stages of the same type (e.g., two back-to-back Encode stages) under a collapsible group header showing the type badge and part count. Single-type stages render as before; multi-part groups expand/collapse via a toggle. No schema changes required — multiple stages of the same type are fully supported by the existing position-ordered model.
- **Modularized Course, Module & Stage Pages** — Decomposed `Courses/Show.jsx`, `Modules/Show.jsx`, and `Stages/Index.jsx` into reusable partials: `CourseHeroCard`, `CourseCurriculumTab`, `CourseLearnersTab`, `ModuleHeroCard`, `ModuleTopicList`, `StageHeroCard`, `StagePipelineList`.
- **Reusable `Breadcrumbs` Component** — Unified accessible breadcrumb strip with back-arrow button, ChevronRight separators, `aria-current`, and long-label truncation. Shared across Course, Module, and Stage views.
- **Consistent Hero Card Design** — Course, Module, and Stage views all share the same layout: icon avatar, title + status badge, meta links, 4-stat grid, primary CTA + `ActionDropdown`.
- **`ActionDropdown` Component** — Portal-based popover for Edit/Delete secondary actions across all resource pages.

### Changed
- **Stage Pipeline rows are clickable** — Clicking a stage card navigates to the new dedicated Stage Show page. Reorder (↑↓) and Delete buttons stop event propagation to avoid accidental navigation.
- **Module rows are clickable** — Clicking a module row in the Course curriculum navigates directly to the Module Show page; removed redundant "View Module" button.
- **Course rows are clickable** — Clicking a course row in the index navigates to Course Show; action buttons stop propagation.
- **Stage Hero Card** — Removed "Generate Preset" button from the hero card top bar; preset generation is now only available from the pipeline's empty state.

### Fixed
- Breadcrumb inconsistency across Courses / Modules / Topics / Stages resolved with shared `Breadcrumbs` component and consistent `backHref` wiring.

### Technical
- Modified: `routes/web.php` — added `topics.stages.show` GET route
- Modified: `app/Http/Controllers/TopicSectionController.php` — added `show()` method with sibling pagination
- Modified: `app/Http/Controllers/ModuleController.php` — added `show()` with sibling modules
- New: `resources/js/Pages/Courses/Stages/Show.jsx`
- New: `resources/js/Pages/Courses/Stages/Partials/StageHeroCard.jsx`, `StagePipelineList.jsx`, `StageFormModal.jsx`
- New: `resources/js/Pages/Courses/Modules/Partials/ModuleHeroCard.jsx`, `ModuleTopicList.jsx`
- New: `resources/js/Pages/Courses/Partials/CourseHeroCard.jsx`, `CourseCurriculumTab.jsx`, `CourseLearnersTab.jsx`
- New: `resources/js/Components/Breadcrumbs.jsx`, `components/ActionDropdown.jsx`
- Tests: 88 passing — lint/typecheck clean

---

## 2026-10-28 — Administration surface (unreleased)

### Added
- **Grouped Effective Permissions Matrix by Role** — `UserPermissionsMatrix` renders permissions dynamically segmented per assigned role with role badges/icons (`Crown`, `Shield`, `User`, `Sparkles`), permission counts, Super Admin wildcard banner, and distinct PBAC direct overrides.
- **Modular User Profile Architecture** — Extracted `Show.jsx` into focused sub-components: `UserProfileCard`, `UserProfileActions`, `UserPermissionsMatrix`, and `UserActivitySection`.
- **Audit & Activity Logs Module** — New `ActivityLogController` with paginated, filterable log index (`GET /activity-logs`) and CSV export (`GET /activity-logs/export`). Supports filtering by search keyword, action type, subject type, and date range.
- **Audit Logs Nav Link** — Added "Audit Logs" entry with `History` icon to the authenticated sidebar, visible to users with `viewLogs` permission.
- **User Profile & Audit Page** — New `resources/js/Pages/Users/Show.jsx` full-page profile view with tabbed activity log (actions _by_ the user and actions _on_ the user), role/status summary, and metadata inspector modal.
- **View Profile & Audit action** — "View Profile & Audit" shortcut added to the `UserRowActions` dropdown menu on the Users page.
- **Clickable User Names in Users Table** — User names in `/users` now link directly to their profile/audit page, consistent with the Actor column in Activity Logs.
- **Seed Activity Logs** — `DatabaseSeeder` now seeds representative `ActivityLog` entries for the bootstrap event and initial user creations.
- **Starter Kit Landing Page** — Redesigned `resources/js/Pages/Welcome.jsx` into a clean, unopinionated developer starter kit homepage featuring modular capability cards and copyable terminal quickstart commands.
- **Pre-Seeded Credentials Cards** — Interactive copyable test credentials for `superadmin@example.com`, `admin@example.com`, and `user@example.com` on the homepage.
- **Unified CI & Auto-Release Pipeline** — Consolidated GitHub Actions workflows into `.github/workflows/ci.yml` with automated tag checking, changelog extraction, and release publishing on pushes to `main`.
- **Pipeline Concurrency Controls** — Added concurrency group cancellation (`ci-${{ github.ref }}`) to automatically terminate superseded workflow runs.

### Changed
- **User Profile Card Redesign** — Streamlined profile overview with inline account ID (`#id`), subtle non-intrusive status dot (`• Active` / `• Deactivated`), top-right anchored `Actions ▾` dropdown, and a structured 4-column key-value metrics grid (`Member Since`, `Email Status`, `Actions Executed`, `Changes Received`).
- **Table Row Deactivate / Activate Actions** — Attached direct Deactivate and Activate account options in `UserRowActions` on the Users directory table, cleanly distinguishing reversible status toggling from permanent account deletion.
- **Role Editing Guardrails** — Added locked indicator in `EditUserModal` preventing non-Super Admins from revoking or assigning the Super Admin role.
- **`UserController::show`** — Now returns `roles_with_permissions` mapping each role to its assigned permissions for grouped display.
- **`ActivityLog` Model** — Extended with `$fillable`, cast definitions, and helper accessors for human-readable timestamps.
- **`User` Model** — Added `activityLogsBy()` and `activityLogsOn()` relationship helpers used by the Show page.
- **`UserController`** — Added `show()` action to load a user's profile data, role assignments, and paginated audit logs for `users.show`.
- **`HandleInertiaRequests`** — Exposes `can.viewLogs` to the Inertia shared props for sidebar visibility gating.
- **`activity_logs` migration** — Added `subject_name` and `actor_name` string columns for tombstone-safe display after account deletion.
- **Login button state** — Login `<PrimaryButton>` is now disabled when email or password fields are empty, preventing redundant submit attempts.
- **Node.js Environment** — Upgraded GitHub Actions runners to Node 22 (LTS with npm 11) for stable dependency resolution.
- **NPM Package Configuration** — Added `"version": "1.1.0"` and `npm test` script to `package.json`.

### Removed
- **Redundant Release Workflow** — Removed `.github/workflows/release.yml` in favor of the consolidated pipeline.
- **AI Design Artifacts** — Removed artificial blurred gradients, pulsing skeleton mockups, and marketing copy from the welcome page.

### Fixed
- **Dependabot Peer Dependency Breakage** — Added ignore rules for major version bumps of `@vitejs/plugin-react` in `.github/dependabot.yml` to prevent peer dependency conflicts with Vite 6.
- **NPM Arborist Tree Solver Crashes** — Configured `legacy-peer-deps=true` in `.npmrc` to prevent `edgesOut` null reference errors during CI installations.

### Technical
- New: `.agents/Agents.md`, `app/Http/Controllers/ActivityLogController.php`, `resources/js/Pages/ActivityLogs/Index.jsx`, `resources/js/Pages/Users/Show.jsx`, `resources/js/Pages/Users/Partials/UserProfileCard.jsx`, `resources/js/Pages/Users/Partials/UserProfileActions.jsx`, `resources/js/Pages/Users/Partials/UserPermissionsMatrix.jsx`, `resources/js/Pages/Users/Partials/UserActivitySection.jsx`
- Modified: `CHANGELOG.md`, `.github/dependabot.yml`, `.github/workflows/ci.yml`, `.gitignore`, `.npmrc`, `package.json`, `resources/js/Pages/Welcome.jsx`, `app/Http/Controllers/UserController.php`, `app/Http/Middleware/HandleInertiaRequests.php`, `app/Models/ActivityLog.php`, `app/Models/User.php`, `database/migrations/2026_09_09_004538_create_activity_logs_table.php`, `database/seeders/DatabaseSeeder.php`, `resources/js/Layouts/AuthenticatedLayout.jsx`, `resources/js/Pages/Auth/Login.jsx`, `resources/js/Pages/Roles/Index.jsx`, `resources/js/Pages/Users/Index.jsx`, `resources/js/Pages/Users/Partials/EditUserModal.jsx`, `resources/js/Pages/Users/Partials/UserRowActions.jsx`, `resources/js/Pages/Users/Partials/UserTable.jsx`, `routes/web.php`
- Deleted: `.github/workflows/release.yml`

---

## [1.0.0] - 2026-09-09 — Template baseline

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
