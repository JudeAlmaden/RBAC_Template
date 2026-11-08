export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center justify-center rounded-lg border border-line bg-surface px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-sm transition duration-150 ease-in-out hover:bg-raised dark:hover:bg-raised focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-40 ` +
                className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
