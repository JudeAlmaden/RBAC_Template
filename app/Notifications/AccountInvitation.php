<?php

namespace App\Notifications;

use App\Support\SetupLink;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountInvitation extends Notification
{
    use Queueable;

    public function __construct(
        public readonly string $url,
        public readonly string $roleLabel = 'User',
        public readonly bool $isReset = false,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $subject = $this->isReset
            ? 'Choose a new Nexus password'
            : 'Set up your Nexus account';

        $intro = $this->isReset
            ? 'An administrator asked you to choose a new password for your account.'
            : "An account has been created for you with the role: {$this->roleLabel}.";

        return (new MailMessage)
            ->subject($subject)
            ->greeting('Hello '.$notifiable->name.',')
            ->line($intro)
            ->action('Choose your password', $this->url)
            ->line('This link expires in '.SetupLink::TTL_HOURS.' hours and can only be used once.')
            ->line('If you did not expect this email, you can safely ignore it.');
    }
}
