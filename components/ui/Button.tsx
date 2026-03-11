import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const { theme } = useTheme();

  // Base styles
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-khmer";
  
  // Size styles
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2 w-10 h-10",
  };

  // Variant styles
  const variantStyles = {
    primary: theme === 'dark'
      ? "bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-500"
      : "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500",
    secondary: theme === 'dark'
      ? "bg-slate-800 hover:bg-slate-700 text-slate-200 focus:ring-slate-500"
      : "bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500",
    outline: theme === 'dark'
      ? "border border-slate-700 hover:bg-slate-800 text-slate-300 focus:ring-slate-500"
      : "border border-gray-200 hover:bg-gray-50 text-gray-700 focus:ring-gray-500",
    ghost: theme === 'dark'
      ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200 focus:ring-slate-500"
      : "hover:bg-gray-100 text-gray-500 hover:text-gray-900 focus:ring-gray-500",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};
