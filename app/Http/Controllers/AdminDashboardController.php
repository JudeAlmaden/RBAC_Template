<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class AdminDashboardController extends Controller
{
    /**
     * Display the Admin command and system overview.
     */
    public function index(Request $request): Response
    {
        if (! $request->user()?->canViewAdminDashboard()) {
            abort(403, 'You do not have permission to view the admin dashboard.');
        }

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'total_users' => User::count(),
                'active_learners' => User::role('learner')->count(),
                'total_roles' => Role::count(),
                'recent_logs_count' => ActivityLog::where('created_at', '>=', now()->subDay())->count(),
            ],
            'recentLogs' => ActivityLog::latest()->take(5)->get(),
        ]);
    }
}
