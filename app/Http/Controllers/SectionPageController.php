<?php

namespace App\Http\Controllers;

use App\Models\SectionPage;
use App\Models\TopicSection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SectionPageController extends Controller
{
    /**
     * Store a new container page within a stage.
     */
    public function store(Request $request, TopicSection $stage): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'layout_type' => ['required', 'string', Rule::in(SectionPage::VALID_LAYOUT_TYPES)],
            'is_visible' => ['boolean'],
        ]);

        $maxPosition = (int) $stage->pages()->max('position');

        $stage->pages()->create([
            'title' => $validated['title'] ?? ('Page '.($maxPosition + 1)),
            'layout_type' => $validated['layout_type'],
            'position' => $maxPosition + 1,
            'is_visible' => $validated['is_visible'] ?? true,
        ]);

        return back()->with('success', 'Page container added successfully.');
    }

    /**
     * Update an existing container page.
     */
    public function update(Request $request, TopicSection $stage, SectionPage $page): RedirectResponse
    {
        $this->authorizeAdmin($request);

        if ((int) $page->topic_section_id !== (int) $stage->id) {
            abort(404);
        }

        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'layout_type' => ['required', 'string', Rule::in(SectionPage::VALID_LAYOUT_TYPES)],
            'is_visible' => ['boolean'],
        ]);

        $page->update($validated);

        return back()->with('success', 'Page container updated successfully.');
    }

    /**
     * Delete a container page.
     */
    public function destroy(Request $request, TopicSection $stage, SectionPage $page): RedirectResponse
    {
        $this->authorizeAdmin($request);

        if ((int) $page->topic_section_id !== (int) $stage->id) {
            abort(404);
        }

        $title = $page->title ?: 'Page';
        $page->delete();

        return back()->with('success', "{$title} removed successfully.");
    }

    /**
     * Reorder pages within a stage.
     */
    public function reorder(Request $request, TopicSection $stage): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'page_ids' => ['required', 'array'],
            'page_ids.*' => ['integer', 'exists:section_pages,id'],
        ]);

        DB::transaction(function () use ($stage, $validated) {
            foreach ($validated['page_ids'] as $index => $pageId) {
                SectionPage::where('id', $pageId)
                    ->where('topic_section_id', $stage->id)
                    ->update(['position' => -($index + 1)]);
            }

            foreach ($validated['page_ids'] as $index => $pageId) {
                SectionPage::where('id', $pageId)
                    ->where('topic_section_id', $stage->id)
                    ->update(['position' => $index + 1]);
            }
        });

        return back()->with('success', 'Pages reordered successfully.');
    }

    /**
     * Authorize admin users.
     */
    private function authorizeAdmin(Request $request): void
    {
        $user = $request->user();
        if (! $user->isAdmin() && ! $user->isSuperAdmin()) {
            abort(403, 'Unauthorized.');
        }
    }
}
