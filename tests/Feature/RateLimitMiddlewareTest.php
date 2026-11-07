<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class RateLimitMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_inertia_requests_are_redirected_back_with_a_flash_error(): void
    {
        $user = User::factory()->create();

        // The 'web' limiter hashes md5(limiter name . 'reads:' . user id).
        $this->exhaustBucket('webreads:'.$user->id, 300);

        $response = $this->actingAs($user)
            ->from('/dashboard')
            ->withHeader('X-Inertia', 'true')
            ->get('/dashboard');

        $response->assertRedirect('/dashboard');
        $response->assertSessionHas('error');
    }

    public function test_json_requests_still_receive_a_429_with_retry_after(): void
    {
        $user = User::factory()->create();

        $this->exhaustBucket('webwrites:'.$user->id, 60);

        $response = $this->actingAs($user)->patchJson('/notifications/read-all');

        $response->assertStatus(429);
        $response->assertHeader('Retry-After');
    }

    public function test_read_traffic_does_not_consume_the_write_budget(): void
    {
        $user = User::factory()->create();

        $this->exhaustBucket('webreads:'.$user->id, 300);

        $response = $this->actingAs($user)->patchJson('/notifications/read-all');

        $this->assertNotSame(429, $response->status());
    }

    public function test_activity_log_export_uses_its_own_limiter(): void
    {
        $user = User::factory()->create();

        // The 'exports' limiter keys on the user id alone.
        $this->exhaustBucket('exports'.$user->id, 5);

        $this->actingAs($user)
            ->get('/activity-logs/export')
            ->assertStatus(429);
    }

    /**
     * Fill a named limiter bucket so the next matching request is throttled.
     */
    private function exhaustBucket(string $unhashedKey, int $maxAttempts): void
    {
        for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
            RateLimiter::hit(md5($unhashedKey), 60);
        }
    }
}
