import { colors } from '@/lib/colors';
import { cn } from '@/lib/utils';
import { ButtonProps } from '@/types/ui';

const sizeClasses: Record<string, string> = {
  default: 'h-10 px-4 py-2 text-sm',
  sm:      'h-8 px-3 text-xs',
  lg:      'h-12 px-6 text-base',
  icon:    'h-9 w-9 p-0',
};

export function Button({
  children,
  variant = 'default',
  size = 'default',
  className,
  disabled,
  onClick,
  ...props
}: ButtonProps) {

  const getStyles = () => {
    type StyleMap = { backgroundColor: string; color: string; borderColor: string; boxShadow?: string };
    const map: Record<string, StyleMap> = {
      default: {
        backgroundColor: colors.primary,
        color: colors.primaryForeground,
        borderColor: 'transparent',
        boxShadow: '0 2px 10px rgba(232,160,32,0.28)',
      },
      outline: {
        backgroundColor: colors.surface ?? colors.input,
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
    return map[variant] ?? map.default;
  };

  const styles = getStyles();
  const sizeClass = sizeClasses[size] ?? sizeClasses.default;

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50 cursor-pointer border',
        sizeClass,
        className
      )}
      style={{
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        borderColor: styles.borderColor,
        boxShadow: styles.boxShadow,
        ['--tw-ring-color' as string]: colors.ring,
      }}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={e => {
        if (disabled) return;
        const el = e.currentTarget;
        if (variant === 'default') {
          el.style.backgroundColor = colors.primaryDark ?? colors.primary;
          el.style.boxShadow = '0 4px 16px rgba(232,160,32,0.38)';
        } else if (variant === 'outline' || variant === 'ghost') {
          el.style.backgroundColor = colors.muted;
        }
      }}
      onMouseLeave={e => {
        if (disabled) return;
        const el = e.currentTarget;
        el.style.backgroundColor = styles.backgroundColor;
        el.style.boxShadow = styles.boxShadow ?? '';
      }}
      {...props}
    >
      {children}
    </button>
  );
}
