import { forwardRef } from 'react';

const Input = forwardRef(({ className = '', error, ...props }, ref) => {
    return (
        <div className="w-full">
            <input
                className={`flex h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
                ref={ref}
                {...props}
            />
            {error && (
                <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
