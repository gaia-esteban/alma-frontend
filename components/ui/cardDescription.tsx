import { colors } from '@/lib/colors';
import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export function CardDescription({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
  <div 
    className={cn('text-sm', className)} {...props}
    style={{ color: colors.mutedForeground }}
  >
    {children}
  </div>
  );
}
