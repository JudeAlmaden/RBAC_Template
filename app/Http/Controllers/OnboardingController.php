<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\PasswordPolicy;
use App\Support\SetupLink;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    /**
     * Show the signed "choose your password" page.
     */
    public function show(Request $request, User $user, string $hash): Response|RedirectResponse
    {
        if (! SetupLink::matches($user, $hash)) {
            return redirect()->route('login')
                ->with('error', 'That setup link is no longer valid. Ask an administrator to send a new one.');
        }

        if (! $user->must_change_password) {
            return $this->alreadySetUpResponse($user);
        }

        $expiresAt = $this->expiryFrom($request);

        return Inertia::render('Onboarding/Show', [
            'name' => $user->name,
            'email' => $user->email,
            'submitUrl' => SetupLink::storeUrlFor($user, $expiresAt),
            'expiresAt' => $expiresAt->toIso8601String(),
            'minPasswordLength' => PasswordPolicy::MIN_LENGTH,
        ]);
    }

    /**
     * Save the password chosen from a signed setup link.
     */
    public function store(Request $request, User $user, string $hash): RedirectResponse
    {
        if (! SetupLink::matches($user, $hash)) {
            return redirect()->route('login')
                ->with('error', 'That setup link is no longer valid. Ask an administrator to send a new one.');
        }

        if (! $user->must_change_password) {
            return $this->alreadySetUpResponse($user);
        }

        $request->validate([
            'password' => ['required', 'string', Password::defaults(), 'confirmed'],
        ]);

        $user->forceFill([
            'password' => $request->string('password')->value(),
            'must_change_password' => false,
            'email_verified_at' => $user->email_verified_at ?? now(),
        ])->save();

        if (! $user->is_active) {
            return redirect()->route('login')
                ->with('error', 'Your password was saved, but this account is deactivated. Contact an administrator.');
        }

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('dashboard')
            ->with('success', 'Your password has been set. Welcome to Nexus.');
    }

    /**
     * Reuse the signed link's own expiry so the form cannot outlive it.
     */
    private function expiryFrom(Request $request): CarbonImmutable
    {
        $expires = (int) $request->query('expires');

        return $expires > now()->getTimestamp()
            ? CarbonImmutable::createFromTimestamp($expires)
            : CarbonImmutable::now()->addHour();
    }

    private function alreadySetUpResponse(User $user): RedirectResponse
    {
        if (! $user->is_active) {
            return redirect()->route('login')
                ->with('error', 'This account is deactivated. Contact an administrator.');
        }

        return redirect()->route('login')
            ->with('status', 'This account is already set up. Please sign in.');
    }
}
