<?php

namespace App\Support;

final class PasswordPolicy
{
    /**
     * Mirrors the minimum enforced by Password::defaults().
     * Keep resources/js/lib/passwordPolicy.js in sync with this value.
     */
    public const MIN_LENGTH = 8;
}
