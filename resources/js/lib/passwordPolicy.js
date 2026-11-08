/**
 * Mirrors App\Support\PasswordPolicy::MIN_LENGTH.
 * Only the server enforces the rule; keep these values in sync.
 */
export const PASSWORD_MIN_LENGTH = 8;

export function isPasswordLongEnough(password = '') {
    return password.length >= PASSWORD_MIN_LENGTH;
}

export function doPasswordsMatch(password = '', confirmation = '') {
    return confirmation.length > 0 && password === confirmation;
}
