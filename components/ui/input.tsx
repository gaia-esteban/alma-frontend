import { cn } from '@/lib/utils';

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn('border rounded px-3 py-2 w-full', className)}
      {...props}
    />
  );
}
