# Notification System Reference

This application uses a **custom, database-backed notification system** — not Laravel's built-in
`Illuminate\Notifications`. All notifications are stored in the `notifications` table and served
via `app/Models/Notification.php`.

---

## 1. Schema

| Column | Type | Description |
|---|---|---|
| `id` | UUID (string) | Auto-generated UUID primary key |
| `recipient_id` | FK → users (nullable) | Target user. `null` = **broadcast** (all users see it) |
| `sender_id` | FK → users (nullable) | Who sent it. `null` = system-generated |
| `sender_name` | string (nullable) | Preserved sender name (survives user deletion) |
| `type` | string | Machine-readable slug, e.g. `account.created`, `role.assigned` |
| `title` | string | Short headline shown in the notification panel |
| `body` | text (nullable) | Optional longer description |
| `action_url` | string (nullable) | URL for a CTA button |
| `action_label` | string (nullable) | Label for the CTA button (e.g. `"View Account"`) |
| `icon` | string (nullable) | Lucide icon name, e.g. `"user"`, `"shield-check"` |
| `severity` | string | `info` · `success` · `warning` · `danger` |
| `read_at` | timestamp (nullable) | Set when the user reads the notification |
| `dismissed_at` | timestamp (nullable) | Set when the user dismisses it (soft-removes from feed) |
| `metadata` | JSON (nullable) | Any extra structured context |

---

## 2. Sending Notifications

Use the static `Notification::send()` factory. It persists and returns the model.

### Signature

```php
Notification::send(
    recipient: ?User,   // null = broadcast to all users
    sender:    ?User,   // null = system message
    type:      string,  // machine-readable slug
    title:     string,  // headline
    options:   array    // see below
);
```

### Options array

```php
[
    'body'         => 'Optional detail text.',
    'action_url'   => '/users',
    'action_label' => 'View Accounts',
    'icon'         => 'user-check',        // Lucide icon name
    'severity'     => 'success',           // info | success | warning | danger
    'metadata'     => ['key' => 'value'],  // any extra data
]
```

---

## 3. Usage Examples

### 3.1 System broadcast (no sender, all users)

```php
Notification::send(
    recipient: null,
    sender:    null,
    type:      'system.maintenance',
    title:     'Scheduled maintenance at 2AM tonight',
    options:   [
        'severity' => 'warning',
        'icon'     => 'wrench',
        'body'     => 'The system will be unavailable for ~15 minutes.',
    ]
);
```

### 3.2 Targeted notification with a CTA

```php
Notification::send(
    recipient: $targetUser,
    sender:    $request->user(),
    type:      'account.role_changed',
    title:     'Your account role has been updated',
    options:   [
        'body'         => "Your role was changed to {$newRole}.",
        'action_url'   => route('dashboard'),
        'action_label' => 'Go to Dashboard',
        'severity'     => 'info',
        'icon'         => 'shield',
        'metadata'     => ['old_role' => $oldRole, 'new_role' => $newRole],
    ]
);
```

### 3.3 System notification to a specific user (no sender)

```php
Notification::send(
    recipient: $user,
    sender:    null,
    type:      'account.password_reset_required',
    title:     'You must change your password',
    options:   [
        'severity' => 'danger',
        'icon'     => 'lock',
    ]
);
```

---

## 4. Severity Levels

| Level | Use case | Color in UI |
|---|---|---|
| `info` | General updates, FYI messages | Blue |
| `success` | Confirmations, completed actions | Green |
| `warning` | Things to be aware of, approaching limits | Amber |
| `danger` | Errors, security alerts, blocked actions | Red |

---

## 5. Broadcast vs. Targeted

| | Broadcast | Targeted |
|---|---|---|
| `recipient_id` | `null` | User's ID |
| Visible to | **All** authenticated users | Only the recipient |
| Typical use | System announcements, maintenance | Account changes, personal alerts |

The `scopeForUser($userId)` query scope in `Notification.php` handles this automatically —
it returns rows where `recipient_id = $userId OR recipient_id IS NULL`.

---

## 6. Notification Lifecycle

```
Created ──► Unread (visible in panel)
               │
               ├─► markRead()      sets read_at (stays in feed, unread dot removed)
               │
               └─► dismiss()       sets dismissed_at + read_at (removed from feed)
```

- **Unread count** badge in the sidebar shows `whereNull('read_at') AND whereNull('dismissed_at')`.
- Dismissed notifications are permanently hidden from the feed but not deleted from the DB
  (useful for auditing/reporting later).
- "Mark all as read" (`PATCH /notifications/read-all`) bulk-updates `read_at` for all unread
  notifications of the current user.

---

## 7. API Routes

| Method | URL | Action |
|---|---|---|
| `GET` | `/notifications` | Paginated feed (HTML via Inertia or JSON via XHR) |
| `PATCH` | `/notifications/read-all` | Mark all as read |
| `PATCH` | `/notifications/{id}/read` | Mark single notification as read |
| `DELETE` | `/notifications/{id}` | Dismiss (soft-remove) a notification |

The `GET /notifications` endpoint detects `Accept: application/json` / AJAX requests
and returns raw JSON instead of rendering the Inertia page — the notification panel
in the sidebar uses this for polling.

---

## 8. Adding a New Notification Type

1. Choose a type slug following the `module.event` convention (e.g. `hr.record_created`).
2. Call `Notification::send()` from the appropriate controller action.
3. Choose an appropriate Lucide icon name for `icon` (browse at [lucide.dev](https://lucide.dev)).
4. No migrations or registration needed — types are free-form strings.

### Recommended type slugs

| Module | Event | Slug |
|---|---|---|
| Accounts | User created | `account.created` |
| Accounts | Role changed | `account.role_changed` |
| Accounts | Deactivated | `account.deactivated` |
| Roles | Role created | `role.created` |
| Roles | Role deleted | `role.deleted` |
| System | Maintenance | `system.maintenance` |
| System | Password reset required | `system.password_reset` |

---

## 9. Frontend: NotificationPanel

The notification panel is rendered by `resources/js/Components/NotificationPanel.jsx`.
It polls `GET /notifications` via XHR and renders the notification list with
severity-colored indicators, action buttons, dismiss controls, and an unread count badge.

The panel receives its initial `unread_count` via Inertia shared props from the layout —
no separate setup required when sending a new notification type.
