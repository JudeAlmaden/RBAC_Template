import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-lg border border-[#E8E8EC] dark:border-[#26262D] bg-white dark:bg-[#15151A] text-gray-900 dark:text-[#F8F9FD] text-xs shadow-sm focus:border-[#5B5FC7] focus:ring-1 focus:ring-[#5B5FC7] transition ' +
                className
            }
            ref={localRef}
        />
    );
});
