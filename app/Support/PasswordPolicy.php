<?php

namespace App\Support;

/**
 * Single source of truth for the password rule shown in the UI.
 *
 * Keep MIN_LENGTH in sync with `Password::defaults()`, which is what every
 * server-side form actually enforces.
 */
final class PasswordPolicy
{
    public const MIN_LENGTH = 8;
}
