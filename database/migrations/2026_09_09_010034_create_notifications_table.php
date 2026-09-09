<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Recipient — null means broadcast (visible to all)
            $table->foreignId('recipient_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Sender — null means system-generated
            $table->foreignId('sender_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Preserved so notifications survive sender deletion
            $table->string('sender_name')->nullable();

            // Notification content
            $table->string('type');                   // e.g. 'account_created', 'role_promoted'
            $table->string('title');                  // short headline
            $table->text('body')->nullable();         // optional longer description

            // Optional CTA
            $table->string('action_url')->nullable(); // e.g. /users/42
            $table->string('action_label')->nullable(); // e.g. "View Account"

            // Visual hint (maps to a lucide-react icon name)
            $table->string('icon')->nullable();       // e.g. 'UserPlus', 'Shield'

            // Severity drives the colour treatment in the UI
            $table->enum('severity', ['info', 'success', 'warning', 'danger'])->default('info');

            // State
            $table->timestamp('read_at')->nullable();
            $table->timestamp('dismissed_at')->nullable();

            // Arbitrary extra context
            $table->json('metadata')->nullable();

            $table->timestamps();

            // Fast unread-count queries per user
            $table->index(['recipient_id', 'read_at']);
            $table->index(['recipient_id', 'dismissed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
