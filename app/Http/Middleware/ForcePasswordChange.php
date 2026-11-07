<?php

namespace App\Http\Middleware;

use App\Support\SetupLink;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForcePasswordChange
{
    /**
     * Routes a password-pending user is still allowed to reach.
     */
    protected array $except = [
        'onboarding.show',
        'onboarding.store',
        'logout',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (
            $user &&
            $user->must_change_password &&
            ! in_array($request->route()?->getName(), $this->except, true)
        ) {
            // A signed link is the only way a user without a password can set one.
            return redirect()->to(SetupLink::showUrlFor($user));
        }

        return $next($request);
    }
}
