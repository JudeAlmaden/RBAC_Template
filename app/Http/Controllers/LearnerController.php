<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\Module;
use App\Models\Topic;
use App\Models\User;
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
                'course_slug' => $enrollment->course?->slug,
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
     * Display a course's curriculum and modules for a learner.
     */
    public function course(Request $request, Course $course): Response
    {
        $this->authorizeEnrollment($request->user(), $course);

        $course->load([
            'modules' => fn ($q) => $q->published()->orderBy('position')->with([
                'topics' => fn ($t) => $t->published()->orderBy('position'),
            ]),
        ]);

        return Inertia::render('Learner/Courses/Show', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
                'description' => $course->description,
                'modules' => $course->modules->map(fn (Module $module) => [
                    'id' => $module->id,
                    'title' => $module->title,
                    'description' => $module->description,
                    'topics' => $module->topics->map(fn (Topic $topic) => [
                        'id' => $topic->id,
                        'title' => $topic->title,
                        'slug' => $topic->slug,
                        'estimated_minutes' => $topic->estimated_minutes,
                    ]),
                ]),
            ],
        ]);
    }

    /**
     * Display a specific module's topics for a learner.
     */
    public function module(Request $request, Course $course, Module $module): Response
    {
        $this->authorizeEnrollment($request->user(), $course);

        if ((int) $module->course_id !== (int) $course->id || ! $module->is_published) {
            abort(404);
        }

        $module->load([
            'topics' => fn ($q) => $q->published()->orderBy('position'),
        ]);

        return Inertia::render('Learner/Modules/Show', [
            'course' => ['id' => $course->id, 'title' => $course->title, 'slug' => $course->slug],
            'module' => [
                'id' => $module->id,
                'title' => $module->title,
                'description' => $module->description,
                'topics' => $module->topics->map(fn (Topic $topic) => [
                    'id' => $topic->id,
                    'title' => $topic->title,
                    'slug' => $topic->slug,
                    'estimated_minutes' => $topic->estimated_minutes,
                ]),
            ],
        ]);
    }

    /**
     * Display a specific topic's content for a learner.
     */
    public function topic(Request $request, Course $course, Module $module, Topic $topic): Response
    {
        $this->authorizeEnrollment($request->user(), $course);

        if ((int) $module->course_id !== (int) $course->id || (int) $topic->module_id !== (int) $module->id || ! $topic->is_published) {
            abort(404);
        }

        $topic->load([
            'sections' => fn ($q) => $q->published()->orderBy('position')->with([
                'pages' => fn ($p) => $p->visible()->orderBy('position')->with([
                    'blocks' => fn ($b) => $b->visible()->orderBy('position')
                ])
            ]),
        ]);

        $course->load([
            'modules' => fn ($q) => $q->published()->orderBy('position')->with([
                'topics' => fn ($t) => $t->published()->orderBy('position'),
            ]),
        ]);

        return Inertia::render('Learner/Topics/Show', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
                'modules' => $course->modules->map(fn (Module $m) => [
                    'id' => $m->id,
                    'title' => $m->title,
                    'topics' => $m->topics->map(fn (Topic $t) => [
                        'id' => $t->id,
                        'title' => $t->title,
                        'slug' => $t->slug,
                    ]),
                ]),
            ],
            'module' => ['id' => $module->id, 'title' => $module->title],
            'topic' => [
                'id' => $topic->id,
                'title' => $topic->title,
                'description' => $topic->description,
                'sections' => $topic->sections->map(fn ($section) => [
                    'id' => $section->id,
                    'title' => $section->title,
                    'section_type' => $section->section_type,
                    'pages' => $section->pages->map(fn ($page) => [
                        'id' => $page->id,
                        'title' => $page->title,
                        'layout_type' => $page->layout_type,
                        'blocks' => $page->blocks->map(fn ($block) => [
                            'id' => $block->id,
                            'type' => $block->block_type,
                            'variant' => $block->display_variant,
                            'slot' => $block->layout_slot,
                            'content' => $block->content,
                        ]),
                    ]),
                ]),
            ],
        ]);
    }

    /**
     * Authorize that the user is enrolled in the course or is an admin.
     */
    private function authorizeEnrollment(User $user, Course $course): void
    {
        $isEnrolled = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->exists();

        if (! $isEnrolled && ! $user->isAdmin() && ! $user->isSuperAdmin()) {
            abort(403, 'You are not enrolled in this course.');
        }
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
