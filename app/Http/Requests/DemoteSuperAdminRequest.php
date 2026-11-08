<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class DemoteSuperAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var User $target */
        $target = $this->route('user');

        return $this->user()->can('demoteSuperAdmin', $target);
    }

    public function rules(): array
    {
        return [];
    }
}
