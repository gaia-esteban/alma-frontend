import { colors } from '@/lib/colors';
import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export function CardTitle({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
  <h3 
    className={cn('text-xl sm:text-2xl font-semibold leading-none tracking-tight', className)} {...props}
    style={{ color: colors.secondary }}
  >
    {children}
  </h3>
  );
}
