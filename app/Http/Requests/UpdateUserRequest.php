<?php

namespace App\Http\Requests;

use App\Models\Role;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $targetUser = $this->route('user');

        return $this->user()->can('update', $targetUser);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $targetUser = $this->route('user');

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($targetUser->id),
            ],
            'password' => ['nullable', 'string', Password::defaults()],
        ];

        // Users with canAssignRoles or canManageAdmins can change roles via edit form
        if ($this->user()->canAssignRoles() || $this->user()->canManageAdmins()) {
            $allowedRoles = Role::pluck('name')
                ->reject(fn ($role) => $role === 'super_admin')
                ->values()
                ->all();

            // Only Super Admins can assign the Administrator role
            if (! $this->user()->isSuperAdmin()) {
                $allowedRoles = array_values(array_filter($allowedRoles, fn ($r) => $r !== 'admin'));
            }

            // If target user is a super admin and current user is super admin, allow retaining super_admin
            if ($targetUser && $targetUser->isSuperAdmin() && $this->user()->isSuperAdmin()) {
                $allowedRoles[] = 'super_admin';
            }

            $roleCapacityRule = function ($attribute, $value, $fail) use ($targetUser) {
                if ($targetUser && $targetUser->is_active) {
                    $newRole = Role::where('name', $value)->first();
                    if ($newRole && $newRole->hasReachedCapacity($targetUser)) {
                        $fail("The '{$newRole->name}' role has reached its maximum capacity of {$newRole->max_active_users} active users.");
                    }
                }
            };

            $rules['role'] = [
                'sometimes',
                'string',
                Rule::in($allowedRoles),
                $roleCapacityRule,
            ];

            $rules['roles'] = [
                'sometimes',
                'array',
            ];

            $rules['roles.*'] = [
                'string',
                Rule::in($allowedRoles),
                $roleCapacityRule,
            ];
        }

        return $rules;
    }

    /**
     * Get the resolved roles list.
     *
     * @return array<string>|null
     */
    public function getSelectedRoles(): ?array
    {
        if ($this->has('roles') && is_array($this->roles)) {
            $filtered = array_values(array_filter(array_unique($this->roles)));

            return empty($filtered) ? ['user'] : $filtered;
        }

        if ($this->has('role') && ! empty($this->role)) {
            return [$this->role];
        }

        return null;
    }
}
