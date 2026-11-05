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
            'layout_type' => 'split_two_column',
            'title' => 'Encode: Volatility Framework Basics',
            'instructions' => 'Understand process memory dumping.',
            'is_required' => true,
            'is_published' => true,
        ]);

        $storeResponse->assertRedirect();
        $this->assertDatabaseHas('topic_sections', [
            'topic_id' => $this->topic->id,
            'section_type' => 'encode',
            'layout_type' => 'split_two_column',
            'title' => 'Encode: Volatility Framework Basics',
            'position' => 1,
            'is_required' => true,
            'is_published' => true,
        ]);

        $stage = TopicSection::where('topic_id', $this->topic->id)->firstOrFail();

        // 2. Update
        $updateResponse = $this->actingAs($this->admin)->put(route('topics.stages.update', [$this->topic->id, $stage->id]), [
            'section_type' => 'encode',
            'layout_type' => 'cinema_focus',
            'title' => 'Encode: Volatility 3 Analysis',
            'instructions' => 'Updated instructions.',
            'is_required' => true,
            'is_published' => false,
        ]);

        $updateResponse->assertRedirect();
        $this->assertDatabaseHas('topic_sections', [
            'id' => $stage->id,
            'layout_type' => 'cinema_focus',
            'title' => 'Encode: Volatility 3 Analysis',
            'is_published' => false,
        ]);

        // 3. Delete
        $deleteResponse = $this->actingAs($this->admin)->delete(route('topics.stages.destroy', [$this->topic->id, $stage->id]));

        $deleteResponse->assertRedirect();
        $this->assertDatabaseMissing('topic_sections', [
            'id' => $stage->id,
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
            'layout_type' => 'single_column',
            'title' => 'Stage 1',
            'position' => 1,
        ]);

        $stage2 = $this->topic->sections()->create([
            'section_type' => 'encode',
            'layout_type' => 'single_column',
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
}
