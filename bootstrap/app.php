<?php

use App\Http\Middleware\ForcePasswordChange;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RateLimitRequests;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            // Login: 10 attempts per minute per IP.
            RateLimiter::for('login', function (Request $request) {
                return Limit::perMinute(10)->by($request->ip());
            });

            // Authenticated traffic: reads and writes are counted separately so
            // browsing never eats into a user's budget for form submissions.
            RateLimiter::for('web', function (Request $request) {
                $key = $request->user()?->getAuthIdentifier() ?? $request->ip();

                return $request->isMethodSafe()
                    ? Limit::perMinute(300)->by('reads:'.$key)
                    : Limit::perMinute(60)->by('writes:'.$key);
            });

            // Password reset: keyed by email + IP so a single address cannot be
            // flooded and a single IP cannot spray many addresses.
            RateLimiter::for('password-reset', function (Request $request) {
                return Limit::perMinute(5)->by(
                    Str::lower((string) $request->input('email')).'|'.$request->ip()
                );
            });

            // CSV export is the heaviest read in the admin UI.
            RateLimiter::for('exports', function (Request $request) {
                return Limit::perMinute(5)->by($request->user()?->getAuthIdentifier() ?? $request->ip());
            });

            // The stage builder saves large JSON payloads and runs on every save.
            RateLimiter::for('builder', function (Request $request) {
                return Limit::perMinute(60)->by($request->user()?->getAuthIdentifier() ?? $request->ip());
            });

            // Setup links are unauthenticated, so scope the budget to the target account.
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

        $middleware->alias([
            'force.password.change' => ForcePasswordChange::class,
            'rate-limit' => RateLimitRequests::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
