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
        // 1. Activity Attempts
        Schema::create('activity_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('learning_activity_id')->constrained('learning_activities')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('attempt_number')->default(1);
            $table->string('status', 32)->default('in_progress');
            $table->decimal('score', 8, 2)->nullable();
            $table->decimal('max_score', 8, 2)->nullable();
            $table->timestamp('started_at');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('graded_at')->nullable();
            $table->json('grading_summary')->nullable();
            $table->timestamps();

            $table->unique(['learning_activity_id', 'user_id', 'attempt_number']);
            $table->index(['user_id', 'status']);
        });

        // 2. Activity Responses
        Schema::create('activity_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_attempt_id')->constrained('activity_attempts')->cascadeOnDelete();
            $table->foreignId('activity_question_id')->constrained('activity_questions')->cascadeOnDelete();
            $table->json('response')->nullable();
            $table->boolean('is_correct')->nullable();
            $table->decimal('score', 8, 2)->nullable();
            $table->json('feedback')->nullable();
            $table->timestamp('answered_at')->nullable();
            $table->timestamps();

            $table->unique(['activity_attempt_id', 'activity_question_id']);
        });

        // 3. Topic Progress
        Schema::create('topic_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('topic_id')->constrained('topics')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status', 32)->default('not_started');
            $table->decimal('progress_percent', 5, 2)->default(0.00);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('last_activity_at')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();

            $table->unique(['topic_id', 'user_id']);
            $table->index(['user_id', 'status']);
        });

        // 4. Course Assignments
        Schema::create('course_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('target_type', 64);
            $table->unsignedBigInteger('target_id');
            $table->timestamp('due_at')->nullable()->index();
            $table->timestamp('available_from')->nullable();
            $table->timestamp('available_until')->nullable();
            $table->boolean('required')->default(true);
            $table->json('settings')->nullable();
            $table->timestamps();

            $table->index(['course_id', 'target_type', 'target_id']);
        });

        // 5. Course Enrollments
        Schema::create('course_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('course_assignment_id')->nullable()->constrained('course_assignments')->nullOnDelete();
            $table->string('status', 32)->default('enrolled');
            $table->timestamp('enrolled_at');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->decimal('progress_percent', 5, 2)->default(0.00);
            $table->json('settings')->nullable();
            $table->timestamps();

            $table->unique(['course_id', 'user_id']);
            $table->index(['user_id', 'status']);
            $table->index(['course_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_enrollments');
        Schema::dropIfExists('course_assignments');
        Schema::dropIfExists('topic_progress');
        Schema::dropIfExists('activity_responses');
        Schema::dropIfExists('activity_attempts');
    }
};
