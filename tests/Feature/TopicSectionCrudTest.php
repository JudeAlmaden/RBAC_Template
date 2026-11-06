<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Module;
use App\Models\Role;
use App\Models\Topic;
use App\Models\TopicSection;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TopicSectionCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $learner;

    private Topic $topic;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->admin = User::where('email', 'admin@example.com')->firstOrFail();

        $learnerRole = Role::firstOrCreate(['name' => 'learner'], [
            'display_name' => 'Learner',
            'scope' => 'learner',
            'is_system' => true,
        ]);
        $this->learner = User::factory()->create();
        $this->learner->assignRole($learnerRole);

        $course = Course::create([
            'title' => 'Advanced Cyber Defense',
            'slug' => 'advanced-cyber-defense',
            'status' => 'published',
            'created_by' => $this->admin->id,
        ]);

        $module = Module::create([
            'course_id' => $course->id,
            'title' => 'Module 1: Incident Response',
            'position' => 1,
            'is_published' => true,
        ]);

        $this->topic = Topic::create([
            'module_id' => $module->id,
            'title' => 'Live Memory Forensics',
            'slug' => 'live-memory-forensics',
            'position' => 1,
            'estimated_minutes' => 45,
            'is_published' => true,
        ]);
    }

    public function test_admin_can_view_topic_stages_index(): void
    {
        $response = $this->actingAs($this->admin)->get(route('topics.stages.index', $this->topic->id));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Courses/Stages/Index')
            ->has('topic')
            ->where('topic.id', $this->topic->id)
            ->where('topic.title', 'Live Memory Forensics')
        );
    }

    public function test_learner_cannot_view_stages_builder(): void
    {
        $response = $this->actingAs($this->learner)->get(route('topics.stages.index', $this->topic->id));

        $response->assertForbidden();
    }

    public function test_admin_can_create_update_and_delete_stage(): void
    {
        // 1. Store
        $storeResponse = $this->actingAs($this->admin)->post(route('topics.stages.store', $this->topic->id), [
            'section_type' => 'encode',
            'title' => 'Encode: Volatility Framework Basics',
            'instructions' => 'Understand process memory dumping.',
            'is_required' => true,
            'is_published' => true,
        ]);

        $storeResponse->assertRedirect();
        $this->assertDatabaseHas('topic_sections', [
            'topic_id' => $this->topic->id,
            'section_type' => 'encode',
            'title' => 'Encode: Volatility Framework Basics',
            'position' => 1,
            'is_required' => true,
            'is_published' => true,
        ]);

        $stage = TopicSection::where('topic_id', $this->topic->id)->firstOrFail();

        // Check that initial page container was created
        $this->assertDatabaseHas('section_pages', [
            'topic_section_id' => $stage->id,
            'position' => 1,
            'layout_type' => 'single_column',
        ]);

        // 2. Update
        $updateResponse = $this->actingAs($this->admin)->put(route('topics.stages.update', [$this->topic->id, $stage->id]), [
            'section_type' => 'encode',
            'title' => 'Encode: Volatility 3 Analysis',
            'instructions' => 'Updated instructions.',
            'is_required' => true,
            'is_published' => false,
        ]);

        $updateResponse->assertRedirect();
        $this->assertDatabaseHas('topic_sections', [
            'id' => $stage->id,
            'title' => 'Encode: Volatility 3 Analysis',
            'is_published' => false,
        ]);

        // 3. Delete
        $deleteResponse = $this->actingAs($this->admin)->delete(route('topics.stages.destroy', [$this->topic->id, $stage->id]));

        $deleteResponse->assertRedirect();
        $this->assertDatabaseMissing('topic_sections', [
            'id' => $stage->id,
        ]);
        $this->assertDatabaseMissing('section_pages', [
            'topic_section_id' => $stage->id,
        ]);
    }

    public function test_admin_can_apply_stage_preset(): void
    {
        $response = $this->actingAs($this->admin)->post(route('topics.stages.preset', $this->topic->id), [
            'preset' => 'standard_pedagogical',
        ]);

        $response->assertRedirect();

        // Standard preset has 6 stages (activate, encode, retrieve, anchor, deepen, assessment)
        $this->assertEquals(6, $this->topic->sections()->count());
        $this->assertDatabaseHas('topic_sections', [
            'topic_id' => $this->topic->id,
            'section_type' => 'activate',
            'position' => 1,
        ]);
        $this->assertDatabaseHas('topic_sections', [
            'topic_id' => $this->topic->id,
            'section_type' => 'deepen',
            'position' => 5,
        ]);
        $this->assertDatabaseHas('topic_sections', [
            'topic_id' => $this->topic->id,
            'section_type' => 'assessment',
            'position' => 6,
        ]);
    }

    public function test_admin_can_reorder_stages(): void
    {
        $stage1 = $this->topic->sections()->create([
            'section_type' => 'activate',
            'title' => 'Stage 1',
            'position' => 1,
        ]);

        $stage2 = $this->topic->sections()->create([
            'section_type' => 'encode',
            'title' => 'Stage 2',
            'position' => 2,
        ]);

        // Swap positions
        $response = $this->actingAs($this->admin)->post(route('topics.stages.reorder', $this->topic->id), [
            'stage_ids' => [$stage2->id, $stage1->id],
        ]);

        $response->assertRedirect();

        $this->assertEquals(1, $stage2->fresh()->position);
        $this->assertEquals(2, $stage1->fresh()->position);
    }

    public function test_admin_can_manage_section_pages(): void
    {
        $stage = $this->topic->sections()->create([
            'section_type' => 'encode',
            'title' => 'Encode Stage',
            'position' => 1,
        ]);

        // 1. Store Page
        $storeResponse = $this->actingAs($this->admin)->post(route('stages.pages.store', $stage->id), [
            'title' => 'Concept Overview',
            'layout_type' => 'split_two_column',
            'is_visible' => true,
        ]);

        $storeResponse->assertRedirect();
        $this->assertDatabaseHas('section_pages', [
            'topic_section_id' => $stage->id,
            'title' => 'Concept Overview',
            'layout_type' => 'split_two_column',
            'position' => 1,
        ]);

        $page = $stage->pages()->firstOrFail();

        // 2. Update Page
        $updateResponse = $this->actingAs($this->admin)->put(route('stages.pages.update', [$stage->id, $page->id]), [
            'title' => 'Updated Overview',
            'layout_type' => 'cinema_focus',
            'is_visible' => false,
        ]);

        $updateResponse->assertRedirect();
        $this->assertDatabaseHas('section_pages', [
            'id' => $page->id,
            'title' => 'Updated Overview',
            'layout_type' => 'cinema_focus',
            'is_visible' => false,
        ]);

        // 3. Delete Page
        $deleteResponse = $this->actingAs($this->admin)->delete(route('stages.pages.destroy', [$stage->id, $page->id]));

        $deleteResponse->assertRedirect();
        $this->assertDatabaseMissing('section_pages', [
            'id' => $page->id,
        ]);
    }

    public function test_admin_can_save_stage_builder_content(): void
    {
        $stage = $this->topic->sections()->create([
            'section_type' => 'encode',
            'title' => 'Encode Stage',
            'position' => 1,
        ]);

        $page = $stage->pages()->create([
            'title' => 'Page 1',
            'layout_type' => 'single_column',
            'position' => 1,
            'is_visible' => true,
        ]);

        $block = $page->blocks()->create([
            'block_type' => 'rich_text',
            'display_variant' => 'default',
            'layout_slot' => 'main',
            'content' => ['text' => 'Old copy'],
            'position' => 1,
            'is_visible' => true,
        ]);

        $orphan = $page->blocks()->create([
            'block_type' => 'callout',
            'display_variant' => 'callout_tip',
            'layout_slot' => 'main',
            'content' => ['text' => 'Remove me'],
            'position' => 2,
            'is_visible' => true,
        ]);

        $response = $this->actingAs($this->admin)->put(route('stages.builder.save', $stage->id), [
            'pages' => [
                [
                    'id' => $page->id,
                    'title' => 'Renamed Page',
                    'layout_type' => 'split_two_column',
                    'is_visible' => true,
                    'position' => 1,
                    'blocks' => [
                        [
                            'id' => $block->id,
                            'block_type' => 'rich_text',
                            'display_variant' => 'heading',
                            'layout_slot' => 'left',
                            'content' => ['text' => 'Hello world', 'level' => 2],
                            'is_visible' => true,
                            'position' => 1,
                        ],
                        [
                            'id' => null,
                            'block_type' => 'video',
                            'display_variant' => 'card',
                            'layout_slot' => 'right',
                            'content' => ['url' => 'https://example.com/video'],
                            'is_visible' => true,
                            'position' => 2,
                        ],
                    ],
                ],
            ],
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('section_pages', [
            'id' => $page->id,
            'title' => 'Renamed Page',
            'layout_type' => 'split_two_column',
        ]);

        $this->assertDatabaseHas('content_blocks', [
            'id' => $block->id,
            'display_variant' => 'heading',
            'layout_slot' => 'left',
            'position' => 1,
        ]);

        $this->assertDatabaseMissing('content_blocks', ['id' => $orphan->id]);

        $this->assertDatabaseHas('content_blocks', [
            'section_page_id' => $page->id,
            'block_type' => 'video',
            'layout_slot' => 'right',
            'position' => 2,
        ]);
    }

    public function test_builder_save_deletes_pages_missing_from_payload(): void
    {
        $stage = $this->topic->sections()->create([
            'section_type' => 'encode',
            'title' => 'Encode Stage',
            'position' => 1,
        ]);

        $keep = $stage->pages()->create([
            'title' => 'Keep',
            'layout_type' => 'single_column',
            'position' => 1,
            'is_visible' => true,
        ]);

        $drop = $stage->pages()->create([
            'title' => 'Drop',
            'layout_type' => 'single_column',
            'position' => 2,
            'is_visible' => true,
        ]);

        $response = $this->actingAs($this->admin)->put(route('stages.builder.save', $stage->id), [
            'pages' => [
                [
                    'id' => $keep->id,
                    'title' => 'Keep',
                    'layout_type' => 'single_column',
                    'is_visible' => true,
                    'position' => 1,
                    'blocks' => [],
                ],
            ],
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('section_pages', ['id' => $keep->id]);
        $this->assertDatabaseMissing('section_pages', ['id' => $drop->id]);
    }

    public function test_learner_cannot_save_stage_builder_content(): void
    {
        $stage = $this->topic->sections()->create([
            'section_type' => 'encode',
            'title' => 'Encode Stage',
            'position' => 1,
        ]);

        $response = $this->actingAs($this->learner)->put(route('stages.builder.save', $stage->id), [
            'pages' => [],
        ]);

        $response->assertForbidden();
    }

    public function test_admin_can_view_stage_show_with_pages_and_blocks(): void
    {
        $stage = $this->topic->sections()->create([
            'section_type' => 'encode',
            'title' => 'Encode Stage',
            'position' => 1,
        ]);

        $page = $stage->pages()->create([
            'title' => 'Concept Overview',
            'layout_type' => 'split_two_column',
            'position' => 1,
            'is_visible' => true,
        ]);

        $page->blocks()->create([
            'block_type' => 'rich_text',
            'display_variant' => 'heading',
            'layout_slot' => 'left',
            'content' => ['text' => 'Objectives', 'level' => 2],
            'position' => 1,
            'is_visible' => true,
        ]);

        $response = $this->actingAs($this->admin)->get(route('topics.stages.show', [$this->topic->id, $stage->id]));

        $response->assertOk();
        $response->assertInertia(fn ($inertia) => $inertia
            ->component('Courses/Stages/Show')
            ->where('stage.id', $stage->id)
            ->has('stage.pages', 1)
            ->where('stage.pages.0.id', $page->id)
            ->where('stage.pages.0.layout_type', 'split_two_column')
            ->has('stage.pages.0.blocks', 1)
            ->where('stage.pages.0.blocks.0.block_type', 'rich_text')
            ->where('stage.pages.0.blocks.0.display_variant', 'heading')
            ->where('stage.pages.0.blocks.0.layout_slot', 'left')
        );
    }
}
