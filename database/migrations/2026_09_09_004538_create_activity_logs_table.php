<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('actor_name')->nullable(); // preserved if actor is deleted
            $table->string('action');                 // e.g. 'promoted', 'demoted', 'created', 'deleted'
            $table->string('subject_type')->nullable(); // e.g. 'User'
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->string('subject_name')->nullable(); // preserved name
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('metadata')->nullable();       // any extra context
            $table->timestamps();

            // High-performance compound indexes for scalability
            $table->index(['subject_type', 'subject_id', 'created_at']);
            $table->index(['actor_id', 'created_at']);
            $table->index(['action', 'created_at']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
