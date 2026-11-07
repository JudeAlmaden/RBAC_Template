<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\SetupLink;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ForcePasswordChangeTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_pending_user_is_sent_to_the_setup_page(): void
    {
        $user = User::factory()->create(['must_change_password' => true]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertRedirect();
        $this->assertStringContainsString(
            '/onboarding/'.$user->id,
            $response->headers->get('Location'),
        );
    }

    public function test_a_pending_user_can_still_log_out(): void
    {
        $user = User::factory()->create(['must_change_password' => true]);

        $this->actingAs($user)->post('/logout')->assertRedirect('/');

        $this->assertGuest();
    }

    public function test_the_setup_page_itself_is_never_blocked(): void
    {
        $user = User::factory()->create(['must_change_password' => true]);

        $this->get(SetupLink::showUrlFor($user))->assertOk();
    }

    public function test_users_without_the_flag_are_not_redirected(): void
    {
        $user = User::factory()->create(['must_change_password' => false]);

        $this->actingAs($user)->get('/profile')->assertOk();
    }
}
