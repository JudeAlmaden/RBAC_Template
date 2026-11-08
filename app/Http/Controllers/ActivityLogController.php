<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ActivityLogController extends Controller
{
    /**
     * Display a listing of system and administrative activity logs.
     */
    public function index(Request $request): Response
    {
        $currentUser = $request->user();

        if (! $currentUser?->canViewLogs()) {
            abort(403, 'You do not have permission to view activity logs.');
        }

        $query = $this->buildFilteredQuery($request);

        $activityLogs = (clone $query)
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn ($log) => [
                'id' => $log->id,
                'actor_id' => $log->actor_id,
                'actor_name' => $log->actor_name,
                'action' => $log->action,
                'subject_type' => $log->subject_type,
                'subject_id' => $log->subject_id,
                'subject_name' => $log->subject_name,
                'ip_address' => $log->ip_address,
                'user_agent' => $log->user_agent,
                'metadata' => $log->metadata,
                'created_at_human' => $log->created_at?->diffForHumans(),
                'created_at_date' => $log->created_at?->format('M d, Y g:i A'),
                'created_at_iso' => $log->created_at?->toIso8601String(),
            ]);

        $availableActions = ActivityLog::distinct()->pluck('action')->filter()->values();
        $availableSubjectTypes = ActivityLog::distinct()->pluck('subject_type')->filter()->values();

        // Metrics for summary cards
        $metrics = [
            'total' => ActivityLog::count(),
            'today' => ActivityLog::whereDate('created_at', today())->count(),
            'security' => ActivityLog::whereIn('action', [
                'promoted_super_admin',
                'demoted_super_admin',
                'transferred_super_admin',
                'deleted_user',
                'deleted_role',
            ])->count(),
        ];

        return Inertia::render('ActivityLogs/Index', [
            'logs' => $activityLogs,
            'filters' => [
                'search' => $request->input('search', ''),
                'action' => $request->input('action', ''),
                'subject_type' => $request->input('subject_type', ''),
                'date_from' => $request->input('date_from', ''),
                'date_to' => $request->input('date_to', ''),
            ],
            'availableActions' => $availableActions,
            'availableSubjectTypes' => $availableSubjectTypes,
            'metrics' => $metrics,
        ]);
    }

    /**
     * Stream a filtered CSV export of activity logs without memory exhaustion.
     */
    public function export(Request $request): StreamedResponse
    {
        $currentUser = $request->user();

        if (! $currentUser?->canViewLogs()) {
            abort(403, 'You do not have permission to export activity logs.');
        }

        $query = $this->buildFilteredQuery($request);
        $filename = 'audit-logs-'.now()->format('Y-m-d-His').'.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');
            if ($handle === false) {
                return;
            }

            // Write UTF-8 BOM for Microsoft Excel compatibility
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'Log ID',
                'Timestamp',
                'Actor Name',
                'Actor ID',
                'Action',
                'Subject Type',
                'Subject ID',
                'Subject Name',
                'IP Address',
                'Metadata Details',
            ]);

            $query->orderBy('id', 'asc')->chunk(500, function ($logs) use ($handle) {
                foreach ($logs as $log) {
                    $metaString = '';
                    if (! empty($log->metadata) && is_array($log->metadata)) {
                        $metaString = json_encode($log->metadata, JSON_UNESCAPED_SLASHES);
                    }

                    fputcsv($handle, [
                        $log->id,
                        $log->created_at?->format('Y-m-d H:i:s'),
                        $log->actor_name ?: 'System',
                        $log->actor_id ?: 'N/A',
                        $log->action,
                        $log->subject_type ?: 'N/A',
                        $log->subject_id ?: 'N/A',
                        $log->subject_name ?: 'N/A',
                        $log->ip_address ?: 'N/A',
                        $metaString,
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }

    /**
     * Construct reusable filtered Eloquent query based on request parameters.
     */
    private function buildFilteredQuery(Request $request): Builder
    {
        $search = $request->input('search');
        $action = $request->input('action');
        $subjectType = $request->input('subject_type');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        return ActivityLog::query()
            ->when($search, function (Builder $q, $s) {
                $q->where(function (Builder $sub) use ($s) {
                    $sub->where('actor_name', 'like', "%{$s}%")
                        ->orWhere('subject_name', 'like', "%{$s}%")
                        ->orWhere('action', 'like', "%{$s}%");
                });
            })
            ->when($action, fn (Builder $q, $a) => $q->where('action', $a))
            ->when($subjectType, fn (Builder $q, $st) => $q->where('subject_type', $st))
            ->when($dateFrom, fn (Builder $q, $df) => $q->whereDate('created_at', '>=', $df))
            ->when($dateTo, fn (Builder $q, $dt) => $q->whereDate('created_at', '<=', $dt));
    }
}
