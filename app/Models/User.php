<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Spatie\Permission\Traits\HasRoles;

#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'must_change_password',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'must_change_password' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Helper to get the primary role name.
     */
    public function getRoleAttribute(): string
    {
        try {
            if ($this->hasRole('super_admin')) {
                return 'super_admin';
            }
            if ($this->hasRole('admin')) {
                return 'admin';
            }
            $customRole = $this->roles->firstWhere('name', '!=', 'user');

            return $customRole?->name ?? 'user';
        } catch (\Throwable) {
            return 'user';
        }
    }

    public function isSuperAdmin(): bool
    {
        try {
            return $this->hasRole('super_admin');
        } catch (\Throwable) {
            return false;
        }
    }

    public function isAdmin(): bool
    {
        try {
            return $this->hasRole('admin');
        } catch (\Throwable) {
            return false;
        }
    }

    public function isUser(): bool
    {
        try {
            return ! $this->isSuperAdmin() && ! $this->isAdmin();
        } catch (\Throwable) {
            return true;
        }
    }

    public function canManageUsers(): bool
    {
        try {
            return $this->can('manage users');
        } catch (\Throwable) {
            return false;
        }
    }

    public function canManageAdmins(): bool
    {
        try {
            return $this->can('manage admins');
        } catch (\Throwable) {
            return false;
        }
    }

    public function canManageRoles(): bool
    {
        try {
            return $this->can('manage roles');
        } catch (\Throwable) {
            return false;
        }
    }

    public function canAssignRoles(): bool
    {
        try {
            return $this->can('assign roles');
        } catch (\Throwable) {
            return false;
        }
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function canPromoteToSuperAdmin(): bool
    {
        try {
            if (! $this->can('promote super admin')) {
                return false;
            }

            $superAdminRole = Role::findByName('super_admin');

            return ! $superAdminRole->hasReachedCapacity();
        } catch (\Throwable) {
            return false;
        }
    }

    public function canTransferSuperAdmin(): bool
    {
        try {
            return $this->can('transfer super admin');
        } catch (\Throwable) {
            return false;
        }
    }

    /**
     * Declarative registry of relations representing permanent audit or business records.
     * When any of these relations contain records, the user cannot be permanently deleted.
     * Format: [ relationMethodName => HumanReadableLabel ]
     */
    public static array $relevantRelations = [
        'activityLogs' => 'Activity Logs',
        'receivedNotifications' => 'Notifications',
        'sentNotifications' => 'Sent Notifications',
    ];

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class, 'actor_id');
    }

    public function receivedNotifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'recipient_id');
    }

    public function sentNotifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'sender_id');
    }

    /**
     * Check whether this user has any permanent related records.
     */
    public function hasRelatedData(): bool
    {
        foreach (array_keys(static::$relevantRelations) as $relation) {
            if (method_exists($this, $relation) && $this->{$relation}()->exists()) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get a human-readable summary of existing records blocking deletion.
     *
     * @return array<string>
     */
    public function getRelatedDataSummary(): array
    {
        $summary = [];
        foreach (static::$relevantRelations as $relation => $label) {
            if (method_exists($this, $relation)) {
                $count = $this->{$relation}()->count();
                if ($count > 0) {
                    $summary[] = "{$count} ".Str::plural($label, $count);
                }
            }
        }

        return $summary;
    }

    /**
     * Determine if this user is eligible for permanent hard deletion.
     */
    public function canBeDeleted(): bool
    {
        return ! $this->hasRelatedData();
    }
}
