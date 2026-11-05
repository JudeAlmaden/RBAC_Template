<?php

namespace App\Http\Controllers;

use App\Models\CourseEnrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LearnerController extends Controller
{
    /**
     * Learner main dashboard.
     */
    public function dashboard(Request $request): Response
    {
        $user = $request->user();

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

        return Inertia::render('Learner/Dashboard', [
            'user' => $user,
            'enrollments' => $enrollments,
        ]);
    }

    /**
     * Cyber Range lab environment overview.
     */
    public function cyberRange(Request $request): Response
    {
        return Inertia::render('Learner/CyberRange');
    }

    /**
     * Cybersecurity terminology glossary and knowledge base.
     */
    public function glossary(Request $request): Response
    {
        return Inertia::render('Learner/Glossary');
    }

    /**
     * Learner certifications, badges, and credentials.
     */
    public function credentials(Request $request): Response
    {
        return Inertia::render('Learner/Credentials');
    }

    /**
     * Frequently asked questions and academy help.
     */
    public function faq(Request $request): Response
    {
        return Inertia::render('Learner/Faq');
    }

    /**
     * TALA AI Assistant conversation interface.
     */
    public function tala(Request $request): Response
    {
        return Inertia::render('Learner/Tala');
    }

    /**
     * Report an issue or platform feedback.
     */
    public function report(Request $request): Response
    {
        return Inertia::render('Learner/ReportProblem');
    }
}
