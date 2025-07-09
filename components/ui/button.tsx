import { colors } from '@/lib/colors';
import { cn } from '@/lib/utils';
import { ButtonProps, Variant } from '@/types/ui';


export function Button({
  children,
  variant = 'default',
  className,
  disabled,
  onClick,
  ...props
}: ButtonProps) {

  const getButtonStyles = () => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-4 py-2';

    const styles: Record<Variant, {
      backgroundColor: string;
      color: string;
      borderColor: string;
    }> = {
      default: {
        backgroundColor: colors.primary,
        color: colors.primaryForeground,
        borderColor: 'transparent',
      },
      outline: {
        backgroundColor: colors.input,
        color: colors.secondary,
        borderColor: colors.border,
      },
      ghost: {
        backgroundColor: 'transparent',
        color: colors.secondary,
        borderColor: 'transparent',
      },
      destructive: {
        backgroundColor: colors.destructive,
        color: colors.destructiveForeground,
        borderColor: 'transparent',
      },
    };

    return { baseClasses, ...styles[variant] };
  };

  const buttonStyles = getButtonStyles();

  return (
    <button
      className={cn(buttonStyles.baseClasses, 'border', className)}
      style={{
        backgroundColor: buttonStyles.backgroundColor,
        color: buttonStyles.color,
        borderColor: buttonStyles.borderColor,
        '--tw-ring-color': colors.ring
      } as React.CSSProperties}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={(e) => {
        const target = e.target as HTMLButtonElement;
        if (!disabled && variant === 'default') {
          target.style.backgroundColor = `${colors.primary}E6`; // 90% opacity
        } else if (!disabled && variant === 'outline') {
          target.style.backgroundColor = colors.muted;
        } else if (!disabled && variant === 'ghost') {
          target.style.backgroundColor = colors.muted;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          const styles = getButtonStyles();
          const target = e.target as HTMLButtonElement;
          target.style.backgroundColor = styles.backgroundColor;
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
}