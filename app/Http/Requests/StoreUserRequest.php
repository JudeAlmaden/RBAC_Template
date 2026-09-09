<?php

namespace App\Http\Requests;

use App\Models\Role;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', User::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $allowedRoles = ['user'];
        if ($this->user()->canAssignRoles() || $this->user()->canManageAdmins()) {
            $allowedRoles = Role::pluck('name')
                ->reject(fn ($role) => $role === 'super_admin')
                ->values()
                ->all();

            // Only Super Admins can assign the Administrator role
            if (! $this->user()->isSuperAdmin()) {
                $allowedRoles = array_values(array_filter($allowedRoles, fn ($r) => $r !== 'admin'));
            }
        }

        $roleCapacityRule = function ($attribute, $value, $fail) {
            $role = Role::where('name', $value)->first();
            if ($role && $role->hasReachedCapacity()) {
                $fail("The '{$role->name}' role has reached its maximum capacity of {$role->max_active_users} active users.");
            }
        };

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'string', Password::defaults()],
            'role' => [
                'sometimes',
                'string',
                Rule::in($allowedRoles),
                $roleCapacityRule,
            ],
            'roles' => [
                'sometimes',
                'array',
            ],
            'roles.*' => [
                'string',
                Rule::in($allowedRoles),
                $roleCapacityRule,
            ],
        ];
    }

    /**
     * Get the resolved roles list.
     *
     * @return array<string>
     */
    public function getSelectedRoles(): array
    {
        if ($this->has('roles') && is_array($this->roles)) {
            $filtered = array_values(array_filter(array_unique($this->roles)));

            return empty($filtered) ? ['user'] : $filtered;
        }

        if ($this->has('role') && ! empty($this->role)) {
            return [$this->role];
        }

        return ['user'];
    }
}
