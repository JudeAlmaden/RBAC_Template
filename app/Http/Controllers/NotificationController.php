<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * GET /notifications/feed
     * Lightweight JSON feed for dropdown panel.
     */
    public function feed(Request $request): JsonResponse
    {
        $user = $request->user();
        $notifications = Notification::forUser($user->id)
            ->visible()
            ->latest()
            ->take(20)
            ->get()
            ->map(fn (Notification $n) => $this->format($n));

        return response()->json([
            'notifications' => ['data' => $notifications],
            'unread_count' => $this->unreadCount($user->id),
        ]);
    }

    /**
     * GET /notifications
     * Paginated notification feed for the current user.
     */
    public function index(Request $request): Response|JsonResponse
    {
        $user = $request->user();
        $query = Notification::forUser($user->id)->visible();

        // Filter: all | unread | read
        $filter = $request->query('filter', 'all');
        if ($filter === 'unread') {
            $query->unread();
        } elseif ($filter === 'read') {
            $query->whereNotNull('read_at');
        }

        // Severity filter: info | success | warning | danger
        $severity = $request->query('severity', '');
        if (! empty($severity) && in_array($severity, ['info', 'success', 'warning', 'danger'])) {
            $query->where('severity', $severity);
        }

        // Keyword search in title, body, sender_name
        $search = $request->query('search', '');
        if (! empty($search)) {
            $term = '%'.strtolower($search).'%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(title) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(body) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(sender_name) LIKE ?', [$term]);
            });
        }

        $perPage = (int) $request->query('per_page', 15);
        if ($perPage < 5 || $perPage > 100) {
            $perPage = 15;
        }

        $notifications = $query->latest()
            ->paginate($perPage)
            ->withQueryString();

        $notifications->getCollection()->transform(
            fn (Notification $n) => $this->format($n)
        );

        $unreadCount = $this->unreadCount($user->id);

        // Explicit JSON format request (non-Inertia only)
        if (! $request->header('X-Inertia') && $request->query('format') === 'json') {
            return response()->json([
                'notifications' => $notifications,
                'unread_count' => $unreadCount,
            ]);
        }

        $allCount = Notification::forUser($user->id)->visible()->count();
        $readCount = Notification::forUser($user->id)->visible()->whereNotNull('read_at')->count();

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
            'counts' => [
                'all' => $allCount,
                'unread' => $unreadCount,
                'read' => $readCount,
            ],
            'filters' => [
                'filter' => $filter,
                'severity' => $severity,
                'search' => $search,
            ],
        ]);
    }

    /**
     * PATCH /notifications/{notification}/read
     * Mark a single notification as read.
     */
    public function markRead(Request $request, Notification $notification): RedirectResponse
    {
        $this->authorizeNotification($request, $notification);
        $notification->markRead();

        return back()->with('success', 'Notification marked as read.');
    }

    /**
     * PATCH /notifications/read-all
     * Mark all of the current user's notifications as read.
     */
    public function markAllRead(Request $request): RedirectResponse
    {
        Notification::forUser($request->user()->id)
            ->unread()
            ->update(['read_at' => now()]);

        return back()->with('success', 'All notifications marked as read.');
    }

    /**
     * DELETE /notifications/clear-read
     * Dismiss all read notifications for current user.
     */
    public function clearRead(Request $request): RedirectResponse
    {
        Notification::forUser($request->user()->id)
            ->whereNotNull('read_at')
            ->visible()
            ->update(['dismissed_at' => now()]);

        return back()->with('success', 'Read notifications cleared.');
    }

    /**
     * DELETE /notifications/{notification}
     * Dismiss (soft-remove) a notification from the feed.
     */
    public function destroy(Request $request, Notification $notification): RedirectResponse
    {
        $this->authorizeNotification($request, $notification);
        $notification->dismiss();

        return back()->with('success', 'Notification dismissed.');
    }

    /* ─── Helpers ─────────────────────────────────────────────────────── */

    private function authorizeNotification(Request $request, Notification $notification): void
    {
        abort_unless(
            $notification->recipient_id === null ||
            $notification->recipient_id === $request->user()->id,
            403
        );
    }

    private function unreadCount(int $userId): int
    {
        return Notification::forUser($userId)->visible()->unread()->count();
    }

    private function format(Notification $n): array
    {
        return [
            'id' => $n->id,
            'type' => $n->type,
            'title' => $n->title,
            'body' => $n->body,
            'action_url' => $n->action_url,
            'action_label' => $n->action_label,
            'icon' => $n->icon,
            'severity' => $n->severity,
            'sender_name' => $n->sender_name,
            'read_at' => $n->read_at?->toIso8601String(),
            'created_at' => $n->created_at->diffForHumans(),
            'created_at_formatted' => $n->created_at->format('M d, Y h:i A'),
            'is_read' => $n->isRead(),
        ];
    }
}
