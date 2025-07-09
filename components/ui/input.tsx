import { colors } from '@/lib/colors';
import { cn } from '@/lib/utils';
import { InputProps } from '@/types/ui';


export function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'flex h-12 w-full rounded-md border px-3 py-2 text-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error
          ? `border-[${colors.destructive}] focus-visible:ring-[${colors.destructive}]`
          : `border-[${colors.border}] focus-visible:ring-[${colors.ring}]`,
        `bg-[${colors.input}] placeholder:text-[${colors.mutedForeground}]`,
        className
      )}
      style={{
        backgroundColor: colors.input,
        borderColor: error ? colors.destructive : colors.border,
        ...{
          '--tw-ring-color': error ? colors.destructive : colors.ring
        }
      } as React.CSSProperties}
      {...props}
    />
  );
}
