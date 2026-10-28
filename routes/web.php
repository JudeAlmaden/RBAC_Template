<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RoleSwitchController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified', 'force.password.change'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Role View Switcher & Preview
    Route::post('/switch-role', [RoleSwitchController::class, 'switch'])->name('switch-role');
    Route::post('/switch-role/exit', [RoleSwitchController::class, 'exit'])->name('switch-role.exit');

    // Profile Management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // User & Account Management (RBAC & PBAC)
    Route::resource('users', UserController::class);
    Route::post('users/{user}/promote-super-admin', [UserController::class, 'promoteSuperAdmin'])
        ->name('users.promote-super-admin');
    Route::post('users/{user}/transfer-super-admin', [UserController::class, 'transferSuperAdmin'])
        ->name('users.transfer-super-admin');
    Route::post('users/{user}/demote-super-admin', [UserController::class, 'demoteSuperAdmin'])
        ->name('users.demote-super-admin');
    Route::patch('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])
        ->name('users.toggle-status');
    Route::get('users/{user}/deletion-check', [UserController::class, 'checkDeletion'])
        ->name('users.deletion-check');

    // Roles & Permissions Management
    Route::resource('roles', RoleController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::patch('roles/{role}/toggle-status', [RoleController::class, 'toggleStatus'])
        ->name('roles.toggle-status');

    // Audit & Activity Logs
    Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
    Route::get('/activity-logs/export', [ActivityLogController::class, 'export'])->name('activity-logs.export');

    // Notifications
    Route::get('/notifications/feed', [NotificationController::class, 'feed'])->name('notifications.feed');
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::delete('/notifications/clear-read', [NotificationController::class, 'clearRead'])->name('notifications.clear-read');
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
});

require __DIR__.'/auth.php';
