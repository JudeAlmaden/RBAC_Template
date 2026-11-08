<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class PromoteSuperAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var User $target */
        $target = $this->route('user');

        return $this->user()->can('promoteSuperAdmin', $target);
    }

    public function rules(): array
    {
        return [];
    }
}
