<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
            'resetEmail' => session('reset_email'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * The response is deliberately uniform so it never reveals whether an
     * address has an account.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $email = $request->string('email')->lower()->value();
        $status = Password::sendResetLink(['email' => $email]);

        if ($status === Password::RESET_THROTTLED) {
            return back()->withErrors([
                'email' => 'Please wait a moment before requesting another link.',
            ]);
        }

        return back()->with([
            'status' => 'If an account exists for that address, we just sent a reset link.',
            'reset_email' => $email,
        ]);
    }
}
