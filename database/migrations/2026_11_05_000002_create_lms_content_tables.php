<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Content Type Definitions (Optional Registry)
        Schema::create('content_type_definitions', function (Blueprint $table) {
            $table->id();
            $table->string('scope', 32);
            $table->string('type_key', 64);
            $table->string('label');
            $table->json('config_schema')->nullable();
            $table->json('default_config')->nullable();
            $table->string('renderer_key', 128)->nullable();
            $table->unsignedInteger('version')->default(1);
            $table->boolean('is_enabled')->default(true);
            $table->timestamps();

            $table->unique(['scope', 'type_key', 'version']);
        });

        // 2. Courses
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('thumbnail_url', 500)->nullable();
            $table->string('banner_url', 500)->nullable();
            $table->string('status', 32)->default('draft')->index();
            $table->json('settings')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('created_by');
        });

        // 3. Modules
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_published')->default(false);
            $table->json('settings')->nullable();
            $table->timestamps();

            $table->unique(['course_id', 'position']);
        });

        // 4. Topics
        Schema::create('topics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->unsignedInteger('estimated_minutes')->nullable();
            $table->boolean('is_published')->default(false);
            $table->json('settings')->nullable();
            $table->timestamps();

            $table->unique(['module_id', 'position']);
            $table->unique(['module_id', 'slug']);
        });

        // 5. Topic Sections (stages)
        Schema::create('topic_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('topic_id')->constrained('topics')->cascadeOnDelete();
            $table->string('section_type', 64);
            $table->string('title');
            $table->text('instructions')->nullable();
            $table->json('content')->nullable();
            $table->json('presentation_config')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_required')->default(true);
            $table->boolean('is_published')->default(false);
            $table->json('settings')->nullable();
            $table->timestamps();

            $table->unique(['topic_id', 'position']);
            $table->index(['topic_id', 'section_type']);
        });

        // 6. Section Pages (containers within a stage — each has its own layout)
        Schema::create('section_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('topic_section_id')->constrained('topic_sections')->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->string('layout_type', 64)->default('single_column')->index();
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->json('settings')->nullable();
            $table->timestamps();

            $table->unique(['topic_section_id', 'position']);
            $table->index(['topic_section_id', 'layout_type']);
        });

        // 7. Content Blocks (components within a page)
        Schema::create('content_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_page_id')->constrained('section_pages')->cascadeOnDelete();
            $table->string('block_type', 64)->index();
            $table->string('display_variant', 64)->default('default');
            $table->string('layout_slot', 32)->default('main');
            $table->json('content')->nullable();
            $table->foreignId('media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();

            $table->unique(['section_page_id', 'position']);
            $table->index(['section_page_id', 'layout_slot']);
        });

        // 8. Learning Activities
        Schema::create('learning_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('topic_section_id')->constrained('topic_sections')->cascadeOnDelete();
            $table->string('activity_type', 64);
            $table->string('title');
            $table->text('instructions')->nullable();
            $table->json('content')->nullable();
            $table->json('presentation_config')->nullable();
            $table->json('grading_config')->nullable();
            $table->boolean('is_answerable')->default(false);
            $table->boolean('is_gradable')->default(false);
            $table->decimal('max_score', 8, 2)->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_required')->default(true);
            $table->boolean('is_published')->default(false);
            $table->json('settings')->nullable();
            $table->timestamps();

            $table->unique(['topic_section_id', 'position']);
            $table->index(['topic_section_id', 'activity_type']);
        });

        // 9. Activity Questions
        Schema::create('activity_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('learning_activity_id')->constrained('learning_activities')->cascadeOnDelete();
            $table->string('question_type', 64);
            $table->json('prompt');
            $table->json('question_config')->nullable();
            $table->json('answer_key')->nullable();
            $table->json('grading_config')->nullable();
            $table->json('explanation')->nullable();
            $table->decimal('points', 8, 2)->default(1.00);
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_required')->default(true);
            $table->timestamps();

            $table->unique(['learning_activity_id', 'position']);
            $table->index(['learning_activity_id', 'question_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_questions');
        Schema::dropIfExists('learning_activities');
        Schema::dropIfExists('content_blocks');
        Schema::dropIfExists('section_pages');
        Schema::dropIfExists('topic_sections');
        Schema::dropIfExists('topics');
        Schema::dropIfExists('modules');
        Schema::dropIfExists('courses');
        Schema::dropIfExists('content_type_definitions');
    }
};
