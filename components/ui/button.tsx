import { cn } from '@/lib/utils';

export function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn('px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/80')}
      {...props}
    >
      {children}
    </button>
  );
}
