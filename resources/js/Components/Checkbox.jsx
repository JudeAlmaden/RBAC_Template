export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-line-strong text-accent shadow-sm focus:ring-accent dark:border-line dark:bg-surface dark:focus:ring-accent dark:focus:ring-offset-surface ' +
                className
            }
        />
    );
}
