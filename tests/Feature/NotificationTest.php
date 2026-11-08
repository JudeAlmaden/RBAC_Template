<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_user_can_view_notifications_page(): void
    {
        $user = User::where('email', 'user@example.com')->first();

        Notification::send($user, null, 'role_assigned', 'Role Assigned', [
            'body' => 'You were assigned a new role.',
            'severity' => 'success',
        ]);

        $response = $this->actingAs($user)->get(route('notifications.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Notifications/Index')
            ->has('notifications.data', 1)
            ->where('unread_count', 1)
            ->has('counts')
            ->has('filters')
        );
    }

    public function test_user_can_filter_notifications_by_status(): void
    {
        $user = User::where('email', 'user@example.com')->first();

        $unreadNotif = Notification::send($user, null, 'alert_unread', 'Unread Alert', [
            'severity' => 'warning',
        ]);

        $readNotif = Notification::send($user, null, 'alert_read', 'Read Alert', [
            'severity' => 'info',
        ]);
        $readNotif->markRead();

        // Filter unread
        $responseUnread = $this->actingAs($user)->get(route('notifications.index', ['filter' => 'unread']));
        $responseUnread->assertOk();
        $responseUnread->assertInertia(fn (Assert $page) => $page
            ->component('Notifications/Index')
            ->has('notifications.data', 1)
            ->where('notifications.data.0.title', 'Unread Alert')
        );

        // Filter read
        $responseRead = $this->actingAs($user)->get(route('notifications.index', ['filter' => 'read']));
        $responseRead->assertOk();
        $responseRead->assertInertia(fn (Assert $page) => $page
            ->component('Notifications/Index')
            ->has('notifications.data', 1)
            ->where('notifications.data.0.title', 'Read Alert')
        );
    }

    public function test_user_can_search_notifications(): void
    {
        $user = User::where('email', 'user@example.com')->first();

        Notification::send($user, null, 'super_promo', 'Super Admin Promotion', [
            'body' => 'Congratulations on your new position.',
        ]);

        Notification::send($user, null, 'routine_ping', 'Routine Ping', [
            'body' => 'Everything is operational.',
        ]);

        $response = $this->actingAs($user)->get(route('notifications.index', ['search' => 'promotion']));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Notifications/Index')
            ->has('notifications.data', 1)
            ->where('notifications.data.0.title', 'Super Admin Promotion')
        );
    }

    public function test_user_can_mark_notification_as_read(): void
    {
        $user = User::where('email', 'user@example.com')->first();

        $notif = Notification::send($user, null, 'notice', 'Notice Title');

        $this->assertNull($notif->fresh()->read_at);

        $response = $this->actingAs($user)->patch(route('notifications.read', $notif->id));

        $response->assertRedirect();
        $this->assertNotNull($notif->fresh()->read_at);
    }

    public function test_user_can_mark_all_notifications_as_read(): void
    {
        $user = User::where('email', 'user@example.com')->first();

        $n1 = Notification::send($user, null, 'notice_1', 'Notice 1');
        $n2 = Notification::send($user, null, 'notice_2', 'Notice 2');

        $this->assertEquals(2, Notification::forUser($user->id)->unread()->count());

        $response = $this->actingAs($user)->patch(route('notifications.read-all'));

        $response->assertRedirect();
        $this->assertEquals(0, Notification::forUser($user->id)->unread()->count());
    }

    public function test_user_can_dismiss_notification(): void
    {
        $user = User::where('email', 'user@example.com')->first();

        $notif = Notification::send($user, null, 'removable', 'To Dismiss');

        $response = $this->actingAs($user)->delete(route('notifications.destroy', $notif->id));

        $response->assertRedirect();
        $this->assertNotNull($notif->fresh()->dismissed_at);
        $this->assertEquals(0, Notification::forUser($user->id)->visible()->count());
    }

    public function test_user_can_clear_all_read_notifications(): void
    {
        $user = User::where('email', 'user@example.com')->first();

        $n1 = Notification::send($user, null, 'read_item', 'Already Read');
        $n1->markRead();

        $n2 = Notification::send($user, null, 'unread_item', 'Still Unread');

        $response = $this->actingAs($user)->delete(route('notifications.clear-read'));

        $response->assertRedirect();
        $this->assertNotNull($n1->fresh()->dismissed_at);
        $this->assertNull($n2->fresh()->dismissed_at);
        $this->assertEquals(1, Notification::forUser($user->id)->visible()->count());
    }

    public function test_user_can_fetch_notifications_feed_json(): void
    {
        $user = User::where('email', 'user@example.com')->first();

        Notification::send($user, null, 'feed_item', 'Feed Item', ['severity' => 'info']);

        $response = $this->actingAs($user)->getJson(route('notifications.feed'));

        $response->assertOk();
        $response->assertJsonStructure([
            'notifications' => ['data'],
            'unread_count',
        ]);
        $this->assertEquals('Feed Item', $response->json('notifications.data.0.title'));
    }

    public function test_inertia_request_to_index_receives_inertia_response_even_with_ajax_header(): void
    {
        $user = User::where('email', 'user@example.com')->first();

        Notification::send($user, null, 'inertia_item', 'Inertia Item');

        // Simulate AJAX request from client navigation
        $response = $this->actingAs($user)->get(route('notifications.index'), [
            'X-Requested-With' => 'XMLHttpRequest',
        ]);

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Notifications/Index')
            ->has('notifications.data', 1)
        );
    }
}
