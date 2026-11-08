export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-lg border border-transparent bg-accent hover:bg-accent-hover px-4 py-2 text-xs font-semibold text-white shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                    disabled ? 'opacity-40 cursor-not-allowed' : ''
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
