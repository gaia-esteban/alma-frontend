import { colors } from '@/lib/colors';
import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export function Card({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
  <div 
    className={cn('rounded-lg border shadow-sm', className)} {...props}
    style={{ 
      backgroundColor: colors.input, 
      borderColor: colors.border,
      color: colors.secondary
    }}
  >
    {children}
  </div>
  );
}


