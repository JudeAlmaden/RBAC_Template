<?php

namespace App\Http\Controllers;

use App\Models\CourseEnrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $enrollments = null;

        if ($user->isLearner() && ! $user->isAdmin() && ! $user->isSuperAdmin()) {
            $enrollments = CourseEnrollment::with(['course:id,title,description,status', 'assignment:id,due_at'])
                ->where('user_id', $user->id)
                ->whereHas('course', fn ($q) => $q->where('status', 'published'))
                ->orderBy('enrolled_at', 'desc')
                ->get()
                ->map(fn (CourseEnrollment $enrollment) => [
                    'id' => $enrollment->id,
                    'course_id' => $enrollment->course_id,
                    'course_title' => $enrollment->course?->title,
                    'course_description' => $enrollment->course?->description,
                    'status' => $enrollment->status,
                    'progress_percent' => (float) $enrollment->progress_percent,
                    'enrolled_at' => $enrollment->enrolled_at?->format('M d, Y'),
                    'due_at' => $enrollment->assignment?->due_at?->format('M d, Y'),
                ]);
        }

        return Inertia::render('Dashboard', [
            'enrollments' => $enrollments,
        ]);
    }
}
