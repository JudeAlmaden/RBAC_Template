<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_password_link_screen_can_be_rendered(): void
    {
        $this->get('/forgot-password')->assertStatus(200);
    }

    public function test_reset_password_link_can_be_requested(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email])
            ->assertSessionHas('status');

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_unknown_addresses_do_not_reveal_whether_the_account_exists(): void
    {
        Notification::fake();

        $this->post('/forgot-password', ['email' => 'nobody@example.com'])
            ->assertSessionHas('status')
            ->assertSessionHasNoErrors();

        Notification::assertNothingSent();
    }

    public function test_reset_password_screen_can_be_rendered(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
            $this->get('/reset-password/'.$notification->token.'?email='.urlencode($user->email))
                ->assertStatus(200)
                ->assertInertia(fn ($page) => $page
                    ->component('Auth/ResetPassword')
                    ->where('email', $user->email));

            return true;
        });
    }

    public function test_a_reset_link_without_an_email_renders_the_invalid_state(): void
    {
        $this->get('/reset-password/'.$this->tokenFor(User::factory()->create()))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Auth/ResetPassword')
                ->where('invalidReason', 'missing'));
    }

    public function test_password_can_be_reset_with_valid_token(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
            $this->post('/reset-password', [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => 'new-strong-password',
                'password_confirmation' => 'new-strong-password',
            ])->assertSessionHasNoErrors()->assertRedirect(route('dashboard'));

            $this->assertAuthenticatedAs($user->fresh());

            return true;
        });
    }

    public function test_resetting_a_password_clears_the_pending_change_flag(): void
    {
        Notification::fake();

        $user = User::factory()->create(['must_change_password' => true]);

        $this->post('/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
            $this->post('/reset-password', [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => 'new-strong-password',
                'password_confirmation' => 'new-strong-password',
            ]);

            $this->assertFalse($user->fresh()->must_change_password);

            return true;
        });
    }

    public function test_a_deactivated_user_is_not_signed_in_after_resetting(): void
    {
        Notification::fake();

        $user = User::factory()->create(['is_active' => false]);

        $this->post('/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
            $this->post('/reset-password', [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => 'new-strong-password',
                'password_confirmation' => 'new-strong-password',
            ])->assertRedirect(route('login'));

            $this->assertGuest();

            return true;
        });
    }

    public function test_an_expired_token_is_rejected(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
            $this->travel(61)->minutes();

            $this->post('/reset-password', [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => 'new-strong-password',
                'password_confirmation' => 'new-strong-password',
            ])->assertSessionHasErrors('email');

            $this->assertGuest();

            return true;
        });
    }

    private function tokenFor(User $user): string
    {
        return app('auth.password.broker')->createToken($user);
    }
}
