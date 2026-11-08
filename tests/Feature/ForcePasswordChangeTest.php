<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\SetupLink;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ForcePasswordChangeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_a_flagged_user_is_redirected_to_the_setup_page(): void
    {
        $user = User::where('email', 'user@example.com')->firstOrFail();
        $user->forceFill(['must_change_password' => true])->save();

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertRedirectContains('/onboarding/'.$user->id);
    }

    public function test_a_flagged_user_can_still_log_out(): void
    {
        $user = User::where('email', 'user@example.com')->firstOrFail();
        $user->forceFill(['must_change_password' => true])->save();

        $response = $this->actingAs($user)->post('/logout');

        $response->assertRedirect('/');
        $this->assertGuest();
    }

    public function test_the_setup_page_is_reachable_while_flagged(): void
    {
        $user = User::where('email', 'user@example.com')->firstOrFail();
        $user->forceFill(['must_change_password' => true])->save();

        $this->get(SetupLink::showUrlFor($user))->assertOk();
    }

    public function test_unflagged_users_are_not_redirected(): void
    {
        $user = User::where('email', 'user@example.com')->firstOrFail();

        $this->actingAs($user)->get('/dashboard')->assertOk();
    }
}
