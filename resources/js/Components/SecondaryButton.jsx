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
                `inline-flex items-center justify-center rounded-lg border border-[#E8E8EC] dark:border-[#26262D] bg-white dark:bg-[#15151A] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 dark:hover:bg-[#1C1C24] focus:outline-none focus:ring-2 focus:ring-[#5B5FC7] focus:ring-offset-2 disabled:opacity-40 ` +
                className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
