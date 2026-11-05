<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Module;
use App\Models\Role;
use App\Models\Topic;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseShowAndCurriculumCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $learner;

    private Course $course;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->admin = User::where('email', 'admin@example.com')->firstOrFail();

        // Create learner user
        $learnerRole = Role::firstOrCreate(['name' => 'learner'], [
            'display_name' => 'Learner',
            'scope' => 'learner',
            'is_system' => true,
        ]);

        $this->learner = User::factory()->create();
        $this->learner->assignRole($learnerRole);

        $this->course = Course::create([
            'title' => 'Web Security Fundamentals',
            'slug' => 'web-security-fundamentals',
            'description' => 'A comprehensive guide to web app security.',
            'status' => 'published',
            'created_by' => $this->admin->id,
            'published_at' => now(),
        ]);
    }

    public function test_admin_can_view_course_show_page(): void
    {
        $response = $this->actingAs($this->admin)->get(route('courses.show', $this->course->id));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Courses/Show')
            ->has('course')
            ->where('course.id', $this->course->id)
            ->where('course.title', 'Web Security Fundamentals')
        );
    }

    public function test_admin_can_view_module_show_page(): void
    {
        $module = Module::create([
            'course_id' => $this->course->id,
            'title' => 'Module 1: Injection',
            'position' => 1,
            'is_published' => true,
        ]);

        $response = $this->actingAs($this->admin)->get(route('courses.modules.show', [$this->course->id, $module->id]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Courses/Modules/Show')
            ->has('module')
            ->where('module.id', $module->id)
            ->where('module.title', 'Module 1: Injection')
        );
    }

    public function test_non_admin_cannot_view_course_show_page(): void
    {
        $response = $this->actingAs($this->learner)->get(route('courses.show', $this->course->id));

        $response->assertForbidden();
    }

    public function test_admin_can_create_update_and_delete_module(): void
    {
        // 1. Create module
        $storeResponse = $this->actingAs($this->admin)->post(route('courses.modules.store', $this->course->id), [
            'title' => 'Module 1: Injection Attacks',
            'description' => 'SQLi and Command Injection explained.',
            'is_published' => true,
        ]);

        $storeResponse->assertRedirect();
        $this->assertDatabaseHas('modules', [
            'course_id' => $this->course->id,
            'title' => 'Module 1: Injection Attacks',
            'is_published' => true,
            'position' => 1,
        ]);

        $module = Module::where('course_id', $this->course->id)->firstOrFail();

        // 2. Update module
        $updateResponse = $this->actingAs($this->admin)->put(route('courses.modules.update', [$this->course->id, $module->id]), [
            'title' => 'Module 1: Injection Attacks (Updated)',
            'description' => 'Updated description.',
            'is_published' => false,
        ]);

        $updateResponse->assertRedirect();
        $this->assertDatabaseHas('modules', [
            'id' => $module->id,
            'title' => 'Module 1: Injection Attacks (Updated)',
            'is_published' => false,
        ]);

        // 3. Delete module
        $deleteResponse = $this->actingAs($this->admin)->delete(route('courses.modules.destroy', [$this->course->id, $module->id]));

        $deleteResponse->assertRedirect();
        $this->assertDatabaseMissing('modules', [
            'id' => $module->id,
        ]);
    }

    public function test_admin_can_create_update_and_delete_topic(): void
    {
        $module = Module::create([
            'course_id' => $this->course->id,
            'title' => 'Module 1',
            'position' => 1,
            'is_published' => true,
        ]);

        // 1. Create topic
        $storeResponse = $this->actingAs($this->admin)->post(route('modules.topics.store', $module->id), [
            'title' => 'SQL Injection Deep Dive',
            'description' => 'Hands on practice with union based SQLi.',
            'estimated_minutes' => 30,
            'is_published' => true,
        ]);

        $storeResponse->assertRedirect();
        $this->assertDatabaseHas('topics', [
            'module_id' => $module->id,
            'title' => 'SQL Injection Deep Dive',
            'slug' => 'sql-injection-deep-dive',
            'estimated_minutes' => 30,
            'is_published' => true,
            'position' => 1,
        ]);

        $topic = Topic::where('module_id', $module->id)->firstOrFail();

        // 2. Update topic
        $updateResponse = $this->actingAs($this->admin)->put(route('modules.topics.update', [$module->id, $topic->id]), [
            'title' => 'SQL Injection Advanced',
            'description' => 'Blind SQLi techniques.',
            'estimated_minutes' => 45,
            'is_published' => false,
        ]);

        $updateResponse->assertRedirect();
        $this->assertDatabaseHas('topics', [
            'id' => $topic->id,
            'title' => 'SQL Injection Advanced',
            'estimated_minutes' => 45,
            'is_published' => false,
        ]);

        // 3. Delete topic
        $deleteResponse = $this->actingAs($this->admin)->delete(route('modules.topics.destroy', [$module->id, $topic->id]));

        $deleteResponse->assertRedirect();
        $this->assertDatabaseMissing('topics', [
            'id' => $topic->id,
        ]);
    }
}
