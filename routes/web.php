<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LearnerController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RoleSwitchController;
use App\Http\Controllers\SectionPageController;
use App\Http\Controllers\TopicController;
use App\Http\Controllers\TopicSectionController;
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
    // Main Dashboard Dispatcher
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Learner Portal Routes
    Route::prefix('learner')->name('learner.')->group(function () {
        Route::get('/dashboard', [LearnerController::class, 'dashboard'])->name('dashboard');
        Route::get('/cyber-range', [LearnerController::class, 'cyberRange'])->name('cyber-range');
        Route::get('/glossary', [LearnerController::class, 'glossary'])->name('glossary');
        Route::get('/credentials', [LearnerController::class, 'credentials'])->name('credentials');
        Route::get('/settings', function () {
            return redirect()->route('profile.edit');
        })->name('settings');
        Route::get('/faq', [LearnerController::class, 'faq'])->name('faq');
        Route::get('/tala', [LearnerController::class, 'tala'])->name('tala');
        Route::get('/report-a-problem', [LearnerController::class, 'report'])->name('report');
    });

    // Admin Portal Routes
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    });

    // Course Management (Admin CRUD + Assign)
    Route::resource('courses', CourseController::class);
    Route::get('courses/{course}/assignable-users', [CourseController::class, 'assignableUsers'])->name('courses.assignable-users');
    Route::post('courses/{course}/assign', [CourseController::class, 'assign'])->name('courses.assign');
    Route::delete('courses/{course}/unassign/{user}', [CourseController::class, 'unassign'])->name('courses.unassign');

    // Module Management
    Route::get('courses/{course}/modules/{module}', [ModuleController::class, 'show'])->name('courses.modules.show');
    Route::post('courses/{course}/modules', [ModuleController::class, 'store'])->name('courses.modules.store');
    Route::put('courses/{course}/modules/{module}', [ModuleController::class, 'update'])->name('courses.modules.update');
    Route::delete('courses/{course}/modules/{module}', [ModuleController::class, 'destroy'])->name('courses.modules.destroy');
    Route::post('courses/{course}/modules/reorder', [ModuleController::class, 'reorder'])->name('courses.modules.reorder');

    // Topic Management
    Route::post('modules/{module}/topics', [TopicController::class, 'store'])->name('modules.topics.store');
    Route::put('modules/{module}/topics/{topic}', [TopicController::class, 'update'])->name('modules.topics.update');
    Route::delete('modules/{module}/topics/{topic}', [TopicController::class, 'destroy'])->name('modules.topics.destroy');
    Route::post('modules/{module}/topics/reorder', [TopicController::class, 'reorder'])->name('modules.topics.reorder');

    // Topic Stages / Sections (Pedagogical Builder)
    Route::get('topics/{topic}/stages', [TopicSectionController::class, 'index'])->name('topics.stages.index');
    Route::get('topics/{topic}/stages/{stage}', [TopicSectionController::class, 'show'])->name('topics.stages.show');
    Route::post('topics/{topic}/stages', [TopicSectionController::class, 'store'])->name('topics.stages.store');
    Route::put('topics/{topic}/stages/{stage}', [TopicSectionController::class, 'update'])->name('topics.stages.update');
    Route::delete('topics/{topic}/stages/{stage}', [TopicSectionController::class, 'destroy'])->name('topics.stages.destroy');
    Route::post('topics/{topic}/stages/reorder', [TopicSectionController::class, 'reorder'])->name('topics.stages.reorder');
    Route::post('topics/{topic}/stages/preset', [TopicSectionController::class, 'applyPreset'])->name('topics.stages.preset');

    // Stage Container Pages
    Route::post('stages/{stage}/pages', [SectionPageController::class, 'store'])->name('stages.pages.store');
    Route::put('stages/{stage}/pages/{page}', [SectionPageController::class, 'update'])->name('stages.pages.update');
    Route::delete('stages/{stage}/pages/{page}', [SectionPageController::class, 'destroy'])->name('stages.pages.destroy');
    Route::post('stages/{stage}/pages/reorder', [SectionPageController::class, 'reorder'])->name('stages.pages.reorder');

    // Friendly Aliases for FAQ and Settings
    Route::get('/faq', fn () => redirect()->route('learner.faq'))->name('faq');
    Route::get('/report-a-problem', fn () => redirect()->route('learner.report'))->name('report-problem');

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
