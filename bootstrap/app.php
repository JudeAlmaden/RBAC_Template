<?php

use App\Http\Middleware\ForcePasswordChange;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            // Login rate limiting: 10 attempts per minute per IP
            RateLimiter::for('login', function (Request $request) {
                return Limit::perMinute(10)->by($request->ip());
            });

            // Password setup submissions: 10 per minute per account + IP
            RateLimiter::for('onboarding', function (Request $request) {
                $routeUser = $request->route('user');
                $account = $routeUser instanceof Model
                    ? $routeUser->getKey()
                    : (is_scalar($routeUser) ? (string) $routeUser : $request->ip());

                return Limit::perMinute(10)->by('onboarding:'.$account.'|'.$request->ip());
            });
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);

        // Named alias so routes can use 'force.password.change'
        $middleware->alias([
            'force.password.change' => ForcePasswordChange::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
