<?php

namespace App\Support;

use App\Models\User;
use DateTimeInterface;
use Illuminate\Support\Facades\URL;

/**
 * Builds and verifies the signed "set your password" links used by both the
 * onboarding flow and admin-initiated password resets.
 */
final class SetupLink
{
    /**
     * How long an emailed setup link stays valid.
     */
    public const TTL_HOURS = 72;

    /**
     * Mailers that accept a message but never deliver it.
     *
     * @var list<string>
     */
    public const MAILERS_WITHOUT_DELIVERY = ['log', 'failover'];

    /**
     * Build a signed setup link plus its matching store endpoint.
     *
     * @return array{show: string, store: string, expires_at: DateTimeInterface}
     */
    public static function make(User $user): array
    {
        $expiresAt = now()->addHours(self::TTL_HOURS);

        return [
            'show' => self::showUrlFor($user, $expiresAt),
            'store' => self::storeUrlFor($user, $expiresAt),
            'expires_at' => $expiresAt,
        ];
    }

    public static function showUrlFor(User $user, ?DateTimeInterface $expiresAt = null): string
    {
        return URL::temporarySignedRoute(
            'onboarding.show',
            $expiresAt ?? now()->addHours(self::TTL_HOURS),
            self::parameters($user),
        );
    }

    public static function storeUrlFor(User $user, DateTimeInterface $expiresAt): string
    {
        return URL::temporarySignedRoute(
            'onboarding.store',
            $expiresAt,
            self::parameters($user),
        );
    }

    /**
     * Route parameters covered by the signature.
     *
     * @return array{user: int, hash: string}
     */
    public static function parameters(User $user): array
    {
        return [
            'user' => (int) $user->getKey(),
            'hash' => self::hashFor($user),
        ];
    }

    /**
     * Bind the link to the account's current credentials, so setting a password
     * invalidates every link issued before it.
     */
    public static function hashFor(User $user): string
    {
        return sha1($user->getEmailForPasswordReset().$user->getAuthPassword());
    }

    public static function matches(User $user, string $hash): bool
    {
        return hash_equals(self::hashFor($user), $hash);
    }

    /**
     * Whether the configured mailer can actually reach an inbox.
     */
    public static function mailIsDeliverable(): bool
    {
        return ! in_array(config('mail.default'), self::MAILERS_WITHOUT_DELIVERY, true);
    }
}
