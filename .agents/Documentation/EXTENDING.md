# Extending the Access Control System

This guide covers how to safely add new permissions, roles, policies, and module pages
without breaking existing access control rules.

---

## 1. Adding a New Permission

### Step 1 — Seed the permission

Open `database/seeders/DatabaseSeeder.php` and add a `firstOrCreate` call alongside the existing permissions:

```php
// Existing
$manageUsers = Permission::firstOrCreate(['name' => 'manage users']);

// New — e.g. an HR module permission
$manageHr = Permission::firstOrCreate(['name' => 'manage hr']);
```

Then sync it to whichever roles should hold it by default:

```php
$adminRole->syncPermissions([
    $manageUsers,
    $assignRoles,
    $manageHr,   // ← add here
]);
```

Run the seeder (safe to re-run — uses `firstOrCreate`):

```bash
php artisan db:seed
# or a full reset:
php artisan migrate:fresh --seed
```

### Step 2 — Register it in the UI category (optional but recommended)

Open `app/Http/Controllers/RoleController.php` → `categorizePermissions()`.

Add your permission to an existing category, or create a new one:

```php
'HR Module' => [
    'manage hr' => 'Access HR records, employee data, and payroll visibility',
],
```

> **Tip:** If you skip this step the permission still appears — it will be auto-placed in the
> **"Other Modules"** catch-all category at the bottom of the Roles configuration modal.

### Step 3 — Gate it in the controller

```php
// Simple permission check
if (!$request->user()->can('manage hr')) {
    abort(403);
}

// Or via a helper method on the User model (recommended for reuse)
if (!$request->user()->canManageHr()) {
    abort(403);
}
```

If you add a helper method, add it to `app/Models/User.php`:

```php
public function canManageHr(): bool
{
    try {
        return $this->can('manage hr');
    } catch (\Throwable) {
        return false;
    }
}
```

---

## 2. Adding a New Module Page with Its Own Permission

Full end-to-end walkthrough for a new, permission-gated page (e.g. **HR**).

### 2.1 Migration

Add any new tables your module needs. No changes to existing tables required —
the permission system is separate.

### 2.2 Seeder

```php
$manageHr = Permission::firstOrCreate(['name' => 'manage hr']);
$superAdminRole->syncPermissions([..., $manageHr]);
```

### 2.3 Controller

```php
class HrController extends Controller
{
    public function index(Request $request): Response
    {
        if (!$request->user()->can('manage hr')) {
            abort(403, 'You do not have permission to access HR.');
        }

        // ... fetch data

        return Inertia::render('Hr/Index', [
            'records'      => $records,
            'activityLogs' => $this->fetchLogs(), // optional, see §2.5
        ]);
    }
}
```

### 2.4 Route

```php
Route::get('/hr', [HrController::class, 'index'])->name('hr.index');
```

### 2.5 Activity Logs (optional but recommended)

To get an **Activity History** tab on your new page for free:

```php
// In your controller, fetch logs scoped to your model type:
$activityLogs = ActivityLog::where('subject_type', 'HrRecord')
    ->latest()
    ->limit(50)
    ->get()
    ->map(fn ($log) => [
        'id'               => $log->id,
        'actor_name'       => $log->actor_name,
        'action'           => $log->action,
        'subject_type'     => $log->subject_type,
        'subject_name'     => $log->subject_name,
        'metadata'         => $log->metadata,
        'created_at_human' => $log->created_at->diffForHumans(),
        'created_at_date'  => $log->created_at->format('M d, Y g:i A'),
    ])->values()->all();
```

Then in your service/controller actions, record logs:

```php
ActivityLog::record(
    actor: $request->user(),
    action: 'created',
    subject: $hrRecord,
    metadata: ['department' => $hrRecord->department]
);
```

In the React page, drop in `<ActivityLogTable>`:

```jsx
import ActivityLogTable from '@/Components/ActivityLogTable';

// Inside a tab panel:
<ActivityLogTable
    logs={activityLogs}
    emptyLabel="No HR activity recorded yet."
/>
```

### 2.6 Sidebar Navigation

Add a nav link in `resources/js/Layouts/AuthenticatedLayout.jsx` inside the nav array,
gated by whatever prop you pass down from the controller:

```jsx
// In your controller, pass to shared Inertia props or the page directly:
'canManageHr' => $user->can('manage hr'),

// In the sidebar nav:
{ label: 'HR', href: route('hr.index'), icon: Users2, show: page.props.canManageHr }
```

---

## 3. Adding a New Custom Role via Seeder

Use this when a role needs to be present from a fresh install (e.g. a "Manager" role
with a specific permission set that should always exist).

```php
// In DatabaseSeeder.php
$managePayroll = Permission::firstOrCreate(['name' => 'manage payroll']);

$managerRole = Role::firstOrCreate(['name' => 'manager']);
$managerRole->max_active_users = 5; // optional capacity cap
$managerRole->save();
$managerRole->syncPermissions([$manageUsers, $managePayroll]);
```

> Custom roles created only via the UI are fine for ad-hoc roles. Seed roles
> that must survive a `migrate:fresh`.

---

## 4. Adding a New Policy

Use policies when the permission check alone isn't enough and you need **contextual rules**
(e.g. "you can only edit records you own", "you can't delete the last item").

### 4.1 Create the policy

```bash
php artisan make:policy HrRecordPolicy --model=HrRecord
```

### 4.2 Register it (Laravel 11+ auto-discovers policies by convention)

If auto-discovery doesn't pick it up, register in `app/Providers/AuthServiceProvider.php`:

```php
protected $policies = [
    HrRecord::class => HrRecordPolicy::class,
];
```

### 4.3 Use it in a controller

```php
Gate::authorize('update', $hrRecord);
// or
$this->authorize('update', $hrRecord);
```

### 4.4 Expose the result to the frontend

In your controller's data transform, add a `can` block:

```php
'can' => [
    'update' => $currentUser->can('update', $hrRecord),
    'delete' => $currentUser->can('delete', $hrRecord),
],
```

The frontend can then conditionally render action buttons with `record.can.update`.

---

## 5. Locking Essential Permissions on a Role

If a new role or custom role has permissions that **must never be unchecked** in the UI
(like Super Admin's core permissions), add them to the locked set in `Roles/Index.jsx`:

```jsx
// In the edit modal permission map:
const isLocked = selectedRole?.name === 'my_special_role' && [
    'manage hr',
    'manage payroll',
].includes(perm.name);
```

---

## 6. Troubleshooting

| Symptom | Fix |
|---|---|
| `can()` returns wrong result after seeding | `php artisan permission:cache-reset` |
| New permission not showing in the Roles modal | Add it to `categorizePermissions()` in `RoleController` or it will appear in "Other Modules" |
| Policy not being called | Check the model is registered; run `php artisan config:clear` |
| Super Admin not bypassing permission check | Ensure `Gate::before()` is registered in `AuthServiceProvider` (done automatically by Spatie) |
| Role capacity not enforcing | Ensure you check `Role::hasReachedCapacity()` in the relevant policy |

---

## 7. Linking New Tables to the Deletion Guard

When you introduce a new table that references users (e.g. `orders`, `projects`, `tickets`), you must ensure accounts linked to those records are **audit-protected** (cannot be permanently deleted, only deactivated).

Adding your new table takes **two quick steps** in `app/Models/User.php`:

### Step 1 — Define the Eloquent relation
```php
public function projects(): HasMany
{
    return $this->hasMany(Project::class);
}
```

### Step 2 — Register it in `$relevantRelations`
```php
public static array $relevantRelations = [
    'activityLogs'          => 'Activity Logs',
    'receivedNotifications' => 'Notifications',
    'sentNotifications'     => 'Sent Notifications',
    'projects'              => 'Projects',  // ← Add your new relation here
];
```

**That's it!** The system automatically:
1. Blocks `DELETE /users/{id}` if the user has any records in that table.
2. Checks dependency on-demand via `GET /users/{id}/deletion-check` without slowing down the accounts directory.
3. Automatically formats the modal warning message (e.g., *"Cannot delete: Tied to 3 Projects"*).
