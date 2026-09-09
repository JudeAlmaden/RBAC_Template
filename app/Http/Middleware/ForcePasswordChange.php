<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForcePasswordChange
{
    /**
     * Routes that are exempt from the force-change redirect.
     */
    protected array $except = [
        'profile.edit',
        'profile.update',
        'profile.destroy',
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
            return redirect()->route('profile.edit')
                ->with('warning', 'Please update your password before continuing.');
        }

        return $next($request);
    }
}
