<?php

namespace App\Http\Middleware;

use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\ThrottleRequests;

/**
 * Applies Laravel's named rate limiters to web routes.
 *
 * The framework middleware aborts with a 429 response, which an Inertia
 * navigation surfaces as an error modal. For Inertia requests this middleware
 * redirects back with a flash error instead, so the shared layout shows its
 * normal toast. JSON and plain requests keep the standard 429 + Retry-After.
 */
class RateLimitRequests extends ThrottleRequests
{
    /**
     * Create the 'too many attempts' exception for the request.
     *
     * @param  Request  $request
     * @param  string  $key
     * @param  int  $maxAttempts
     * @param  callable|null  $responseCallback
     * @return ThrottleRequestsException|HttpResponseException
     */
    protected function buildException($request, $key, $maxAttempts, $responseCallback = null)
    {
        if (is_null($responseCallback) && $request->header('X-Inertia')) {
            $retryAfter = max(1, (int) $this->getTimeUntilNextRetry($key));

            return new HttpResponseException(
                back()
                    ->with('error', "Too many requests. Please wait {$retryAfter} seconds before trying again.")
                    ->withHeaders($this->getHeaders(
                        $maxAttempts,
                        $this->calculateRemainingAttempts($key, $maxAttempts, $retryAfter),
                        $retryAfter,
                    ))
            );
        }

        return parent::buildException($request, $key, $maxAttempts, $responseCallback);
    }
}
