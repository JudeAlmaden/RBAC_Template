<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'assigned_by',
        'target_type',
        'target_id',
        'due_at',
        'available_from',
        'available_until',
        'required',
        'settings',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'target_id' => 'integer',
            'due_at' => 'datetime',
            'available_from' => 'datetime',
            'available_until' => 'datetime',
            'required' => 'boolean',
            'settings' => 'array',
        ];
    }

    /**
     * The course that was assigned.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * The admin or instructor who assigned the course.
     */
    public function assigner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /**
     * Student enrollments generated or linked to this assignment.
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(CourseEnrollment::class);
    }

    /**
     * Scope for currently open/available assignments.
     */
    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where(function (Builder $q): void {
            $q->whereNull('available_from')->orWhere('available_from', '<=', now());
        })->where(function (Builder $q): void {
            $q->whereNull('available_until')->orWhere('available_until', '>=', now());
        });
    }

    /**
     * Scope for mandatory assignments.
     */
    public function scopeRequired(Builder $query): Builder
    {
        return $query->where('required', true);
    }
}
