import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-base font-semibold text-[#4B2E2B]">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          ref={ref}
          className={cn(
            'w-full bg-white border-2 rounded-xl px-4 py-3 text-base transition-colors',
            'focus:outline-none focus:ring-0',
            error 
              ? 'border-red-500 focus:border-red-500' 
              : 'border-gray-200 focus:border-[#C08552]',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm font-medium text-red-500 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
