<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Additional per-row permissions passed from the controller.
     * Set via ->additional(['currentUser' => $user]).
     */
    public function toArray(Request $request): array
    {
        $currentUser = $this->additional['currentUser'] ?? $request->user();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at?->format('M d, Y'),
            'can' => [
                'update' => $currentUser->can('update', $this->resource),
                'delete' => $currentUser->can('delete', $this->resource),
                'toggleStatus' => $currentUser->can('toggleStatus', $this->resource),
                'promoteSuperAdmin' => $currentUser->can('promoteSuperAdmin', $this->resource),
                'transferSuperAdmin' => $currentUser->can('transferSuperAdmin', $this->resource),
                'demoteSuperAdmin' => $currentUser->can('demoteSuperAdmin', $this->resource),
            ],
        ];
    }
}
