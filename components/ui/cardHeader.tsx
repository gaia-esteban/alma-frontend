import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
  <div className={cn('flex flex-col space-y-1.5 p-4 sm:p-6 text-center', className)} {...props}>
    {children}
  </div>
  );
}


