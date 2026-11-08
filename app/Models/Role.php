<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    protected $fillable = [
        'name',
        'guard_name',
        'max_active_users',
        'is_active',
    ];

    protected $casts = [
        'max_active_users' => 'integer',
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Pre-defined system roles that cannot be deleted or renamed.
     */
    public const PROTECTED_ROLES = [
        'super_admin',
        'admin',
        'user',
    ];

    /**
     * Check if this role is a protected system role.
     */
    public function isProtected(): bool
    {
        return in_array($this->name, self::PROTECTED_ROLES, true);
    }

    /**
     * Count only active users assigned to this role.
     */
    public function activeUsersCount(): int
    {
        return $this->users()->where('is_active', true)->count();
    }

    /**
     * Determine whether the role has reached its max active personnel capacity.
     */
    public function hasReachedCapacity(?User $ignoreUser = null): bool
    {
        if ($this->max_active_users === null) {
            return false;
        }

        $query = $this->users()->where('is_active', true);
        if ($ignoreUser && $ignoreUser->exists) {
            $query->where('users.id', '!=', $ignoreUser->id);
        }

        return $query->count() >= $this->max_active_users;
    }
}
