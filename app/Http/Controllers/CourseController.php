<?php

namespace App\Http\Controllers;

use App\Http\Requests\AssignCourseRequest;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Requests\UpdateCourseRequest;
use App\Models\Course;
use App\Models\CourseAssignment;
use App\Models\CourseEnrollment;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    /**
     * Display the course management index with search and pagination.
     */
    public function index(Request $request): Response
    {
        $this->authorizeAdmin($request);

        $search = $request->input('search');
        $statusFilter = $request->input('status');

        $courses = Course::withCount('enrollments')
            ->with(['creator:id,name', 'prerequisites:id,title,status'])
            ->when($search, fn ($q) => $q->where('title', 'like', "%{$search}%"))
            ->when($statusFilter, fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Course $course) => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
                'description' => $course->description,
                'status' => $course->status,
                'enrollments_count' => $course->enrollments_count,
                'prerequisites' => $course->prerequisites->map(fn ($p) => [
                    'id' => $p->id,
                    'title' => $p->title,
                    'status' => $p->status,
                    'auto_enroll' => (bool) ($p->pivot->auto_enroll ?? true),
                ])->values()->all(),
                'created_by_name' => $course->creator?->name,
                'created_at' => $course->created_at?->format('M d, Y'),
                'published_at' => $course->published_at?->format('M d, Y'),
            ]);

        $allCourses = Course::select('id', 'title', 'status')->orderBy('title')->get();

        return Inertia::render('Courses/Index', [
            'courses' => $courses,
            'allCourses' => $allCourses,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
            ],
        ]);
    }

    /**
     * Store a newly created course.
     */
    public function store(StoreCourseRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $slug = Str::slug($validated['title']);
        $originalSlug = $slug;
        $count = 1;
        while (Course::withTrashed()->where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$count}";
            $count++;
        }

        $course = Course::create([
            'title' => $validated['title'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
            'created_by' => $request->user()->id,
            'published_at' => $validated['status'] === 'published' ? now() : null,
        ]);

        if (! empty($validated['prerequisite_ids'])) {
            $autoEnroll = $validated['auto_enroll_prerequisites'] ?? true;
            $syncData = [];
            foreach ($validated['prerequisite_ids'] as $pid) {
                $syncData[$pid] = ['auto_enroll' => $autoEnroll];
            }
            $course->prerequisites()->sync($syncData);
        }

        return redirect()->route('courses.index')->with('success', "Course '{$validated['title']}' created successfully.");
    }

    /**
     * Display the specified course with its curriculum and enrollment details.
     */
    public function show(Request $request, Course $course): Response
    {
        $this->authorizeAdmin($request);

        $course->load([
            'creator:id,name,email',
            'prerequisites:id,title,status',
            'modules' => fn ($q) => $q->orderBy('position')->with([
                'topics' => fn ($t) => $t->orderBy('position')->with([
                    'sections' => fn ($s) => $s->orderBy('position')->select('id', 'topic_id', 'section_type', 'title', 'position', 'is_published'),
                ])->withCount('sections'),
            ]),
            'enrollments' => fn ($q) => $q->with(['user:id,name,email', 'assignment:id,due_at'])->latest('enrolled_at'),
        ]);

        $allCourses = Course::where('id', '!=', $course->id)
            ->select('id', 'title', 'status')
            ->orderBy('title')
            ->get();

        return Inertia::render('Courses/Show', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
                'description' => $course->description,
                'thumbnail_url' => $course->thumbnail_url,
                'banner_url' => $course->banner_url,
                'status' => $course->status,
                'created_by' => $course->creator ? [
                    'id' => $course->creator->id,
                    'name' => $course->creator->name,
                    'email' => $course->creator->email,
                ] : null,
                'published_at' => $course->published_at?->format('M d, Y h:i A'),
                'created_at' => $course->created_at?->format('M d, Y'),
                'updated_at' => $course->updated_at?->format('M d, Y'),
                'prerequisites' => $course->prerequisites->map(fn ($p) => [
                    'id' => $p->id,
                    'title' => $p->title,
                    'status' => $p->status,
                    'auto_enroll' => (bool) ($p->pivot->auto_enroll ?? true),
                ])->values()->all(),
                'modules' => $course->modules->map(fn ($m) => [
                    'id' => $m->id,
                    'course_id' => $m->course_id,
                    'title' => $m->title,
                    'description' => $m->description,
                    'position' => $m->position,
                    'is_published' => (bool) $m->is_published,
                    'topics' => $m->topics->map(fn ($t) => [
                        'id' => $t->id,
                        'module_id' => $t->module_id,
                        'title' => $t->title,
                        'slug' => $t->slug,
                        'description' => $t->description,
                        'position' => $t->position,
                        'estimated_minutes' => $t->estimated_minutes,
                        'is_published' => (bool) $t->is_published,
                        'sections_count' => $t->sections_count,
                        'sections' => $t->sections->map(fn ($s) => [
                            'id' => $s->id,
                            'section_type' => $s->section_type,
                            'title' => $s->title,
                            'position' => $s->position,
                            'is_published' => (bool) $s->is_published,
                        ])->values()->all(),
                    ])->values()->all(),
                ])->values()->all(),
                'enrollments' => $course->enrollments->map(fn ($e) => [
                    'id' => $e->id,
                    'user' => [
                        'id' => $e->user?->id,
                        'name' => $e->user?->name,
                        'email' => $e->user?->email,
                    ],
                    'status' => $e->status,
                    'progress_percent' => (float) $e->progress_percent,
                    'enrolled_at' => $e->enrolled_at?->format('M d, Y'),
                    'completed_at' => $e->completed_at?->format('M d, Y'),
                    'due_at' => $e->assignment?->due_at?->format('M d, Y'),
                ])->values()->all(),
            ],
            'allCourses' => $allCourses,
        ]);
    }

    /**
     * Update the specified course.
     */
    public function update(UpdateCourseRequest $request, Course $course): RedirectResponse
    {
        $validated = $request->validated();

        $wasPublished = $course->status !== 'published' && $validated['status'] === 'published';

        $course->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
            'published_at' => $wasPublished ? now() : $course->published_at,
        ]);

        $prereqIds = array_filter($validated['prerequisite_ids'] ?? [], fn ($id) => (int) $id !== (int) $course->id);
        $autoEnroll = $validated['auto_enroll_prerequisites'] ?? true;
        $syncData = [];
        foreach ($prereqIds as $pid) {
            $syncData[$pid] = ['auto_enroll' => $autoEnroll];
        }
        $course->prerequisites()->sync($syncData);

        return redirect()->route('courses.index')->with('success', "Course '{$course->title}' updated successfully.");
    }

    /**
     * Remove the specified course (soft delete).
     */
    public function destroy(Request $request, Course $course): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $title = $course->title;
        $course->delete();

        return redirect()->route('courses.index')->with('success', "Course '{$title}' deleted successfully.");
    }

    /**
     * Return users who can be assigned to a course (for the assign modal).
     */
    public function assignableUsers(Request $request, Course $course): JsonResponse
    {
        $this->authorizeAdmin($request);

        $search = $request->input('search');

        // Already enrolled user IDs
        $enrolledUserIds = $course->enrollments()->pluck('user_id');

        $users = User::active()
            ->whereNotIn('id', $enrolledUserIds)
            ->when($search, fn ($q) => $q->where(function ($sub) use ($search) {
                $sub->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            }))
            ->orderBy('name')
            ->limit(30)
            ->get(['id', 'name', 'email'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]);

        return response()->json($users);
    }

    /**
     * Assign a course to a specific user, creating an enrollment.
     */
    public function assign(AssignCourseRequest $request, Course $course): RedirectResponse
    {
        $validated = $request->validated();
        $actor = $request->user();

        /** @var User $targetUser */
        $targetUser = User::findOrFail($validated['user_id']);

        // Prevent duplicate enrollment
        if (CourseEnrollment::where('course_id', $course->id)->where('user_id', $targetUser->id)->exists()) {
            return back()->with('error', "{$targetUser->name} is already enrolled in this course.");
        }

        $assignment = CourseAssignment::create([
            'course_id' => $course->id,
            'assigned_by' => $actor->id,
            'target_type' => 'user',
            'target_id' => $targetUser->id,
            'due_at' => $validated['due_at'] ?? null,
            'required' => $validated['required'] ?? true,
        ]);

        CourseEnrollment::create([
            'course_id' => $course->id,
            'user_id' => $targetUser->id,
            'course_assignment_id' => $assignment->id,
            'status' => 'enrolled',
            'enrolled_at' => now(),
        ]);

        // Auto-enroll prerequisites if configured
        $autoAddedCount = 0;
        $prerequisites = $course->prerequisites()->wherePivot('auto_enroll', true)->get();
        foreach ($prerequisites as $prereq) {
            $alreadyEnrolled = CourseEnrollment::where('course_id', $prereq->id)
                ->where('user_id', $targetUser->id)
                ->exists();

            if (! $alreadyEnrolled) {
                $prereqAssignment = CourseAssignment::create([
                    'course_id' => $prereq->id,
                    'assigned_by' => $actor->id,
                    'target_type' => 'user',
                    'target_id' => $targetUser->id,
                    'due_at' => $validated['due_at'] ?? null,
                    'required' => true,
                    'settings' => ['prerequisite_of' => $course->id],
                ]);

                CourseEnrollment::create([
                    'course_id' => $prereq->id,
                    'user_id' => $targetUser->id,
                    'course_assignment_id' => $prereqAssignment->id,
                    'status' => 'enrolled',
                    'enrolled_at' => now(),
                ]);

                $autoAddedCount++;
            }
        }

        Notification::send(
            recipient: $targetUser,
            sender: $actor,
            type: 'course.assigned',
            title: 'You have been assigned a new course',
            options: [
                'body' => $autoAddedCount > 0
                    ? "You have been assigned to: {$course->title} along with {$autoAddedCount} required prerequisite course(s)."
                    : "You have been assigned to: {$course->title}.",
                'action_url' => route('dashboard'),
                'action_label' => 'Go to Dashboard',
                'icon' => 'book-open',
                'severity' => 'info',
            ]
        );

        $successMsg = "'{$course->title}' assigned to {$targetUser->name}.";
        if ($autoAddedCount > 0) {
            $successMsg .= " Automatically enrolled in {$autoAddedCount} prerequisite course(s).";
        }

        return redirect()->back()->with('success', $successMsg);
    }

    /**
     * Remove a user's enrollment from a course.
     */
    public function unassign(Request $request, Course $course, User $user): RedirectResponse
    {
        $this->authorizeAdmin($request);

        CourseEnrollment::where('course_id', $course->id)
            ->where('user_id', $user->id)
            ->delete();

        CourseAssignment::where('course_id', $course->id)
            ->where('target_type', 'user')
            ->where('target_id', $user->id)
            ->delete();

        return redirect()->back()->with('success', "{$user->name} has been removed from '{$course->title}'.");
    }

    /**
     * Authorize that the current user is an admin or super admin.
     */
    private function authorizeAdmin(Request $request): void
    {
        $user = $request->user();
        if (! $user->isAdmin() && ! $user->isSuperAdmin()) {
            abort(403, 'Unauthorized.');
        }
    }
}
