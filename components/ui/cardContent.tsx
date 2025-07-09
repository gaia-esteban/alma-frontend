import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export function CardContent({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-4 pt-0 sm:p-6 sm:pt-0', className)} {...props}>
      {children}
    </div>
  );
}
