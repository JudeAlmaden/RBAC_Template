<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Module;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ModuleController extends Controller
{
    /**
     * Display a specific module with its topics and stages outline.
     */
    public function show(Request $request, Course $course, Module $module): Response
    {
        $this->authorizeCurriculumEdit($request);

        if ((int) $module->course_id !== (int) $course->id) {
            abort(404);
        }

        $module->load([
            'course:id,title,slug,status',
            'topics' => fn ($q) => $q->orderBy('position')->with([
                'sections' => fn ($s) => $s->orderBy('position')->select('id', 'topic_id', 'section_type', 'title', 'position', 'is_published'),
            ])->withCount(['sections']),
        ]);

        $siblingModules = $course->modules()
            ->select('id', 'title', 'position', 'is_published')
            ->orderBy('position')
            ->get();

        return Inertia::render('Courses/Modules/Show', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
                'status' => $course->status,
            ],
            'module' => [
                'id' => $module->id,
                'course_id' => $module->course_id,
                'title' => $module->title,
                'description' => $module->description,
                'position' => $module->position,
                'is_published' => (bool) $module->is_published,
                'topics' => $module->topics->map(fn ($t) => [
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
            ],
            'siblingModules' => $siblingModules,
        ]);
    }

    /**
     * Store a newly created module within a course.
     */
    public function store(Request $request, Course $course): RedirectResponse
    {
        $this->authorizeCurriculumEdit($request);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_published' => ['boolean'],
        ]);

        $maxPosition = (int) $course->modules()->max('position');

        $course->modules()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'is_published' => $validated['is_published'] ?? false,
            'position' => $maxPosition + 1,
        ]);

        return back()->with('success', "Module '{$validated['title']}' created successfully.");
    }

    /**
     * Update the specified module.
     */
    public function update(Request $request, Course $course, Module $module): RedirectResponse
    {
        $this->authorizeCurriculumEdit($request);

        if ((int) $module->course_id !== (int) $course->id) {
            abort(404);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_published' => ['boolean'],
        ]);

        $module->update($validated);

        return back()->with('success', "Module '{$module->title}' updated successfully.");
    }

    /**
     * Remove the specified module.
     */
    public function destroy(Request $request, Course $course, Module $module): RedirectResponse
    {
        $this->authorizeCurriculumEdit($request);

        if ((int) $module->course_id !== (int) $course->id) {
            abort(404);
        }

        $title = $module->title;
        $module->delete();

        return back()->with('success', "Module '{$title}' deleted successfully.");
    }

    /**
     * Reorder modules in a course.
     */
    public function reorder(Request $request, Course $course): RedirectResponse
    {
        $this->authorizeCurriculumEdit($request);

        $validated = $request->validate([
            'module_ids' => ['required', 'array'],
            'module_ids.*' => ['integer', 'exists:modules,id'],
        ]);

        DB::transaction(function () use ($course, $validated) {
            // First assign negative positions to avoid unique constraint violations
            foreach ($validated['module_ids'] as $index => $moduleId) {
                Module::where('id', $moduleId)
                    ->where('course_id', $course->id)
                    ->update(['position' => -($index + 1)]);
            }

            foreach ($validated['module_ids'] as $index => $moduleId) {
                Module::where('id', $moduleId)
                    ->where('course_id', $course->id)
                    ->update(['position' => $index + 1]);
            }
        });

        return back()->with('success', 'Modules reordered successfully.');
    }

    /**
     * Authorize that the current user is an admin or super admin.
     */
    private function authorizeCurriculumEdit(Request $request): void
    {
        if (! $request->user()?->can('manage curriculum')) {
            abort(403, 'Unauthorized.');
        }
    }
}
