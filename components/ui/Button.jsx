import { forwardRef } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({
    children,
    className = '',
    variant = 'primary', // primary, secondary, outline, ghost, danger
    size = 'default', // sm, default, lg, icon
    isLoading = false,
    href,
    disabled,
    ...props
}, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white";

    const variants = {
        primary: "bg-[var(--primary)] text-black hover:bg-[var(--primary-hover)] shadow-sm",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200 shadow-sm",
        outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700",
        ghost: "hover:bg-gray-100 text-gray-700 hover:text-gray-900",
        danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
        link: "text-gray-900 underline-offset-4 hover:underline",
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        default: "h-10 py-2 px-4",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
    };

    const combinedClassName = `${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.default} ${className}`;

    if (href) {
        return (
            <Link
                href={href}
                className={combinedClassName}
                aria-disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </Link>
        );
    }

    return (
        <button
            ref={ref}
            className={combinedClassName}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
