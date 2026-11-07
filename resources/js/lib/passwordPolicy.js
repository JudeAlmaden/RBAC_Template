/**
 * Mirrors App\Support\PasswordPolicy. The server always has the last word:
 * every form posts to a rule built from Password::defaults().
 */
export const PASSWORD_MIN_LENGTH = 8;

export function isPasswordLongEnough(password = '') {
    return password.length >= PASSWORD_MIN_LENGTH;
}

export function doPasswordsMatch(password = '', confirmation = '') {
    return confirmation.length > 0 && password === confirmation;
}
