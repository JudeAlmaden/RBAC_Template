<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\Topic;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TopicController extends Controller
{
    /**
     * Store a newly created topic within a module.
     */
    public function store(Request $request, Module $module): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'estimated_minutes' => ['nullable', 'integer', 'min:1', 'max:1440'],
            'is_published' => ['boolean'],
        ]);

        $baseSlug = Str::slug($validated['title']);
        $slug = $baseSlug ?: 'topic';
        $count = 1;
        while ($module->topics()->where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$count}";
            $count++;
        }

        $maxPosition = (int) $module->topics()->max('position');

        $module->topics()->create([
            'title' => $validated['title'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'estimated_minutes' => $validated['estimated_minutes'] ?? null,
            'is_published' => $validated['is_published'] ?? false,
            'position' => $maxPosition + 1,
        ]);

        return back()->with('success', "Topic '{$validated['title']}' created successfully.");
    }

    /**
     * Update the specified topic.
     */
    public function update(Request $request, Module $module, Topic $topic): RedirectResponse
    {
        $this->authorizeAdmin($request);

        if ((int) $topic->module_id !== (int) $module->id) {
            abort(404);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'estimated_minutes' => ['nullable', 'integer', 'min:1', 'max:1440'],
            'is_published' => ['boolean'],
        ]);

        $topic->update($validated);

        return back()->with('success', "Topic '{$topic->title}' updated successfully.");
    }

    /**
     * Remove the specified topic.
     */
    public function destroy(Request $request, Module $module, Topic $topic): RedirectResponse
    {
        $this->authorizeAdmin($request);

        if ((int) $topic->module_id !== (int) $module->id) {
            abort(404);
        }

        $title = $topic->title;
        $topic->delete();

        return back()->with('success', "Topic '{$title}' deleted successfully.");
    }

    /**
     * Reorder topics in a module.
     */
    public function reorder(Request $request, Module $module): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'topic_ids' => ['required', 'array'],
            'topic_ids.*' => ['integer', 'exists:topics,id'],
        ]);

        DB::transaction(function () use ($module, $validated) {
            // Negative positions to avoid unique constraint collisions
            foreach ($validated['topic_ids'] as $index => $topicId) {
                Topic::where('id', $topicId)
                    ->where('module_id', $module->id)
                    ->update(['position' => -($index + 1)]);
            }

            foreach ($validated['topic_ids'] as $index => $topicId) {
                Topic::where('id', $topicId)
                    ->where('module_id', $module->id)
                    ->update(['position' => $index + 1]);
            }
        });

        return back()->with('success', 'Topics reordered successfully.');
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
