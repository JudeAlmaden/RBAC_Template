<?php

namespace App\Http\Controllers;

use App\Models\SectionPage;
use App\Models\Topic;
use App\Models\TopicSection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TopicSectionController extends Controller
{
    public const VALID_SECTION_TYPES = [
        'activate',
        'encode',
        'retrieve',
        'anchor',
        'deepen',
        'lab',
        'assessment',
        'custom',
    ];

    public const VALID_LAYOUT_TYPES = SectionPage::VALID_LAYOUT_TYPES;

    /**
     * Display the dedicated view for a single stage.
     */
    public function show(Request $request, Topic $topic, TopicSection $stage): Response
    {
        $this->authorizeAdmin($request);

        if ((int) $stage->topic_id !== (int) $topic->id) {
            abort(404);
        }

        $topic->load(['module.course:id,title,slug']);

        $stage->load([
            'pages' => fn ($q) => $q->orderBy('position')->withCount('blocks'),
        ]);
        $stage->loadCount(['blocks', 'activities']);

        $siblingStages = $topic->sections()
            ->orderBy('position')
            ->get(['id', 'title', 'section_type', 'position']);

        $currentIndex = $siblingStages->search(fn (TopicSection $s) => $s->id === $stage->id);
        $prevStage = $currentIndex > 0 ? $siblingStages[$currentIndex - 1] : null;
        $nextStage = $currentIndex < $siblingStages->count() - 1 ? $siblingStages[$currentIndex + 1] : null;

        return Inertia::render('Courses/Stages/Show', [
            'topic' => [
                'id' => $topic->id,
                'title' => $topic->title,
                'slug' => $topic->slug,
                'is_published' => (bool) $topic->is_published,
                'module' => [
                    'id' => $topic->module?->id,
                    'title' => $topic->module?->title,
                ],
                'course' => [
                    'id' => $topic->module?->course?->id,
                    'title' => $topic->module?->course?->title,
                    'slug' => $topic->module?->course?->slug,
                ],
            ],
            'stage' => [
                'id' => $stage->id,
                'topic_id' => $stage->topic_id,
                'section_type' => $stage->section_type,
                'title' => $stage->title,
                'instructions' => $stage->instructions,
                'position' => $stage->position,
                'is_required' => (bool) $stage->is_required,
                'is_published' => (bool) $stage->is_published,
                'blocks_count' => $stage->blocks_count,
                'activities_count' => $stage->activities_count,
                'pages' => $stage->pages->map(fn (SectionPage $p) => [
                    'id' => $p->id,
                    'topic_section_id' => $p->topic_section_id,
                    'title' => $p->title,
                    'layout_type' => $p->layout_type,
                    'position' => $p->position,
                    'is_visible' => (bool) $p->is_visible,
                    'blocks_count' => $p->blocks_count,
                ]),
            ],
            'prevStage' => $prevStage ? [
                'id' => $prevStage->id,
                'title' => $prevStage->title,
                'section_type' => $prevStage->section_type,
            ] : null,
            'nextStage' => $nextStage ? [
                'id' => $nextStage->id,
                'title' => $nextStage->title,
                'section_type' => $nextStage->section_type,
            ] : null,
            'availableSectionTypes' => self::VALID_SECTION_TYPES,
            'availableLayoutTypes' => self::VALID_LAYOUT_TYPES,
        ]);
    }

    /**
     * Display the stages builder for a specific topic.
     */
    public function index(Request $request, Topic $topic): Response
    {
        $this->authorizeAdmin($request);

        $topic->load([
            'module.course:id,title,slug',
            'sections' => fn ($q) => $q->orderBy('position')->withCount(['blocks', 'activities']),
        ]);

        return Inertia::render('Courses/Stages/Index', [
            'topic' => [
                'id' => $topic->id,
                'title' => $topic->title,
                'slug' => $topic->slug,
                'description' => $topic->description,
                'estimated_minutes' => $topic->estimated_minutes,
                'is_published' => (bool) $topic->is_published,
                'module' => [
                    'id' => $topic->module?->id,
                    'title' => $topic->module?->title,
                ],
                'course' => [
                    'id' => $topic->module?->course?->id,
                    'title' => $topic->module?->course?->title,
                    'slug' => $topic->module?->course?->slug,
                ],
                'sections' => $topic->sections->map(fn (TopicSection $s) => [
                    'id' => $s->id,
                    'topic_id' => $s->topic_id,
                    'section_type' => $s->section_type,
                    'title' => $s->title,
                    'instructions' => $s->instructions,
                    'position' => $s->position,
                    'is_required' => (bool) $s->is_required,
                    'is_published' => (bool) $s->is_published,
                    'blocks_count' => $s->blocks_count,
                    'activities_count' => $s->activities_count,
                ]),
            ],
            'availableSectionTypes' => self::VALID_SECTION_TYPES,
            'availableLayoutTypes' => self::VALID_LAYOUT_TYPES,
        ]);
    }

    /**
     * Store a newly created stage within a topic.
     */
    public function store(Request $request, Topic $topic): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'section_type' => ['required', 'string', Rule::in(self::VALID_SECTION_TYPES)],
            'title' => ['required', 'string', 'max:255'],
            'instructions' => ['nullable', 'string', 'max:5000'],
            'is_required' => ['boolean'],
            'is_published' => ['boolean'],
        ]);

        $maxPosition = (int) $topic->sections()->max('position');

        $stage = $topic->sections()->create([
            'section_type' => $validated['section_type'],
            'title' => $validated['title'],
            'instructions' => $validated['instructions'] ?? null,
            'position' => $maxPosition + 1,
            'is_required' => $validated['is_required'] ?? true,
            'is_published' => $validated['is_published'] ?? false,
        ]);

        // Automatically provision an initial single-column page container for the new stage
        $stage->pages()->create([
            'title' => 'Page 1',
            'layout_type' => 'single_column',
            'position' => 1,
            'is_visible' => true,
        ]);

        return back()->with('success', "Stage '{$validated['title']}' added successfully.");
    }

    /**
     * Update the specified stage.
     */
    public function update(Request $request, Topic $topic, TopicSection $stage): RedirectResponse
    {
        $this->authorizeAdmin($request);

        if ((int) $stage->topic_id !== (int) $topic->id) {
            abort(404);
        }

        $validated = $request->validate([
            'section_type' => ['required', 'string', Rule::in(self::VALID_SECTION_TYPES)],
            'title' => ['required', 'string', 'max:255'],
            'instructions' => ['nullable', 'string', 'max:5000'],
            'is_required' => ['boolean'],
            'is_published' => ['boolean'],
        ]);

        $stage->update($validated);

        return back()->with('success', "Stage '{$stage->title}' updated successfully.");
    }

    /**
     * Remove the specified stage.
     */
    public function destroy(Request $request, Topic $topic, TopicSection $stage): RedirectResponse
    {
        $this->authorizeAdmin($request);

        if ((int) $stage->topic_id !== (int) $topic->id) {
            abort(404);
        }

        $title = $stage->title;
        $stage->delete();

        return back()->with('success', "Stage '{$title}' removed successfully.");
    }

    /**
     * Reorder stages within a topic.
     */
    public function reorder(Request $request, Topic $topic): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'stage_ids' => ['required', 'array'],
            'stage_ids.*' => ['integer', 'exists:topic_sections,id'],
        ]);

        DB::transaction(function () use ($topic, $validated) {
            foreach ($validated['stage_ids'] as $index => $stageId) {
                TopicSection::where('id', $stageId)
                    ->where('topic_id', $topic->id)
                    ->update(['position' => -($index + 1)]);
            }

            foreach ($validated['stage_ids'] as $index => $stageId) {
                TopicSection::where('id', $stageId)
                    ->where('topic_id', $topic->id)
                    ->update(['position' => $index + 1]);
            }
        });

        return back()->with('success', 'Stages reordered successfully.');
    }

    /**
     * Apply a preset sequence of stages to a topic.
     */
    public function applyPreset(Request $request, Topic $topic): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'preset' => ['required', 'string', Rule::in(['standard_pedagogical', 'hands_on_lab', 'assessment_only'])],
        ]);

        $presets = [
            'standard_pedagogical' => [
                ['section_type' => 'activate', 'default_layout' => 'single_column', 'title' => 'Activate: Warm-up & Context', 'instructions' => 'Prime your prior knowledge with a quick review.'],
                ['section_type' => 'encode', 'default_layout' => 'split_two_column', 'title' => 'Encode: Concept Walkthrough', 'instructions' => 'Study the core concept principles and guided media.'],
                ['section_type' => 'retrieve', 'default_layout' => 'single_column', 'title' => 'Retrieve: Active Recall Check', 'instructions' => 'Test your immediate retention with low-stakes comprehension checks.'],
                ['section_type' => 'anchor', 'default_layout' => 'split_two_column', 'title' => 'Anchor: Real-World Scenario', 'instructions' => 'Apply concepts to a realistic industry scenario.'],
                ['section_type' => 'deepen', 'default_layout' => 'single_column', 'title' => 'Deepen: Advanced Challenges & Synthesis', 'instructions' => 'Explore edge cases, advanced defense variations, and architectural tradeoffs.'],
                ['section_type' => 'assessment', 'default_layout' => 'single_column', 'title' => 'Assessment: Mastery Checkpoint', 'instructions' => 'Verify mastery of this topic before continuing.'],
            ],
            'hands_on_lab' => [
                ['section_type' => 'activate', 'default_layout' => 'single_column', 'title' => 'Activate: Lab Objectives', 'instructions' => 'Review the lab environment setup and requirements.'],
                ['section_type' => 'encode', 'default_layout' => 'split_two_column', 'title' => 'Encode: Guided Walkthrough', 'instructions' => 'Follow the step-by-step instructional guide.'],
                ['section_type' => 'lab', 'default_layout' => 'cinema_focus', 'title' => 'Lab: Hands-on Execution', 'instructions' => 'Perform the exercise in the interactive sandbox or terminal.'],
                ['section_type' => 'deepen', 'default_layout' => 'single_column', 'title' => 'Deepen: Challenge & Reflection', 'instructions' => 'Analyze edge cases and review defense recommendations.'],
            ],
            'assessment_only' => [
                ['section_type' => 'encode', 'default_layout' => 'single_column', 'title' => 'Encode: Overview & Instructions', 'instructions' => 'Review evaluation guidelines and grading rubric.'],
                ['section_type' => 'assessment', 'default_layout' => 'single_column', 'title' => 'Assessment: Summative Evaluation', 'instructions' => 'Complete all required evaluation questions.'],
            ],
        ];

        $stages = $presets[$validated['preset']] ?? [];
        $currentMax = (int) $topic->sections()->max('position');

        DB::transaction(function () use ($topic, $stages, &$currentMax) {
            foreach ($stages as $stageData) {
                $currentMax++;
                $stage = $topic->sections()->create([
                    'section_type' => $stageData['section_type'],
                    'title' => $stageData['title'],
                    'instructions' => $stageData['instructions'],
                    'position' => $currentMax,
                    'is_required' => true,
                    'is_published' => false,
                ]);

                // Create initial page container for the preset stage
                $stage->pages()->create([
                    'title' => 'Page 1',
                    'layout_type' => $stageData['default_layout'] ?? 'single_column',
                    'position' => 1,
                    'is_visible' => true,
                ]);
            }
        });

        return back()->with('success', 'Preset stages generated successfully.');
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
